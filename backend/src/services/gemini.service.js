const { GoogleGenerativeAI } = require("@google/generative-ai");
const { GoogleAIFileManager } = require("@google/generative-ai/server");
const { parseModelJson } = require("../utils/textFormatter");

const genAI = process.env.GEMINI_API_KEY
  ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
  : null;
const fileManager = process.env.GEMINI_API_KEY
  ? new GoogleAIFileManager(process.env.GEMINI_API_KEY)
  : null;

const MODEL_NAME = "gemini-2.5-flash";

const SURVEY_PROMPT =
  'You are a data extraction assistant for an NGO. Look at this survey image. Extract location_clues, calculate an urgency_score from 1-100 based on the text, and list the specific needs as an array of strings. location_clues (string): Extract the exact physical location, including the camp name, city, and critically, the SECTOR or REGION mentioned (e.g., "Camp 1, Sector 4"). If no location is mentioned, return an empty string "". Also extract these as STRICT integers only: total_requested_qty (the total combined requested volume; if text says "12,000 kits", return 12000; if missing, return 0) and distance_km (distance from base in km; if missing, return 0). Analyze the context to determine the date the event occurred (e.g., if the text says "yesterday", calculate the date based on today). Return an "event_date" field in ISO 8601 format. If absolutely no time context is provided, set "event_date" to null. Return ONLY valid JSON in this exact structure: { "location_clues": "Camp 1, Sector 4, 12km from base", "urgency_score": number, "needs": ["string"], "total_requested_qty": 12000, "distance_km": 15, "event_date": "string | null" }. Do not include markdown code blocks like ```json.';

const ensureGemini = () => {
  if (!genAI) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  return genAI;
};

const ensureFileManager = () => {
  if (!fileManager) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  return fileManager;
};

const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const analyzeSurvey = async (imagePart) => {
  const client = ensureGemini();
  const model = client.getGenerativeModel({ model: MODEL_NAME });
  const result = await model.generateContent([SURVEY_PROMPT, imagePart]);
  return result.response.text().trim();
};

const analyzeScene = async (imagePart, prompt) => {
  const client = ensureGemini();
  const model = client.getGenerativeModel({ model: MODEL_NAME });
  const result = await model.generateContent([prompt, imagePart]);
  return result.response.text().trim();
};

const VOICE_PROMPT =
  'You are a disaster assessment AI. Read this transcribed voice report from the field. Extract location_clues, calculate an urgency_score (1-100), and list resources_needed as an array. location_clues (string): Extract the exact physical location, including the camp name, city, and critically, the SECTOR or REGION mentioned (e.g., "Camp 1, Sector 4"). If no location is mentioned, return an empty string "". Also extract these as STRICT integers only: total_requested_qty (the total combined requested volume; if text says "12,000 kits", return 12000; if missing, return 0) and distance_km (distance from base in km; if missing, return 0). Analyze the context to determine the date the event occurred (e.g., if the text says "yesterday", calculate the date based on today). Return an "event_date" field in ISO 8601 format. If absolutely no time context is provided, set "event_date" to null. Return ONLY valid JSON: { "location_clues": "Camp 1, Sector 4, 12km from base", "urgency_score": number, "resources_needed": ["string"], "total_requested_qty": 12000, "distance_km": 15, "event_date": "string | null" }. Do not include markdown code blocks.';

const MANUAL_LOG_PROMPT =
  'You are a disaster assessment AI. Read this unstructured field report/message. Extract location_clues, calculate an urgency_score (1-100), list resources_needed as an array of strings, and write a brief 1-sentence summary. location_clues (string): Extract the exact physical location, including the camp name, city, and critically, the SECTOR or REGION mentioned (e.g., "Camp 1, Sector 4"). If no location is mentioned, return an empty string "". Also extract these as STRICT integers only: total_requested_qty (the total combined requested volume; if text says "12,000 kits", return 12000; if missing, return 0) and distance_km (distance from base in km; if missing, return 0). Analyze the context to determine the date the event occurred (e.g., if the text says "yesterday", calculate the date based on today). Return an "event_date" field in ISO 8601 format. If absolutely no time context is provided, set "event_date" to null. Return ONLY valid JSON: { "location_clues": "Camp 1, Sector 4, 12km from base", "urgency_score": number, "resources_needed": ["string"], "summary": "string", "total_requested_qty": 12000, "distance_km": 15, "event_date": "string | null" }. Do not include markdown.';

const analyzeVoiceTranscript = async (transcript) => {
  try {
    const client = ensureGemini();
    const model = client.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent([VOICE_PROMPT, transcript]);
    const rawText = result.response.text().trim();
    return parseModelJson(rawText);
  } catch (error) {
    throw new Error(`Failed to analyze voice transcript: ${error.message}`);
  }
};

const analyzeManualLog = async (logText) => {
  try {
    const client = ensureGemini();
    const model = client.getGenerativeModel({ model: MODEL_NAME });
    const result = await model.generateContent([MANUAL_LOG_PROMPT, logText]);
    const rawText = result.response.text().trim();
    return parseModelJson(rawText);
  } catch (error) {
    throw new Error(`Failed to analyze manual log: ${error.message}`);
  }
};

const analyzeVideoReport = async (filePath, mimeType) => {
  const client = ensureGemini();
  const fm = ensureFileManager();
  const model = client.getGenerativeModel({ model: MODEL_NAME });
  const prompt =
    'You are a disaster assessment AI. Watch this field report video. Extract location_clues if mentioned/visible, calculate an urgency_score (1-100), list resources_needed as an array, and summarize the visual conditions in 1 sentence. location_clues (string): Extract the exact physical location, including the camp name, city, and critically, the SECTOR or REGION mentioned (e.g., "Camp 1, Sector 4"). If no location is mentioned, return an empty string "". Also extract these as STRICT integers only: total_requested_qty (the total combined requested volume; if text says "12,000 kits", return 12000; if missing, return 0) and distance_km (distance from base in km; if missing, return 0). Analyze the context to determine the date the event occurred (e.g., if the text says "yesterday", calculate the date based on today). Return an "event_date" field in ISO 8601 format. If absolutely no time context is provided, set "event_date" to null. Return ONLY valid JSON: { "location_clues": "Camp 1, Sector 4, 12km from base", "urgency_score": number, "resources_needed": ["string"], "summary": "string", "total_requested_qty": 12000, "distance_km": 15, "event_date": "string | null" }. Do not include markdown.';

  let uploadedFileName = null;

  try {
    const uploadResult = await fm.uploadFile(filePath, {
      mimeType,
      displayName: `video-report-${Date.now()}`,
    });

    let file = uploadResult.file;
    uploadedFileName = file.name;

    while (file.state !== "ACTIVE") {
      if (file.state === "FAILED") {
        throw new Error("Uploaded video failed processing in Gemini File API.");
      }

      await wait(2000);
      file = await fm.getFile(uploadedFileName);
    }

    const result = await model.generateContent([
      prompt,
      {
        fileData: {
          fileUri: file.uri,
          mimeType,
        },
      },
    ]);

    const rawText = result.response.text().trim();
    return parseModelJson(rawText);
  } finally {
    if (uploadedFileName) {
      try {
        await fm.deleteFile(uploadedFileName);
      } catch (deleteError) {
        console.warn(`Failed to delete Gemini file ${uploadedFileName}: ${deleteError.message}`);
      }
    }
  }
};

module.exports = {
  analyzeSurvey,
  analyzeScene,
  analyzeVoiceTranscript,
  analyzeManualLog,
  analyzeVideoReport,
};
