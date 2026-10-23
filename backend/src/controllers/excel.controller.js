const ExcelJS = require("exceljs");
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  Table,
  TableRow,
  TableCell,
  WidthType,
  AlignmentType,
  BorderStyle,
  HeadingLevel,
} = require("docx");
const prisma = require("../config/db");
const { calculateSubjectAttainment } = require("../services/attainment.service");

/**
 * 1. Generate Student Marks Template
 */
const downloadStudentMarksTemplate = async (req, res, next) => {
  try {
    const { subjectId } = req.query;
    if (!subjectId) {
      return res.status(400).json({ message: "subjectId query parameter is required." });
    }

    const subject = await prisma.subject.findUnique({
      where: { id: Number(subjectId) },
      include: { cos: { orderBy: { code: "asc" } } },
    });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found." });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("Student Marks");

    // Columns: Roll No / PRN, CO1, CO2, etc. (No Name column)
    const columns = [
      { header: "Roll No / PRN", key: "rollNo", width: 18 },
    ];

    subject.cos.forEach((co) => {
      columns.push({ header: co.code, key: co.code, width: 12 });
    });

    sheet.columns = columns;

    // Add 5 sample rows
    for (let i = 1; i <= 5; i++) {
      const sampleRow = {
        rollNo: `2025CS${100 + i}`,
      };
      subject.cos.forEach((co) => {
        sampleRow[co.code] = Math.floor(Math.random() * 8) + 12;
      });
      sheet.addRow(sampleRow);
    }

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Marks_Template_${subject.code}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

/**
 * 2. Generate CES Template
 */
const downloadCesTemplate = async (req, res, next) => {
  try {
    const { subjectId } = req.query;
    if (!subjectId) {
      return res.status(400).json({ message: "subjectId is required." });
    }

    const subject = await prisma.subject.findUnique({
      where: { id: Number(subjectId) },
      include: { cos: { orderBy: { code: "asc" } } },
    });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found." });
    }

    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet("CES Feedback");

    sheet.columns = [
      { header: "CO Code", key: "code", width: 14 },
      { header: "Course Outcome Statement", key: "statement", width: 45 },
      { header: "X (>70% Satisfied)", key: "countX", width: 20 },
      { header: "Y (55-70% Satisfied)", key: "countY", width: 22 },
      { header: "Z (<55% Satisfied)", key: "countZ", width: 20 },
    ];

    subject.cos.forEach((co) => {
      sheet.addRow({
        code: co.code,
        statement: co.statement,
        countX: 45,
        countY: 12,
        countZ: 3,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=CES_Template_${subject.code}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

/**
 * 3. Upload & Ingest Student Marks
 */
const uploadStudentMarks = async (req, res, next) => {
  try {
    const { subjectId } = req.body;
    if (!subjectId || !req.file) {
      return res.status(400).json({ message: "subjectId and file upload are required." });
    }

    const sId = Number(subjectId);
    const subject = await prisma.subject.findUnique({
      where: { id: sId },
      include: { cos: { orderBy: { code: "asc" } } },
    });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found." });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const sheet = workbook.worksheets[0];

    let headerRowIndex = -1;
    let rollColIdx = -1;
    const coColMap = {}; // colIndex -> co.id

    // 6.1 Header detection in first 10 rows
    for (let r = 1; r <= Math.min(10, sheet.rowCount); r++) {
      const row = sheet.getRow(r);
      row.eachCell((cell, colNumber) => {
        const val = String(cell.value || "").toUpperCase().trim();
        if (
          val.includes("ROLL") ||
          val.includes("PRN") ||
          val.includes("ENROL") ||
          val.includes("USN") ||
          val.includes("STUDENT ID")
        ) {
          headerRowIndex = r;
          rollColIdx = colNumber;
        }
      });
      if (headerRowIndex !== -1) break;
    }

    if (headerRowIndex === -1) {
      headerRowIndex = 1;
      rollColIdx = 1;
    }

    // Map columns to COs
    const headerRow = sheet.getRow(headerRowIndex);
    headerRow.eachCell((cell, colNumber) => {
      const val = String(cell.value || "").trim().toUpperCase();
      const matchedCo = subject.cos.find((c) => {
        const cCode = c.code.toUpperCase();
        return val === cCode || val.startsWith(cCode + " ") || val.endsWith(" " + cCode);
      });

      if (matchedCo) {
        coColMap[colNumber] = matchedCo.id;
      }
    });

    // If no direct CO1..CO6 found, map columns CA1, CA2, MSE, ESE sequentially to COs
    if (Object.keys(coColMap).length === 0) {
      let coPointer = 0;
      headerRow.eachCell((cell, colNumber) => {
        if (colNumber === rollColIdx) return;
        const val = String(cell.value || "").toUpperCase().trim();
        if (
          (val.includes("CA") ||
            val.includes("MSE") ||
            val.includes("ESE") ||
            val.includes("TEST") ||
            val.includes("EXAM") ||
            val.includes("MARKS")) &&
          coPointer < subject.cos.length
        ) {
          coColMap[colNumber] = subject.cos[coPointer].id;
          coPointer++;
        }
      });
    }

    // Fallback: If still not mapped, use whatever columns follow the roll column
    if (Object.keys(coColMap).length === 0) {
      let coPointer = 0;
      headerRow.eachCell((cell, colNumber) => {
        if (colNumber > rollColIdx && coPointer < subject.cos.length) {
          coColMap[colNumber] = subject.cos[coPointer].id;
          coPointer++;
        }
      });
    }

    const marksToInsert = [];

    // Parse data rows
    for (let r = headerRowIndex + 1; r <= sheet.rowCount; r++) {
      const row = sheet.getRow(r);
      let rollNoVal = row.getCell(rollColIdx).value;
      if (!rollNoVal) continue;

      let rollNoStr = String(rollNoVal).trim();
      const upper = rollNoStr.toUpperCase();
      if (
        upper.includes("TOTAL") ||
        upper.includes("AVERAGE") ||
        upper.includes("MEAN") ||
        upper.includes("MAX") ||
        upper.includes("MIN")
      ) {
        continue;
      }

      // Extract roll digits/alphanumeric
      rollNoStr = rollNoStr.replace(/^(PRN|ROLL|ENROLLMENT)[:\s-]*/i, "").trim();

      Object.entries(coColMap).forEach(([colIdx, coId]) => {
        const rawMark = row.getCell(Number(colIdx)).value;
        if (rawMark !== null && rawMark !== undefined && rawMark !== "") {
          const numMark = parseFloat(rawMark);
          if (!isNaN(numMark)) {
            marksToInsert.push({
              studentRollNo: rollNoStr,
              marks: numMark,
              subjectId: sId,
              coId: Number(coId),
            });
          }
        }
      });
    }

    if (marksToInsert.length === 0) {
      return res.status(400).json({
        message: "No valid student marks could be extracted from the file.",
      });
    }

    // Upsert transaction: replace previous marks for this subject
    await prisma.$transaction(async (tx) => {
      await tx.studentMark.deleteMany({ where: { subjectId: sId } });
      await tx.studentMark.createMany({ data: marksToInsert });
    });

    const uniqueStudents = new Set(marksToInsert.map((m) => m.studentRollNo)).size;

    res.json({
      success: true,
      message: `Ingested ${marksToInsert.length} mark entries across ${uniqueStudents} students.`,
      recordsCount: marksToInsert.length,
      studentsCount: uniqueStudents,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 4. Upload & Ingest CES Survey
 */
const uploadCesFeedback = async (req, res, next) => {
  try {
    const { subjectId } = req.body;
    if (!subjectId || !req.file) {
      return res.status(400).json({ message: "subjectId and file upload are required." });
    }

    const sId = Number(subjectId);
    const subject = await prisma.subject.findUnique({
      where: { id: sId },
      include: { cos: { orderBy: { code: "asc" } } },
    });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found." });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);
    const sheet = workbook.worksheets[0];

    const records = [];

    // Parse each row looking for CO match
    for (let r = 2; r <= sheet.rowCount; r++) {
      const row = sheet.getRow(r);
      const coVal = String(row.getCell(1).value || "").toUpperCase().trim();
      const matchedCo = subject.cos.find((c) => coVal.includes(c.code.toUpperCase()));

      if (matchedCo) {
        const countX = parseInt(row.getCell(3).value, 10) || 0;
        const countY = parseInt(row.getCell(4).value, 10) || 0;
        const countZ = parseInt(row.getCell(5).value, 10) || 0;

        records.push({
          subjectId: sId,
          coId: matchedCo.id,
          countX,
          countY,
          countZ,
        });
      }
    }

    for (const rec of records) {
      await prisma.cesFeedback.upsert({
        where: {
          subjectId_coId: {
            subjectId: rec.subjectId,
            coId: rec.coId,
          },
        },
        update: { countX: rec.countX, countY: rec.countY, countZ: rec.countZ },
        create: rec,
      });
    }

    res.json({
      success: true,
      message: `Updated CES feedback for ${records.length} course outcomes.`,
      data: records,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 5. Export Full Attainment to Multi-Sheet Excel
 */
const exportAttainmentWorkbook = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const attainment = await calculateSubjectAttainment(subjectId, req.query);

    const workbook = new ExcelJS.Workbook();

    // Sheet 1: Direct Attainment
    const sheet1 = workbook.addWorksheet("Direct CO Attainment");
    sheet1.columns = [
      { header: "CO Code", key: "code", width: 10 },
      { header: "Outcome Statement", key: "statement", width: 40 },
      { header: "Group", key: "group", width: 10 },
      { header: "Target %", key: "targetPct", width: 12 },
      { header: "Max Marks", key: "maxMarks", width: 12 },
      { header: "Cutoff", key: "cutoff", width: 10 },
      { header: "Students Attempted", key: "attempted", width: 18 },
      { header: "Above Cutoff", key: "above", width: 15 },
      { header: "Attainment %", key: "pct", width: 15 },
      { header: "NBA Level (0-3)", key: "level", width: 16 },
    ];

    attainment.coResults.forEach((co) => {
      sheet1.addRow({
        code: co.code,
        statement: co.statement,
        group: co.assessmentGroup,
        targetPct: `${co.targetPercentage}%`,
        maxMarks: co.maxMarks,
        cutoff: co.cutoffMarks,
        attempted: co.studentsAttempted,
        above: co.studentsAboveCutoff,
        pct: `${co.attainmentPercentage}%`,
        level: co.directLevel,
      });
    });

    // Sheet 2: Combined Overall CO Attainment
    const sheet2 = workbook.addWorksheet("Final CO Attainment");
    sheet2.columns = [
      { header: "CO Code", key: "code", width: 10 },
      { header: "Direct Level (0-3)", key: "direct", width: 18 },
      { header: "CES Indirect Score (0-3)", key: "ces", width: 24 },
      { header: "Final Attainment (90% + 10%)", key: "final", width: 28 },
    ];

    attainment.coResults.forEach((co) => {
      sheet2.addRow({
        code: co.code,
        direct: co.directLevel,
        ces: co.ces.cesScore,
        final: co.finalCoScore,
      });
    });

    // Sheet 3: PO Attainment Summary
    const sheet3 = workbook.addWorksheet("PO Attainment");
    sheet3.columns = [
      { header: "PO Code", key: "code", width: 12 },
      { header: "Statement", key: "statement", width: 45 },
      { header: "Mapped COs", key: "mappedCount", width: 14 },
      { header: "Direct PO Score (0-3)", key: "directScore", width: 22 },
      { header: "Weighted Attainment %", key: "weightedPct", width: 25 },
    ];

    Object.values(attainment.poResults).forEach((po) => {
      sheet3.addRow({
        code: po.code,
        statement: po.statement,
        mappedCount: po.mappedCoCount,
        directScore: po.directPoScore,
        weightedPct: `${po.weightedPercentage}%`,
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=Attainment_${attainment.subject.code}.xlsx`
    );

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    next(error);
  }
};

/**
 * 6. Export Word Report (.docx) with Institutional Header & Signatures
 */
const exportWordReport = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const attainment = await calculateSubjectAttainment(subjectId, req.query);

    const doc = new Document({
      sections: [
        {
          properties: {},
          children: [
            // Institutional Header
            new Paragraph({
              text: "INSTITUTE OF TECHNOLOGY & MANAGEMENT",
              heading: HeadingLevel.HEADING_1,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: `DEPARTMENT OF ${attainment.subject.department.toUpperCase()}`,
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({
              text: "NBA ACCREDITATION - COURSE ATTAINMENT REPORT",
              alignment: AlignmentType.CENTER,
            }),
            new Paragraph({ text: "" }),

            // Subject Details Table
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Course Code:")] }),
                    new TableCell({ children: [new Paragraph(attainment.subject.code)] }),
                    new TableCell({ children: [new Paragraph("Course Name:")] }),
                    new TableCell({ children: [new Paragraph(attainment.subject.name)] }),
                  ],
                }),
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("Academic Year:")] }),
                    new TableCell({ children: [new Paragraph(attainment.subject.academicYear)] }),
                    new TableCell({ children: [new Paragraph("Faculty In-Charge:")] }),
                    new TableCell({ children: [new Paragraph(attainment.subject.teacher || "N/A")] }),
                  ],
                }),
              ],
            }),

            new Paragraph({ text: "" }),
            new Paragraph({
              text: "1. Course Outcome (CO) Direct Attainment Summary",
              heading: HeadingLevel.HEADING_2,
            }),

            // Direct Attainment Table
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("CO")] }),
                    new TableCell({ children: [new Paragraph("Assessment")] }),
                    new TableCell({ children: [new Paragraph("Target %")] }),
                    new TableCell({ children: [new Paragraph("Attempted")] }),
                    new TableCell({ children: [new Paragraph(">= Cutoff")] }),
                    new TableCell({ children: [new Paragraph("Attainment %")] }),
                    new TableCell({ children: [new Paragraph("NBA Level")] }),
                  ],
                }),
                ...attainment.coResults.map(
                  (co) =>
                    new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph(co.code)] }),
                        new TableCell({ children: [new Paragraph(co.assessmentGroup)] }),
                        new TableCell({ children: [new Paragraph(`${co.targetPercentage}%`)] }),
                        new TableCell({ children: [new Paragraph(String(co.studentsAttempted))] }),
                        new TableCell({ children: [new Paragraph(String(co.studentsAboveCutoff))] }),
                        new TableCell({ children: [new Paragraph(`${co.attainmentPercentage}%`)] }),
                        new TableCell({ children: [new Paragraph(String(co.directLevel))] }),
                      ],
                    })
                ),
              ],
            }),

            new Paragraph({ text: "" }),
            new Paragraph({
              text: "2. Final Course Outcome Attainment (90% Direct + 10% Indirect)",
              heading: HeadingLevel.HEADING_2,
            }),

            // Combined Table
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({ children: [new Paragraph("CO Code")] }),
                    new TableCell({ children: [new Paragraph("Direct Level (0-3)")] }),
                    new TableCell({ children: [new Paragraph("CES Indirect Score")] }),
                    new TableCell({ children: [new Paragraph("Final CO Attainment")] }),
                  ],
                }),
                ...attainment.coResults.map(
                  (co) =>
                    new TableRow({
                      children: [
                        new TableCell({ children: [new Paragraph(co.code)] }),
                        new TableCell({ children: [new Paragraph(String(co.directLevel))] }),
                        new TableCell({ children: [new Paragraph(String(co.ces.cesScore))] }),
                        new TableCell({ children: [new Paragraph(String(co.finalCoScore))] }),
                      ],
                    })
                ),
              ],
            }),

            new Paragraph({ text: "" }),
            new Paragraph({ text: "" }),

            // Signatures block
            new Table({
              width: { size: 100, type: WidthType.PERCENTAGE },
              rows: [
                new TableRow({
                  children: [
                    new TableCell({
                      children: [
                        new Paragraph({ text: "Prepared By:" }),
                        new Paragraph({ text: `${attainment.subject.teacher || "Faculty"}` }),
                        new Paragraph({ text: "Course In-Charge" }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({ text: "Verified By:" }),
                        new Paragraph({ text: "Module Coordinator" }),
                        new Paragraph({ text: "Academic Committee" }),
                      ],
                    }),
                    new TableCell({
                      children: [
                        new Paragraph({ text: "Approved By:" }),
                        new Paragraph({ text: "Head of Department" }),
                        new Paragraph({ text: `${attainment.subject.department}` }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        },
      ],
    });

    const buffer = await Packer.toBuffer(doc);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=NBA_Attainment_Report_${attainment.subject.code}.docx`
    );

    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  downloadStudentMarksTemplate,
  downloadCesTemplate,
  uploadStudentMarks,
  uploadCesFeedback,
  exportAttainmentWorkbook,
  exportWordReport,
};
