const { db } = require("../config/firebase");
const { analyzeManualLog } = require("../services/gemini.service");
const { geocodeAddress } = require("../services/maps.service");
const { findEligibleNGOs } = require("../services/routing.service");
const { checkAnomaly } = require("../services/anomaly.service");

const processManualLog = async (req, res) => {
  try {
    const { logText } = req.body;

    if (!logText || typeof logText !== "string") {
      return res.status(400).json({ message: "logText is required." });
    }

    const extractedData = await analyzeManualLog(logText);
    const eventDate = extractedData.event_date || new Date().toISOString();
    const parsedData = {
      ...extractedData,
      event_date: eventDate,
    };

    let location = null;
    let location_source = "AI_GUESSED_TEXT_ONLY";

    try {
      const geocoded = await geocodeAddress(extractedData.location_clues);
      location = {
        lat: geocoded.latitude,
        lng: geocoded.longitude,
      };
      location_source = "AI_GUESSED";
    } catch (geocodeError) {
      console.warn("Manual log geocoding failed/disabled. Using text-only location clues.");
      location = null;
      location_source = "AI_GUESSED_TEXT_ONLY";
    }

    const finalData = {
      ...parsedData,
      location,
      location_source,
      status: "pending",
      timestamp: new Date().toISOString(),
    };

    const mlPayload = {
      requests_last_24h: parsedData.requests_last_24h || Math.floor(Math.random() * 5) + 1,
      requested_qty: parsedData.total_requested_qty || 100,
      distance_from_base_km: parsedData.distance_km || 15,
    };

    const anomalyData = await checkAnomaly(mlPayload, 0);
    finalData.anomaly_detected = anomalyData.anomaly_detected;
    finalData.anomaly_score = anomalyData.anomaly_score;
    finalData.reason = anomalyData.reason;

    try {
      finalData.eligibleNgoIds = await findEligibleNGOs(
        parsedData.resources_needed || parsedData.resources || [],
        parsedData.location_clues || parsedData.location_clue || parsedData.location || null,
      );
    } catch (routingError) {
      console.warn("Manual log NGO routing failed. Saving log without eligibleNgoIds.", routingError.message);
      finalData.eligibleNgoIds = [];
    }

    const docRef = await db.collection("manual_logs").add(finalData);

    return res.status(200).json({
      id: docRef.id,
      ...finalData,
      anomaly_detected: anomalyData.anomaly_detected,
      anomaly_score: anomalyData.anomaly_score,
      reason: anomalyData.reason,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to process manual log.",
      error: error.message,
    });
  }
};

module.exports = {
  processManualLog,
};
