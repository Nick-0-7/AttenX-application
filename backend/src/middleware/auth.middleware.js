const jwt = require("jsonwebtoken");
const prisma = require("../config/db");
const userService = require("../services/user.service");

const JWT_SECRET = process.env.JWT_SECRET || "co_po_secret_jwt_key_2026_secure_key";

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authentication required. Bearer token missing." });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET);
    const userId = decoded.userId || decoded.id;

    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true },
      });
    } catch (dbErr) {
      // Prisma DB unavailable; check fallback
    }

    if (!user) {
      const allFallback = require("../../prisma/users.json");
      user = allFallback.find((u) => u.id === userId);
      if (user) {
        user = { id: user.id, name: user.name, email: user.email, role: user.role };
      }
    }

    if (!user) {
      return res.status(401).json({ message: "Invalid user session or user not found." });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired authorization token." });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Forbidden: You do not possess the required permissions for this action.",
      });
    }
    next();
  };
};

module.exports = { authenticate, authorize };
