import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Circle, MapPin, Clock, Users, Loader2, UserCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { fetchAllEmergencies } from "@/lib/emergencySources";
import { useNavigate } from "react-router-dom";

interface EmergencyTask {
  id: string;
  sourceCollection: string;
  title: string;
  description: string;
  location: string;
  urgency: "Low" | "Medium" | "Critical";
  status: "assigned" | "in_progress";
}

interface VolunteerProfileView {
  locationZone: string;
  clusterLabel: string;
}

const urgencyStyles: Record<string, string> = {
  Critical: "bg-destructive/10 text-destructive",
  Medium: "bg-warning/10 text-warning-foreground",
  Low: "bg-success/10 text-success",
};

const statusStyles: Record<EmergencyTask["status"], string> = {
  assigned: "text-warning",
  in_progress: "text-primary",
};

const API_BASE = "http://localhost:5050/api/dispatch";

const FieldApp = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<EmergencyTask[]>([]);
  const [isLoadingTasks, setIsLoadingTasks] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<{ emergencyId: string; type: "accept" | "complete" } | null>(null);
  const [profile, setProfile] = useState<VolunteerProfileView>({
    locationZone: "Unknown Zone",
    clusterLabel: "Newcomer",
  });

  const displayName = useMemo(() => {
    if (!currentUser?.email) return "Volunteer";
    return currentUser.email.split("@")[0];
  }, [currentUser?.email]);

  useEffect(() => {
    const loadVolunteerProfile = async () => {
      if (!currentUser?.uid) {
        setProfile({ locationZone: "Unknown Zone", clusterLabel: "Newcomer" });
        return;
      }

      try {
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        const data = userDoc.data() || {};

        setProfile({
          locationZone: data.locationZone || "Unknown Zone",
          clusterLabel: data.clusterLabel || "Newcomer",
        });
      } catch (error) {
        console.error("Failed to load volunteer profile:", error);
        setProfile({ locationZone: "Unknown Zone", clusterLabel: "Newcomer" });
      }
    };

    void loadVolunteerProfile();
  }, [currentUser?.uid]);

  useEffect(() => {
    if (!currentUser?.uid) {
      setTasks([]);
      setIsLoadingTasks(false);
      return;
    }

    setIsLoadingTasks(true);
    setError(null);

    const loadAssignedTasks = async () => {
      try {
        const sourceRecords = await fetchAllEmergencies({
          status: "assigned",
          filterField: "assignedVolunteerId",
          filterOperator: "==",
          filterValue: currentUser.uid,
        });

        const nextTasks: EmergencyTask[] = sourceRecords.map(({ id, sourceCollection, data }) => {
          const status = data.status === "in_progress" ? "in_progress" : "assigned";
          const urgencyRaw = String(data.urgency_level || data.urgency || "Low");
          const urgency = ["Low", "Medium", "Critical"].includes(urgencyRaw)
            ? (urgencyRaw as EmergencyTask["urgency"])
            : "Low";

          return {
            id,
            sourceCollection,
            title: String(data.summary || data.description || data.title || data.type || "Emergency"),
            description: String(data.summary || data.description || ""),
            location: String(data.location_clues || data.location || data.target_location || "Unknown location"),
            urgency,
            status,
          };
        });

        setTasks(nextTasks);
      } catch (snapshotError) {
        setError(snapshotError instanceof Error ? snapshotError.message : "Failed to load assigned tasks.");
      } finally {
        setIsLoadingTasks(false);
      }
    };

    void loadAssignedTasks();

    return () => {
      // no realtime subscription in unified fetch mode
    };
  }, [currentUser?.uid]);

  const handleAcceptTask = async (emergencyId: string) => {
    if (!currentUser?.uid) return;

    setActionLoading({ emergencyId, type: "accept" });
    setError(null);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`${API_BASE}/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          emergencyId,
          sourceCollection: tasks.find((task) => task.id === emergencyId)?.sourceCollection,
          volunteerId: currentUser.uid,
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || payload?.message || "Failed to accept task.");
      }

      setTasks((prev) => prev.map((task) => (task.id === emergencyId ? { ...task, status: "in_progress" } : task)));
      toast.success("Task accepted", { description: "You are now marked as in progress." });
    } catch (acceptError) {
      const message = acceptError instanceof Error ? acceptError.message : "Failed to accept task.";
      setError(message);
      toast.error("Unable to accept task", { description: message });
    } finally {
      setActionLoading(null);
    }
  };

  const handleCompleteTask = async (emergencyId: string) => {
    if (!currentUser?.uid) return;

    setActionLoading({ emergencyId, type: "complete" });
    setError(null);
    try {
      const token = await currentUser.getIdToken();
      const res = await fetch(`${API_BASE}/complete`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          emergencyId,
          sourceCollection: tasks.find((task) => task.id === emergencyId)?.sourceCollection,
          volunteerId: currentUser.uid,
        }),
      });

      const payload = await res.json();
      if (!res.ok) {
        throw new Error(payload?.error || payload?.message || "Failed to complete task.");
      }

      setTasks((prev) => prev.filter((task) => task.id !== emergencyId));
      toast.success("Task completed", { description: "Great work. This task has been marked complete." });
    } catch (completeError) {
      const message = completeError instanceof Error ? completeError.message : "Failed to complete task.";
      setError(message);
      toast.error("Unable to complete task", { description: message });
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F0F8FF] flex items-center justify-center md:p-8">
      <div className="w-full h-full min-h-screen bg-white relative flex flex-col md:w-[400px] md:min-h-0 md:h-[800px] md:rounded-[3rem] md:shadow-2xl md:border-[8px] md:border-white md:overflow-hidden">
          {/* Status bar */}
          <div className="flex items-center justify-between bg-primary px-5 py-3">
            <span className="font-heading text-sm font-bold text-primary-foreground">SamarthAI Field</span>
            <div className="flex items-center gap-2 text-xs text-primary-foreground/80">
              <span className="hidden sm:inline">{displayName}</span>
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="h-7 w-7 rounded-full text-primary-foreground hover:bg-primary-foreground/20"
                onClick={() => navigate("/field/profile")}
                aria-label="Open profile"
              >
                <UserCircle2 className="h-4 w-4" />
              </Button>
              <span>
                <Clock className="mr-1 inline h-3 w-3" />
                Today
              </span>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-5 pb-28">
            <div className="mb-4 rounded-lg border border-border bg-muted/40 p-3">
              <p className="text-sm font-semibold text-foreground">{displayName}</p>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  {profile.locationZone}
                </span>
                <span className="rounded-full bg-primary/10 px-2 py-0.5 font-medium text-primary">
                  Badge: {profile.clusterLabel}
                </span>
              </div>
            </div>

            <h2 className="font-heading text-lg font-bold text-foreground">Smart Itinerary</h2>
            <p className="mt-1 text-xs text-muted-foreground">{tasks.length} active dispatch tasks</p>

            {error && <p className="mt-3 text-xs text-destructive">{error}</p>}
            {isLoadingTasks && <p className="mt-3 text-xs text-muted-foreground">Loading active tasks...</p>}

            {/* Timeline */}
            <div className="mt-6 space-y-0">
              {!isLoadingTasks && tasks.length === 0 && (
                <div className="rounded-lg border border-border bg-muted/30 p-4 text-sm text-muted-foreground">
                  No active assigned tasks right now.
                </div>
              )}

              {tasks.map((task, i) => (
                <div key={`${task.sourceCollection}:${task.id}`} className="flex gap-3">
                  {/* Timeline rail */}
                  <div className="flex flex-col items-center">
                    {task.status === "in_progress" ? (
                      <div className="relative flex h-5 w-5 shrink-0 items-center justify-center">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary/30" />
                        <Circle className="h-5 w-5 fill-primary text-primary" />
                      </div>
                    ) : (
                      <CheckCircle2 className={`h-5 w-5 shrink-0 ${statusStyles.assigned}`} />
                    )}
                    {i < tasks.length - 1 && (
                      <div className={`w-px flex-1 min-h-[3rem] ${task.status === "in_progress" ? "bg-primary/40" : "bg-border"}`} />
                    )}
                  </div>

                  <div
                    className={`mb-4 flex-1 rounded-lg border p-3 transition-all ${
                      task.status === "in_progress"
                        ? "border-primary/30 bg-primary/5 shadow-sm"
                        : "border-warning/40 bg-warning/5"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider ${
                          task.status === "in_progress"
                            ? "bg-primary/10 text-primary"
                            : "bg-warning/10 text-warning-foreground"
                        }`}
                      >
                        {task.status === "in_progress" ? "In Progress" : "Assigned"}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${urgencyStyles[task.urgency] || urgencyStyles.Low}`}>
                          {task.urgency}
                        </span>
                      </div>
                    </div>

                    <p className="mt-2 text-sm font-semibold text-foreground">{task.title}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{task.description}</p>
                    <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" />
                      {task.location}
                    </div>

                    <div className="mt-3">
                      {task.status === "assigned" ? (
                        <Button
                          onClick={() => handleAcceptTask(task.id)}
                          disabled={actionLoading?.emergencyId === task.id}
                          className="w-full bg-warning text-warning-foreground hover:bg-warning/90"
                        >
                          {actionLoading?.emergencyId === task.id && actionLoading.type === "accept" ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Accepting...
                            </>
                          ) : (
                            "Accept Task"
                          )}
                        </Button>
                      ) : (
                        <Button
                          onClick={() => handleCompleteTask(task.id)}
                          disabled={actionLoading?.emergencyId === task.id}
                          className="w-full"
                        >
                          {actionLoading?.emergencyId === task.id && actionLoading.type === "complete" ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Marking...
                            </>
                          ) : (
                            "Mark Completed"
                          )}
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
};

export default FieldApp;
