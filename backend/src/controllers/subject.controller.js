const prisma = require("../config/db");

const getSubjects = async (req, res, next) => {
  try {
    const { departmentId, semester, academicYear } = req.query;
    const filter = {};
    if (departmentId) filter.departmentId = Number(departmentId);
    if (semester) filter.semester = Number(semester);
    if (academicYear) filter.academicYear = String(academicYear);

    const subjects = await prisma.subject.findMany({
      where: filter,
      include: {
        teacher: true,
        department: true,
        cos: { orderBy: { code: "asc" } },
      },
      orderBy: { code: "asc" },
    });
    res.json({ success: true, data: subjects });
  } catch (error) {
    next(error);
  }
};

const getSubjectById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const subject = await prisma.subject.findUnique({
      where: { id: Number(id) },
      include: {
        teacher: true,
        department: true,
        cos: { orderBy: { code: "asc" } },
        coPoMappings: {
          include: { po: true, pso: true },
        },
        cesFeedbacks: true,
      },
    });

    if (!subject) {
      return res.status(404).json({ message: "Subject not found." });
    }
    res.json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

const createSubject = async (req, res, next) => {
  try {
    const { code, name, semester, academicYear, teacherId, departmentId } = req.body;
    if (!code || !name || !semester || !academicYear || !teacherId || !departmentId) {
      return res.status(400).json({
        message: "code, name, semester, academicYear, teacherId, and departmentId are required.",
      });
    }

    const subject = await prisma.subject.create({
      data: {
        code,
        name,
        semester: Number(semester),
        academicYear,
        teacherId: Number(teacherId),
        departmentId: Number(departmentId),
      },
    });
    res.status(201).json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

const updateSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { code, name, semester, academicYear, teacherId, departmentId } = req.body;

    const subject = await prisma.subject.update({
      where: { id: Number(id) },
      data: {
        ...(code && { code }),
        ...(name && { name }),
        ...(semester && { semester: Number(semester) }),
        ...(academicYear && { academicYear }),
        ...(teacherId && { teacherId: Number(teacherId) }),
        ...(departmentId && { departmentId: Number(departmentId) }),
      },
    });
    res.json({ success: true, data: subject });
  } catch (error) {
    next(error);
  }
};

const deleteSubject = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.subject.delete({ where: { id: Number(id) } });
    res.json({ success: true, message: "Subject deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getSubjects,
  getSubjectById,
  createSubject,
  updateSubject,
  deleteSubject,
};
