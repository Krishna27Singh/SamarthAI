import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Truck, LogOut, Package, Users, BarChart3, AlertTriangle } from "lucide-react";

const stats = [
  { label: "Active Shipments", value: "24", icon: Package, trend: "+3 today" },
  { label: "Field Volunteers", value: "148", icon: Users, trend: "12 on mission" },
  { label: "Deliveries This Month", value: "1,204", icon: BarChart3, trend: "+18% vs last month" },
  { label: "Urgent Alerts", value: "3", icon: AlertTriangle, color: "warning" as const },
];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold text-foreground">SamarthAI</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">{user?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Log Out
            </Button>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="font-heading text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="mt-1 text-muted-foreground">
            Welcome back, <span className="font-medium text-foreground">{user?.email}</span>
          </p>
        </div>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div key={s.label} className="rounded-xl border border-border bg-card p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">{s.label}</span>
                <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${s.color === "warning" ? "bg-warning/10" : "bg-primary/10"}`}>
                  <s.icon className={`h-4 w-4 ${s.color === "warning" ? "text-warning" : "text-primary"}`} />
                </div>
              </div>
              <p className="mt-2 font-heading text-3xl font-bold text-foreground">{s.value}</p>
              {s.trend && <p className="mt-1 text-xs text-muted-foreground">{s.trend}</p>}
            </div>
          ))}
        </div>

        {/* Placeholder */}
        <div className="mt-8 rounded-xl border border-dashed border-border bg-card/50 p-12 text-center">
          <Package className="mx-auto h-12 w-12 text-muted-foreground/40" />
          <h3 className="mt-4 font-heading text-lg font-semibold text-muted-foreground">More modules coming soon</h3>
          <p className="mt-1 text-sm text-muted-foreground/70">Inventory, routing, volunteer management and analytics will appear here.</p>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
