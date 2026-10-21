const prisma = require("../config/db");

const getProgramOutcomes = async (req, res, next) => {
  try {
    const pos = await prisma.programOutcome.findMany({
      orderBy: { code: "asc" },
    });
    res.json({ success: true, data: pos });
  } catch (error) {
    next(error);
  }
};

const createProgramOutcome = async (req, res, next) => {
  try {
    const { code, statement } = req.body;
    if (!code || !statement) {
      return res.status(400).json({ message: "code and statement are required." });
    }
    const po = await prisma.programOutcome.create({
      data: { code, statement },
    });
    res.status(201).json({ success: true, data: po });
  } catch (error) {
    next(error);
  }
};

const updateProgramOutcome = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, statement } = req.body;
    const po = await prisma.programOutcome.update({
      where: { id: Number(id) },
      data: {
        ...(code && { code }),
        ...(statement && { statement }),
      },
    });
    res.json({ success: true, data: po });
  } catch (error) {
    next(error);
  }
};

const deleteProgramOutcome = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.programOutcome.delete({ where: { id: Number(id) } });
    res.json({ success: true, message: "Program outcome deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProgramOutcomes,
  createProgramOutcome,
  updateProgramOutcome,
  deleteProgramOutcome,
};
