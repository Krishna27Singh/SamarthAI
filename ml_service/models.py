from pydantic import BaseModel
from typing import List

class VolunteerProfile(BaseModel):
    volunteer_id: str
    ngo_id: str
    name: str
    phone: str
    skills_bio: str
    location_zone: str
    assets: List[str] = [] # Example: ["truck", "medical kit"]

class NGOEmergencyDeclaration(BaseModel):
    emergency_description: str
    target_location: str
    people_needed: int