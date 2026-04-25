from firebase_admin import firestore
from sklearn.cluster import KMeans
from sklearn.preprocessing import MinMaxScaler
import numpy as np

from database import db


async def run_volunteer_clustering():
    """
    Clusters volunteers by reliability and response velocity, then writes cluster labels to Firestore.

    Features:
      1) completion_rate = tasksCompleted / tasksAssigned
      2) avg_response_time = totalResponseTimeMins / tasksAssigned
    """
    try:
        # Primary filter requested: role == "volunteer"
        docs = list(db.collection("users").where("role", "==", "volunteer").stream())

        # Graceful compatibility with title-case role values if lowercase set is empty.
        if not docs:
            docs = list(db.collection("users").where("role", "==", "Volunteer").stream())

        if not docs:
            return {
                "status": "No volunteers found.",
                "updated_count": 0,
                "category_counts": {
                    "Rapid Responders": 0,
                    "Steady Workers": 0,
                    "Flaky": 0,
                },
            }

        volunteer_ids = []
        feature_rows = []

        for doc in docs:
            data = doc.to_dict() or {}
            tasks_assigned = data.get("tasksAssigned", 0) or 0
            tasks_completed = data.get("tasksCompleted", 0) or 0
            total_response_time_mins = data.get("totalResponseTimeMins", 0) or 0

            # Keep newcomers untouched.
            if tasks_assigned == 0:
                continue

            completion_rate = tasks_completed / tasks_assigned
            avg_response_time = total_response_time_mins / tasks_assigned

            volunteer_ids.append(doc.id)
            feature_rows.append([completion_rate, avg_response_time])

        if len(feature_rows) < 3:
            return {
                "status": "Not enough data to cluster.",
                "updated_count": 0,
                "category_counts": {
                    "Rapid Responders": 0,
                    "Steady Workers": 0,
                    "Flaky": 0,
                },
            }

        feature_array = np.array(feature_rows, dtype=float)

        scaler = MinMaxScaler()
        scaled_features = scaler.fit_transform(feature_array)

        kmeans = KMeans(n_clusters=3, random_state=42)
        kmeans.fit(scaled_features)

        centers = kmeans.cluster_centers_

        # centers[:, 0] => completion_rate (higher is better)
        # centers[:, 1] => avg_response_time (lower is better)
        labels = [0, 1, 2]

        rapid_label = max(labels, key=lambda i: (centers[i][0], -centers[i][1]))
        flaky_label = min(labels, key=lambda i: centers[i][0])
        steady_label = [i for i in labels if i not in (rapid_label, flaky_label)][0]

        label_name_map = {
            rapid_label: "Rapid Responders",
            steady_label: "Steady Workers",
            flaky_label: "Flaky",
        }

        category_counts = {
            "Rapid Responders": 0,
            "Steady Workers": 0,
            "Flaky": 0,
        }

        assigned_labels = kmeans.labels_
        updated_count = 0

        for idx, volunteer_id in enumerate(volunteer_ids):
            cluster_id = int(assigned_labels[idx])
            cluster_name = label_name_map[cluster_id]

            db.collection("users").document(volunteer_id).update({
                "clusterLabel": cluster_name,
            })

            category_counts[cluster_name] += 1
            updated_count += 1

        return {
            "status": "Clustering completed.",
            "updated_count": updated_count,
            "category_counts": category_counts,
        }

    except Exception as e:
        return {
            "status": "Clustering failed.",
            "updated_count": 0,
            "category_counts": {
                "Rapid Responders": 0,
                "Steady Workers": 0,
                "Flaky": 0,
            },
            "error": str(e),
        }
