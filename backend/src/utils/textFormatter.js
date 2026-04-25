const stripMarkdownFences = (text) => text.replace(/```json|```/gi, "").trim();

const parseModelJson = (rawText) => {
  const cleanedText = stripMarkdownFences(rawText);
  return JSON.parse(cleanedText);
};

module.exports = {
  stripMarkdownFences,
  parseModelJson,
};
