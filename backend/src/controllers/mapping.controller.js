const prisma = require("../config/db");

const getMappings = async (req, res, next) => {
  try {
    const { subjectId } = req.query;
    if (!subjectId) {
      return res.status(400).json({ message: "subjectId query parameter is required." });
    }

    const mappings = await prisma.coPoMapping.findMany({
      where: { subjectId: Number(subjectId) },
      include: {
        co: true,
        po: true,
        pso: true,
      },
    });

    res.json({ success: true, data: mappings });
  } catch (error) {
    next(error);
  }
};

const saveMappings = async (req, res, next) => {
  try {
    const { subjectId, mappings } = req.body;
    if (!subjectId || !Array.isArray(mappings)) {
      return res.status(400).json({ message: "subjectId and an array of mappings are required." });
    }

    const sId = Number(subjectId);

    // Transaction to replace mappings safely
    await prisma.$transaction(async (tx) => {
      await tx.coPoMapping.deleteMany({
        where: { subjectId: sId },
      });

      const recordsToCreate = mappings.map((m) => ({
        subjectId: sId,
        coId: Number(m.coId),
        poId: m.poId ? Number(m.poId) : null,
        psoId: m.psoId ? Number(m.psoId) : null,
        level: Number(m.level) || 0,
      }));

      if (recordsToCreate.length > 0) {
        await tx.coPoMapping.createMany({
          data: recordsToCreate,
        });
      }
    });

    const updatedMappings = await prisma.coPoMapping.findMany({
      where: { subjectId: sId },
      include: { co: true, po: true, pso: true },
    });

    res.json({
      success: true,
      message: "CO-PO correlation mappings saved successfully.",
      data: updatedMappings,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMappings, saveMappings };
