const express = require("express");
const {
  createFrontendReport,
  calculateLive,
  getSampleMarks,
} = require("../controllers/report.controller");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

router.post("/calculate-live", upload.single("file"), calculateLive);
router.get("/sample-marks", getSampleMarks);
router.post("/create-report", upload.single("file"), createFrontendReport);

module.exports = router;
