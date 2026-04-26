import numpy as np
import pandas as pd


def generate_training_data(num_rows: int = 1000) -> pd.DataFrame:
    """Generate intentionally imbalanced binary crisis training data for demo training."""
    rainfall_mm = np.random.uniform(0, 500, num_rows)
    days_since_last_supply = np.random.uniform(0, 30, num_rows)
    population_density = np.random.uniform(100, 12000, num_rows)
    previous_incidents = np.random.randint(0, 40, num_rows)

    rainfall_norm = rainfall_mm / 500
    supply_norm = days_since_last_supply / 30
    density_norm = population_density / 12000
    incidents_norm = previous_incidents / 40

    noise = np.random.normal(0, 0.02, num_rows)

    risk_score = (
        0.35 * rainfall_norm
        + 0.25 * supply_norm
        + 0.25 * density_norm
        + 0.15 * incidents_norm
        + noise
    )
    risk_score = np.clip(risk_score, 0.0, 1.0)

    # Force a minority crisis class (~7%) to simulate class imbalance for SMOTE.
    crisis_threshold = np.quantile(risk_score, 0.93)
    crisis_severity = (risk_score >= crisis_threshold).astype(int)

    return pd.DataFrame(
        {
            "rainfall_mm": rainfall_mm,
            "days_since_last_supply": days_since_last_supply,
            "population_density": population_density,
            "previous_incidents": previous_incidents,
            "crisis_severity": crisis_severity,
        }
    )