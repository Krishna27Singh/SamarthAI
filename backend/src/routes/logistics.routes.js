const express = require("express");
const {
  getLogisticsHeatmap,
  runAnomalyCheck,
} = require("../controllers/logistics.controller");

const router = express.Router();

router.get("/heatmap", getLogisticsHeatmap);
router.post("/anomaly-check", runAnomalyCheck);

module.exports = router;
