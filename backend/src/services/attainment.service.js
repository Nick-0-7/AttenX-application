const prisma = require("../config/db");

/**
 * 4.1 Max Marks Dynamic Scale Detection
 */
function detectMaxMarks(marksArray) {
  if (!marksArray || marksArray.length === 0) return 20;
  const maxObserved = Math.max(...marksArray.filter((m) => typeof m === "number" && !isNaN(m)));
  if (!isFinite(maxObserved) || maxObserved <= 0) return 20;

  const standardScales = [10, 15, 20, 25, 30, 40, 50, 75, 100];
  for (const scale of standardScales) {
    if (maxObserved <= scale) return scale;
  }
  return 100;
}

/**
 * 4.2 NBA Attainment Level Mapping (0 to 3 scale)
 */
function getNbaLevel(percentage) {
  if (percentage >= 80) return 3;
  if (percentage >= 70) return 2;
  if (percentage >= 60) return 1;
  return 0;
}

/**
 * 4.3 Indirect Attainment: Course Exit Survey (CES)
 */
function calculateCesScore(countX, countY, countZ) {
  const x = Number(countX) || 0;
  const y = Number(countY) || 0;
  const z = Number(countZ) || 0;
  const total = x + y + z;
  if (total === 0) return 0;
  const score = (3 * x + 2 * y + 1 * z) / total;
  return Number(score.toFixed(2));
}

/**
 * 4.4 Final Overall CO Attainment (90% Direct + 10% Indirect)
 */
function calculateFinalCoScore(directLevel, cesScore) {
  const finalScore = 0.9 * directLevel + 0.1 * cesScore;
  return Number(finalScore.toFixed(2));
}

/**
 * Full calculation for a specific Subject
 */
async function calculateSubjectAttainment(subjectId, options = {}) {
  const targetCa1 = Number(options.targetCa1 || options.thresholdCa1 || options.threshold || 60);
  const targetCa2 = Number(options.targetCa2 || options.thresholdCa2 || options.threshold || 60);

  // 1. Fetch Subject with COs, mappings, marks, and CES
  const subject = await prisma.subject.findUnique({
    where: { id: Number(subjectId) },
    include: {
      teacher: true,
      department: true,
      cos: {
        orderBy: { code: "asc" },
      },
      studentMarks: true,
      cesFeedbacks: true,
      coPoMappings: {
        include: {
          po: true,
          pso: true,
        },
      },
    },
  });

  if (!subject) {
    throw new Error(`Subject with ID ${subjectId} not found.`);
  }

  // Fetch all Program Outcomes and PSOs
  const programOutcomes = await prisma.programOutcome.findMany({
    orderBy: { code: "asc" },
  });
  const programSpecificOutcomes = await prisma.programSpecificOutcome.findMany({
    orderBy: { code: "asc" },
  });

  const cos = subject.cos;
  const numCos = cos.length;
  const ca1CutoffIndex = Math.ceil(numCos / 2);

  // Unique student count enrolled in this subject
  const uniqueStudents = new Set(subject.studentMarks.map((m) => m.studentRollNo));
  const totalStudentsEnrolled = uniqueStudents.size || 1; // prevent div by 0

  // 2. Direct CO Attainment Calculations
  const coResults = cos.map((co, index) => {
    const isCa1 = index < ca1CutoffIndex;
    const targetPercentage = isCa1 ? targetCa1 : targetCa2;
    const assessmentGroup = isCa1 ? "CA1" : "CA2";

    const marksForCo = subject.studentMarks
      .filter((m) => m.coId === co.id)
      .map((m) => m.marks);

    const maxMarks = detectMaxMarks(marksForCo);
    const cutoffMarks = Number(((targetPercentage / 100) * maxMarks).toFixed(2));

    const studentsAttempted = marksForCo.length;
    const studentsAboveCutoff = marksForCo.filter((m) => m >= cutoffMarks).length;

    const attainmentPercentage = totalStudentsEnrolled > 0
      ? Number(((studentsAboveCutoff / totalStudentsEnrolled) * 100).toFixed(2))
      : 0;

    const directLevel = getNbaLevel(attainmentPercentage);

    // CES Indirect
    const ces = subject.cesFeedbacks.find((c) => c.coId === co.id) || {
      countX: 0,
      countY: 0,
      countZ: 0,
    };
    const cesScore = calculateCesScore(ces.countX, ces.countY, ces.countZ);

    // Final CO Attainment
    const finalCoScore = calculateFinalCoScore(directLevel, cesScore);

    return {
      coId: co.id,
      code: co.code,
      statement: co.statement,
      assessmentGroup,
      targetPercentage,
      maxMarks,
      cutoffMarks,
      studentsAttempted,
      studentsAboveCutoff,
      totalStudentsEnrolled,
      attainmentPercentage,
      directLevel,
      ces: {
        countX: ces.countX,
        countY: ces.countY,
        countZ: ces.countZ,
        cesScore,
      },
      finalCoScore,
    };
  });

  // 3. PO / PSO Attainment Matrix Calculations
  const poResults = {};
  programOutcomes.forEach((po) => {
    poResults[po.code] = {
      poId: po.id,
      code: po.code,
      statement: po.statement,
      cellValues: {}, // coCode -> { level, cellAttainment }
      mappedCoCount: 0,
      sumCellAttainment: 0,
      directPoScore: 0,
      weightedSum: 0,
      totalWeights: 0,
      weightedPercentage: 0,
    };
  });

  const psoResults = {};
  programSpecificOutcomes.forEach((pso) => {
    psoResults[pso.code] = {
      psoId: pso.id,
      code: pso.code,
      statement: pso.statement,
      cellValues: {},
      mappedCoCount: 0,
      sumCellAttainment: 0,
      directPsoScore: 0,
      weightedSum: 0,
      totalWeights: 0,
      weightedPercentage: 0,
    };
  });

  // Process mappings
  subject.coPoMappings.forEach((mapping) => {
    const coData = coResults.find((c) => c.coId === mapping.coId);
    if (!coData || mapping.level <= 0) return;

    // Cell Attainment formula: ceil( (L * Final CO) / 3.0 * 100 ) / 100
    const cellAttainment = Number(
      (Math.ceil(((mapping.level * coData.finalCoScore) / 3.0) * 100) / 100).toFixed(2)
    );

    if (mapping.poId && mapping.po) {
      const p = poResults[mapping.po.code];
      if (p) {
        p.cellValues[coData.code] = {
          level: mapping.level,
          cellAttainment,
        };
        p.mappedCoCount += 1;
        p.sumCellAttainment += cellAttainment;
        p.weightedSum += coData.attainmentPercentage * mapping.level;
        p.totalWeights += mapping.level;
      }
    }

    if (mapping.psoId && mapping.pso) {
      const ps = psoResults[mapping.pso.code];
      if (ps) {
        ps.cellValues[coData.code] = {
          level: mapping.level,
          cellAttainment,
        };
        ps.mappedCoCount += 1;
        ps.sumCellAttainment += cellAttainment;
        ps.weightedSum += coData.attainmentPercentage * mapping.level;
        ps.totalWeights += mapping.level;
      }
    }
  });

  // Finalize PO summary averages
  Object.keys(poResults).forEach((code) => {
    const item = poResults[code];
    item.directPoScore = item.mappedCoCount > 0
      ? Number((item.sumCellAttainment / item.mappedCoCount).toFixed(2))
      : 0;
    item.weightedPercentage = item.totalWeights > 0
      ? Number((item.weightedSum / item.totalWeights).toFixed(2))
      : 0;
  });

  // Finalize PSO summary averages
  Object.keys(psoResults).forEach((code) => {
    const item = psoResults[code];
    item.directPsoScore = item.mappedCoCount > 0
      ? Number((item.sumCellAttainment / item.mappedCoCount).toFixed(2))
      : 0;
    item.weightedPercentage = item.totalWeights > 0
      ? Number((item.weightedSum / item.totalWeights).toFixed(2))
      : 0;
  });

  return {
    subject: {
      id: subject.id,
      code: subject.code,
      name: subject.name,
      semester: subject.semester,
      academicYear: subject.academicYear,
      teacher: subject.teacher?.name,
      department: subject.department?.name,
    },
    totalStudentsEnrolled,
    targetCa1,
    targetCa2,
    coResults,
    poResults,
    psoResults,
  };
}

module.exports = {
  detectMaxMarks,
  getNbaLevel,
  calculateCesScore,
  calculateFinalCoScore,
  calculateSubjectAttainment,
};
