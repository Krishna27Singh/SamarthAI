const axios = require("axios");

async function checkAnomaly(data, sourceId) {
  const mlPayload = {
    requests_last_24h:
      data.requests_last_24h || Math.floor(Math.random() * 5) + 1,
    requested_qty: data.requested_qty || data.quantity || 100,
    distance_from_base_km:
      data.distance_from_base_km || (Math.random() * 40) + 10,
    ingestion_source: sourceId,
  };

  try {
    const response = await axios.post(
      "http://127.0.0.1:8000/api/ml/check-anomaly",
      mlPayload,
    );

    return {
      anomaly_detected: response.data.anomaly_detected,
      anomaly_score: response.data.anomaly_score,
      reason: response.data.reason,
    };
  } catch (error) {
    console.warn("Anomaly detection service unavailable.", error.message);

    return {
      anomaly_detected: false,
      anomaly_score: 0,
      reason: "",
    };
  }
}

module.exports = {
  checkAnomaly,
};