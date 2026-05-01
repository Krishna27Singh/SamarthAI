const API_BASE_NODE = import.meta.env.VITE_BACKEND_URL || "http://localhost:5050";
const API_BASE_FASTAPI = import.meta.env.VITE_ML_SERVICE_URL || "http://localhost:8000";
const API_BASE_GEMINI = import.meta.env.VITE_ML_SERVICE_URL || "http://localhost:4000";

// Normalized API endpoints with /api path
const API_ENDPOINT_NODE = `${API_BASE_NODE}/api`;
const API_ENDPOINT_ML = `${API_BASE_FASTAPI}/api`;

export async function uploadSurveyForOCR(imageFile: File): Promise<any> {
  const formData = new FormData();
  formData.append("surveyImage", imageFile);

  const res = await fetch(`${API_ENDPOINT_NODE}/ingestion/ocr`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorPayload = await res.text();
    throw new Error(errorPayload || "Failed to upload survey for OCR");
  }

  return res.json();
}

export async function uploadScenePhoto(file: File): Promise<any> {
  const formData = new FormData();
  formData.append("sceneImage", file);

  const res = await fetch(`${API_ENDPOINT_NODE}/ingestion/scene-photo`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorPayload = await res.text();
    throw new Error(errorPayload || "Failed to upload scene photo for assessment");
  }

  return res.json();
}

export async function updateSceneLocationAPI(id: string, manualAddress: string): Promise<any> {
  const res = await fetch(`${API_ENDPOINT_NODE}/ingestion/scene-photo/${id}/location`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ manualAddress }),
  });

  if (!res.ok) {
    const errorPayload = await res.text();
    throw new Error(errorPayload || "Failed to update scene location");
  }

  return res.json();
}

export async function uploadVoiceReportAPI(audioBlob: Blob | File): Promise<any> {
  const formData = new FormData();
  formData.append("audioData", audioBlob);

  const res = await fetch(`${API_ENDPOINT_NODE}/ingestion/voice`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorPayload = await res.text();
    throw new Error(errorPayload || "Failed to upload voice report");
  }

  return res.json();
}

export async function submitManualLogAPI(logText: string): Promise<any> {
  const res = await fetch(`${API_ENDPOINT_NODE}/ingestion/manual`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ logText }),
  });

  if (!res.ok) {
    const errorPayload = await res.text();
    throw new Error(errorPayload || "Failed to process manual log");
  }

  return res.json();
}

export async function submitVideoReportAPI(videoFile: File): Promise<any> {
  const formData = new FormData();
  formData.append("videoData", videoFile);

  const res = await fetch(`${API_ENDPOINT_NODE}/ingestion/video`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const errorPayload = await res.text();
    throw new Error(errorPayload || "Failed to process video report");
  }

  return res.json();
}

export async function fetchPredictiveHeatmapData(): Promise<void> {
  console.log("[API] fetchPredictiveHeatmapData called");
  // TODO: GET from FastAPI /models backend
  // const res = await fetch(`${API_BASE_FASTAPI}/heatmap/predict`);
  // return res.json();
}

export async function submitVoiceTask(audioData: Blob): Promise<void> {
  console.log("[API] submitVoiceTask called with audio blob:", `${(audioData.size / 1024).toFixed(1)} KB`, audioData.type);
  // TODO: POST to Gemini API via Node proxy
  // const formData = new FormData();
  // formData.append("audio", audioData);
  // const res = await fetch(`${API_BASE_GEMINI}/voice-task`, { method: "POST", body: formData });
  // return res.json();
}
