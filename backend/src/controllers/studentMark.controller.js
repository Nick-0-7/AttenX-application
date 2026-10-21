const prisma = require("../config/db");

const getStudentMarks = async (req, res, next) => {
  try {
    const { subjectId } = req.query;
    if (!subjectId) {
      return res.status(400).json({ message: "subjectId query parameter is required." });
    }

    const marks = await prisma.studentMark.findMany({
      where: { subjectId: Number(subjectId) },
      include: { co: true },
      orderBy: [{ studentRollNo: "asc" }, { coId: "asc" }],
    });

    res.json({ success: true, count: marks.length, data: marks });
  } catch (error) {
    next(error);
  }
};

const createStudentMark = async (req, res, next) => {
  try {
    const { studentRollNo, marks, subjectId, coId } = req.body;
    if (!studentRollNo || marks === undefined || !subjectId || !coId) {
      return res.status(400).json({
        message: "studentRollNo, marks, subjectId, and coId are required.",
      });
    }

    const markRecord = await prisma.studentMark.create({
      data: {
        studentRollNo: String(studentRollNo).trim(),
        marks: parseFloat(marks),
        subjectId: Number(subjectId),
        coId: Number(coId),
      },
    });

    res.status(201).json({ success: true, data: markRecord });
  } catch (error) {
    next(error);
  }
};

module.exports = { getStudentMarks, createStudentMark };
