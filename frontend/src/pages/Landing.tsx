import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Truck, Package, Users, BarChart3, Shield, Zap, ArrowRight } from "lucide-react";

const features = [
  { icon: Package, title: "Smart Inventory", desc: "AI-powered tracking of relief supplies across warehouses and transit points." },
  { icon: Truck, title: "Route Optimization", desc: "Intelligent routing that accounts for terrain, weather, and urgency levels." },
  { icon: Users, title: "Volunteer Coordination", desc: "Seamlessly manage field teams, assign tasks, and track progress." },
  { icon: BarChart3, title: "Impact Analytics", desc: "Real-time dashboards showing delivery metrics and community reach." },
  { icon: Shield, title: "Secure & Compliant", desc: "Enterprise-grade security with full audit trails for donor transparency." },
  { icon: Zap, title: "Rapid Deployment", desc: "Go live in hours, not weeks. Built for crisis-speed operations." },
];

const Landing = () => {
  return (
    <div className="min-h-screen" style={{ backgroundColor: '#F0F8FF' }}>
      <div className="flex items-center justify-center py-20 px-4">
        <div className="w-full max-w-4xl rounded-2xl bg-white shadow-[0_4px_14px_0_rgba(0,118,255,0.05)] overflow-hidden">
          <div className="bg-[#F7F5F0] p-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <img src="/images/samarthlogo.png" alt="Samarth" className="h-10 w-auto object-contain" />
                <span className="font-heading text-2xl font-bold text-[#1E293B]">Samarth AI</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h1 className="font-heading text-3xl font-bold text-[#1E293B]">Welcome to Samarth AI</h1>
                <p className="mt-3 text-slate-600">AI-powered logistics and field coordination built for NGOs and volunteers. Localized, reliable, and easy to use.</p>
              </div>

              <div className="flex flex-col gap-4">
                <Link to="/login" className="block">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100 flex items-center gap-3 hover:shadow-md">
                    <div className="h-10 w-10 rounded-lg bg-[#2563EB]/10 flex items-center justify-center">
                      <Users className="h-5 w-5 text-[#2563EB]" />
                    </div>
                    <div>
                      <div className="text-[#1E293B] font-semibold">NGO Admin Login</div>
                      <div className="text-xs text-slate-500">Access dashboard & operations</div>
                    </div>
                  </div>
                </Link>

                <Link to="/login" className="block">
                  <div className="bg-white rounded-lg p-4 shadow-sm border border-slate-100 flex items-center gap-3 hover:shadow-md">
                    <div className="h-10 w-10 rounded-lg bg-[#2563EB]/10 flex items-center justify-center">
                      <Zap className="h-5 w-5 text-[#2563EB]" />
                    </div>
                    <div>
                      <div className="text-[#1E293B] font-semibold">Volunteer Login</div>
                      <div className="text-xs text-slate-500">Field reporting & assignments</div>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </div>
          <div className="p-6 text-center text-sm text-slate-500">© 2026 Samarth AI — Built for those who serve.</div>
        </div>
      </div>
    </div>
  );
};

export default Landing;
