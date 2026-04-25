import google.generativeai as genai
from fastapi import HTTPException
from database import my_endpoint, get_volunteer_from_firestore, db

def get_embedding(text: str):
    """Turns text into a 768-dimension math vector."""
    try:
        result = genai.embed_content(
            model="models/gemini-embedding-001",
            content=text,
            task_type="retrieval_document",
            output_dimensionality=768
        )
        return result['embedding']
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI Embedding Error: {str(e)}")


def tool_search_volunteers(required_skills: str, limit: int = 5) -> str:
    """
    TOOL FOR GEMINI: Searches the Vertex AI Vector Search index for matching volunteers.
    Returns a string of formatted volunteer profiles.
    """
    print(f"\n🤖 AGENT USING TOOL: Searching vector database for '{required_skills}'...")
    
    vector = get_embedding(required_skills)

    if my_endpoint is None:
        print("[WARN] Vertex endpoint unavailable (Dummy Mode).")
        return "Vector search unavailable (mock mode). Please rely on standard database queries."

    try:
        response = my_endpoint.find_neighbors(queries=[vector], num_neighbors=min(limit, 3))
    except Exception as e:
        print(f"[WARN] Vertex neighbor search failed: {str(e)}")
        return "Vector search unavailable (mock mode). Please rely on standard database queries."

    neighbor_ids = []
    try:
        neighbors = response[0] if response else []
        for neighbor in neighbors:
            if isinstance(neighbor, dict):
                vol_id = neighbor.get("id") or neighbor.get("datapoint_id")
            else:
                vol_id = getattr(neighbor, "id", None) or getattr(neighbor, "datapoint_id", None)

            if vol_id:
                neighbor_ids.append(vol_id)
    except Exception as e:
        print(f"[WARN] Failed to parse Vertex neighbor response: {str(e)}")
        return "Vector search unavailable (mock mode). Please rely on standard database queries."
    
    found_volunteers = []
    try:
        for vol_id in neighbor_ids:
            vol_details = get_volunteer_from_firestore(vol_id)
            if vol_details:
                info = f"Name: {vol_details.get('name', 'N/A')}, Phone: {vol_details.get('phone', 'N/A')}, Zone: {vol_details.get('location_zone', 'N/A')}, Assets: {vol_details.get('assets', [])}, Skills: {vol_details.get('skills_bio', 'N/A')}"
                found_volunteers.append(info)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Firestore volunteer lookup failed: {str(e)}")
            
    if not found_volunteers:
        return "No volunteers found in the database."
        
    return "\n".join(found_volunteers)


def run_logistics_swarm(emergency_data: dict) -> str:
    """
    THE SWARM BRAIN: Wakes up Gemini, gives it the tools, and asks it to form a plan.
    """
    print("\n🧠 Waking up Gemini Logistics Commander...")
    
    # 1. Create the AI Agent and give it our custom function as a tool
    model = genai.GenerativeModel(
        model_name='gemini-1.5-flash',
        tools=[tool_search_volunteers]
    )
    
    # 2. Give the Agent its prompt and objective
    prompt = f"""
    You are an autonomous AI Logistics Commander for disaster relief.
    An NGO has declared an emergency: "{emergency_data['emergency_description']}"
    Target Location: {emergency_data['target_location']}
    People Needed: {emergency_data['people_needed']}
    
    MISSION: 
    1. Use your 'tool_search_volunteers' tool to search the database for people with the necessary skills and assets.
    2. Review the people the tool returns.
    3. Draft a short, bulleted action plan assigning specific people to specific tasks based on their location and assets.
    """
    
    # 3. Start an automated chat loop (This allows Gemini to use the tool, read the result, and reply)
    chat = model.start_chat(enable_automatic_function_calling=True)
    response = chat.send_message(prompt)
    
    return response.text


def _normalize_cluster_label(label: str) -> str:
    return (label or "").strip().lower()


def _allowed_clusters_for_urgency(urgency: str):
    urgency_normalized = (urgency or "").strip().lower()
    if urgency_normalized == "critical":
        return {"rapid responders"}
    if urgency_normalized == "medium":
        return {"rapid responders", "steady workers"}
    return set()


def _fetch_profile_by_id(volunteer_id: str):
    """Reads volunteer profile from users collection first, then volunteers fallback."""
    try:
        user_doc = db.collection("users").document(volunteer_id).get()
        if user_doc.exists:
            payload = user_doc.to_dict() or {}
            return {
                "volunteerId": volunteer_id,
                "name": payload.get("name") or payload.get("displayName") or payload.get("email") or "Unnamed Volunteer",
                "skillsBio": payload.get("skillsBio") or payload.get("skills_bio") or "",
                "clusterLabel": payload.get("clusterLabel") or "Unknown",
                "locationZone": payload.get("locationZone") or payload.get("location_zone") or "",
                "phone": payload.get("phone") or "",
            }

        fallback_doc = get_volunteer_from_firestore(volunteer_id)
        if fallback_doc:
            return {
                "volunteerId": volunteer_id,
                "name": fallback_doc.get("name") or "Unnamed Volunteer",
                "skillsBio": fallback_doc.get("skills_bio") or fallback_doc.get("skillsBio") or "",
                "clusterLabel": fallback_doc.get("clusterLabel") or "Unknown",
                "locationZone": fallback_doc.get("location_zone") or fallback_doc.get("locationZone") or "",
                "phone": fallback_doc.get("phone") or "",
            }

        return None
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Firestore volunteer lookup failed: {str(e)}")


def get_filtered_volunteers(description: str, urgency: str):
    """Returns top volunteer recommendations after vector retrieval and urgency-based filtering."""
    if not description:
        raise HTTPException(status_code=400, detail="Emergency description is required.")

    allowed_clusters = _allowed_clusters_for_urgency(urgency)

    if my_endpoint is None:
        try:
            users = db.collection("users").where("role", "in", ["Volunteer", "volunteer"]).limit(20).stream()
            recommendations = []
            for user in users:
                payload = user.to_dict() or {}
                volunteer = {
                    "volunteerId": user.id,
                    "name": payload.get("name") or payload.get("displayName") or payload.get("email") or "Unnamed Volunteer",
                    "skillsBio": payload.get("skillsBio") or payload.get("skills_bio") or "",
                    "clusterLabel": payload.get("clusterLabel") or "Unknown",
                    "locationZone": payload.get("locationZone") or payload.get("location_zone") or "",
                    "phone": payload.get("phone") or "",
                }

                cluster_label = _normalize_cluster_label(volunteer.get("clusterLabel", ""))
                if allowed_clusters and cluster_label not in allowed_clusters:
                    continue

                recommendations.append(volunteer)
                if len(recommendations) == 3:
                    break

            return recommendations
        except Exception as e:
            raise HTTPException(status_code=500, detail=f"Firestore fallback match failed: {str(e)}")

    vector = get_embedding(description)

    try:
        response = my_endpoint.find_neighbors(queries=[vector], num_neighbors=10)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Vertex neighbor search failed: {str(e)}")

    neighbor_ids = []
    try:
        neighbors = response[0] if response else []
        for neighbor in neighbors:
            if isinstance(neighbor, dict):
                candidate_id = neighbor.get("id") or neighbor.get("datapoint_id")
            else:
                candidate_id = getattr(neighbor, "id", None) or getattr(neighbor, "datapoint_id", None)

            if candidate_id:
                neighbor_ids.append(candidate_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to parse Vertex neighbor response: {str(e)}")

    recommendations = []

    for volunteer_id in neighbor_ids:
        volunteer = _fetch_profile_by_id(volunteer_id)
        if not volunteer:
            continue

        cluster_label = _normalize_cluster_label(volunteer.get("clusterLabel", ""))
        if allowed_clusters and cluster_label not in allowed_clusters:
            continue

        recommendations.append(volunteer)
        if len(recommendations) == 3:
            break

    return recommendations