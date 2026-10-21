const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const prisma = require("../config/db");

const BACKUP_DB_PATH = path.join(__dirname, "../../prisma/users.json");

// Ensure backup users file exists with default seeded accounts
function initFallbackDb() {
  if (!fs.existsSync(BACKUP_DB_PATH)) {
    const adminHash = bcrypt.hashSync("admin123", 10);
    const teacherHash = bcrypt.hashSync("teacher123", 10);

    const initialUsers = [
      {
        id: 1,
        name: "admin",
        email: "admin@college.edu",
        passwordHash: adminHash,
        role: "ADMIN",
        createdAt: new Date().toISOString(),
      },
      {
        id: 2,
        name: "teacher",
        email: "teacher@college.edu",
        passwordHash: teacherHash,
        role: "TEACHER",
        createdAt: new Date().toISOString(),
      },
    ];
    fs.writeFileSync(BACKUP_DB_PATH, JSON.stringify(initialUsers, null, 2), "utf-8");
  }
}

initFallbackDb();

function getFallbackUsers() {
  try {
    initFallbackDb();
    const data = fs.readFileSync(BACKUP_DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Failed to read fallback users:", err);
    return [];
  }
}

function saveFallbackUsers(users) {
  try {
    fs.writeFileSync(BACKUP_DB_PATH, JSON.stringify(users, null, 2), "utf-8");
  } catch (err) {
    console.error("Failed to save fallback users:", err);
  }
}

async function findUserByIdentifier(identifier) {
  const norm = identifier.trim().toLowerCase();

  // Try Prisma first
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: norm },
          { name: identifier.trim() },
        ],
      },
    });
    if (user) return user;
  } catch (err) {
    // MySQL not reachable or credentials invalid; fall through to local storage
  }

  // Fallback to local store
  const users = getFallbackUsers();
  return users.find(
    (u) =>
      u.email.toLowerCase() === norm ||
      u.name.toLowerCase() === identifier.trim().toLowerCase()
  );
}

async function findUserByEmailOrName(email, name) {
  const normEmail = email.trim().toLowerCase();
  const normName = name.trim();

  // Try Prisma first
  try {
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: normEmail },
          { name: normName },
        ],
      },
    });
    if (user) return user;
  } catch (err) {
    // MySQL unavailable; fall through
  }

  // Fallback
  const users = getFallbackUsers();
  return users.find(
    (u) =>
      u.email.toLowerCase() === normEmail ||
      u.name.toLowerCase() === normName.toLowerCase()
  );
}

async function createUser({ name, email, passwordHash, role }) {
  const normEmail = email.trim().toLowerCase();
  const normName = name.trim();

  // Try Prisma first
  try {
    const user = await prisma.user.create({
      data: {
        name: normName,
        email: normEmail,
        passwordHash,
        role,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });

    if (role === "TEACHER") {
      try {
        await prisma.teacher.upsert({
          where: { email: normEmail },
          update: { name: normName },
          create: { name: normName, email: normEmail },
        });
      } catch (tErr) {
        // Teacher profile upsert optional
      }
    }

    return user;
  } catch (err) {
    // If Prisma connection fails, save to fallback store
    const users = getFallbackUsers();
    const newUser = {
      id: Date.now(),
      name: normName,
      email: normEmail,
      passwordHash,
      role,
      createdAt: new Date().toISOString(),
    };
    users.push(newUser);
    saveFallbackUsers(users);

    return {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      createdAt: newUser.createdAt,
    };
  }
}

module.exports = {
  findUserByIdentifier,
  findUserByEmailOrName,
  createUser,
};
