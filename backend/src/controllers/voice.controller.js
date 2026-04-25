const { db } = require("../config/firebase");
const { analyzeVoiceTranscript } = require("../services/gemini.service");
const { transcribeAudio } = require("../services/speech.service");

const processVoiceReport = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No audio file uploaded. Use field name 'audioData'." });
    }

    const transcript = await transcribeAudio(req.file.buffer);
    const extractedData = await analyzeVoiceTranscript(transcript);
    const eventDate = extractedData.event_date || new Date().toISOString();

    const docRef = await db.collection("voice_reports").add({
      ...extractedData,
      event_date: eventDate,
      transcript,
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

    const docRef = await db.collection("voice_reports").add({
      ...mockExtractedData,
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
