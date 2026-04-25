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
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border bg-card/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold text-foreground">SamarthAI</span>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/auth">
              <Button variant="ghost" size="sm">Log in</Button>
            </Link>
            <Link to="/auth">
              <Button size="sm" className="bg-secondary text-secondary-foreground hover:bg-secondary/90">
                Get Started <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="container mx-auto px-4 py-24 text-center">
        <div className="mx-auto max-w-3xl animate-fade-in">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-4 py-1.5 text-sm text-muted-foreground">
            <Zap className="h-3.5 w-3.5 text-warning" />
            AI-Powered Logistics for Humanitarian Impact
          </div>
          <h1 className="font-heading text-5xl font-extrabold leading-tight tracking-tight text-foreground md:text-6xl">
            Deliver Aid Faster.<br />
            <span className="text-primary">Save More Lives.</span>
          </h1>
          <p className="mx-auto mt-6 max-w-xl text-lg text-muted-foreground">
            SamarthAI brings intelligent supply chain management to NGOs — optimizing routes, tracking inventory, and coordinating volunteers in real-time.
          </p>
          <div className="mt-10 flex items-center justify-center gap-4">
            <Link to="/auth">
              <Button size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 text-base px-8">
                Start Free Trial
              </Button>
            </Link>
            <Button variant="outline" size="lg" className="text-base px-8">
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 pb-24">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group rounded-xl border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/30"
              style={{ animationDelay: `${i * 100}ms` }}
            >
              <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10">
                <f.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-heading text-lg font-semibold text-foreground">{f.title}</h3>
              <p className="mt-2 text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          © 2026 SamarthAI — Built for those who serve.
        </div>
      </footer>
    </div>
  );
};

export default Landing;
