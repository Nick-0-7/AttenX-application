const express = require("express");
const {
  getProgramOutcomes,
  createProgramOutcome,
  updateProgramOutcome,
  deleteProgramOutcome,
} = require("../controllers/po.controller");

const router = express.Router();

router.get("/", getProgramOutcomes);
router.post("/", createProgramOutcome);
router.put("/:id", updateProgramOutcome);
router.delete("/:id", deleteProgramOutcome);

module.exports = router;
