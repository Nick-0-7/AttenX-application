const { calculateSubjectAttainment } = require("../services/attainment.service");

const getCoAttainment = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const result = await calculateSubjectAttainment(subjectId, req.query);
    res.json({
      success: true,
      subject: result.subject,
      totalStudentsEnrolled: result.totalStudentsEnrolled,
      targetCa1: result.targetCa1,
      targetCa2: result.targetCa2,
      coResults: result.coResults,
    });
  } catch (error) {
    next(error);
  }
};

const getPoAttainment = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const result = await calculateSubjectAttainment(subjectId, req.query);
    res.json({
      success: true,
      subject: result.subject,
      poResults: result.poResults,
    });
  } catch (error) {
    next(error);
  }
};

const getPsoAttainment = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const result = await calculateSubjectAttainment(subjectId, req.query);
    res.json({
      success: true,
      subject: result.subject,
      psoResults: result.psoResults,
    });
  } catch (error) {
    next(error);
  }
};

const getFullMatrix = async (req, res, next) => {
  try {
    const { subjectId } = req.params;
    const result = await calculateSubjectAttainment(subjectId, req.query);
    res.json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCoAttainment,
  getPoAttainment,
  getPsoAttainment,
  getFullMatrix,
};
