const { db } = require("../config/firebase");
const { parseModelJson } = require("../utils/textFormatter");
const { analyzeSurvey } = require("../services/gemini.service");
const { findEligibleNGOs } = require("../services/routing.service");
const { checkAnomaly } = require("../services/anomaly.service");

const uploadSurveyForOcr = async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "GEMINI_API_KEY is not configured." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No survey image uploaded. Use field name 'surveyImage'." });
    }

    const imagePart = {
      inlineData: {
        data: req.file.buffer.toString("base64"),
        mimeType: req.file.mimetype,
      },
    };

    const rawText = await analyzeSurvey(imagePart);

    let parsedData;
    try {
      parsedData = parseModelJson(rawText);
    } catch (parseError) {
      return res.status(502).json({
        message: "Gemini returned non-JSON output.",
        raw: rawText,
      });
    }

    const eventDate = parsedData.event_date || new Date().toISOString();
    parsedData = {
      ...parsedData,
      event_date: eventDate,
    };

    const finalData = {
      ...parsedData,
      status: "pending",
    };

    try {
      finalData.eligibleNgoIds = await findEligibleNGOs(
        parsedData.resources_needed || parsedData.needs || parsedData.resources || [],
        parsedData.location_clues || parsedData.location_clue || parsedData.location || null,
      );
    } catch (routingError) {
      console.warn("Survey NGO routing failed. Saving survey without eligibleNgoIds.", routingError.message);
      finalData.eligibleNgoIds = [];
    }

    const mlPayload = {
      requests_last_24h: parsedData.requests_last_24h || Math.floor(Math.random() * 5) + 1,
      requested_qty: parsedData.total_requested_qty || 100,
      distance_from_base_km: parsedData.distance_km || 15,
    };

    const anomalyData = await checkAnomaly(mlPayload, 1);
    finalData.anomaly_detected = anomalyData.anomaly_detected;
    finalData.anomaly_score = anomalyData.anomaly_score;
    finalData.reason = anomalyData.reason;

    await db.collection("surveys").add(finalData);

    return res.status(200).json({
      ...finalData,
      anomaly_detected: anomalyData.anomaly_detected,
      anomaly_score: anomalyData.anomaly_score,
      reason: anomalyData.reason,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to process OCR ingestion.",
      error: error.message,
    });
  }
};

module.exports = {
  uploadSurveyForOcr,
};
