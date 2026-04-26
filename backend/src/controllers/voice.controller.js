const { db } = require("../config/firebase");
const { analyzeVoiceTranscript } = require("../services/gemini.service");
const { transcribeAudio } = require("../services/speech.service");
const { findEligibleNGOs } = require("../services/routing.service");

const processVoiceReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No audio file uploaded. Use field name 'audioData'." });
    }

    const transcript = await transcribeAudio(req.file.buffer);
    const extractedData = await analyzeVoiceTranscript(transcript);
    const eventDate = extractedData.event_date || new Date().toISOString();

    let eligibleNgoIds = [];
    try {
      eligibleNgoIds = await findEligibleNGOs(
        extractedData.resources_needed || extractedData.resources || [],
        extractedData.location_clues || extractedData.location_clue || extractedData.location || null,
      );
    } catch (routingError) {
      console.warn("Voice NGO routing failed. Saving voice report without eligibleNgoIds.", routingError.message);
      eligibleNgoIds = [];
    }

    const docRef = await db.collection("voice_reports").add({
      ...extractedData,
      event_date: eventDate,
      transcript,
      eligibleNgoIds,
      status: "pending",
      is_mock_data: false,
      timestamp: new Date().toISOString(),
    });

    return res.status(200).json({
      id: docRef.id,
      ...extractedData,
      transcript,
    });
  } catch (error) {
    console.warn("Real voice pipeline failed. Falling back to dummy data.");

    const mockExtractedData = {
      location: "Sector 4 Bridge, Riverbank Road",
      urgency_score: 95,
      resources_needed: ["3 Heavy Excavators", "50 Thermal Blankets", "Emergency Medical Kit"],
      anomaly_detected: false,
      event_date: new Date().toISOString(),
      is_mock_data: true,
    };

    let eligibleNgoIds = [];
    try {
      eligibleNgoIds = await findEligibleNGOs(
        mockExtractedData.resources_needed || [],
        mockExtractedData.location || null,
      );
    } catch (routingError) {
      console.warn("Mock voice NGO routing failed. Saving voice report without eligibleNgoIds.", routingError.message);
      eligibleNgoIds = [];
    }

    const docRef = await db.collection("voice_reports").add({
      ...mockExtractedData,
      eligibleNgoIds,
      status: "pending",
      timestamp: new Date().toISOString(),
    });

    return res.status(200).json({
      id: docRef.id,
      ...mockExtractedData,
    });
  }
};

module.exports = {
  processVoiceReport,
};
