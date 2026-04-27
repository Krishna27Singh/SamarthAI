from dotenv import load_dotenv
load_dotenv()
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from google.cloud import aiplatform
from models import VolunteerProfile, NGOEmergencyDeclaration
from database import my_index, save_volunteer_to_firestore
from agents import get_embedding, run_logistics_swarm, get_filtered_volunteers
from clustering import run_volunteer_clustering
from routers.heatmap import router as heatmap_router
from routers.anomaly import router as anomaly_router

app = FastAPI(title="ReliefSangam Agent Swarm")
app.include_router(heatmap_router)
app.include_router(anomaly_router, prefix="/api/ml")


class EmergencyMatchRequest(BaseModel):
    emergency_description: str
    urgency_level: str
    ngo_id: str

@app.get("/")
def health_check():
    return {"status": "AI Swarm Engine is Live and Ready!"}

@app.post("/api/volunteer/onboard")
def onboard_volunteer(profile: VolunteerProfile):
    """Saves volunteer in Firestore and attempts vector upsert in Vertex AI Matching Engine."""
    try:
        volunteer_payload = {
            "ngo_id": profile.ngo_id,
            "name": profile.name,
            "phone": profile.phone,
            "skills_bio": profile.skills_bio,
            "location_zone": profile.location_zone,
            "assets": profile.assets,
        }

        save_volunteer_to_firestore(profile.volunteer_id, volunteer_payload, profile.ngo_id)

        vector = get_embedding(profile.skills_bio)

        if my_index is not None:
            try:
                my_index.upsert_datapoints(
                    datapoints=[
                        aiplatform.MatchingEngineIndex.Datapoint(
                            datapoint_id=profile.volunteer_id,
                            feature_vector=vector,
                            restricts=[
                                aiplatform.matching_engine_utils.MatchingEngineIndexDatapointRestriction(
                                    namespace="ngo_id",
                                    allow_list=[profile.ngo_id]
                                )
                            ]
                        )
                    ]
                )
            except Exception as e:
                print(f"[WARN] Vertex upsert failed for volunteer {profile.volunteer_id}: {str(e)}")
        else:
            print("[WARN] Vertex index unavailable (Dummy Mode). Skipping vector upsert.")

        return {"message": f"Successfully onboarded {profile.name} to the Swarm."}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Volunteer onboarding failed: {str(e)}")

@app.post("/api/emergency/declare")
def declare_emergency(emergency: NGOEmergencyDeclaration):
    """Takes an emergency from the NGO and triggers the AI Agent Swarm to solve it."""
    
    # 1. Convert the Pydantic data into a standard dictionary
    emergency_dict = emergency.model_dump()
    
    # 2. Hand the emergency to the AI and let it generate a plan autonomously
    logistics_plan = run_logistics_swarm(emergency_dict)
    
    # 3. Return the AI's formulated plan to the React frontend
    return {
        "status": "Swarm Deployed",
        "emergency": emergency.emergency_description,
        "ai_action_plan": logistics_plan
    }


@app.post("/api/ml/trigger-clustering")
async def trigger_clustering():
    """Runs K-Means volunteer clustering and writes cluster labels to Firestore."""
    summary = await run_volunteer_clustering()
    return summary


@app.post("/api/emergency/match")
def emergency_match(payload: EmergencyMatchRequest):
    """Returns top volunteer recommendations filtered by urgency, NGO affiliation, and reliability cluster."""
    try:
        allowed_urgency = {"Low", "Medium", "Critical"}
        if payload.urgency_level not in allowed_urgency:
            raise HTTPException(status_code=400, detail="urgency_level must be Low, Medium, or Critical.")

        if not payload.ngo_id:
            raise HTTPException(status_code=400, detail="ngo_id is required.")

        volunteers = get_filtered_volunteers(payload.emergency_description, payload.urgency_level, payload.ngo_id)
        return {
            "status": "ok",
            "volunteers": volunteers,
            "count": len(volunteers),
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Emergency matching failed: {str(e)}")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8003, reload=True)