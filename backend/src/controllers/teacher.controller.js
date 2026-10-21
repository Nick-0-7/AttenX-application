const prisma = require("../config/db");

const getTeachers = async (req, res, next) => {
  try {
    const teachers = await prisma.teacher.findMany({
      include: { subjects: true },
      orderBy: { name: "asc" },
    });
    res.json({ success: true, data: teachers });
  } catch (error) {
    next(error);
  }
};

const createTeacher = async (req, res, next) => {
  try {
    const { name, email } = req.body;
    if (!name || !email) {
      return res.status(400).json({ message: "Name and email are required." });
    }
    const teacher = await prisma.teacher.create({ data: { name, email } });
    res.status(201).json({ success: true, data: teacher });
  } catch (error) {
    next(error);
  }
};

const updateTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;
    const teacher = await prisma.teacher.update({
      where: { id: Number(id) },
      data: { name, email },
    });
    res.json({ success: true, data: teacher });
  } catch (error) {
    next(error);
  }
};

const deleteTeacher = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.teacher.delete({ where: { id: Number(id) } });
    res.json({ success: true, message: "Teacher deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTeachers,
  createTeacher,
  updateTeacher,
  deleteTeacher,
};
