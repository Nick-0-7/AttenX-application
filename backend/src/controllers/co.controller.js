const prisma = require("../config/db");

const getCourseOutcomes = async (req, res, next) => {
  try {
    const { subjectId } = req.query;
    const filter = {};
    if (subjectId) filter.subjectId = Number(subjectId);

    const cos = await prisma.courseOutcome.findMany({
      where: filter,
      orderBy: { code: "asc" },
    });
    res.json({ success: true, data: cos });
  } catch (error) {
    next(error);
  }
};

const createCourseOutcome = async (req, res, next) => {
  try {
    const { code, statement, subjectId } = req.body;
    if (!code || !statement || !subjectId) {
      return res.status(400).json({ message: "code, statement, and subjectId are required." });
    }

    const co = await prisma.courseOutcome.create({
      data: {
        code,
        statement,
        subjectId: Number(subjectId),
      },
    });
    res.status(201).json({ success: true, data: co });
  } catch (error) {
    next(error);
  }
};

const updateCourseOutcome = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, statement } = req.body;
    const co = await prisma.courseOutcome.update({
      where: { id: Number(id) },
      data: {
        ...(code && { code }),
        ...(statement && { statement }),
      },
    });
    res.json({ success: true, data: co });
  } catch (error) {
    next(error);
  }
};

const deleteCourseOutcome = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.courseOutcome.delete({ where: { id: Number(id) } });
    res.json({ success: true, message: "Course outcome deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCourseOutcomes,
  createCourseOutcome,
  updateCourseOutcome,
  deleteCourseOutcome,
};
