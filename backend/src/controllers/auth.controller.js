const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userService = require("../services/user.service");

const JWT_SECRET = process.env.JWT_SECRET || "co_po_secret_jwt_key_2026_secure_key";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "8h";

const register = async (req, res, next) => {
  try {
    const name = (req.body.name || req.body.username || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password;
    const role = req.body.role || "TEACHER";

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Username/name, email, and password are required.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const existingUser = await userService.findUserByEmailOrName(email, name);

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message:
          existingUser.email.toLowerCase() === email
            ? "A user with this email already exists."
            : "A user with this username already exists.",
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await userService.createUser({
      name,
      email,
      passwordHash,
      role,
    });

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.status(201).json({
      success: true,
      message: "User registered successfully.",
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const identifier = (
      req.body.identifier ||
      req.body.email ||
      req.body.username ||
      ""
    ).trim();
    const { password } = req.body;

    if (!identifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Username or email, and password are required.",
      });
    }

    const user = await userService.findUserByIdentifier(identifier);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid username/email or password.",
      });
    }

    const isMatch = await bcrypt.compare(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid username/email or password.",
      });
    }

    const token = jwt.sign({ userId: user.id, role: user.role }, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    res.status(200).json({
      success: true,
      message: "Login successful.",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: "Both current and new password are required." });
    }

    const user = await userService.findUserByIdentifier(req.user.email);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    const isMatch = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isMatch) {
      return res.status(400).json({ message: "Current password does not match." });
    }

    const passwordHash = await bcrypt.hash(newPassword, 10);
    // update password
    user.passwordHash = passwordHash;

    res.status(200).json({ success: true, message: "Password updated successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = { register, login, me, updatePassword };
