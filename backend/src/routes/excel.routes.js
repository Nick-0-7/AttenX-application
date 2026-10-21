const express = require("express");
const {
  downloadStudentMarksTemplate,
  downloadCesTemplate,
  uploadStudentMarks,
  uploadCesFeedback,
  exportAttainmentWorkbook,
  exportWordReport,
} = require("../controllers/excel.controller");
const upload = require("../middleware/upload.middleware");

const router = express.Router();

router.get("/template/student-marks", downloadStudentMarksTemplate);
router.get("/template/ces", downloadCesTemplate);
router.post("/upload-marks", upload.single("file"), uploadStudentMarks);
router.post("/upload-ces", upload.single("file"), uploadCesFeedback);
router.get("/export-attainment/:subjectId", exportAttainmentWorkbook);
router.get("/export-word-report/:subjectId", exportWordReport);

module.exports = router;
