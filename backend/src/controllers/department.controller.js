const prisma = require("../config/db");

const getDepartments = async (req, res, next) => {
  try {
    const departments = await prisma.department.findMany({
      include: { subjects: true },
      orderBy: { name: "asc" },
    });
    res.json({ success: true, data: departments });
  } catch (error) {
    next(error);
  }
};

const createDepartment = async (req, res, next) => {
  try {
    const { name, code } = req.body;
    if (!name || !code) {
      return res.status(400).json({ message: "Name and code are required." });
    }
    const dept = await prisma.department.create({ data: { name, code } });
    res.status(201).json({ success: true, data: dept });
  } catch (error) {
    next(error);
  }
};

const updateDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, code } = req.body;
    const dept = await prisma.department.update({
      where: { id: Number(id) },
      data: { name, code },
    });
    res.json({ success: true, data: dept });
  } catch (error) {
    next(error);
  }
};

const deleteDepartment = async (req, res, next) => {
  try {
    const { id } = req.params;
    await prisma.department.delete({ where: { id: Number(id) } });
    res.json({ success: true, message: "Department deleted successfully." });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDepartments,
  createDepartment,
  updateDepartment,
  deleteDepartment,
};
