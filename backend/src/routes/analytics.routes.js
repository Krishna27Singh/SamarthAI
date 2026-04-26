const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/heatmap", async (req, res) => {
  try {
    const response = await axios.get("http://127.0.0.1:8000/api/ml/predict-heatmap");
    return res.json(response.data);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "ML Service unavailable" });
  }
});

module.exports = router;