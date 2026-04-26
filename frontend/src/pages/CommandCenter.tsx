import { useEffect, useState } from "react";
import { Map, FileText, AlertTriangle, ChevronRight, ShieldAlert, X, Loader2, Users, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { fetchPredictiveHeatmapData } from "@/services/api";
import { db } from "@/lib/firebase";
import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { useAuth } from "@/contexts/AuthContext";

const fieldReports = [
  { id: 1, location: "Kathmandu Valley", urgency: "High", skills: "Medical, Logistics" },
  { id: 2, location: "Cox's Bazar Camp 4", urgency: "High", skills: "Water Purification, Shelter" },
  { id: 3, location: "Turkana County", urgency: "Medium", skills: "Food Distribution, Education" },
  { id: 4, location: "Port-au-Prince Sector B", urgency: "High", skills: "Search & Rescue, Trauma" },
  { id: 5, location: "Sindh Province", urgency: "Low", skills: "Agricultural, Community Health" },
  { id: 6, location: "Aleppo District 7", urgency: "Medium", skills: "Construction, Psychosocial" },
];

const anomalies = [
  { id: 1, description: "Duplicate supply request from Camp 4 (3x in 24h)", score: 87, severity: "High" },
  { id: 2, description: "Unusual volume spike — Sector B medical kits", score: 72, severity: "Medium" },
  { id: 3, description: "Unverified requester ID at Turkana distribution", score: 64, severity: "Medium" },
  { id: 4, description: "GPS mismatch on delivery confirmation", score: 91, severity: "High" },
];

const hotspots = [
  {
    id: "kathmandu",
    label: "Kathmandu Valley",
    x: "22%",
    y: "35%",
    severity: "critical" as const,
    prediction: "87% likelihood of medical supply shortage within 72h",
    shap: [
      { factor: "Recent heavy rainfall", impact: 42 },
      { factor: "Unfulfilled medical requests", impact: 28 },
      { factor: "Historical vulnerability index", impact: 15 },
      { factor: "Road accessibility decline", impact: 10 },
    ],
  },
  {
    id: "coxsbazar",
    label: "Cox's Bazar Camp 4",
    x: "55%",
    y: "28%",
    severity: "warning" as const,
    prediction: "63% likelihood of water purification demand spike",
    shap: [
      { factor: "Monsoon season proximity", impact: 35 },
      { factor: "Population density increase", impact: 22 },
      { factor: "Current inventory levels", impact: 18 },
      { factor: "Seasonal disease trends", impact: 12 },
    ],
  },
  {
    id: "portauprince",
    label: "Port-au-Prince Sector B",
    x: "78%",
    y: "58%",
    severity: "critical" as const,
    prediction: "91% likelihood of trauma care surge needed",
    shap: [
      { factor: "Seismic activity uptick", impact: 48 },
      { factor: "Infrastructure fragility score", impact: 25 },
      { factor: "Medical staff shortage", impact: 16 },
      { factor: "Supply chain disruption", impact: 8 },
    ],
  },
];

const urgencyColor: Record<string, string> = {
  High: "bg-destructive/10 text-destructive",
  Medium: "bg-warning/10 text-warning-foreground",
  Low: "bg-success/10 text-success",
};

const scoreColor = (score: number) => {
  if (score >= 80) return "text-destructive";
  if (score >= 60) return "text-warning";
  return "text-muted-foreground";
};

const severityStyles = {
  critical: {
    ring: "bg-destructive",
    pulse: "bg-destructive/40",
    label: "Critical",
    labelClass: "bg-destructive/10 text-destructive",
  },
  warning: {
    ring: "bg-warning",
    pulse: "bg-warning/40",
    label: "Warning",
    labelClass: "bg-warning/10 text-warning-foreground",
  },
};

type EmergencyItem = {
  id: string;
  title: string;
  description: string;
  urgency: "Low" | "Medium" | "Critical";
  location: string;
};

type RecommendedVolunteer = {
  volunteerId: string;
  name: string;
  skillsBio: string;
  clusterLabel: string;
  locationZone?: string;
  phone?: string;
};

type NgoProfile = {
  specialties: string[];
  serviceAreas: string[];
};

const CommandCenter = () => {
  const { currentUser } = useAuth();
  const [activeHotspot, setActiveHotspot] = useState<string | null>(null);
  const [pendingEmergencies, setPendingEmergencies] = useState<EmergencyItem[]>([]);
  const [isLoadingEmergencies, setIsLoadingEmergencies] = useState(false);
  const [dispatchError, setDispatchError] = useState<string | null>(null);
  const [selectedEmergency, setSelectedEmergency] = useState<EmergencyItem | null>(null);
  const [recommendations, setRecommendations] = useState<RecommendedVolunteer[]>([]);
  const [isRecommendationDialogOpen, setIsRecommendationDialogOpen] = useState(false);
  const [recommendationLoadingId, setRecommendationLoadingId] = useState<string | null>(null);
  const [recommendationError, setRecommendationError] = useState<string | null>(null);
  const [assigningVolunteerId, setAssigningVolunteerId] = useState<string | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [dismissedFallbackWarning, setDismissedFallbackWarning] = useState(false);
  const [ngoProfile, setNgoProfile] = useState<NgoProfile>({
    specialties: [],
    serviceAreas: [],
  });

  const activeData = hotspots.find((h) => h.id === activeHotspot);

  useEffect(() => {
    const loadNgoProfile = async () => {
      if (!currentUser?.uid) {
        setNgoProfile({ specialties: [], serviceAreas: [] });
        return;
      }

      try {
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        const data = userDoc.data() || {};

        setNgoProfile({
          specialties: Array.isArray(data.specialties) ? data.specialties : [],
          serviceAreas: Array.isArray(data.serviceAreas) ? data.serviceAreas : [],
        });
      } catch (error) {
        console.error("Failed to load NGO profile summary:", error);
        setNgoProfile({ specialties: [], serviceAreas: [] });
      }
    };

    void loadNgoProfile();
  }, [currentUser?.uid]);

  const loadPendingEmergencies = async () => {
    setIsLoadingEmergencies(true);
    setDispatchError(null);
    try {
      if (!currentUser?.uid) {
        setPendingEmergencies([]);
        setIsLoadingEmergencies(false);
        return;
      }

      const pendingQuery = query(
        collection(db, "manual_logs"),
        where("status", "==", "pending"),
        where("eligibleNgoIds", "array-contains", currentUser.uid),
      );
      const snapshot = await getDocs(pendingQuery);

      const emergencies: EmergencyItem[] = snapshot.docs.map((docSnap) => {
        const payload = docSnap.data() as Record<string, unknown>;
        const urgencyRaw = String(payload.urgency_level || payload.urgency || "Low");
        const urgency = ["Low", "Medium", "Critical"].includes(urgencyRaw) ? (urgencyRaw as EmergencyItem["urgency"]) : "Low";

        return {
          id: docSnap.id,
          title: String(payload.title || payload.type || "Emergency"),
          description: String(payload.emergency_description || payload.description || "No emergency description available."),
          urgency,
          location: String(payload.target_location || payload.location || "Unknown location"),
        };
      });

      setPendingEmergencies(emergencies);
    } catch (error) {
      setDispatchError(error instanceof Error ? error.message : "Failed to load pending emergencies.");
    } finally {
      setIsLoadingEmergencies(false);
    }
  };

  useEffect(() => {
    loadPendingEmergencies();
  }, [currentUser?.uid]);

  const findBestVolunteers = async (emergency: EmergencyItem) => {
    if (!currentUser) {
      setDispatchError("Please sign in to request AI recommendations.");
      return;
    }

    setRecommendationLoadingId(emergency.id);
    setRecommendationError(null);
    setSelectedEmergency(emergency);
    setDismissedFallbackWarning(false);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch("http://localhost:5050/api/dispatch/recommend", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          emergencyId: emergency.id,
          description: emergency.description,
          urgency: emergency.urgency,
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || payload?.message || "AI recommendation failed.");
      }

      setRecommendations((payload.volunteers || []) as RecommendedVolunteer[]);
      setIsFallback(payload.isFallback === true);
      setIsRecommendationDialogOpen(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to fetch recommendations.";
      setRecommendationError(message);
      setDispatchError(message);
    } finally {
      setRecommendationLoadingId(null);
    }
  };

  const assignVolunteer = async (volunteerId: string) => {
    if (!selectedEmergency || !currentUser) return;

    setAssigningVolunteerId(volunteerId);
    setRecommendationError(null);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch("http://localhost:5050/api/dispatch/assign", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          emergencyId: selectedEmergency.id,
          volunteerId,
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || payload?.message || "Task assignment failed.");
      }

      setPendingEmergencies((prev) => prev.filter((item) => item.id !== selectedEmergency.id));
      setIsRecommendationDialogOpen(false);
      setSelectedEmergency(null);
      setRecommendations([]);
      setIsFallback(false);
      setDismissedFallbackWarning(false);
    } catch (error) {
      setRecommendationError(error instanceof Error ? error.message : "Failed to assign task.");
    } finally {
      setAssigningVolunteerId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">NGO Command Center</h1>
        <p className="mt-1 text-muted-foreground">Real-time operational intelligence for field coordination.</p>
        <div className="mt-3 inline-flex flex-wrap items-center gap-2 rounded-full border border-border bg-muted/40 px-3 py-2 text-xs text-muted-foreground">
          <span className="font-semibold text-foreground">Active Region:</span>
          <span>{ngoProfile.serviceAreas.length > 0 ? ngoProfile.serviceAreas.join(", ") : "Not set"}</span>
          <span className="mx-1 text-border">|</span>
          <span className="font-semibold text-foreground">Capabilities:</span>
          <span>{ngoProfile.specialties.length > 0 ? ngoProfile.specialties.join(", ") : "Not set"}</span>
        </div>
      </div>

      {/* Full-width Heatmap */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Map className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-base font-semibold text-foreground">Predictive Resource Heatmap</h2>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-destructive" /> Critical</span>
              <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-warning" /> Warning</span>
            </div>
            <Button size="sm" variant="outline" onClick={() => fetchPredictiveHeatmapData()}>
              Refresh
            </Button>
          </div>
        </div>

        <div className="relative flex h-80">
          {/* Map background */}
          <div
            className="relative flex-1"
            style={{
              background: `
                radial-gradient(ellipse at 22% 35%, hsl(var(--destructive) / 0.12) 0%, transparent 40%),
                radial-gradient(ellipse at 55% 28%, hsl(var(--warning) / 0.10) 0%, transparent 35%),
                radial-gradient(ellipse at 78% 58%, hsl(var(--destructive) / 0.10) 0%, transparent 35%),
                linear-gradient(180deg, hsl(var(--muted) / 0.3) 0%, hsl(var(--muted) / 0.15) 100%)
              `,
            }}
          >
            {/* Grid overlay */}
            <div
              className="absolute inset-0 opacity-[0.07]"
              style={{
                backgroundImage: `
                  linear-gradient(hsl(var(--foreground)) 1px, transparent 1px),
                  linear-gradient(90deg, hsl(var(--foreground)) 1px, transparent 1px)
                `,
                backgroundSize: "48px 48px",
              }}
            />

            {/* Hotspot markers */}
            {hotspots.map((spot) => {
              const style = severityStyles[spot.severity];
              return (
                <button
                  key={spot.id}
                  onClick={() => setActiveHotspot(activeHotspot === spot.id ? null : spot.id)}
                  className="absolute z-10 group cursor-pointer"
                  style={{ left: spot.x, top: spot.y, transform: "translate(-50%, -50%)" }}
                >
                  {/* Outer pulse */}
                  <span className={`absolute inset-0 h-10 w-10 -translate-x-1/2 -translate-y-1/2 rounded-full ${style.pulse} animate-ping`} />
                  {/* Inner ring */}
                  <span className={`relative flex h-5 w-5 items-center justify-center rounded-full ${style.ring} shadow-lg ring-2 ring-background`}>
                    <span className="h-2 w-2 rounded-full bg-background" />
                  </span>
                  {/* Tooltip label */}
                  <span className="absolute left-1/2 -translate-x-1/2 top-7 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-[11px] font-medium text-popover-foreground shadow-md opacity-0 group-hover:opacity-100 transition-opacity border border-border">
                    {spot.label}
                  </span>
                </button>
              );
            })}
          </div>

          {/* SHAP Side Panel */}
          {activeData && (
            <div className="w-80 shrink-0 border-l border-border bg-card overflow-y-auto animate-in slide-in-from-right-4 duration-200">
              <div className="flex items-center justify-between border-b border-border px-4 py-3">
                <h3 className="text-sm font-semibold text-foreground">AI Prediction Rationale</h3>
                <button onClick={() => setActiveHotspot(null)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="p-4 space-y-4">
                <div>
                  <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${severityStyles[activeData.severity].labelClass}`}>
                    {severityStyles[activeData.severity].label}
                  </span>
                  <h4 className="mt-2 font-heading text-sm font-semibold text-foreground">{activeData.label}</h4>
                  <p className="mt-1 text-xs text-muted-foreground">{activeData.prediction}</p>
                </div>

                <div className="space-y-1">
                  <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">SHAP Breakdown</p>
                  <div className="space-y-3">
                    {activeData.shap.map((s) => (
                      <div key={s.factor}>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-foreground">{s.factor}</span>
                          <span className="font-semibold text-primary">+{s.impact}%</span>
                        </div>
                        <Progress value={s.impact} className="mt-1 h-1.5" />
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-[10px] text-muted-foreground/60 border-t border-border pt-3">
                  Powered by SamarthAI XGBoost model · SHAP explainability
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Anomaly Detection + Field Reports */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Anomaly Detection */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <ShieldAlert className="h-5 w-5 text-destructive" />
            <h2 className="font-heading text-base font-semibold text-foreground">Anomaly Detection Alerts</h2>
          </div>
          <div className="divide-y divide-border">
            {anomalies.map((a) => (
              <div key={a.id} className="flex items-start gap-3 px-5 py-3.5 hover:bg-muted/20 transition-colors">
                <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-destructive/10">
                  <ShieldAlert className="h-4 w-4 text-destructive" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{a.description}</p>
                  <div className="mt-1 flex items-center gap-3">
                    <span className={`text-xs font-semibold ${urgencyColor[a.severity]} rounded-full px-2 py-0.5`}>
                      {a.severity}
                    </span>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className={`text-lg font-bold ${scoreColor(a.score)}`}>{a.score}</p>
                  <p className="text-[10px] text-muted-foreground">Anomaly Score</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Field Reports Table */}
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border px-5 py-4">
            <FileText className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-base font-semibold text-foreground">Recent Field Reports</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Location</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Urgency</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Skills</th>
                  <th className="px-5 py-3"></th>
                </tr>
              </thead>
              <tbody>
                {fieldReports.map((r) => (
                  <tr key={r.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground">{r.location}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${urgencyColor[r.urgency]}`}>
                        {r.urgency === "High" && <AlertTriangle className="h-3 w-3" />}
                        {r.urgency}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{r.skills}</td>
                    <td className="px-5 py-3 text-right">
                      <ChevronRight className="ml-auto h-4 w-4 text-muted-foreground/40" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <h2 className="font-heading text-base font-semibold text-foreground">AI-Assisted Dispatch</h2>
          </div>
          <Button variant="outline" size="sm" onClick={loadPendingEmergencies} disabled={isLoadingEmergencies}>
            {isLoadingEmergencies ? <Loader2 className="h-4 w-4 animate-spin" /> : "Refresh"}
          </Button>
        </div>

        {dispatchError && <p className="px-5 pt-4 text-sm text-destructive">{dispatchError}</p>}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Emergency</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Location</th>
                <th className="px-5 py-3 text-left font-medium text-muted-foreground">Urgency</th>
                <th className="px-5 py-3 text-right font-medium text-muted-foreground">Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingEmergencies.length === 0 && !isLoadingEmergencies ? (
                <tr>
                  <td className="px-5 py-5 text-muted-foreground" colSpan={4}>
                    No pending emergencies to dispatch.
                  </td>
                </tr>
              ) : (
                pendingEmergencies.map((emergency) => (
                  <tr key={emergency.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3">
                      <p className="font-medium text-foreground">{emergency.title}</p>
                      <p className="text-xs text-muted-foreground">{emergency.description}</p>
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{emergency.location}</td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${urgencyColor[emergency.urgency] || urgencyColor.Low}`}>
                        {emergency.urgency}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Button
                        onClick={() => findBestVolunteers(emergency)}
                        disabled={recommendationLoadingId === emergency.id}
                        size="sm"
                      >
                        {recommendationLoadingId === emergency.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Find Best Volunteers (AI)"
                        )}
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={isRecommendationDialogOpen} onOpenChange={setIsRecommendationDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>AI Volunteer Recommendations</DialogTitle>
            <DialogDescription>
              {selectedEmergency ? `Top matches for ${selectedEmergency.title} (${selectedEmergency.urgency}).` : "Review and assign a volunteer."}
            </DialogDescription>
          </DialogHeader>

          {isFallback && !dismissedFallbackWarning && (
            <Alert className="border-warning/40 bg-warning/10">
              <AlertCircle className="h-4 w-4 text-warning" />
              <AlertDescription className="text-warning-foreground">
                ⚠️ AI Matching Service is currently offline. Displaying all registered volunteers for your organization.
                <button
                  onClick={() => setDismissedFallbackWarning(true)}
                  className="ml-3 inline text-xs font-semibold hover:underline"
                >
                  Dismiss
                </button>
              </AlertDescription>
            </Alert>
          )}

          {recommendationError && <p className="text-sm text-destructive">{recommendationError}</p>}

          <div className="space-y-3 max-h-[60vh] overflow-y-auto pr-1">
            {recommendations.length === 0 ? (
              <p className="text-sm text-muted-foreground">No volunteers matched the urgency filter.</p>
            ) : (
              recommendations.map((volunteer) => {
                const isRapid = volunteer.clusterLabel === "Rapid Responders";
                return (
                  <div key={volunteer.volunteerId} className="rounded-lg border border-border p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-semibold text-foreground">{volunteer.name}</p>
                        <p className="mt-1 text-sm text-muted-foreground">{volunteer.skillsBio || "No skills bio provided."}</p>
                        <div className="mt-2 flex items-center gap-2">
                          <Badge variant={isRapid ? "destructive" : "secondary"}>{volunteer.clusterLabel}</Badge>
                          {volunteer.locationZone && <span className="text-xs text-muted-foreground">{volunteer.locationZone}</span>}
                        </div>
                      </div>

                      <Button
                        size="sm"
                        onClick={() => assignVolunteer(volunteer.volunteerId)}
                        disabled={assigningVolunteerId === volunteer.volunteerId}
                      >
                        {assigningVolunteerId === volunteer.volunteerId ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          "Assign Task"
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CommandCenter;
