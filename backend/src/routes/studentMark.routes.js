const express = require("express");
const { getStudentMarks, createStudentMark } = require("../controllers/studentMark.controller");

const router = express.Router();

router.get("/", getStudentMarks);
router.post("/", createStudentMark);

module.exports = router;
