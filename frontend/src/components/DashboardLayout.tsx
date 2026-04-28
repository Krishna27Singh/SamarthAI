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
    <div className="flex min-h-screen bg-[#F8FAFC]">
      {/* Sidebar - Premium Dark Navigation */}
      <aside
        className={`sidebar-premium sticky top-0 flex h-screen flex-col border-r border-[#1E293B] transition-all duration-300 ${collapsed ? "w-16" : "w-64"}`}
      >
        {/* Logo Section */}
        <div className="flex h-16 items-center gap-3 border-b border-[#1E293B] px-4">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-[#4F46E5] to-[#4338CA] shadow-lg">
            <Truck className="h-6 w-6 text-white" />
          </div>
          {!collapsed && (
            <span className="font-heading text-xl font-800 text-[#F8FAFC]">SamarthAI</span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {!collapsed && (
            <p className="mb-4 px-3 text-xs font-700 uppercase tracking-widest text-[#64748B]">
              {userRole === "Volunteer" ? "Field App" : "NGO Command"}
            </p>
          )}
          <ul className="space-y-2">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  end={l.to === "/dashboard"}
                  className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-500 transition-all duration-200 sidebar-item-hover
                    text-[#CBD5E1] hover:text-[#F8FAFC]`}
                  activeClassName="sidebar-item-active bg-[#1E293B] border-l-4 border-[#4F46E5] text-[#F8FAFC]"
                >
                  <l.icon className="h-5 w-5 shrink-0" />
                  {!collapsed && <span>{l.label}</span>}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        {/* Collapse Toggle */}
        <div className="border-t border-[#1E293B] p-3">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex w-full items-center justify-center rounded-lg p-2.5 text-[#CBD5E1] transition-all duration-200 hover:bg-[#1E293B] hover:text-[#F8FAFC] active:scale-95"
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
        {/* Header - Premium Top Bar */}
        <header className="sticky top-0 z-40 flex h-16 items-center justify-between border-b border-[#E2E8F0] bg-white px-8 shadow-sm">
          <h2 className="font-heading text-2xl font-700 text-[#1E293B]">Dashboard</h2>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 rounded-lg bg-[#F8FAFC] px-3 py-1.5 border border-[#E2E8F0]">
              <div className="h-2 w-2 rounded-full bg-[#10B981]"></div>
              <span className="text-xs font-600 text-[#1E293B]">
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
              className="border-[#E2E8F0] hover:bg-red-50 hover:text-red-600 rounded-lg font-600"
            >
              <LogOut className="mr-2 h-4 w-4" />
              Log Out
            </Button>
          </div>
        </header>

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-[#F8FAFC] p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
