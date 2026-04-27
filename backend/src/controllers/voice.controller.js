const { db } = require("../config/firebase");
const { analyzeVoiceTranscript } = require("../services/gemini.service");
const { transcribeAudio } = require("../services/speech.service");
const { findEligibleNGOs } = require("../services/routing.service");
const { checkAnomaly } = require("../services/anomaly.service");

const processVoiceReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No audio file uploaded. Use field name 'audioData'." });
    }

    const transcript = await transcribeAudio(req.file.buffer);
    const extractedData = await analyzeVoiceTranscript(transcript);
    const eventDate = extractedData.event_date || new Date().toISOString();
    const parsedData = {
      ...extractedData,
      event_date: eventDate,
      transcript,
    };

    let eligibleNgoIds = [];
    try {
      eligibleNgoIds = await findEligibleNGOs(
        parsedData.resources_needed || parsedData.resources || [],
        parsedData.location_clues || parsedData.location_clue || parsedData.location || null,
      );
    } catch (routingError) {
      console.warn("Voice NGO routing failed. Saving voice report without eligibleNgoIds.", routingError.message);
      eligibleNgoIds = [];
    }

    const finalData = {
      ...parsedData,
      eligibleNgoIds,
      status: "pending",
      is_mock_data: false,
      timestamp: new Date().toISOString(),
    };

    const mlPayload = {
      requests_last_24h: parsedData.requests_last_24h || Math.floor(Math.random() * 5) + 1,
      requested_qty: parsedData.total_requested_qty || 100,
      distance_from_base_km: parsedData.distance_km || 15,
    };

    const anomalyData = await checkAnomaly(mlPayload, 2);
    finalData.anomaly_detected = anomalyData.anomaly_detected;
    finalData.anomaly_score = anomalyData.anomaly_score;
    finalData.reason = anomalyData.reason;

    const docRef = await db.collection("voice_reports").add(finalData);

    return res.status(200).json({
      id: docRef.id,
      ...finalData,
      anomaly_detected: anomalyData.anomaly_detected,
      anomaly_score: anomalyData.anomaly_score,
      reason: anomalyData.reason,
    });
  } catch (error) {
    console.warn("Real voice pipeline failed. Falling back to dummy data.");

    const parsedData = {
      location: "Sector 4 Bridge, Riverbank Road",
      urgency_score: 95,
      resources_needed: ["3 Heavy Excavators", "50 Thermal Blankets", "Emergency Medical Kit"],
      event_date: new Date().toISOString(),
      is_mock_data: true,
    };

    let eligibleNgoIds = [];
    try {
      eligibleNgoIds = await findEligibleNGOs(
        parsedData.resources_needed || [],
        parsedData.location || null,
      );
    } catch (routingError) {
      console.warn("Mock voice NGO routing failed. Saving voice report without eligibleNgoIds.", routingError.message);
      eligibleNgoIds = [];
    }

    const finalData = {
      ...parsedData,
      eligibleNgoIds,
      status: "pending",
      timestamp: new Date().toISOString(),
    };

    const mlPayload = {
      requests_last_24h: parsedData.requests_last_24h || Math.floor(Math.random() * 5) + 1,
      requested_qty: parsedData.total_requested_qty || 100,
      distance_from_base_km: parsedData.distance_km || 15,
    };

    const anomalyData = await checkAnomaly(mlPayload, 2);
    finalData.anomaly_detected = anomalyData.anomaly_detected;
    finalData.anomaly_score = anomalyData.anomaly_score;
    finalData.reason = anomalyData.reason;

    const docRef = await db.collection("voice_reports").add(finalData);

    return res.status(200).json({
      id: docRef.id,
      ...finalData,
      anomaly_detected: anomalyData.anomaly_detected,
      anomaly_score: anomalyData.anomaly_score,
      reason: anomalyData.reason,
    });
  }
};

module.exports = {
  processVoiceReport,
};
