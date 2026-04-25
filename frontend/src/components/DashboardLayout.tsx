import { useAuth, UserRole } from "@/contexts/AuthContext";
import { useNavigate, Outlet } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Truck, LogOut, LayoutDashboard, Map, Database, BarChart3,
  Smartphone, ChevronLeft, ChevronRight,
} from "lucide-react";
import { useState } from "react";
import { NavLink } from "@/components/NavLink";

const ngoLinks = [
  { to: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { to: "/dashboard/command", label: "Command Center", icon: Map },
  { to: "/dashboard/ingestion", label: "Data Ingestion", icon: Database },
  { to: "/dashboard/analytics", label: "Volunteer Analytics", icon: BarChart3 },
];

const volunteerLinks = [
  { to: "/field-app", label: "Field App", icon: Smartphone },
];

const DashboardLayout = () => {
  const { currentUser, logout, userRole } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const links = userRole === "Volunteer" ? volunteerLinks : ngoLinks;

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside
        className={`sticky top-0 flex h-screen flex-col border-r border-border bg-card transition-all duration-200 ${collapsed ? "w-16" : "w-60"}`}
      >
        {/* Logo */}
        <div className="flex h-16 items-center gap-2 border-b border-border px-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary">
            <Truck className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && <span className="font-heading text-lg font-bold text-foreground">SamarthAI</span>}
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {!collapsed && (
            <p className="mb-2 px-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              {userRole === "Volunteer" ? "Volunteer Field App" : "NGO Command Center"}
            </p>
          )}
          <ul className="space-y-1">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.to === "/dashboard"}
                  className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                  activeClassName="bg-primary/10 text-primary font-medium"
                >
                  <l.icon className="h-4 w-4 shrink-0" />
                  {!collapsed && <span>{l.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Collapse toggle */}
        <div className="border-t border-border p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center rounded-lg p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-border bg-card/80 backdrop-blur-sm px-6">
          <h2 className="font-heading text-lg font-semibold text-foreground">Dashboard</h2>
          <div className="flex items-center gap-4">
            <span className="rounded-md border border-border px-2 py-1 text-xs text-muted-foreground">
              {userRole || "Unknown Role"}
            </span>
            <span className="hidden text-sm text-muted-foreground sm:block">{currentUser?.email}</span>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" /> Log Out
            </Button>
          </div>
        </header>
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
