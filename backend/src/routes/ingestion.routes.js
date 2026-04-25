const express = require("express");
const fs = require("fs");
const multer = require("multer");
const { uploadSurveyForOcr } = require("../controllers/survey.controller");
const { uploadScenePhoto, updateSceneLocation } = require("../controllers/scene.controller");
const { processVoiceReport } = require("../controllers/voice.controller");
const { processManualLog } = require("../controllers/manual.controller");
const { processVideoReport } = require("../controllers/video.controller");

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });
if (!fs.existsSync("uploads")) {
	fs.mkdirSync("uploads", { recursive: true });
}
const diskUpload = multer({ dest: "uploads/" });

router.post("/ocr", upload.single("surveyImage"), uploadSurveyForOcr);
router.post("/scene-photo", upload.single("sceneImage"), uploadScenePhoto);
router.put("/scene-photo/:id/location", updateSceneLocation);
router.post("/voice", upload.single("audioData"), processVoiceReport);
router.post("/manual", processManualLog);
router.post("/video", diskUpload.single("videoData"), processVideoReport);

module.exports = router;
