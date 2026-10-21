const express = require("express");
const {
  getCoAttainment,
  getPoAttainment,
  getPsoAttainment,
  getFullMatrix,
} = require("../controllers/attainment.controller");

const router = express.Router();

router.get("/co/:subjectId", getCoAttainment);
router.get("/po/:subjectId", getPoAttainment);
router.get("/pso/:subjectId", getPsoAttainment);
router.get("/matrix/:subjectId", getFullMatrix);

module.exports = router;
