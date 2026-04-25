import { useState } from "react";
import { Users, Zap, Clock, Star, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

const clusters = [
  {
    name: "Rapid Responders",
    color: "bg-success/10 text-success",
    icon: Zap,
    volunteers: [
      { name: "Priya Sharma", velocity: "4.2 min", completion: "97%", missions: 48 },
      { name: "Amir Khan", velocity: "5.1 min", completion: "94%", missions: 41 },
      { name: "Lina Tanaka", velocity: "4.8 min", completion: "96%", missions: 39 },
    ],
  },
  {
    name: "Weekend Warriors",
    color: "bg-primary/10 text-primary",
    icon: Clock,
    volunteers: [
      { name: "Raj Patel", velocity: "12.3 min", completion: "88%", missions: 22 },
      { name: "Sofia Reyes", velocity: "14.1 min", completion: "85%", missions: 19 },
      { name: "David Okafor", velocity: "11.8 min", completion: "90%", missions: 25 },
    ],
  },
  {
    name: "Specialist Elite",
    color: "bg-warning/10 text-warning",
    icon: Star,
    volunteers: [
      { name: "Dr. Meena Joshi", velocity: "8.5 min", completion: "99%", missions: 34 },
      { name: "Carlos Mendez", velocity: "9.2 min", completion: "92%", missions: 28 },
    ],
  },
];

const mockResults = [
  {
    name: "Priya Sharma",
    cluster: "Rapid Responder",
    clusterColor: "bg-success/10 text-success",
    relevance: 94,
    skills: ["Medical Triage", "Logistics Coordination", "Hindi/English"],
    velocity: "4.2 min avg response",
    missions: 48,
  },
  {
    name: "Dr. Meena Joshi",
    cluster: "Specialist Elite",
    clusterColor: "bg-warning/10 text-warning",
    relevance: 87,
    skills: ["Trauma Surgery", "Field Medicine", "Crisis Counseling"],
    velocity: "8.5 min avg response",
    missions: 34,
  },
];

const VolunteerAnalytics = () => {
  const [query, setQuery] = useState("");
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState<typeof mockResults | null>(null);

  const handleSearch = () => {
    if (!query.trim()) return;
    setSearching(true);
    setResults(null);
    setTimeout(() => {
      setSearching(false);
      setResults(mockResults);
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-3xl font-bold text-foreground">Volunteer Analytics</h1>
        <p className="mt-1 text-muted-foreground">Behavioral clustering and performance insights for volunteer coordination.</p>
      </div>

      {/* Semantic Search */}
      <div className="rounded-xl border border-border bg-card overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border px-5 py-4">
          <Search className="h-5 w-5 text-primary" />
          <h2 className="font-heading text-base font-semibold text-foreground">Semantic Resource Matcher</h2>
          <span className="ml-auto rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold text-primary uppercase tracking-wider">Vector Search</span>
        </div>
        <div className="p-5 space-y-4">
          <div className="flex gap-3">
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="Describe the emergency or required skills in natural language..."
              className="flex-1"
            />
            <Button onClick={handleSearch} disabled={searching || !query.trim()}>
              {searching ? "Searching…" : "Find Matches"}
            </Button>
          </div>

          {/* Loading skeletons */}
          {searching && (
            <div className="grid gap-4 sm:grid-cols-2">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-lg border border-border p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="space-y-2 flex-1">
                      <Skeleton className="h-4 w-32" />
                      <Skeleton className="h-3 w-20" />
                    </div>
                    <Skeleton className="h-8 w-16 rounded-full" />
                  </div>
                  <Skeleton className="h-2 w-full" />
                  <div className="flex gap-2">
                    <Skeleton className="h-5 w-20 rounded-full" />
                    <Skeleton className="h-5 w-24 rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Results */}
          {results && (
            <div className="space-y-3">
              <p className="text-xs text-muted-foreground">Top Matches · Powered by Vertex AI Vector Search</p>
              <div className="grid gap-4 sm:grid-cols-2">
                {results.map((v) => (
                  <div key={v.name} className="rounded-lg border border-border p-4 hover:border-primary/30 transition-colors">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                          <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{v.name}</p>
                          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${v.clusterColor}`}>
                            {v.cluster}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-lg font-bold text-primary">{v.relevance}%</p>
                        <p className="text-[10px] text-muted-foreground">Match</p>
                      </div>
                    </div>
                    <Progress value={v.relevance} className="mt-3 h-1.5" />
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {v.skills.map((s) => (
                        <span key={s} className="rounded-full bg-muted px-2 py-0.5 text-[11px] text-muted-foreground">{s}</span>
                      ))}
                    </div>
                    <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{v.velocity}</span>
                      <span>·</span>
                      <span>{v.missions} missions</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-border bg-card p-5">
          <span className="text-sm text-muted-foreground">Total Volunteers</span>
          <p className="mt-1 font-heading text-3xl font-bold text-foreground">148</p>
          <p className="mt-1 text-xs text-muted-foreground">Across 3 behavioral clusters</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <span className="text-sm text-muted-foreground">Avg Response Velocity</span>
          <p className="mt-1 font-heading text-3xl font-bold text-foreground">8.7 min</p>
          <p className="mt-1 text-xs text-success">↓ 12% faster this month</p>
        </div>
        <div className="rounded-xl border border-border bg-card p-5">
          <span className="text-sm text-muted-foreground">Avg Completion Rate</span>
          <p className="mt-1 font-heading text-3xl font-bold text-foreground">92%</p>
          <p className="mt-1 text-xs text-success">↑ 3% vs last month</p>
        </div>
      </div>

      {/* Cluster groups */}
      {clusters.map((cluster) => (
        <div key={cluster.name} className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="flex items-center gap-3 border-b border-border px-5 py-4">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${cluster.color}`}>
              <cluster.icon className="h-4 w-4" />
            </div>
            <div>
              <h2 className="font-heading text-base font-semibold text-foreground">{cluster.name}</h2>
              <p className="text-xs text-muted-foreground">{cluster.volunteers.length} volunteers</p>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Volunteer</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Response Velocity</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Completion Rate</th>
                  <th className="px-5 py-3 text-left font-medium text-muted-foreground">Missions</th>
                </tr>
              </thead>
              <tbody>
                {cluster.volunteers.map((v) => (
                  <tr key={v.name} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3 font-medium text-foreground flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground/50" />
                      {v.name}
                    </td>
                    <td className="px-5 py-3 text-muted-foreground">{v.velocity}</td>
                    <td className="px-5 py-3 text-muted-foreground">{v.completion}</td>
                    <td className="px-5 py-3 text-muted-foreground">{v.missions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
};

export default VolunteerAnalytics;
