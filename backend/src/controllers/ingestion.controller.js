const { uploadSurveyForOcr } = require("./survey.controller");
const { uploadScenePhoto, updateSceneLocation } = require("./scene.controller");
const { processVoiceReport } = require("./voice.controller");

module.exports = {
  uploadSurveyForOcr,
  uploadScenePhoto,
  updateSceneLocation,
  processVoiceReport,
};
