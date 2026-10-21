const {
  parseMarksheetBuffer,
  calculateAttainmentFromData,
  loadSampleMarksheet,
} = require("../services/liveAttainment.service");

const {
  generateReportFromTemplate,
  getTemplateFileName,
  convertDocxBufferToPdfBuffer,
} = require("../services/reportTemplate.service");

/**
 * Controller: Calculate live attainment from uploaded file or JSON payload
 */
const calculateLive = async (req, res, next) => {
  try {
    let {
      cos = "{}",
      mapping = "{}",
      targetCA1 = 60,
      targetCA2 = 60,
      directWeight = 0.9,
      indirectWeight = 0.1,
      students = null,
      surveyCounts = null,
      useSample = false,
    } = req.body;

    // Handle stringified JSON from multipart form-data
    if (typeof cos === "string") {
      try { cos = JSON.parse(cos); } catch (e) { cos = {}; }
    }
    if (typeof mapping === "string") {
      try { mapping = JSON.parse(mapping); } catch (e) { mapping = {}; }
    }
    if (typeof students === "string") {
      try { students = JSON.parse(students); } catch (e) { students = null; }
    }
    if (typeof surveyCounts === "string") {
      try { surveyCounts = JSON.parse(surveyCounts); } catch (e) { surveyCounts = null; }
    }

    let parsedMarksheet = null;

    if (req.file) {
      parsedMarksheet = await parseMarksheetBuffer(req.file.buffer);
    } else if (students && Array.isArray(students) && students.length > 0) {
      parsedMarksheet = {
        totalStudents: students.length,
        students,
        surveyCounts: surveyCounts || { X: 0, Y: 0, Z: 0 },
        detectedColumns: [],
      };
    } else if (useSample || req.query.sample === "true") {
      parsedMarksheet = await loadSampleMarksheet();
    } else {
      // Default to sample if nothing provided
      parsedMarksheet = await loadSampleMarksheet();
    }

    const calculationResult = calculateAttainmentFromData({
      students: parsedMarksheet.students,
      surveyCounts: parsedMarksheet.surveyCounts,
      cos,
      mapping,
      targetCA1: Number(targetCA1),
      targetCA2: Number(targetCA2),
      directWeight: Number(directWeight),
      indirectWeight: Number(indirectWeight),
    });

    res.json({
      success: true,
      message: "Attainment calculated successfully.",
      data: {
        totalStudents: parsedMarksheet.totalStudents,
        detectedColumns: parsedMarksheet.detectedColumns || [],
        ...calculationResult,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Get sample marksheet metadata and preview
 */
const getSampleMarks = async (req, res, next) => {
  try {
    const sample = await loadSampleMarksheet();
    res.json({
      success: true,
      totalStudents: sample.totalStudents,
      surveyCounts: sample.surveyCounts,
      detectedColumns: sample.detectedColumns,
      preview: sample.students.slice(0, 10),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Controller: Generate NBA DOCX Attainment Report from template
 * Picks the template from report-templates matching attainmentType
 * and replaces all placeholders with actual calculated values.
 */
const createFrontendReport = async (req, res, next) => {
  try {
    let {
      attainmentType = "theory",
      facultyName = "Faculty Member",
      academicYear = "2025-26",
      department = "Computer Science Engineering",
      courseCode = "",
      courseTitle = "",
      className = "TE CSE",
      verifiedBy = "Academic Audit Committee",
      hodName = "Head of Department",
      targetCA1 = 60,
      targetCA2 = 60,
      directWeight = 0.9,
      indirectWeight = 0.1,
      cos = {},
      mapping = {},
      calculatedAttainment = null,
      students = null,
      surveyCounts = null,
    } = req.body;

    // Handle form-data JSON fields
    if (typeof cos === "string") {
      try { cos = JSON.parse(cos); } catch (e) { cos = {}; }
    }
    if (typeof mapping === "string") {
      try { mapping = JSON.parse(mapping); } catch (e) { mapping = {}; }
    }
    if (typeof calculatedAttainment === "string") {
      try { calculatedAttainment = JSON.parse(calculatedAttainment); } catch (e) { calculatedAttainment = null; }
    }
    if (typeof students === "string") {
      try { students = JSON.parse(students); } catch (e) { students = null; }
    }
    if (typeof surveyCounts === "string") {
      try { surveyCounts = JSON.parse(surveyCounts); } catch (e) { surveyCounts = null; }
    }

    // If calculation wasn't passed directly, compute it from file or sample
    if (!calculatedAttainment) {
      let parsedMarksheet = null;
      if (req.file) {
        parsedMarksheet = await parseMarksheetBuffer(req.file.buffer);
      } else if (students && Array.isArray(students)) {
        parsedMarksheet = {
          totalStudents: students.length,
          students,
          surveyCounts: surveyCounts || { X: 0, Y: 0, Z: 0 },
        };
      } else {
        parsedMarksheet = await loadSampleMarksheet();
      }

      calculatedAttainment = calculateAttainmentFromData({
        students: parsedMarksheet.students,
        surveyCounts: parsedMarksheet.surveyCounts,
        cos,
        mapping,
        targetCA1: Number(targetCA1),
        targetCA2: Number(targetCA2),
        directWeight: Number(directWeight),
        indirectWeight: Number(indirectWeight),
      });
    }

    // Generate Word document using corresponding template and placeholder replacement
    const { buffer, templateFileName, totalReplaced } = await generateReportFromTemplate({
      attainmentType,
      metadata: {
        academicYear,
        courseCode,
        courseTitle,
        department,
        facultyName,
        className,
        verifiedBy,
        hodName,
      },
      cos,
      mapping,
      calculatedAttainment,
    });

    console.log(`[createFrontendReport] Template used: ${templateFileName}, placeholders replaced: ${totalReplaced}`);

    const format = String(req.query.format || req.body.format || "docx").toLowerCase().trim();

    if (format === "pdf") {
      try {
        console.log(`[createFrontendReport] Converting DOCX to native Word-rendered PDF...`);
        const pdfBuffer = await convertDocxBufferToPdfBuffer(buffer);
        res.setHeader("Content-Type", "application/pdf");
        res.setHeader(
          "Content-Disposition",
          `attachment; filename=Attainx_${attainmentType}_Report.pdf`
        );
        if (calculatedAttainment) {
          res.setHeader(
            "X-Calculation-Summary",
            encodeURIComponent(JSON.stringify(calculatedAttainment))
          );
        }
        return res.send(pdfBuffer);
      } catch (pdfErr) {
        console.error("[createFrontendReport] PDF conversion failed, falling back to DOCX:", pdfErr);
      }
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Attainx_${attainmentType}_Report.docx`
    );
    if (calculatedAttainment) {
      res.setHeader(
        "X-Calculation-Summary",
        encodeURIComponent(JSON.stringify(calculatedAttainment))
      );
    }

    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  calculateLive,
  getSampleMarks,
  createFrontendReport,
};
