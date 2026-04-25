import { useState, useCallback, useRef } from "react";
import { Upload, FileJson, ArrowDown, Loader2, FileImage, CheckCircle2, Camera, MapPin, Mic, MicOff, Video } from "lucide-react";
import { Button } from "@/components/ui/button";
import { submitManualLogAPI, submitVideoReportAPI, updateSceneLocationAPI, uploadScenePhoto, uploadSurveyForOCR, uploadVoiceReportAPI } from "@/services/api";
import { toast } from "sonner";

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
  const [manualOutput, setManualOutput] = useState<any>(null);
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
      const response = await submitManualLogAPI(manualLogText.trim());
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

  // Color-coded JSON renderer
  const renderJson = (obj: any) => (
    <div className="rounded-lg bg-muted/50 p-4 font-mono text-xs leading-relaxed overflow-x-auto">
      <span className="text-muted-foreground">{"{"}</span>
      <br />
      <span className="ml-4 text-primary">"location"</span>
      <span className="text-muted-foreground">: </span>
      <span className="text-success">"{obj.location}"</span>
      <span className="text-muted-foreground">,</span>
      <br />
      <span className="ml-4 text-primary">"urgency_score"</span>
      <span className="text-muted-foreground">: </span>
      <span className="text-warning font-bold">{obj.urgency_score}</span>
      <span className="text-muted-foreground">,</span>
      <br />
      <span className="ml-4 text-primary">"needs"</span>
      <span className="text-muted-foreground">: [</span>
      <br />
      {obj.needs.map((n, i) => (
        <span key={n}>
          <span className="ml-8 text-success">"{n}"</span>
          {i < obj.needs.length - 1 && <span className="text-muted-foreground">,</span>}
          <br />
        </span>
      ))}
      <span className="ml-4 text-muted-foreground">],</span>
      <br />
      <span className="ml-4 text-primary">"anomaly_detected"</span>
      <span className="text-muted-foreground">: </span>
      <span className="text-destructive">{String(obj.anomaly_detected)}</span>
      <br />
      <span className="text-muted-foreground">{"}"}</span>
    </div>
  );

  const renderSceneJson = (obj: any) => (
    <div className="rounded-lg bg-muted/50 p-4 font-mono text-xs leading-relaxed overflow-x-auto">
      <span className="text-muted-foreground">{"{"}</span>
      <br />
      <span className="ml-4 text-primary">"damage_type"</span>
      <span className="text-muted-foreground">: </span>
      <span className="text-success">"{obj.damage_type}"</span>
      <span className="text-muted-foreground">,</span>
      <br />
      <span className="ml-4 text-primary">"severity_score"</span>
      <span className="text-muted-foreground">: </span>
      <span className="text-warning font-bold">{obj.severity_score}</span>
      <span className="text-muted-foreground">,</span>
      <br />
      <span className="ml-4 text-primary">"resources_needed"</span>
      <span className="text-muted-foreground">: [</span>
      <br />
      {(Array.isArray(obj.resources_needed) ? obj.resources_needed : []).map((resource, i) => (
        <span key={resource + i}>
          <span className="ml-8 text-success">"{resource}"</span>
          {i < (obj.resources_needed?.length || 0) - 1 && <span className="text-muted-foreground">,</span>}
          <br />
        </span>
      ))}
      <span className="ml-4 text-muted-foreground">],</span>
      <br />
      <span className="ml-4 text-primary">"location_clues"</span>
      <span className="text-muted-foreground">: </span>
      <span className="text-success">"{obj.location_clues || "N/A (EXIF metadata)"}"</span>
      <span className="text-muted-foreground">,</span>
      <br />
      <span className="ml-4 text-primary">"location_source"</span>
      <span className="text-muted-foreground">: </span>
      <span className="text-warning">"{obj.location_source}"</span>
      <span className="text-muted-foreground">,</span>
      <br />
      <span className="ml-4 text-primary">"location"</span>
      <span className="text-muted-foreground">: </span>
      <span className="text-success">{"{ lat: "}{obj.location?.lat}{", lng: "}{obj.location?.lng}{" }"}</span>
      <br />
      <span className="text-muted-foreground">{"}"}</span>
    </div>
  );

  const renderVoiceJson = (obj: any) => (
    <div className="rounded-lg bg-muted/50 p-4 font-mono text-xs leading-relaxed overflow-x-auto">
      <span className="text-muted-foreground">{"{"}</span>
      <br />
      <span className="ml-4 text-primary">"location"</span>
      <span className="text-muted-foreground">: </span>
      <span className="text-success">"{obj.location}"</span>
      <span className="text-muted-foreground">,</span>
      <br />
      <span className="ml-4 text-primary">"urgency_score"</span>
      <span className="text-muted-foreground">: </span>
      <span className="text-warning font-bold">{obj.urgency_score}</span>
      <span className="text-muted-foreground">,</span>
      <br />
      <span className="ml-4 text-primary">"resources_needed"</span>
      <span className="text-muted-foreground">: [</span>
      <br />
      {(Array.isArray(obj.resources_needed) ? obj.resources_needed : []).map((resource, i) => (
        <span key={resource + i}>
          <span className="ml-8 text-success">"{resource}"</span>
          {i < (obj.resources_needed?.length || 0) - 1 && <span className="text-muted-foreground">,</span>}
          <br />
        </span>
      ))}
      <span className="ml-4 text-muted-foreground">],</span>
      <br />
      <span className="ml-4 text-primary">"anomaly_detected"</span>
      <span className="text-muted-foreground">: </span>
      <span className="text-destructive">{String(obj.anomaly_detected)}</span>
      <span className="text-muted-foreground">,</span>
      <br />
      <span className="ml-4 text-primary">"transcript"</span>
      <span className="text-muted-foreground">: </span>
      <span className="text-success">"{(obj.transcript || "").substring(0, 60)}..."</span>
      <br />
      <span className="text-muted-foreground">{"}"}</span>
    </div>
  );

  const renderManualJson = (obj: any) => (
    <div className="rounded-lg bg-muted/50 p-4 font-mono text-xs leading-relaxed overflow-x-auto">
      <span className="text-muted-foreground">{"{"}</span>
      <br />
      <span className="ml-4 text-primary">"location_clues"</span>
      <span className="text-muted-foreground">: </span>
      <span className="text-success">"{obj.location_clues}"</span>
      <span className="text-muted-foreground">,</span>
      <br />
      <span className="ml-4 text-primary">"urgency_score"</span>
      <span className="text-muted-foreground">: </span>
      <span className="text-warning font-bold">{obj.urgency_score}</span>
      <span className="text-muted-foreground">,</span>
      <br />
      <span className="ml-4 text-primary">"resources_needed"</span>
      <span className="text-muted-foreground">: [</span>
      <br />
      {(Array.isArray(obj.resources_needed) ? obj.resources_needed : []).map((resource, i) => (
        <span key={resource + i}>
          <span className="ml-8 text-success">"{resource}"</span>
          {i < (obj.resources_needed?.length || 0) - 1 && <span className="text-muted-foreground">,</span>}
          <br />
        </span>
      ))}
      <span className="ml-4 text-muted-foreground">],</span>
      <br />
      <span className="ml-4 text-primary">"summary"</span>
      <span className="text-muted-foreground">: </span>
      <span className="text-success">"{obj.summary}"</span>
      <span className="text-muted-foreground">,</span>
      <br />
      <span className="ml-4 text-primary">"anomaly_detected"</span>
      <span className="text-muted-foreground">: </span>
      <span className="text-destructive">{String(obj.anomaly_detected)}</span>
      <span className="text-muted-foreground">,</span>
      <br />
      <span className="ml-4 text-primary">"location_source"</span>
      <span className="text-muted-foreground">: </span>
      <span className="text-warning">"{obj.location_source}"</span>
      <span className="text-muted-foreground">,</span>
      <br />
      <span className="ml-4 text-primary">"location"</span>
      <span className="text-muted-foreground">: </span>
      <span className="text-success">{"{ lat: "}{obj.location?.lat}{", lng: "}{obj.location?.lng}{" }"}</span>
      <br />
      <span className="text-muted-foreground">{"}"}</span>
    </div>
  );

  const renderVideoJson = (obj: any) => (
    <div className="rounded-lg bg-muted/50 p-4 font-mono text-xs leading-relaxed overflow-x-auto">
      <span className="text-muted-foreground">{"{"}</span>
      <br />
      <span className="ml-4 text-primary">"location_clues"</span>
      <span className="text-muted-foreground">: </span>
      <span className="text-success">"{obj.location_clues}"</span>
      <span className="text-muted-foreground">,</span>
      <br />
      <span className="ml-4 text-primary">"urgency_score"</span>
      <span className="text-muted-foreground">: </span>
      <span className="text-warning font-bold">{obj.urgency_score}</span>
      <span className="text-muted-foreground">,</span>
      <br />
      <span className="ml-4 text-primary">"resources_needed"</span>
      <span className="text-muted-foreground">: [</span>
      <br />
      {(Array.isArray(obj.resources_needed) ? obj.resources_needed : []).map((resource, i) => (
        <span key={resource + i}>
          <span className="ml-8 text-success">"{resource}"</span>
          {i < (obj.resources_needed?.length || 0) - 1 && <span className="text-muted-foreground">,</span>}
          <br />
        </span>
      ))}
      <span className="ml-4 text-muted-foreground">],</span>
      <br />
      <span className="ml-4 text-primary">"summary"</span>
      <span className="text-muted-foreground">: </span>
      <span className="text-success">"{obj.summary}"</span>
      <span className="text-muted-foreground">,</span>
      <br />
      <span className="ml-4 text-primary">"anomaly_detected"</span>
      <span className="text-muted-foreground">: </span>
      <span className="text-destructive">{String(obj.anomaly_detected)}</span>
      <span className="text-muted-foreground">,</span>
      <br />
      <span className="ml-4 text-primary">"location_source"</span>
      <span className="text-muted-foreground">: </span>
      <span className="text-warning">"{obj.location_source}"</span>
      <span className="text-muted-foreground">,</span>
      <br />
      <span className="ml-4 text-primary">"location"</span>
      <span className="text-muted-foreground">: </span>
      <span className="text-success">{"{ lat: "}{obj.location?.lat}{", lng: "}{obj.location?.lng}{" }"}</span>
      <br />
      <span className="text-muted-foreground">{"}"}</span>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Data Ingestion</h1>
        <p className="mt-1 text-muted-foreground">Upload paper surveys and field documents for AI-powered extraction.</p>
      </div>

      {/* Paper Survey */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Upload className="h-5 w-5 text-primary" />
          <h2 className="font-heading text-base font-semibold text-foreground">Upload Paper Survey</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            {!selectedFile ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors cursor-pointer ${
                  dragOver ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40"
                }`}
              >
                <Upload className={`h-12 w-12 ${dragOver ? "text-primary" : "text-muted-foreground/30"}`} />
                <p className="mt-4 text-sm font-medium text-foreground">Drag & drop survey images or documents</p>
                <p className="mt-1 text-xs text-muted-foreground">PNG, JPG, PDF up to 10MB</p>
                <label className="mt-4">
                  <input type="file" accept="image/*,.pdf" className="hidden" onChange={handleFileSelect} />
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span>Browse Files</span>
                  </Button>
                </label>
              </div>
            ) : (
              <div className="rounded-lg border border-border p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <FileImage className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{selectedFile.name}</p>
                    <p className="text-xs text-muted-foreground">Ready for processing</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { setSelectedFile(null); setShowOutput(false); }}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Remove
                  </Button>
                </div>
                <Button
                  onClick={triggerOCR}
                  disabled={processing}
                  className="w-full bg-primary hover:bg-primary/90"
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

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <FileJson className="h-5 w-5 text-primary" />
              <h2 className="font-heading text-base font-semibold text-foreground">Processed Output (JSON Preview)</h2>
              {showOutput && <CheckCircle2 className="ml-auto h-4 w-4 text-success" />}
            </div>
            <div className="p-5">
              {showOutput ? (
                renderJson(jsonOutput)
              ) : (
                <div className="flex h-40 items-center justify-center text-center">
                  <div>
                    <FileJson className="mx-auto h-10 w-10 text-muted-foreground/20" />
                    <p className="mt-3 text-sm text-muted-foreground">Extracted entities will appear here after processing</p>
                    <p className="mt-1 text-xs text-muted-foreground/60">Location · Need · Urgency</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Scene Photo */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Camera className="h-5 w-5 text-primary" />
          <h2 className="font-heading text-base font-semibold text-foreground">Upload Scene Photo (Condition Assessment)</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            {!sceneFile ? (
              <div
                onDragOver={(e) => { e.preventDefault(); setSceneDragOver(true); }}
                onDragLeave={() => setSceneDragOver(false)}
                onDrop={handleSceneFileDrop}
                className={`flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-12 transition-colors cursor-pointer ${
                  sceneDragOver ? "border-primary bg-primary/5" : "border-border hover:border-muted-foreground/40"
                }`}
              >
                <Camera className={`h-12 w-12 ${sceneDragOver ? "text-primary" : "text-muted-foreground/30"}`} />
                <p className="mt-4 text-sm font-medium text-foreground">Drag &amp; drop scene photos</p>
                <p className="mt-1 text-xs text-muted-foreground">PNG, JPG up to 10MB</p>
                <label className="mt-4">
                  <input type="file" accept="image/*" className="hidden" onChange={handleSceneFileSelect} />
                  <Button variant="outline" className="cursor-pointer" asChild>
                    <span>Browse Photos</span>
                  </Button>
                </label>
              </div>
            ) : (
              <div className="rounded-lg border border-border p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Camera className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">{sceneFile.name}</p>
                    <p className="text-xs text-muted-foreground">Ready for scene assessment</p>
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
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Remove
                  </Button>
                </div>
                <Button
                  onClick={triggerSceneAssessment}
                  disabled={isSceneProcessing}
                  className="w-full bg-primary hover:bg-primary/90"
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

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <FileJson className="h-5 w-5 text-primary" />
              <h2 className="font-heading text-base font-semibold text-foreground">Scene Assessment Output (JSON Preview)</h2>
              {showSceneOutput && <CheckCircle2 className="ml-auto h-4 w-4 text-success" />}
            </div>
            <div className="p-5">
              {showSceneOutput ? (
                <div className="space-y-4">
                  {renderSceneJson(sceneOutput)}

                  {!isEditingLocation ? (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setIsEditingLocation(true)}
                      disabled={!sceneDocId}
                      className="w-full sm:w-auto"
                    >
                      <MapPin className="mr-2 h-4 w-4" />
                      Correct Location Manually
                    </Button>
                  ) : (
                    <div className="space-y-3 rounded-lg border border-border p-4">
                      <label className="text-sm font-medium text-foreground">Manual Address Override</label>
                      <input
                        type="text"
                        value={manualAddress}
                        onChange={(e) => setManualAddress(e.target.value)}
                        placeholder="Enter full address or landmark"
                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      />
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" onClick={saveManualLocation} disabled={isUpdating}>
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
                    <FileJson className="mx-auto h-10 w-10 text-muted-foreground/20" />
                    <p className="mt-3 text-sm text-muted-foreground">Scene assessment entities will appear here after processing</p>
                    <p className="mt-1 text-xs text-muted-foreground/60">Damage Type · Severity · Resources · Location Clues</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Voice Report */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Mic className="h-5 w-5 text-primary" />
          <h2 className="font-heading text-base font-semibold text-foreground">Voice Field Report</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="rounded-lg border border-border p-4">
                <h3 className="text-sm font-medium text-foreground mb-3">Record Field Report</h3>
                <div className="flex gap-2">
                  {!isRecording ? (
                    <Button
                      onClick={startRecording}
                      variant="outline"
                      className="flex-1"
                    >
                      <Mic className="mr-2 h-4 w-4" />
                      Start Recording
                    </Button>
                  ) : (
                    <Button
                      onClick={stopRecording}
                      variant="destructive"
                      className="flex-1"
                    >
                      <MicOff className="mr-2 h-4 w-4" />
                      Stop Recording
                    </Button>
                  )}
                </div>
                {isRecording && (
                  <p className="mt-2 text-xs text-destructive font-medium animate-pulse">
                    ● Recording in progress...
                  </p>
                )}
              </div>

              <div className="rounded-lg border border-border p-4">
                <h3 className="text-sm font-medium text-foreground mb-3">Upload Audio File</h3>
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
                    className="w-full cursor-pointer"
                    asChild
                    disabled={isRecording}
                  >
                    <span>Choose Audio File</span>
                  </Button>
                </label>
              </div>
            </div>

            {audioBlob && (
              <div className="rounded-lg border border-border p-4">
                <h3 className="text-sm font-medium text-foreground mb-3">Audio Preview</h3>
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
                  className="mt-2 text-xs text-muted-foreground"
                >
                  Clear Audio
                </Button>
              </div>
            )}

            {audioBlob && !showVoiceOutput && (
              <Button
                onClick={submitVoiceReport}
                disabled={voiceProcessing}
                className="w-full bg-primary hover:bg-primary/90"
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

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <FileJson className="h-5 w-5 text-primary" />
              <h2 className="font-heading text-base font-semibold text-foreground">Voice Report Output (JSON Preview)</h2>
              {showVoiceOutput && <CheckCircle2 className="ml-auto h-4 w-4 text-success" />}
            </div>
            <div className="p-5">
              {showVoiceOutput ? (
                <div className="space-y-4">
                  {renderVoiceJson(voiceOutput)}
                  <div className="pt-2 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Full Transcript:</p>
                    <p className="text-xs leading-relaxed text-foreground bg-muted/30 p-3 rounded">
                      {voiceOutput.transcript || "No transcript available"}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex h-40 items-center justify-center text-center">
                  <div>
                    <Mic className="mx-auto h-10 w-10 text-muted-foreground/20" />
                    <p className="mt-3 text-sm text-muted-foreground">Voice report entities will appear here after processing</p>
                    <p className="mt-1 text-xs text-muted-foreground/60">Location · Urgency · Resources · Anomaly Detection</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Manual Logs */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <FileJson className="h-5 w-5 text-primary" />
          <h2 className="font-heading text-base font-semibold text-foreground">Manual Logs &amp; Observations</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <textarea
              value={manualLogText}
              onChange={(e) => setManualLogText(e.target.value)}
              placeholder="Paste unstructured field notes, WhatsApp forwards, SMS alerts, or volunteer observations here..."
              className="w-full min-h-36 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />

            <Button
              onClick={processManualLog}
              disabled={isManualProcessing}
              className="w-full bg-primary hover:bg-primary/90"
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

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <FileJson className="h-5 w-5 text-primary" />
              <h2 className="font-heading text-base font-semibold text-foreground">Manual Log Output (JSON Preview)</h2>
              {manualOutput && <CheckCircle2 className="ml-auto h-4 w-4 text-success" />}
            </div>
            <div className="p-5">
              {manualOutput ? (
                renderManualJson(manualOutput)
              ) : (
                <div className="flex h-40 items-center justify-center text-center">
                  <div>
                    <FileJson className="mx-auto h-10 w-10 text-muted-foreground/20" />
                    <p className="mt-3 text-sm text-muted-foreground">Parsed manual log entities will appear here after processing</p>
                    <p className="mt-1 text-xs text-muted-foreground/60">Location Clues · Urgency · Resources · Summary · Anomaly</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Video Field Reports */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 mt-6">
        <div className="flex items-center gap-2 mb-4">
          <Video className="h-5 w-5 text-primary" />
          <h2 className="font-heading text-base font-semibold text-foreground">Video Field Reports</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <div className="space-y-4">
            <input
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
              className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />

            <Button
              onClick={processVideoReport}
              disabled={isProcessingVideo || !videoFile}
              className="w-full bg-primary hover:bg-primary/90"
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

          <div className="rounded-xl border border-border bg-card overflow-hidden">
            <div className="flex items-center gap-2 border-b border-border px-5 py-4">
              <FileJson className="h-5 w-5 text-primary" />
              <h2 className="font-heading text-base font-semibold text-foreground">Video Report Output (JSON Preview)</h2>
              {videoOutput && <CheckCircle2 className="ml-auto h-4 w-4 text-success" />}
            </div>
            <div className="p-5">
              {videoOutput ? (
                renderVideoJson(videoOutput)
              ) : (
                <div className="flex h-40 items-center justify-center text-center">
                  <div>
                    <Video className="mx-auto h-10 w-10 text-muted-foreground/20" />
                    <p className="mt-3 text-sm text-muted-foreground">Video report entities will appear here after processing</p>
                    <p className="mt-1 text-xs text-muted-foreground/60">Location Clues · Urgency · Resources · Summary · Anomaly</p>
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
