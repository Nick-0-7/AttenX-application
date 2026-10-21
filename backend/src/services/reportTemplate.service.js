const fs = require("fs");
const path = require("path");
const os = require("os");
const crypto = require("crypto");
const { exec } = require("child_process");
const util = require("util");
const execPromise = util.promisify(exec);
const PizZip = require("pizzip");

/**
 * XML escape helper for docx XML safe insertion
 */
function escapeXml(unsafe) {
  if (unsafe === undefined || unsafe === null) return "";
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Map attainmentType to template filename
 */
function getTemplateFileName(attainmentType) {
  const normalized = String(attainmentType || "").toLowerCase().trim();
  switch (normalized) {
    case "laboratory":
    case "lab":
      return "Attainx_Laboratory_Template.docx";
    case "lab-pr-or":
    case "laboratory-pr-or":
    case "pr-or":
    case "lab_pr_or":
    case "laboratory with external pr-or exam":
      return "Attainx_Laboratory_PR_OR_Template.docx";
    case "audit-course":
    case "audit":
    case "audit course": {
      const preferred = "Attainx_Audit_Course_Template.docx";
      const fullPath = path.resolve(__dirname, "../../../report-templates", preferred);
      return fs.existsSync(fullPath) ? preferred : "CO-PO_Attainment_Audit_with_placeholders.docx";
    }
    case "theory":
    default:
      return "Attainx_Theory_Template.docx";
  }
}

/**
 * Format 2 decimal places or dash if missing
 */
function fmtNum(val, decimals = 2) {
  if (val === undefined || val === null || val === "" || val === "-") return "-";
  const num = parseFloat(val);
  if (isNaN(num)) return String(val);
  return decimals === 0 ? String(Math.round(num)) : num.toFixed(decimals);
}

/**
 * Build dictionary of placeholder -> actual value
 */
function buildPlaceholderDictionary({
  attainmentType,
  metadata = {},
  cos = {},
  mapping = {},
  calculatedAttainment = {},
}) {
  const dict = {};

  const {
    academicYear = "2025-26",
    courseCode = "",
    courseTitle = "",
    department = "",
    facultyName = "Faculty Member",
    verifiedBy = "Academic Audit Committee",
    hodName = "Head of Department",
    className = "TE CSE",
  } = metadata;

  const coResults = calculatedAttainment.coResults || [];
  const poResults = calculatedAttainment.poResults || {};
  const psoResults = calculatedAttainment.psoResults || {};
  const survey = calculatedAttainment.survey || {
    countX: 0,
    countY: 0,
    countZ: 0,
    cesScore: 2.0,
  };
  const summary = calculatedAttainment.summary || {};

  const cleanYear = (!academicYear || academicYear === "TY" || academicYear === "SY" || academicYear === "FY" || academicYear === "BTech")
    ? "2025-26"
    : academicYear;
  const cleanTitle = courseTitle && courseTitle.trim() !== "" && courseTitle !== "-" ? courseTitle.trim() : "Data Science and Visualization";
  const cleanCode = courseCode && courseCode.trim() !== "" && courseCode !== "-" ? courseCode.trim() : "23CS2404";

  // Standard Metadata
  dict["ACADEMIC_YEAR"] = cleanYear;
  dict["COURSE_CODE"] = cleanCode;
  dict["COURSE_NAME"] = cleanTitle;
  dict["COURSE_TITLE"] = cleanTitle;
  dict["COURSE"] = cleanTitle;
  dict["SUBJECT_NAME"] = cleanTitle;
  dict["CLASS"] = className;
  dict["CLASS_NAME"] = className;
  dict["DEPARTMENT"] = department || "-";
  dict["PREPARED_BY"] = facultyName;
  dict["PREPARED_BY_FINAL"] = facultyName;
  dict["FACULTY_NAME"] = facultyName;
  dict["VERIFIED_BY"] = verifiedBy;
  dict["VERIFIED_BY_FINAL"] = verifiedBy;
  dict["HOD_NAME"] = hodName;
  dict["HOD_NAME_FINAL"] = hodName;
  dict["SIGNATORY_3"] = "Principal / Academic Dean";

  // CO Statements
  for (let i = 1; i <= 6; i++) {
    const coCode = `CO${i}`;
    const stmt = cos[coCode] || `Course Outcome ${coCode} statement`;
    dict[`${coCode}__STATEMENT`] = stmt;
    dict[`${coCode}_STATEMENT`] = stmt;
  }

  // Find CO results indexed by CO1..CO6
  const coMap = {};
  coResults.forEach((c) => {
    coMap[c.coCode] = c;
  });

  // Direct Attainment & % Scoring
  for (let i = 1; i <= 6; i++) {
    const coCode = `CO${i}`;
    const coData = coMap[coCode] || {
      attainmentPercentage: 70,
      directLevel: 2,
      finalCoScore: 2.0,
    };

    const pctStr = `${fmtNum(coData.attainmentPercentage, 1)}%`;
    const lvlStr = String(coData.directLevel ?? 2);
    const finalStr = fmtNum(coData.finalCoScore, 2);

    // Theory & Lab direct fields
    dict[`CA1_STUDENTSSCORINGMORETHAN50MARKS_${coCode}`] = pctStr;
    dict[`CA1_ATTAINMENTLEVEL_${coCode}`] = lvlStr;

    dict[`CA2_STUDENTSSCORINGMORETHAN50MARKS_${coCode}`] = pctStr;
    dict[`CA2_ATTAINMENTLEVEL_${coCode}`] = lvlStr;

    dict[`MSE_STUDENTSSCORINGMORETHAN50MARKS_${coCode}`] = pctStr;
    dict[`MSE_ATTAINMENTLEVEL_${coCode}`] = lvlStr;

    // Laboratory specific
    dict[`CA1_CA2_${coCode}_OFSTUDENTSSECUREMORETHANSETLEVEL`] = pctStr;
    dict[`CA1_CA2_${coCode}_ATTAINMENT`] = lvlStr;

    // Audit specific
    dict[`CA1_${coCode}_STUDENT_PERCENTAGE`] = pctStr;
    dict[`CA1_${coCode}_ATTAINMENT`] = lvlStr;

    // Final CO Attainment
    dict[`FINAL_${coCode}_ATTAINMENT`] = finalStr;
    dict[`${coCode}_FINAL_ATTAINMENT`] = finalStr;
  }

  // Attainment levels headers / labels
  dict["CA1_ATTAINMENTLEVELS_CO"] = "Attainment Levels";
  dict["CA1_ATTAINMENTLEVELS_CO2"] = "Attainment Levels";
  dict["CA2_ATTAINMENTLEVELS_CO"] = "Attainment Levels";
  dict["CA2_ATTAINMENTLEVELS_CO5"] = "Attainment Levels";
  dict["MSE_ATTAINMENTLEVELS_CO"] = "Attainment Levels";
  dict["MSE_ATTAINMENTLEVELS_CO2"] = "Attainment Levels";

  // ESE fields (Theory & Lab PR/OR)
  const avgAttainmentPct = summary.avgDirectPercentage ? `${fmtNum(summary.avgDirectPercentage, 1)}%` : "72.5%";
  const avgDirectLvl = summary.avgDirectLevel ? String(Math.round(summary.avgDirectLevel)) : "2";
  dict["ESE_STUDENTSSCORINGMORETHAN50MARKS_ANALYSISSUMMARYANDATTAINMENT"] = avgAttainmentPct;
  dict["ESE_STUDENTSSCORINGMORETHAN40MARKS_ANALYSISSUMMARYANDATTAINMENT"] = avgAttainmentPct;
  dict["ESE_ATTAINMENTLEVEL_ANALYSISSUMMARYANDATTAINMENT"] = avgDirectLvl;
  dict["ESE_ATTAINMENTLEVELS_ANALYSISSUMMARYANDATTAINMENT"] = "Attainment Levels";

  // Indirect Course Exit Survey (CES)
  const xCount = String(survey.countX || 0);
  const yCount = String(survey.countY || 0);
  const zCount = String(survey.countZ || 0);
  const cesScoreStr = fmtNum(survey.cesScore, 2);

  for (let i = 1; i <= 6; i++) {
    const coCode = `CO${i}`;
    // Standard format (Theory & Lab)
    dict[`CES_${coCode}_70`] = xCount;
    dict[`CES_${coCode}_5570`] = yCount;
    dict[`CES_${coCode}_55`] = zCount;
    dict[`CES_${coCode}_ATTAINMENTOUTOF3`] = cesScoreStr;

    // Audit format
    dict[`CES_${coCode}_ABOVE_70_PERCENT`] = xCount;
    dict[`CES_${coCode}_BETWEEN_55_70_PERCENT`] = yCount;
    dict[`CES_${coCode}_BELOW_55_PERCENT`] = zCount;
    dict[`CES_${coCode}_ATTAINMENT_OUT_OF_3`] = cesScoreStr;
  }

  // Correlation Mappings: PO1..PO11 & PSO1..PSO3
  const poCodes = [
    "PO1", "PO2", "PO3", "PO4", "PO5", "PO6",
    "PO7", "PO8", "PO9", "PO10", "PO11"
  ];
  const psoCodes = ["PSO1", "PSO2", "PSO3"];

  for (let i = 1; i <= 6; i++) {
    const coCode = `CO${i}`;
    const coMapObj = mapping[coCode] || {};

    // POs
    poCodes.forEach((po) => {
      const rawVal = coMapObj[po];
      const hasVal = rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== "" && String(rawVal) !== "0" && String(rawVal) !== "-";
      const initialVal = hasVal ? String(rawVal) : "-";

      // Calculate final mapped cell value: (rawVal * co.finalCoScore) / 3.0
      let finalVal = "-";
      if (hasVal) {
        const coScore = coMap[coCode]?.finalCoScore || 2.0;
        finalVal = fmtNum((parseFloat(rawVal) * coScore) / 3.0, 2);
      }

      // Initial mappings
      dict[`INITIAL_${coCode}_${po}`] = initialVal;
      dict[`INITIAL_${i}_${po}`] = initialVal;
      dict[`${coCode}_${po}_MAPPING`] = initialVal;

      // Final mappings
      dict[`FINAL_MAPPING_${coCode}_${po}`] = finalVal;
      dict[`FINAL_MAPPING_${i}_${po}`] = finalVal;
      dict[`FINAL_${coCode}_${po}_ATTAINMENT`] = finalVal;
    });

    // PSOs
    psoCodes.forEach((pso) => {
      const rawVal = coMapObj[pso];
      const hasVal = rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== "" && String(rawVal) !== "0" && String(rawVal) !== "-";
      const initialVal = hasVal ? String(rawVal) : "-";

      let finalVal = "-";
      if (hasVal) {
        const coScore = coMap[coCode]?.finalCoScore || 2.0;
        finalVal = fmtNum((parseFloat(rawVal) * coScore) / 3.0, 2);
      }

      // Note template uses PSO01 or PSO1
      const psoPadded = pso.replace("PSO", "PSO0"); // e.g. PSO01
      dict[`INITIAL_${coCode}_${pso}`] = initialVal;
      dict[`INITIAL_${i}_${pso}`] = initialVal;
      dict[`INITIAL_${coCode}_${psoPadded}`] = initialVal;
      dict[`INITIAL_${i}_${psoPadded}`] = initialVal;
      dict[`${coCode}_${pso}_MAPPING`] = initialVal;
      dict[`${coCode}_${psoPadded}_MAPPING`] = initialVal;

      dict[`FINAL_MAPPING_${coCode}_${pso}`] = finalVal;
      dict[`FINAL_MAPPING_${i}_${pso}`] = finalVal;
      dict[`FINAL_MAPPING_${coCode}_${psoPadded}`] = finalVal;
      dict[`FINAL_MAPPING_${i}_${psoPadded}`] = finalVal;
      dict[`FINAL_${coCode}_${pso}_ATTAINMENT`] = finalVal;
      dict[`FINAL_${coCode}_${psoPadded}_ATTAINMENT`] = finalVal;
    });
  }

  // PO & PSO Averages across all COs
  poCodes.forEach((po) => {
    const poData = poResults[po];
    const avgScore = poData && poData.mappedCoCount > 0 ? fmtNum(poData.directPoScore, 2) : "-";
    dict[`FINAL_MAPPING_AVG_${po}`] = avgScore;
    dict[`AVERAGE_${po}_ATTAINMENT`] = avgScore;
  });

  psoCodes.forEach((pso) => {
    const psoData = psoResults[pso];
    const avgScore = psoData && psoData.mappedCoCount > 0 ? fmtNum(psoData.directPsoScore, 2) : "-";
    const psoPadded = pso.replace("PSO", "PSO0");
    dict[`FINAL_MAPPING_AVG_${pso}`] = avgScore;
    dict[`FINAL_MAPPING_AVG_${psoPadded}`] = avgScore;
    dict[`AVERAGE_${pso}_ATTAINMENT`] = avgScore;
    dict[`AVERAGE_${psoPadded}_ATTAINMENT`] = avgScore;
  });

  return dict;
}

/**
 * Replace placeholders in docx buffer
 */
function fillDocxTemplate(templateBuffer, replacements) {
  const zip = new PizZip(templateBuffer);
  const filesToProcess = Object.keys(zip.files).filter(
    (f) => f.startsWith("word/") && f.endsWith(".xml")
  );

  let totalReplaced = 0;
  filesToProcess.forEach((fileName) => {
    let xml = zip.file(fileName).asText();
    let replacedInFile = false;

    for (const [key, val] of Object.entries(replacements)) {
      const placeholder = `{{${key}}}`;
      if (xml.includes(placeholder)) {
        const escaped = escapeXml(val);
        xml = xml.split(placeholder).join(escaped);
        replacedInFile = true;
        totalReplaced++;
      }
    }

    if (replacedInFile) {
      zip.file(fileName, xml);
    }
  });

  return {
    buffer: zip.generate({ type: "nodebuffer" }),
    totalReplaced,
  };
}

/**
 * Main service function to generate attainment docx report from template
 */
async function generateReportFromTemplate({
  attainmentType = "theory",
  metadata = {},
  cos = {},
  mapping = {},
  calculatedAttainment = {},
}) {
  const templateFileName = getTemplateFileName(attainmentType);
  const templatePath = path.resolve(
    __dirname,
    "../../../report-templates",
    templateFileName
  );

  if (!fs.existsSync(templatePath)) {
    throw new Error(`Report template file not found: ${templatePath}`);
  }

  const templateBuffer = fs.readFileSync(templatePath);
  const replacements = buildPlaceholderDictionary({
    attainmentType,
    metadata,
    cos,
    mapping,
    calculatedAttainment,
  });

  const { buffer, totalReplaced } = fillDocxTemplate(templateBuffer, replacements);

  return {
    buffer,
    templateFileName,
    totalReplaced,
  };
}

/**
 * Convert a generated Docx buffer directly into an authentic Word-rendered PDF buffer
 * using native Microsoft Word automation on Windows.
 */
async function convertDocxBufferToPdfBuffer(docxBuffer) {
  const tmpId = crypto.randomBytes(8).toString("hex");
  const tmpDocx = path.join(os.tmpdir(), `attainx_${tmpId}.docx`);
  const tmpPdf = path.join(os.tmpdir(), `attainx_${tmpId}.pdf`);

  await fs.promises.writeFile(tmpDocx, docxBuffer);

  try {
    if (process.platform === "win32") {
      // Windows Native Word COM Automation
      const psCmd = `$word = New-Object -ComObject Word.Application; $word.Visible = $false; $doc = $word.Documents.Open('${tmpDocx.replace(/\\/g, "/")}'); $doc.SaveAs([ref]'${tmpPdf.replace(/\\/g, "/")}', [ref]17); $doc.Close([ref]0); $word.Quit(); [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null;`;
      await execPromise(`powershell -NoProfile -ExecutionPolicy Bypass -Command "${psCmd}"`, {
        timeout: 30000,
      });
    } else {
      // Linux / Docker / Cloud headless LibreOffice conversion
      const cmd = `libreoffice --headless --convert-to pdf --outdir "${os.tmpdir()}" "${tmpDocx}" || soffice --headless --convert-to pdf --outdir "${os.tmpdir()}" "${tmpDocx}"`;
      await execPromise(cmd, { timeout: 30000 });
    }

    if (fs.existsSync(tmpPdf)) {
      const pdfBuffer = await fs.promises.readFile(tmpPdf);
      return pdfBuffer;
    }
    throw new Error("PDF file was not created by document conversion engine");
  } finally {
    try { if (fs.existsSync(tmpDocx)) await fs.promises.unlink(tmpDocx); } catch (e) {}
    try { if (fs.existsSync(tmpPdf)) await fs.promises.unlink(tmpPdf); } catch (e) {}
  }
}

module.exports = {
  getTemplateFileName,
  buildPlaceholderDictionary,
  fillDocxTemplate,
  generateReportFromTemplate,
  convertDocxBufferToPdfBuffer,
};
