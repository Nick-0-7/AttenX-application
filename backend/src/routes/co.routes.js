const express = require("express");
const {
  getCourseOutcomes,
  createCourseOutcome,
  updateCourseOutcome,
  deleteCourseOutcome,
} = require("../controllers/co.controller");

const router = express.Router();

router.get("/", getCourseOutcomes);
router.post("/", createCourseOutcome);
router.put("/:id", updateCourseOutcome);
router.delete("/:id", deleteCourseOutcome);

module.exports = router;
