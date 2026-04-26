const fs = require("fs");

const { db } = require("../config/firebase");
const { analyzeVideoReport } = require("../services/gemini.service");
const { geocodeAddress } = require("../services/maps.service");
const { findEligibleNGOs } = require("../services/routing.service");

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

    const finalPayload = {
      ...extractedData,
      event_date: eventDate,
      location,
      location_source,
      status: "pending",
      timestamp: new Date().toISOString(),
    };

    try {
      finalPayload.eligibleNgoIds = await findEligibleNGOs(
        extractedData.resources_needed || extractedData.resources || [],
        extractedData.location_clues || extractedData.location_clue || null,
      );
    } catch (routingError) {
      console.warn("Video NGO routing failed. Saving video report without eligibleNgoIds.", routingError.message);
      finalPayload.eligibleNgoIds = [];
    }

    const docRef = await db.collection("video_reports").add(finalPayload);

    return res.status(200).json({ id: docRef.id, ...finalPayload });
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
