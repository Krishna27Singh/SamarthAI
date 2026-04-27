const axios = require("axios");
const { db } = require("../config/firebase");

const getLogisticsHeatmap = async (req, res) => {
  // Placeholder: call Python ML microservice for SHAP-based predictive heatmap data.
  res.status(501).json({
    message: "Logistics heatmap service is not implemented yet.",
  });
};

const runAnomalyCheck = async (req, res) => {
  try {
    // Extract supply request data from request body
    const {
      requested_qty,
      requests_last_24h,
      distance_from_base_km,
      camp_id,
      resource_type,
      ngo_id,
      priority,
    } = req.body;

    // Validate required fields
    if (!requested_qty || !ngo_id) {
      return res.status(400).json({
        message: "requested_qty and ngo_id are required.",
      });
    }

    // Prepare ML payload with defaults for demo
    const mlPayload = {
      requests_last_24h:
        requests_last_24h || Math.floor(Math.random() * 5) + 1,
      requested_qty: requested_qty,
      distance_from_base_km:
        distance_from_base_km || Math.random() * 40 + 10,
    };

    // Initialize anomaly detection variables
    let anomaly_detected = false;
    let anomaly_score = 0;
    let reason = "";

    // Call ML service for anomaly detection
    try {
      const mlResponse = await axios.post(
        "http://127.0.0.1:8000/api/ml/check-anomaly",
        mlPayload,
        { timeout: 5000 }
      );

      anomaly_detected = mlResponse.data.anomaly_detected;
      anomaly_score = mlResponse.data.anomaly_score;
      reason = mlResponse.data.reason;
    } catch (mlError) {
      console.warn(
        "ML anomaly detection service unavailable. Using defaults.",
        mlError.message
      );
      // Set defaults if ML service fails
      anomaly_detected = false;
      anomaly_score = 0;
      reason = "";
    }

    // Create supply request document
    const supplyRequestPayload = {
      requested_qty: requested_qty,
      requests_last_24h: mlPayload.requests_last_24h,
      distance_from_base_km: mlPayload.distance_from_base_km,
      camp_id: camp_id || null,
      resource_type: resource_type || "General Relief Supplies",
      ngo_id: ngo_id,
      priority: priority || "medium",
      anomaly_detected: anomaly_detected,
      anomaly_score: anomaly_score,
      reason: reason,
      status: "pending",
      timestamp: new Date().toISOString(),
    };

    // Save to Firestore
    const docRef = await db.collection("supply_requests").add(supplyRequestPayload);

    return res.status(201).json({
      id: docRef.id,
      ...supplyRequestPayload,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Failed to create supply request.",
      error: error.message,
    });
  }
};

module.exports = {
  getLogisticsHeatmap,
  runAnomalyCheck,
};
