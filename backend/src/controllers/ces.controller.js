const prisma = require("../config/db");
const { detectMaxMarks } = require("../services/attainment.service");

const getCesFeedbacks = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const feedbacks = await prisma.cesFeedback.findMany({
      where: { subjectId: Number(subjectId) },
      include: { co: true },
      orderBy: { co: { code: "asc" } },
    });
    res.json({ success: true, data: feedbacks });
  } catch (error) {
    next(error);
  }
};

const saveCesFeedback = async (req, res, next) => {
  try {
    const { subjectId, coId, countX = 0, countY = 0, countZ = 0 } = req.body;
    if (!subjectId || !coId) {
      return res.status(400).json({ message: "subjectId and coId are required." });
    }

    const sId = Number(subjectId);
    const cId = Number(coId);

    const feedback = await prisma.cesFeedback.upsert({
      where: {
        subjectId_coId: {
          subjectId: sId,
          coId: cId,
        },
      },
      update: {
        countX: Number(countX) || 0,
        countY: Number(countY) || 0,
        countZ: Number(countZ) || 0,
      },
      create: {
        subjectId: sId,
        coId: cId,
        countX: Number(countX) || 0,
        countY: Number(countY) || 0,
        countZ: Number(countZ) || 0,
      },
    });

    res.json({ success: true, data: feedback });
  } catch (error) {
    next(error);
  }
};

const bulkSaveCesFeedback = async (req, res, next) => {
  try {
    const { subjectId, feedbacks } = req.body;
    if (!subjectId || !Array.isArray(feedbacks)) {
      return res.status(400).json({ message: "subjectId and feedbacks array are required." });
    }

    const sId = Number(subjectId);
    const results = [];

    for (const f of feedbacks) {
      const cId = Number(f.coId);
      const saved = await prisma.cesFeedback.upsert({
        where: {
          subjectId_coId: {
            subjectId: sId,
            coId: cId,
          },
        },
        update: {
          countX: Number(f.countX) || 0,
          countY: Number(f.countY) || 0,
          countZ: Number(f.countZ) || 0,
        },
        create: {
          subjectId: sId,
          coId: cId,
          countX: Number(f.countX) || 0,
          countY: Number(f.countY) || 0,
          countZ: Number(f.countZ) || 0,
        },
      });
      results.push(saved);
    }

    res.json({
      success: true,
      message: "CES feedback data saved successfully.",
      data: results,
    });
  } catch (error) {
    next(error);
  }
};

const generateFromMarks = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const sId = Number(subjectId);

    const cos = await prisma.courseOutcome.findMany({
      where: { subjectId: sId },
      orderBy: { code: "asc" },
    });

    const allMarks = await prisma.studentMark.findMany({
      where: { subjectId: sId },
    });

    const generated = [];

    for (const co of cos) {
      const coMarks = allMarks.filter((m) => m.coId === co.id).map((m) => m.marks);
      const maxMarks = detectMaxMarks(coMarks);

      let countX = 0; // >= 70%
      let countY = 0; // 55% - 69.99%
      let countZ = 0; // < 55%

      coMarks.forEach((mark) => {
        const pct = (mark / maxMarks) * 100;
        if (pct >= 70) countX++;
        else if (pct >= 55) countY++;
        else countZ++;
      });

      const upserted = await prisma.cesFeedback.upsert({
        where: {
          subjectId_coId: {
            subjectId: sId,
            coId: co.id,
          },
        },
        update: { countX, countY, countZ },
        create: {
          subjectId: sId,
          coId: co.id,
          countX,
          countY,
          countZ,
        },
      });

      generated.push(upserted);
    }

    res.json({
      success: true,
      message: "CES feedback simulated and generated from student marks distribution.",
      data: generated,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCesFeedbacks,
  saveCesFeedback,
  bulkSaveCesFeedback,
  generateFromMarks,
};
