from fastapi import APIRouter

from services.heatmap_ml import get_predictions_with_explanations


router = APIRouter()


@router.get("/api/ml/predict-heatmap")
def predict_heatmap():
    return get_predictions_with_explanations()