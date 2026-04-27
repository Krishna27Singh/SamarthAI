const fs = require("fs");

const { db } = require("../config/firebase");
const { analyzeVideoReport } = require("../services/gemini.service");
const { geocodeAddress } = require("../services/maps.service");
const { findEligibleNGOs } = require("../services/routing.service");
const { checkAnomaly } = require("../services/anomaly.service");

const processVideoReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No video file uploaded. Use field name 'videoData'." });
    }

    const extractedData = await analyzeVideoReport(req.file.path, req.file.mimetype);
    const eventDate = extractedData.event_date || new Date().toISOString();

    // Delete local uploaded file immediately after AI processing.
    if (req.file.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

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
      console.warn("Video report geocoding failed/disabled. Using text-only location clues.");
      location = null;
      location_source = "AI_GUESSED_TEXT_ONLY";
    }

    const parsedData = {
      ...extractedData,
      event_date: eventDate,
      location,
      location_source,
    };

    const finalData = {
      ...parsedData,
      status: "pending",
      timestamp: new Date().toISOString(),
    };

    try {
      finalData.eligibleNgoIds = await findEligibleNGOs(
        parsedData.resources_needed || parsedData.resources || [],
        parsedData.location_clues || parsedData.location_clue || null,
      );
    } catch (routingError) {
      console.warn("Video NGO routing failed. Saving video report without eligibleNgoIds.", routingError.message);
      finalData.eligibleNgoIds = [];
    }

    const mlPayload = {
      requests_last_24h: parsedData.requests_last_24h || Math.floor(Math.random() * 5) + 1,
      requested_qty: parsedData.total_requested_qty || 100,
      distance_from_base_km: parsedData.distance_km || 15,
    };

    const anomalyData = await checkAnomaly(mlPayload, 4);
    finalData.anomaly_detected = anomalyData.anomaly_detected;
    finalData.anomaly_score = anomalyData.anomaly_score;
    finalData.reason = anomalyData.reason;

    const docRef = await db.collection("video_reports").add(finalData);

    return res.status(200).json({
      id: docRef.id,
      ...finalData,
      anomaly_detected: anomalyData.anomaly_detected,
      anomaly_score: anomalyData.anomaly_score,
      reason: anomalyData.reason,
    });
  } catch (error) {
    try {
      if (req.file?.path && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
    } catch (unlinkError) {
      console.warn(`Failed to remove local uploaded video: ${unlinkError.message}`);
    }

    return res.status(500).json({
      message: "Failed to process video report.",
      error: error.message,
    });
  }
};

module.exports = {
  processVideoReport,
};
