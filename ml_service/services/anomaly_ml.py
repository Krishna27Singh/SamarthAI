import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest

# Ingestion source mapping
INGESTION_SOURCES = {
    0: "Manual",
    1: "OCR",
    2: "Voice",
    3: "Photo",
    4: "Video",
}


def generate_training_logs(num_normal: int = 950, num_anomalies: int = 50) -> pd.DataFrame:
    """Generate synthetic training data with normal and anomalous supply requests.
    
    Includes ingestion_source feature (0-4) with source-specific anomaly patterns:
    - Manual (0): Normal or high distance anomalies
    - OCR (1): High volume anomalies (scanning misreads)
    - Voice (2): Normal patterns
    - Photo (3): Normal patterns
    - Video (4): Normal patterns
    """
    # Normal data: typical request patterns
    normal_data = {
        "requests_last_24h": np.random.randint(1, 6, num_normal),
        "requested_qty": np.random.randint(10, 501, num_normal),
        "distance_from_base_km": np.random.uniform(0, 50, num_normal),
        "ingestion_source": np.random.randint(0, 5, num_normal),
    }

    # Anomaly data: source-specific suspicious patterns
    anomaly_sources = np.random.randint(0, 5, num_anomalies)
    anomaly_qty = np.random.randint(10, 501, num_anomalies)
    anomaly_distance = np.random.uniform(0, 50, num_anomalies)

    # Inject source-specific anomaly logic
    for i in range(num_anomalies):
        if anomaly_sources[i] == 0:  # Manual: high distance (GPS spoofing)
            anomaly_distance[i] = np.random.uniform(100, 1000)
        elif anomaly_sources[i] == 1:  # OCR: high volume (scanning error)
            anomaly_qty[i] = np.random.randint(5000, 10001)
        # Other sources: use standard anomaly patterns
        else:
            anomaly_qty[i] = np.random.randint(2000, 10001)
            anomaly_distance[i] = np.random.uniform(100, 1000)

    anomaly_data = {
        "requests_last_24h": np.random.randint(10, 51, num_anomalies),
        "requested_qty": anomaly_qty,
        "distance_from_base_km": anomaly_distance,
        "ingestion_source": anomaly_sources,
    }

    # Combine into single DataFrame
    normal_df = pd.DataFrame(normal_data)
    anomaly_df = pd.DataFrame(anomaly_data)
    combined_df = pd.concat([normal_df, anomaly_df], ignore_index=True)

    # Shuffle to randomize order
    combined_df = combined_df.sample(frac=1, random_state=42).reset_index(drop=True)

    return combined_df


# Global model initialization and training on module import
_training_data = generate_training_logs(num_normal=950, num_anomalies=50)
model = IsolationForest(contamination=0.05, random_state=42)
model.fit(_training_data)


def evaluate_new_request(request_data: dict) -> dict:
    """Evaluate a new supply request for anomalies using trained Isolation Forest.
    
    Args:
        request_data: Dictionary with keys:
            - requests_last_24h: Number of requests in last 24h
            - requested_qty: Quantity requested
            - distance_from_base_km: Distance from base in km
            - ingestion_source: Integer 0-4 (Manual, OCR, Voice, Photo, Video)
    
    Returns:
        Dictionary with:
            - anomaly_detected: Boolean indicating if anomaly detected
            - anomaly_score: Normalized 0-100 score
            - reason: Source-aware explanation
    """
    # Convert single request to 1-row DataFrame
    df = pd.DataFrame([request_data])

    # Get predictions and anomaly scores
    prediction = model.predict(df)
    decision_scores = model.decision_function(df)

    # Determine if anomaly was detected (prediction == -1 for anomalies)
    anomaly_detected = bool(prediction[0] == -1)

    # Normalize decision function to 0-100 anomaly score
    # decision_function: negative values = anomalies, positive values = normal
    # Map range [-1, 1] to [100, 0] (higher decision = lower anomaly score)
    decision_value = float(decision_scores[0])
    anomaly_score = int(max(0, min(100, ((1 - decision_value) / 2) * 100)))

    # Generate human-readable reason if anomaly detected
    reason = ""
    if anomaly_detected:
        requested_qty = request_data.get("requested_qty", 0)
        distance = request_data.get("distance_from_base_km", 0)
        ingestion_source = request_data.get("ingestion_source", -1)
        source_name = INGESTION_SOURCES.get(ingestion_source, "Unknown")

        # Source-specific anomaly reasons
        if ingestion_source == 1:  # OCR
            reason = "Potential OCR scanning error (Volume Spike)"
        elif ingestion_source == 2:  # Voice
            reason = "Voice transcription anomaly"
        elif ingestion_source == 0:  # Manual
            if distance > 100:
                reason = "Manual entry: GPS spoofing suspected"
            else:
                reason = "Manual entry: Suspicious pattern detected"
        else:
            # Fallback reasons for Photo/Video/Unknown
            if requested_qty > 1000:
                reason = f"{source_name}: Unusual volume spike"
            elif distance > 100:
                reason = f"{source_name}: GPS mismatch on delivery"
            else:
                reason = "Suspicious request pattern"

    return {
        "anomaly_detected": anomaly_detected,
        "anomaly_score": anomaly_score,
        "reason": reason,
    }
