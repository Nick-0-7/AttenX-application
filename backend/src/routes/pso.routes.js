const express = require("express");
const {
  getProgramSpecificOutcomes,
  createProgramSpecificOutcome,
  updateProgramSpecificOutcome,
  deleteProgramSpecificOutcome,
} = require("../controllers/pso.controller");

const router = express.Router();

router.get("/", getProgramSpecificOutcomes);
router.post("/", createProgramSpecificOutcome);
router.put("/:id", updateProgramSpecificOutcome);
router.delete("/:id", deleteProgramSpecificOutcome);

module.exports = router;
