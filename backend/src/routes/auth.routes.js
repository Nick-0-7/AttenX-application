const express = require("express");
const { register, login, me, updatePassword } = require("../controllers/auth.controller");
const { authenticate } = require("../middleware/auth.middleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, me);
router.put("/update-password", authenticate, updatePassword);

module.exports = router;
