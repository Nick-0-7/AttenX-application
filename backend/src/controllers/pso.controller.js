const prisma = require("../config/db");

const getProgramSpecificOutcomes = async (req, res, next) => {
  try {
    const psos = await prisma.programSpecificOutcome.findMany({
      orderBy: { code: "asc" },
    });
    res.json({ success: true, data: psos });
  } catch (error) {
    next(error);
  }
};

const createProgramSpecificOutcome = async (req, res, next) => {
  try {
    const { code, statement } = req.body;
    if (!code || !statement) {
      return res.status(400).json({ message: "code and statement are required." });
    }
    const pso = await prisma.programSpecificOutcome.create({
      data: { code, statement },
    });
    res.status(201).json({ success: true, data: pso });
  } catch (error) {
    next(error);
  }
};

const updateProgramSpecificOutcome = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, statement } = req.body;
    const pso = await prisma.programSpecificOutcome.update({
      where: { id: Number(id) },
      data: {
        ...(code && { code }),
        ...(statement && { statement }),
      },
    });
    res.json({ success: true, data: pso });
  } catch (error) {
    next(error);
  }
};

const deleteProgramSpecificOutcome = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.programSpecificOutcome.delete({ where: { id: Number(id) } });
    res.json({ success: true, message: "Program specific outcome deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProgramSpecificOutcomes,
  createProgramSpecificOutcome,
  updateProgramSpecificOutcome,
  deleteProgramSpecificOutcome,
};
