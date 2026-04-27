from fastapi import APIRouter
from pydantic import BaseModel, Field
from services.anomaly_ml import evaluate_new_request


router = APIRouter()


class AnomalyCheckRequest(BaseModel):
    requests_last_24h: int
    requested_qty: int
    distance_from_base_km: float
    ingestion_source: int = Field(
        ..., 
        description="Source of data ingestion: 0=Manual, 1=OCR, 2=Voice, 3=Photo, 4=Video"
    )


@router.post("/check-anomaly")
def check_anomaly(request: AnomalyCheckRequest):
    """
    Evaluates a supply request for anomalies using Isolation Forest with ingestion-source awareness.
    
    Args:
        request: AnomalyCheckRequest containing:
            - requests_last_24h: Number of requests in the last 24 hours
            - requested_qty: Quantity of supplies requested
            - distance_from_base_km: Distance from base location in kilometers
            - ingestion_source: Source of data (0=Manual, 1=OCR, 2=Voice, 3=Photo, 4=Video)
    
    Returns:
        Dictionary with:
            - anomaly_detected: Boolean indicating if anomaly was detected
            - anomaly_score: Normalized score 0-100 (higher = more anomalous)
            - reason: Source-aware explanation of the anomaly
    """
    request_data = request.model_dump()
    result = evaluate_new_request(request_data)
    return result
