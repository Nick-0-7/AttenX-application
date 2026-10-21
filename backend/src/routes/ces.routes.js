const express = require("express");
const {
  getCesFeedbacks,
  saveCesFeedback,
  bulkSaveCesFeedback,
  generateFromMarks,
} = require("../controllers/ces.controller");

const router = express.Router();

router.get("/:subjectId", getCesFeedbacks);
router.post("/save", saveCesFeedback);
router.post("/bulk", bulkSaveCesFeedback);
router.post("/generate-from-marks/:subjectId", generateFromMarks);

module.exports = router;
