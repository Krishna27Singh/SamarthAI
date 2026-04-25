const express = require("express");
const { runSemanticMatch } = require("../controllers/volunteer.controller");

const router = express.Router();

router.post("/semantic-match", runSemanticMatch);

module.exports = router;
