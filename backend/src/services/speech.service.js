const transcribeAudio = async (audioBuffer, mimeType) => {
  // 1. THE EARLY EXIT (100% Crash-Proof)
  // If mock mode is true, we never even require() the Google SDK.
  if (process.env.USE_MOCK_SPEECH === "true") {
    console.log("🎙️ Mock Mode Active: Bypassing Google Cloud Speech completely.");
    
    // Simulate a 1.5-second processing delay for realism during the presentation
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    return "This is a priority field report. The bridge at Sector 4 is completely washed out. We need 3 heavy excavators, 50 thermal blankets, and an emergency medical kit immediately. This looks very critical.";
  }

  // 2. THE REAL PIPELINE
  // This will ONLY execute if you change your .env to USE_MOCK_SPEECH="false"
  try {
    const speech = require('@google-cloud/speech');
    const client = new speech.SpeechClient();
    
    const audio = { content: audioBuffer.toString('base64') };
    const config = {
      encoding: 'WEBM_OPUS', // Adjust based on your React MediaRecorder settings
      sampleRateHertz: 48000,
      languageCode: 'en-US',
    };
    
    const request = { audio, config };
    const [response] = await client.recognize(request);
    
    return response.results
      .map(result => result.alternatives[0].transcript)
      .join('\n');

  } catch (error) {
    console.error("❌ Real Speech API failed:", error.message);
    throw new Error("Speech API Failed: " + error.message);
  }
};

module.exports = { transcribeAudio };