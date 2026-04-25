import os
import google.generativeai as genai
from dotenv import load_dotenv
import firebase_admin
from firebase_admin import credentials, firestore
from google.cloud import aiplatform

load_dotenv()

#  connection to Google AI
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))

def init_vertex_ai():
	"""Initializes Vertex AI Matching Engine resources.

	Returns:
		tuple: (my_index, my_endpoint) where each can be None in dummy mode.
	"""
	project_id = os.getenv("GCP_PROJECT_ID")
	location = os.getenv("GCP_LOCATION")
	index_id = os.getenv("VERTEX_INDEX_ID")
	endpoint_id = os.getenv("VERTEX_ENDPOINT_ID")

	try:
		aiplatform.init(project=project_id, location=location)

		my_index = aiplatform.MatchingEngineIndex(index_name=index_id)
		my_endpoint = aiplatform.MatchingEngineIndexEndpoint(endpoint_name=endpoint_id)
		return my_index, my_endpoint
	except Exception as e:
		print(f"[WARN] Vertex AI initialization failed. Running in Dummy Mode: {str(e)}")
		return None, None


def _initialize_firestore_client():
	"""Initializes Firebase Admin SDK and returns Firestore client."""
	credentials_path = os.getenv("FIREBASE_CREDENTIALS_PATH")
	if not credentials_path:
		raise RuntimeError("FIREBASE_CREDENTIALS_PATH is not set.")

	if not os.path.exists(credentials_path):
		raise RuntimeError(f"Firebase credentials file not found: {credentials_path}")

	try:
		if not firebase_admin._apps:
			cred = credentials.Certificate(credentials_path)
			firebase_admin.initialize_app(cred)
		return firestore.client()
	except Exception as e:
		raise RuntimeError(f"Failed to initialize Firestore client: {str(e)}")


db = _initialize_firestore_client()
my_index, my_endpoint = init_vertex_ai()


def save_volunteer_to_firestore(volunteer_id: str, volunteer_data: dict):
	"""Writes a volunteer profile to Firestore volunteers collection."""
	try:
		db.collection("volunteers").document(volunteer_id).set(volunteer_data)
	except Exception as e:
		raise RuntimeError(f"Firestore write error for volunteer {volunteer_id}: {str(e)}")


def get_volunteer_from_firestore(volunteer_id: str):
	"""Fetches a volunteer profile from Firestore volunteers collection."""
	try:
		doc = db.collection("volunteers").document(volunteer_id).get()
		if not doc.exists:
			return None
		return doc.to_dict()
	except Exception as e:
		raise RuntimeError(f"Firestore read error for volunteer {volunteer_id}: {str(e)}")