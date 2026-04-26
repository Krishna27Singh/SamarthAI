const { db } = require("../config/firebase");
const { parseModelJson } = require("../utils/textFormatter");
const { analyzeSurvey } = require("../services/gemini.service");
const { findEligibleNGOs } = require("../services/routing.service");

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

    let extractedData;
    try {
      extractedData = parseModelJson(rawText);
    } catch (parseError) {
      return res.status(502).json({
        message: "Gemini returned non-JSON output.",
        raw: rawText,
      });
    }

    const eventDate = extractedData.event_date || new Date().toISOString();
    const finalPayload = {
      ...extractedData,
      event_date: eventDate,
      status: "pending",
    };

    try {
      finalPayload.eligibleNgoIds = await findEligibleNGOs(
        extractedData.resources_needed || extractedData.needs || extractedData.resources || [],
        extractedData.location_clues || extractedData.location_clue || extractedData.location || null,
      );
    } catch (routingError) {
      console.warn("Survey NGO routing failed. Saving survey without eligibleNgoIds.", routingError.message);
      finalPayload.eligibleNgoIds = [];
    }

    await db.collection("surveys").add(finalPayload);

    return res.status(200).json(finalPayload);
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
