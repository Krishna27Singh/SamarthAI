import { useState, useCallback, useRef } from "react";
import { Upload, Loader2, FileImage, CheckCircle2, Camera, MapPin, Mic, MicOff, Video, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitManualLogAPI, submitVideoReportAPI, updateSceneLocationAPI, uploadScenePhoto, uploadSurveyForOCR, uploadVoiceReportAPI } from "@/services/api";
import { toast } from "sonner";

type ManualLogResponse = {
  anomaly_detected?: boolean;
  anomaly_score?: number;
  reason?: string;
} & Record<string, unknown>;

const DataIngestion = () => {
  const [dragOver, setDragOver] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [showOutput, setShowOutput] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [jsonOutput, setJsonOutput] = useState<any>(null);
  const [sceneDragOver, setSceneDragOver] = useState(false);
  const [sceneFile, setSceneFile] = useState<File | null>(null);
  const [isSceneProcessing, setIsSceneProcessing] = useState(false);
  const [sceneOutput, setSceneOutput] = useState<any>(null);
  const [showSceneOutput, setShowSceneOutput] = useState(false);
  const [sceneDocId, setSceneDocId] = useState<string | null>(null);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [manualAddress, setManualAddress] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  // Voice state
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [voiceProcessing, setVoiceProcessing] = useState(false);
  const [voiceOutput, setVoiceOutput] = useState<any>(null);
  const [showVoiceOutput, setShowVoiceOutput] = useState(false);
  const [manualLogText, setManualLogText] = useState("");
  const [manualOutput, setManualOutput] = useState<ManualLogResponse | null>(null);
  const [isManualProcessing, setIsManualProcessing] = useState(false);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoOutput, setVideoOutput] = useState<any>(null);
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const handleFileReady = (file: File) => {
    setSelectedFile(file);
    setShowOutput(false);
    setProcessing(false);
  };

  const handleFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileReady(file);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileReady(file);
  };

  const triggerOCR = async () => {
    if (!selectedFile) {
      toast.error("Please select a file first.");
      return;
    }

    const fileToUpload = selectedFile;
    setProcessing(true);
    setShowOutput(false);

    try {
      const response = await uploadSurveyForOCR(fileToUpload);
      setJsonOutput(response);
      setShowOutput(true);
      toast.success("OCR Pipeline Complete", {
        description: "Entities extracted successfully from survey scan.",
      });
    } catch (error) {
      toast.error("OCR Pipeline Failed", {
        description: error instanceof Error ? error.message : "Unexpected error during OCR processing.",
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleSceneFileReady = (file: File) => {
    setSceneFile(file);
    setShowSceneOutput(false);
    setIsSceneProcessing(false);
    setIsEditingLocation(false);
    setManualAddress("");
  };

  const handleSceneFileDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setSceneDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleSceneFileReady(file);
  }, []);

  const handleSceneFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleSceneFileReady(file);
  };

  const triggerSceneAssessment = async () => {
    if (!sceneFile) {
      toast.error("Please select a scene photo first.");
      return;
    }

    const fileToUpload = sceneFile;
    setIsSceneProcessing(true);
    setShowSceneOutput(false);

    try {
      const response = await uploadScenePhoto(fileToUpload);
      setSceneOutput(response);
      setSceneDocId(response?.id || null);
      setShowSceneOutput(true);
      setIsEditingLocation(false);
      setManualAddress("");
      toast.success("Scene Assessment Complete", {
        description: "Condition assessment extracted successfully.",
      });
    } catch (error) {
      toast.error("Scene Assessment Failed", {
        description: error instanceof Error ? error.message : "Unexpected error during scene assessment.",
      });
    } finally {
      setIsSceneProcessing(false);
    }
  };

  const saveManualLocation = async () => {
    if (!sceneDocId) {
      toast.error("Scene assessment id not found. Re-run assessment first.");
      return;
    }

    if (!manualAddress.trim()) {
      toast.error("Please enter a valid address.");
      return;
    }

    setIsUpdating(true);
    try {
      const updated = await updateSceneLocationAPI(sceneDocId, manualAddress.trim());
      setSceneOutput((prev: any) => ({
        ...(prev || {}),
        ...updated,
      }));
      setIsEditingLocation(false);
      setManualAddress("");
      toast.success("Location updated", {
        description: "Scene location overridden successfully.",
      });
    } catch (error) {
      toast.error("Location update failed", {
        description: error instanceof Error ? error.message : "Unexpected error while updating location.",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Voice recording handlers
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];

      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunks, { type: "audio/webm" });
        setAudioBlob(blob);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
      toast.success("Recording started", {
        description: "Speak your field report now.",
      });
    } catch (error) {
      toast.error("Microphone access denied", {
        description: error instanceof Error ? error.message : "Unable to access microphone.",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success("Recording stopped");
    }
  };

  const handleVoiceFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioBlob(file);
      setShowVoiceOutput(false);
    }
  };

  const submitVoiceReport = async () => {
    if (!audioBlob) {
      toast.error("Please record or upload audio first.");
      return;
    }

    setVoiceProcessing(true);
    setShowVoiceOutput(false);

    try {
      const response = await uploadVoiceReportAPI(audioBlob);
      setVoiceOutput(response);
      setShowVoiceOutput(true);
      setAudioBlob(null);
      toast.success("Voice Report Processed", {
        description: "Field report transcribed and analyzed successfully.",
      });
    } catch (error) {
      toast.error("Voice Report Processing Failed", {
        description: error instanceof Error ? error.message : "Unexpected error during voice processing.",
      });
    } finally {
      setVoiceProcessing(false);
    }
  };

  const processManualLog = async () => {
    if (!manualLogText.trim()) {
      toast.error("Please enter manual log text first.");
      return;
    }

    setIsManualProcessing(true);
    try {
      const response = (await submitManualLogAPI(manualLogText.trim())) as ManualLogResponse;
      setManualOutput(response);
      toast.success("Manual log processed", {
        description: "Unstructured text converted into structured disaster intelligence.",
      });
    } catch (error) {
      toast.error("Manual log processing failed", {
        description: error instanceof Error ? error.message : "Unexpected error while processing manual log.",
      });
    } finally {
      setIsManualProcessing(false);
    }
  };

  const processVideoReport = async () => {
    if (!videoFile) {
      toast.error("Please select a video file first.");
      return;
    }

    setIsProcessingVideo(true);
    try {
      const response = await submitVideoReportAPI(videoFile);
      setVideoOutput(response);
      toast.success("Video report processed", {
        description: "Field video analyzed and converted into structured disaster intelligence.",
      });
    } catch (error) {
      toast.error("Video report processing failed", {
        description: error instanceof Error ? error.message : "Unexpected error while processing video report.",
      });
    } finally {
      setIsProcessingVideo(false);
    }
  };

  // Helper functions for insights rendering
  const getUrgencyColor = (score: number) => {
    if (score >= 80) return "bg-red-100 text-red-700";
    if (score >= 50) return "bg-amber-100 text-amber-700";
    return "bg-green-100 text-green-700";
  };

  const getUrgencyLabel = (score: number) => {
    if (score >= 80) return "Critical";
    if (score >= 50) return "High";
    return "Moderate";
  };

  const renderExtractedInsights = (obj: any) => (
    <div className="space-y-5">
      {/* Location */}
      <div>
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">📍 Location</label>
        <p className="mt-2 text-lg font-bold text-slate-800">{obj.location || "Not detected"}</p>
      </div>

      {/* Urgency Score Badge */}
      <div>
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">⚡ Urgency Score</label>
        <div className="mt-2 flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full font-bold text-sm ${getUrgencyColor(obj.urgency_score || 0)}`}>
            {obj.urgency_score || 0}/100 — {getUrgencyLabel(obj.urgency_score || 0)}
          </span>
        </div>
      </div>

      {/* Required Resources */}
      {obj.needs && obj.needs.length > 0 && (
        <div>
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">📦 Required Resources</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {obj.needs.map((need: string) => (
              <span key={need} className="inline-flex items-center bg-blue-50 text-blue-700 border border-blue-200 rounded-md px-2 py-1 text-xs font-medium">
                {need}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div>
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">📝 Summary</label>
        <p className="mt-2 text-sm text-slate-600 italic leading-relaxed">
          {obj.summary || "Survey processed successfully. Key entities extracted for field assessment."}
        </p>
      </div>

      {/* Anomaly Detection */}
      {obj.anomaly_detected && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 text-sm">Anomaly Detected</p>
            <p className="text-red-700 text-xs mt-1">This situation shows unusual patterns. Review carefully.</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderSceneInsights = (obj: any) => (
    <div className="space-y-5">
      {/* Damage Type */}
      <div>
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">🔍 Damage Type</label>
        <p className="mt-2 text-lg font-bold text-slate-800">{obj.damage_type || "Assessing..."}</p>
      </div>

      {/* Severity Score Badge */}
      <div>
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">📊 Severity Score</label>
        <div className="mt-2 flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full font-bold text-sm ${getUrgencyColor(obj.severity_score || 0)}`}>
            {obj.severity_score || 0}/100 — {getUrgencyLabel(obj.severity_score || 0)}
          </span>
        </div>
      </div>

      {/* Resources Needed */}
      {obj.resources_needed && obj.resources_needed.length > 0 && (
        <div>
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">📦 Resources Needed</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {obj.resources_needed.map((resource: string) => (
              <span key={resource} className="inline-flex items-center bg-blue-50 text-blue-700 border border-blue-200 rounded-md px-2 py-1 text-xs font-medium">
                {resource}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Location Information */}
      <div>
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">📍 Detected Location</label>
        <div className="mt-2">
          <p className="text-sm font-semibold text-slate-800">{obj.location_clues || "Region clues"}</p>
          <p className="text-xs text-slate-500 mt-1">
            Source: {obj.location_source === "exif_metadata" ? "📷 Photo Metadata (GPS)" : "🔎 Visual Analysis"}
          </p>
          {obj.location && (
            <p className="text-xs text-slate-600 mt-1 font-mono">
              {obj.location.lat?.toFixed(4)}, {obj.location.lng?.toFixed(4)}
            </p>
          )}
        </div>
      </div>

      {/* Summary */}
      <div>
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">📝 Scene Assessment</label>
        <p className="mt-2 text-sm text-slate-600 italic leading-relaxed">
          Scene analysis complete. All visual indicators have been extracted and severity assessed.
        </p>
      </div>
    </div>
  );

  const renderVoiceInsights = (obj: any) => (
    <div className="space-y-5">
      {/* Location */}
      <div>
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">📍 Location</label>
        <p className="mt-2 text-lg font-bold text-slate-800">{obj.location || "Not mentioned"}</p>
      </div>

      {/* Urgency Score Badge */}
      <div>
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">⚡ Urgency Score</label>
        <div className="mt-2 flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full font-bold text-sm ${getUrgencyColor(obj.urgency_score || 0)}`}>
            {obj.urgency_score || 0}/100 — {getUrgencyLabel(obj.urgency_score || 0)}
          </span>
        </div>
      </div>

      {/* Resources Needed */}
      {obj.resources_needed && obj.resources_needed.length > 0 && (
        <div>
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">📦 Resources Needed</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {obj.resources_needed.map((resource: string) => (
              <span key={resource} className="inline-flex items-center bg-blue-50 text-blue-700 border border-blue-200 rounded-md px-2 py-1 text-xs font-medium">
                {resource}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Transcript */}
      <div>
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">🎙️ Transcript</label>
        <p className="mt-2 text-sm text-slate-600 italic leading-relaxed">
          {obj.transcript ? obj.transcript.substring(0, 200) + (obj.transcript.length > 200 ? "..." : "") : "Transcription unavailable"}
        </p>
      </div>

      {/* Anomaly Detection */}
      {obj.anomaly_detected && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 text-sm">Anomaly Detected</p>
            <p className="text-red-700 text-xs mt-1">Unusual activity or pattern identified.</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderManualInsights = (obj: ManualLogResponse) => (
    <div className="space-y-5">
      {/* Location */}
      <div>
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">📍 Location</label>
        <p className="mt-2 text-lg font-bold text-slate-800">{(obj.location as string) || "Not mentioned"}</p>
      </div>

      {/* Urgency Score Badge */}
      <div>
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">⚡ Urgency Score</label>
        <div className="mt-2 flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full font-bold text-sm ${getUrgencyColor((obj.urgency_score as number) || 0)}`}>
            {(obj.urgency_score as number) || 0}/100 — {getUrgencyLabel((obj.urgency_score as number) || 0)}
          </span>
        </div>
      </div>

      {/* Resources Needed */}
      {(obj.resources_needed as string[]) && (obj.resources_needed as string[]).length > 0 && (
        <div>
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">📦 Resources Needed</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {(obj.resources_needed as string[]).map((resource: string) => (
              <span key={resource} className="inline-flex items-center bg-blue-50 text-blue-700 border border-blue-200 rounded-md px-2 py-1 text-xs font-medium">
                {resource}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div>
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">📝 Summary</label>
        <p className="mt-2 text-sm text-slate-600 italic leading-relaxed">
          {(obj.summary as string) || "Manual log processed. Unstructured notes converted to actionable intelligence."}
        </p>
      </div>

      {/* Anomaly Detection */}
      {obj.anomaly_detected && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 text-sm">Anomaly Detected</p>
            <p className="text-red-700 text-xs mt-1">Unusual event or emergency pattern identified.</p>
          </div>
        </div>
      )}
    </div>
  );

  const renderVideoInsights = (obj: any) => (
    <div className="space-y-5">
      {/* Location Clues */}
      <div>
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">📍 Location Clues</label>
        <p className="mt-2 text-lg font-bold text-slate-800">{obj.location_clues || "Analyzing..."}</p>
      </div>

      {/* Urgency Score Badge */}
      <div>
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">⚡ Urgency Score</label>
        <div className="mt-2 flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full font-bold text-sm ${getUrgencyColor(obj.urgency_score || 0)}`}>
            {obj.urgency_score || 0}/100 — {getUrgencyLabel(obj.urgency_score || 0)}
          </span>
        </div>
      </div>

      {/* Resources Needed */}
      {obj.resources_needed && obj.resources_needed.length > 0 && (
        <div>
          <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">📦 Resources Needed</label>
          <div className="mt-2 flex flex-wrap gap-2">
            {obj.resources_needed.map((resource: string) => (
              <span key={resource} className="inline-flex items-center bg-blue-50 text-blue-700 border border-blue-200 rounded-md px-2 py-1 text-xs font-medium">
                {resource}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Summary */}
      <div>
        <label className="text-xs font-semibold text-slate-600 uppercase tracking-wide">📝 Summary</label>
        <p className="mt-2 text-sm text-slate-600 italic leading-relaxed">
          {obj.summary || "Video analysis complete. Key observations extracted for field assessment."}
        </p>
      </div>

      {/* Anomaly Detection */}
      {obj.anomaly_detected && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-3 flex gap-3">
          <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-red-800 text-sm">Anomaly Detected</p>
            <p className="text-red-700 text-xs mt-1">Unusual activity or pattern identified in video.</p>
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Data Ingestion</h1>
        <p className="mt-1 text-muted-foreground">Upload paper surveys and field documents for AI-powered extraction.</p>
      </div>

      {/* Paper Survey */}
      <div className="bg-white p-6 rounded-2xl shadow-[0_4px_14px_0_rgba(0,118,255,0.05)] mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="h-5 w-5 text-blue-600" />
          <h2 className="font-heading text-base font-semibold text-foreground">Upload Paper Survey</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            {!selectedFile ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors duration-300 cursor-pointer ${
                  dragOver ? "border-blue-400 bg-blue-100" : "border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-400"
                }`}
              >
                <Upload className={`h-12 w-12 ${dragOver ? "text-blue-600" : "text-blue-300"}`} />
                <p className="mt-4 text-sm font-medium text-slate-800">Drag & drop survey images or documents</p>
                <p className="mt-1 text-xs text-slate-600">PNG, JPG, PDF up to 10MB</p>
                <label className="mt-4">
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileSelect} />
                  <Button className="cursor-pointer bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700" asChild>
                    <span>Browse Files</span>
                  </Button>
                </label>
              </div>
            ) : (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <FileImage className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-slate-600">Ready for processing</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setSelectedFile(null); setShowOutput(false); }}
                    className="text-slate-600 hover:text-slate-800"
                  >
                    Remove
                  </Button>
                </div>
                <Button
                  onClick={triggerOCR}
                  disabled={processing}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
                >
                  {processing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Processing with Google Cloud Vision &amp; Gemini…
                    </>
                  ) : (
                    "Trigger OCR Scan"
                  )}
                </Button>
              </div>
            )}
          </div>

          <div className="rounded-2xl shadow-[0_4px_14px_0_rgba(0,118,255,0.05)] border border-blue-100 bg-white overflow-hidden">
            <div className="flex items-center gap-2 border-b border-blue-100 px-5 py-4 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                <MapPin className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="font-heading text-base font-semibold text-slate-800">AI Extracted Insights</h2>
              {showOutput && <CheckCircle2 className="ml-auto h-4 w-4 text-green-600" />}
            </div>
            <div className="p-6">
              {showOutput ? (
                renderExtractedInsights(jsonOutput)
              ) : (
                <div className="flex h-40 items-center justify-center text-center">
                  <div>
                    <Upload className="mx-auto h-10 w-10 text-blue-200" />
                    <p className="mt-3 text-sm text-slate-600">Extracted insights will appear here after processing</p>
                    <p className="mt-1 text-xs text-slate-500">Location · Urgency · Resources · Details</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scene Photo */}
      <div className="bg-white p-6 rounded-2xl shadow-[0_4px_14px_0_rgba(0,118,255,0.05)] mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Camera className="h-5 w-5 text-blue-600" />
          <h2 className="font-heading text-base font-semibold text-foreground">Upload Scene Photo (Condition Assessment)</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            {!sceneFile ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setSceneDragOver(true); }}
                onDragLeave={() => setSceneDragOver(false)}
                onDrop={handleSceneFileDrop}
                className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors duration-300 cursor-pointer ${
                  sceneDragOver ? "border-blue-400 bg-blue-100" : "border-blue-200 bg-blue-50 hover:bg-blue-100 hover:border-blue-400"
                }`}
              >
                <Camera className={`h-12 w-12 ${sceneDragOver ? "text-blue-600" : "text-blue-300"}`} />
                <p className="mt-4 text-sm font-medium text-slate-800">Drag &amp; drop scene photos</p>
                <p className="mt-1 text-xs text-slate-600">PNG, JPG up to 10MB</p>
                <label className="mt-4">
                  <input type="file" accept="image/*" className="hidden" onChange={handleSceneFileSelect} />
                  <Button className="cursor-pointer bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700" asChild>
                    <span>Browse Photos</span>
                  </Button>
                </label>
              </div>
            ) : (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
                    <Camera className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-800 truncate">{sceneFile.name}</p>
                    <p className="text-xs text-slate-600">Ready for scene assessment</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSceneFile(null);
                      setShowSceneOutput(false);
                      setSceneDocId(null);
                      setIsEditingLocation(false);
                      setManualAddress("");
                    }}
                    className="text-slate-600 hover:text-slate-800"
                  >
                    Remove
                  </Button>
                </div>
                <Button
                  onClick={triggerSceneAssessment}
                  disabled={isSceneProcessing}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
                >
                  {isSceneProcessing ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Running AI condition assessment...
                    </>
                  ) : (
                    "Trigger Assessment"
                  )}
                </Button>
              </div>
            )}
          </div>

          <div className="rounded-2xl shadow-[0_4px_14px_0_rgba(0,118,255,0.05)] border border-blue-100 bg-white overflow-hidden">
            <div className="flex items-center gap-2 border-b border-blue-100 px-5 py-4 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                <Camera className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="font-heading text-base font-semibold text-slate-800">Scene Assessment Insights</h2>
              {showSceneOutput && <CheckCircle2 className="ml-auto h-4 w-4 text-green-600" />}
            </div>
            <div className="p-6">
              {showSceneOutput ? (
                <div className="space-y-6">
                  {renderSceneInsights(sceneOutput)}

                  {!isEditingLocation ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditingLocation(true)}
                      disabled={!sceneDocId}
                      className="w-full sm:w-auto border-blue-200 text-blue-600 hover:bg-blue-50"
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Correct Location Manually
                    </Button>
                  ) : (
                    <div className="space-y-3 rounded-lg border border-blue-200 bg-blue-50 p-4">
                      <label className="text-sm font-medium text-slate-800">Manual Address Override</label>
                      <input
                        type="text"
                        value={manualAddress}
                        onChange={(e) => setManualAddress(e.target.value)}
                        placeholder="Enter full address or landmark"
                        className="w-full rounded-md border border-blue-200 bg-white px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" onClick={saveManualLocation} disabled={isUpdating} className="bg-blue-600 text-white hover:bg-blue-700">
                          {isUpdating ? "Saving..." : "Save New Location"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            setIsEditingLocation(false);
                            setManualAddress("");
                          }}
                          disabled={isUpdating}
                          className="border-blue-200 text-blue-600 hover:bg-blue-50"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center text-center">
                  <div>
                    <Camera className="mx-auto h-10 w-10 text-blue-200" />
                    <p className="mt-3 text-sm text-slate-600">Scene assessment insights will appear here after processing</p>
                    <p className="mt-1 text-xs text-slate-500">Damage Type · Severity · Resources · Location</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Voice Report */}
      <div className="bg-white p-6 rounded-2xl shadow-[0_4px_14px_0_rgba(0,118,255,0.05)] mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Mic className="h-5 w-5 text-blue-600" />
          <h2 className="font-heading text-base font-semibold text-foreground">Voice Field Report</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h3 className="text-sm font-medium text-slate-800 mb-3">Record Field Report</h3>
                <div className="flex gap-2">
                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      variant="outline"
                      className="flex-1 border-blue-200 text-blue-600 hover:bg-blue-100"
                    >
                      <Mic className="mr-2 h-4 w-4" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button
                      onClick={stopRecording}
                      className="flex-1 bg-red-600 text-white hover:bg-red-700"
                    >
                      <MicOff className="mr-2 h-4 w-4" />
                      Stop Recording
                    </Button>
                  )}
                </div>
                {isRecording && (
                  <p className="mt-2 text-xs text-red-600 font-medium animate-pulse">
                    ● Recording in progress...
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h3 className="text-sm font-medium text-slate-800 mb-3">Upload Audio File</h3>
                <label>
                  <input
                    type="file"
                    accept="audio/*"
                    className="hidden"
                    onChange={handleVoiceFileSelect}
                    disabled={isRecording}
                  />
                  <Button
                    variant="outline"
                    className="w-full cursor-pointer border-blue-200 text-blue-600 hover:bg-blue-100"
                    asChild
                    disabled={isRecording}
                  >
                    <span>Choose Audio File</span>
                  </Button>
                </label>
              </div>
            </div>

            {audioBlob && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
                <h3 className="text-sm font-medium text-slate-800 mb-3">Audio Preview</h3>
                <audio
                  controls
                  className="w-full"
                >
                  <source src={URL.createObjectURL(audioBlob)} type="audio/webm" />
                  Your browser does not support the audio element.
                </audio>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setAudioBlob(null)}
                  className="mt-2 text-xs text-slate-600"
                >
                  Clear Audio
                </Button>
              </div>
            )}

            {audioBlob && !showVoiceOutput && (
              <Button
                onClick={submitVoiceReport}
                disabled={voiceProcessing}
                className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
              >
                {voiceProcessing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Transcribing & analyzing voice report...
                  </>
                ) : (
                  "Submit Voice Report"
                )}
              </Button>
            )}
          </div>

          <div className="rounded-2xl shadow-[0_4px_14px_0_rgba(0,118,255,0.05)] border border-blue-100 bg-white overflow-hidden">
            <div className="flex items-center gap-2 border-b border-blue-100 px-5 py-4 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                <Mic className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="font-heading text-base font-semibold text-slate-800">Voice Report Insights</h2>
              {showVoiceOutput && <CheckCircle2 className="ml-auto h-4 w-4 text-green-600" />}
            </div>
            <div className="p-6">
              {showVoiceOutput ? (
                renderVoiceInsights(voiceOutput)
              ) : (
                <div className="flex h-40 items-center justify-center text-center">
                  <div>
                    <Mic className="mx-auto h-10 w-10 text-blue-200" />
                    <p className="mt-3 text-sm text-slate-600">Voice report insights will appear here after processing</p>
                    <p className="mt-1 text-xs text-slate-500">Location · Urgency · Resources · Transcript</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Manual Logs */}
      <div className="bg-white p-6 rounded-2xl shadow-[0_4px_14px_0_rgba(0,118,255,0.05)] mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="h-5 w-5 text-blue-600" />
          <h2 className="font-heading text-base font-semibold text-foreground">Manual Logs &amp; Observations</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <textarea
              value={manualLogText}
              onChange={(e) => setManualLogText(e.target.value)}
              placeholder="Paste unstructured field notes, WhatsApp forwards, SMS alerts, or volunteer observations here..."
              className="w-full min-h-36 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            />

            <Button
              onClick={processManualLog}
              disabled={isManualProcessing}
              className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
            >
              {isManualProcessing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing Log...
                </>
              ) : (
                "Process Log"
              )}
            </Button>
          </div>

          <div className="rounded-2xl shadow-[0_4px_14px_0_rgba(0,118,255,0.05)] border border-blue-100 bg-white overflow-hidden">
            <div className="flex items-center gap-2 border-b border-blue-100 px-5 py-4 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                <Upload className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="font-heading text-base font-semibold text-slate-800">Processed Insights</h2>
              {manualOutput && <CheckCircle2 className="ml-auto h-4 w-4 text-green-600" />}
            </div>
            <div className="p-6">
              {manualOutput ? (
                renderManualInsights(manualOutput)
              ) : (
                <div className="flex h-40 items-center justify-center text-center">
                  <div>
                    <Upload className="mx-auto h-10 w-10 text-blue-200" />
                    <p className="mt-3 text-sm text-slate-600">Processed manual log insights will appear here</p>
                    <p className="mt-1 text-xs text-slate-500">Location · Urgency · Resources · Summary</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Field Reports */}
      <div className="bg-white p-6 rounded-2xl shadow-[0_4px_14px_0_rgba(0,118,255,0.05)] mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Video className="h-5 w-5 text-blue-600" />
          <h2 className="font-heading text-base font-semibold text-foreground">Video Field Reports</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              className="w-full rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
            />

            <Button
              onClick={processVideoReport}
              disabled={isProcessingVideo || !videoFile}
              className="w-full bg-blue-600 text-white hover:bg-blue-700 rounded-lg"
            >
              {isProcessingVideo ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Uploading & Analyzing Video (This takes 10-20 seconds)...
                </>
              ) : (
                "Submit Video Report"
              )}
            </Button>
          </div>

          <div className="rounded-2xl shadow-[0_4px_14px_0_rgba(0,118,255,0.05)] border border-blue-100 bg-white overflow-hidden">
            <div className="flex items-center gap-2 border-b border-blue-100 px-5 py-4 bg-gradient-to-r from-blue-50 to-white">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-100">
                <Video className="h-5 w-5 text-blue-600" />
              </div>
              <h2 className="font-heading text-base font-semibold text-slate-800">Video Report Insights</h2>
              {videoOutput && <CheckCircle2 className="ml-auto h-4 w-4 text-green-600" />}
            </div>
            <div className="p-6">
              {videoOutput ? (
                renderVideoInsights(videoOutput)
              ) : (
                <div className="flex h-40 items-center justify-center text-center">
                  <div>
                    <Video className="mx-auto h-10 w-10 text-blue-200" />
                    <p className="mt-3 text-sm text-slate-600">Video report insights will appear here after processing</p>
                    <p className="mt-1 text-xs text-slate-500">Location · Urgency · Resources · Summary</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataIngestion;
