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
    <div className="flex min-h-screen bg-[#F0F8FF]">
      {/* Sidebar - Serene Beige Navigation */}
      <aside
        className={`sidebar-serene sticky top-0 flex h-screen flex-col border-r border-[#E0F2FE] transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}
      >
        {/* Logo Section */}
        <div className="flex h-16 items-center gap-3 border-b border-[#E0F2FE] px-4">
          <img 
            src="/images/samarthlogo.png" 
            alt="SamarthAI Logo" 
            className="h-8 w-auto object-contain"
          />
          {!collapsed && (
            <span className="font-heading text-xl font-bold text-[#1E293B]">SamarthAI</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {!collapsed && (
            <p className="mb-4 px-3 text-xs font-bold uppercase tracking-widest text-[#64748B]">
              {userRole === "Volunteer" ? "Field App" : "NGO Command"}
            </p>
          )}
          <ul className="space-y-2">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.to === "/dashboard/command"}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-500 transition-all duration-300 sidebar-item-hover text-[#1E293B]`}
                  activeClassName="sidebar-item-active bg-[#EBE7DD] border-l-4 border-[#2563EB] text-[#2563EB]"
                >
                  <l.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{l.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Collapse Toggle */}
        <div className="border-t border-[#E0F2FE] p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center rounded-lg p-2.5 text-[#1E293B] transition-all duration-300 hover:bg-[#F3F0E8] active:scale-95"
          >
            {collapsed ? (
              <ChevronRight className="h-5 w-5" />
            ) : (
              <ChevronLeft className="h-5 w-5" />
            )}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        {/* Header - Clean Light Blue Top Bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#E0F2FE] bg-white px-8 shadow-sm">
          <h2 className="font-heading text-2xl font-bold text-[#1E293B]">Dashboard</h2>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 rounded-lg bg-[#F0F8FF] px-3 py-1.5 border border-[#E0F2FE]">
              <div className="h-2 w-2 rounded-full bg-[#059669]"></div>
              <span className="text-xs font-bold text-[#1E293B]">
                {userRole || "Unknown"}
              </span>
            </div>
            <span className="hidden text-sm font-500 text-[#64748B] sm:block">
              {currentUser?.email}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="border-[#E0F2FE] hover:bg-[#FEE2E2] hover:text-[#DC2626] rounded-lg font-semibold"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#F0F8FF] p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
