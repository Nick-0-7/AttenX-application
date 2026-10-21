const express = require("express");
const { getMappings, saveMappings } = require("../controllers/mapping.controller");

const router = express.Router();

router.get("/", getMappings);
router.post("/", saveMappings);

module.exports = router;
