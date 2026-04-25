const { db } = require("../config/firebase");
const { analyzeManualLog } = require("../services/gemini.service");
const { geocodeAddress } = require("../services/maps.service");

const processManualLog = async (req, res) => {
  try {
    const { logText } = req.body;

    if (!logText || typeof logText !== "string") {
      return res.status(400).json({ message: "logText is required." });
    }

    const extractedData = await analyzeManualLog(logText);
    const eventDate = extractedData.event_date || new Date().toISOString();

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

    const finalPayload = {
      ...extractedData,
      event_date: eventDate,
      location,
      location_source,
      timestamp: new Date().toISOString(),
    };

    const docRef = await db.collection("manual_logs").add(finalPayload);

    return res.status(200).json({ id: docRef.id, ...finalPayload });
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
