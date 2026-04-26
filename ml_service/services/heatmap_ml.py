from __future__ import annotations

import random
from typing import Dict, List

import numpy as np
import pandas as pd
import shap
from imblearn.over_sampling import SMOTE
from xgboost import XGBClassifier

from services.synthetic_data import generate_training_data


FEATURE_COLUMNS = [
    "rainfall_mm",
    "days_since_last_supply",
    "population_density",
    "previous_incidents",
]


_training_df = generate_training_data(num_rows=1000)
_x_train = _training_df[FEATURE_COLUMNS]
_y_train = _training_df["crisis_severity"].astype(int)

X_resampled, y_resampled = SMOTE(random_state=42).fit_resample(_x_train, _y_train)

_model = XGBClassifier(
    n_estimators=180,
    max_depth=5,
    learning_rate=0.07,
    subsample=0.9,
    colsample_bytree=0.9,
    random_state=42,
    objective="binary:logistic",
    eval_metric="logloss",
)
_model.fit(X_resampled, y_resampled)
_explainer = shap.TreeExplainer(_model)


def _extract_shap_matrix(shap_values: object) -> np.ndarray:
    # SHAP output format varies by version/model type; normalize to (n_samples, n_features).
    if isinstance(shap_values, list):
        return np.array(shap_values[-1], dtype=float)

    shap_array = np.array(shap_values, dtype=float)
    if shap_array.ndim == 3:
        return shap_array[:, :, -1]

    return shap_array


def _shap_percent_breakdown(shap_values: np.ndarray) -> Dict[str, int]:
    absolute_vals = np.abs(shap_values)
    total = float(np.sum(absolute_vals))

    if total == 0:
        even_share = 100 // len(FEATURE_COLUMNS)
        remainder = 100 - (even_share * len(FEATURE_COLUMNS))
        output = {name: even_share for name in FEATURE_COLUMNS}
        if remainder > 0:
            output[FEATURE_COLUMNS[0]] += remainder
        return output

    raw_perc = (absolute_vals / total) * 100
    floored = np.floor(raw_perc).astype(int)
    remainder = int(100 - np.sum(floored))

    fractions = raw_perc - floored
    order = np.argsort(-fractions)
    for idx in order[:remainder]:
        floored[idx] += 1

    return {FEATURE_COLUMNS[i]: int(floored[i]) for i in range(len(FEATURE_COLUMNS))}


def get_predictions_with_explanations() -> List[Dict[str, object]]:
    hubs = [
        (28.6139, 77.2090),  # Delhi
        (19.0760, 72.8777),  # Mumbai
        (22.5726, 88.3639),  # Kolkata
        (13.0827, 80.2707),  # Chennai
        (26.1445, 91.7362),  # Guwahati
        (21.1458, 79.0882),  # Nagpur
    ]

    geo_points: List[tuple[float, float]] = []
    for hub_lat, hub_lng in hubs:
        for _ in range(5):
            geo_points.append(
                (
                    float(hub_lat + random.uniform(-1.5, 1.5)),
                    float(hub_lng + random.uniform(-1.5, 1.5)),
                )
            )

    num_points = len(geo_points)

    feature_df = pd.DataFrame(
        {
            "rainfall_mm": np.random.uniform(0, 500, num_points),
            "days_since_last_supply": np.random.uniform(0, 30, num_points),
            "population_density": np.random.uniform(100, 12000, num_points),
            "previous_incidents": np.random.randint(0, 40, num_points),
        }
    )

    predictions = _model.predict_proba(feature_df)[:, 1]
    shap_values = _extract_shap_matrix(_explainer.shap_values(feature_df))

    ranked_indices = np.argsort(predictions)[::-1]
    top_indices = set(ranked_indices[: min(10, num_points)].tolist())

    results: List[Dict[str, object]] = []
    for i in range(num_points):
        explanation = {}
        if i in top_indices:
            explanation = _shap_percent_breakdown(np.array(shap_values[i], dtype=float))

        results.append(
            {
                "lat": geo_points[i][0],
                "lng": geo_points[i][1],
                "weight": float(predictions[i]),
                "explanations": explanation,
            }
        )

    return results