const { db } = require("../config/firebase");
const { parseModelJson } = require("../utils/textFormatter");
const { extractGpsFromExif, extractDateFromExif } = require("../utils/exifHandler");
const { geocodeAddress } = require("../services/maps.service");
const { analyzeScene } = require("../services/gemini.service");

const uploadScenePhoto = async (req, res) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ message: "GEMINI_API_KEY is not configured." });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No scene image uploaded. Use field name 'sceneImage'." });
    }

    const imagePart = {
      inlineData: {
        data: req.file.buffer.toString("base64"),
        mimeType: req.file.mimetype,
      },
    };
    const exifGps = extractGpsFromExif(req.file.buffer);
    const exifEventDate = extractDateFromExif(req.file.buffer);

    let extractedData;

    if (exifGps) {
      const exifPrompt =
        'You are a disaster assessment AI. Look at this photo of a field condition. Analyze the context to determine the date the event occurred (e.g., if contextual clues imply "yesterday", calculate based on today). Return an "event_date" field in ISO 8601 format. If absolutely no time context is provided, set "event_date" to null. Extract ONLY this valid JSON: { "damage_type": "string", "severity_score": number, "resources_needed": ["string"], "event_date": "string | null" }. Do not include markdown.';

      const rawText = await analyzeScene(imagePart, exifPrompt);

      let damageData;
      try {
        damageData = parseModelJson(rawText);
      } catch (parseError) {
        return res.status(502).json({
          message: "Gemini returned non-JSON output.",
          raw: rawText,
        });
      }

      extractedData = {
        ...damageData,
        location: {
          lat: exifGps.latitude,
          lng: exifGps.longitude,
        },
        location_source: "EXIF",
      };
    } else {
      const aiPrompt =
        'You are a disaster assessment AI. Look at this photo of a field condition in India. Analyze the context to determine the date the event occurred (e.g., if contextual clues imply "yesterday", calculate based on today). Return an "event_date" field in ISO 8601 format. If absolutely no time context is provided, set "event_date" to null. Extract ONLY valid JSON in this exact structure: { "damage_type": "string", "severity_score": number, "resources_needed": ["string"], "location_clues": "string", "event_date": "string | null" }. Make location_clues as specific as possible using visible landmarks/signboards/local context. Do not include markdown.';

      const rawText = await analyzeScene(imagePart, aiPrompt);

      let aiData;
      try {
        aiData = parseModelJson(rawText);
      } catch (parseError) {
        return res.status(502).json({
          message: "Gemini returned non-JSON output.",
          raw: rawText,
        });
      }

      if (!aiData.location_clues || typeof aiData.location_clues !== "string") {
        return res.status(502).json({
          message: "Gemini did not return usable location_clues.",
          raw: rawText,
        });
      }

      try {
        const geocoded = await geocodeAddress(aiData.location_clues);
        extractedData = {
          ...aiData,
          location: {
            lat: geocoded.latitude,
            lng: geocoded.longitude,
          },
          location_source: "AI_GUESSED",
        };
      } catch (geocodeError) {
        console.warn("Geocoding disabled/failed. Falling back to text location.");
        extractedData = {
          ...aiData,
          location: null,
          location_source: "AI_GUESSED_TEXT_ONLY",
        };
      }
    }

    const resolvedEventDate = exifEventDate || extractedData.event_date || new Date().toISOString();
    extractedData = {
      ...extractedData,
      event_date: resolvedEventDate,
    };

    const docRef = await db.collection("scene_assessments").add(extractedData);

    return res.status(200).json({ id: docRef.id, ...extractedData });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to process scene assessment.",
      error: error.message,
    });
  }
};

const updateSceneLocation = async (req, res) => {
  try {
    const docId = req.params.id;
    const { manualAddress } = req.body;

    if (!docId) {
      return res.status(400).json({ message: "Missing scene assessment document id." });
    }

    if (!manualAddress || typeof manualAddress !== "string") {
      return res.status(400).json({ message: "manualAddress is required." });
    }

    let updatePayload;

    try {
      const geocoded = await geocodeAddress(manualAddress);
      updatePayload = {
        location: {
          lat: geocoded.latitude,
          lng: geocoded.longitude,
        },
        location_clues: manualAddress,
        location_source: "MANUAL_OVERRIDE",
      };
    } catch (geocodeError) {
      console.warn("Geocoding disabled. Saving manual text address only.");
      updatePayload = {
        location: null,
        location_clues: manualAddress,
        location_source: "MANUAL_OVERRIDE_TEXT_ONLY",
      };
    }

    await db.collection("scene_assessments").doc(docId).update(updatePayload);

    return res.status(200).json({ id: docId, ...updatePayload });
  } catch (error) {
    if (error.code === 5) {
      return res.status(404).json({ message: "Scene assessment document not found." });
    }

    return res.status(500).json({
      message: "Failed to update scene location.",
      error: error.message,
    });
  }
};

module.exports = {
  uploadScenePhoto,
  updateSceneLocation,
};
