import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"NGO" | "Volunteer">("NGO");
  const [specialties, setSpecialties] = useState("");
  const [serviceAreas, setServiceAreas] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isLogin) {
        const role = await login(email, password);
        navigate(role === "NGO" ? "/dashboard" : "/field-app");
      } else {
        const parsedSpecialties = specialties.split(",").map((item) => item.trim()).filter(Boolean);
        const parsedServiceAreas = serviceAreas.split(",").map((item) => item.trim()).filter(Boolean);

        if (!name.trim()) {
          throw new Error("Please enter your name.");
        }

        if (parsedSpecialties.length === 0) {
          throw new Error("Please enter at least one specialty.");
        }

        if (parsedServiceAreas.length === 0) {
          throw new Error("Please enter at least one service area.");
        }

        const createdRole = await signup(
          email,
          password,
          role,
          name,
          parsedSpecialties,
          parsedServiceAreas,
        );
        navigate(createdRole === "NGO" ? "/dashboard" : "/field-app");
      }
    } catch (err: any) {
      setError(err?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div
        className="hidden md:block md:w-1/2 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero.jpg')" }}
      />

      <div className="w-full md:w-1/2 bg-[#F0F8FF] flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
          <div className="flex items-center gap-3 mb-6">
            <img src="/images/samarthlogo.png" alt="Samarth" className="h-9 w-auto object-contain" />
            <span className="font-heading text-lg font-semibold text-[#1E293B]">Samarth AI</span>
          </div>

          <h1 className="font-heading text-2xl font-bold text-[#1E293B]">
            {isLogin ? "Welcome back" : "Create Account"}
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {isLogin ? "Sign in to continue" : "Set up your organization or field access"}
          </p>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            {!isLogin && (
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="rounded-lg border border-gray-200 p-2.5 focus:border-transparent focus:ring-2 focus:ring-blue-600"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@ngo.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="rounded-lg border border-gray-200 p-2.5 focus:border-transparent focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="rounded-lg border border-gray-200 p-2.5 focus:border-transparent focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {!isLogin && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    value={role}
                    onChange={(e) => setRole(e.target.value as "NGO" | "Volunteer")}
                    className="w-full rounded-lg border border-gray-200 p-2.5 focus:border-transparent focus:ring-2 focus:ring-blue-600"
                  >
                    <option value="NGO">NGO Admin</option>
                    <option value="Volunteer">Field Volunteer</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specialties">Specialties (comma-separated, e.g., medical, food distribution, search & rescue)</Label>
                  <textarea
                    id="specialties"
                    value={specialties}
                    onChange={(e) => setSpecialties(e.target.value)}
                    rows={3}
                    placeholder="medical, food distribution, search & rescue"
                    className="w-full rounded-lg border border-gray-200 p-2.5 focus:border-transparent focus:ring-2 focus:ring-blue-600"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="serviceAreas">Service Areas (comma-separated, e.g., Sector 4, Downtown, North District)</Label>
                  <textarea
                    id="serviceAreas"
                    value={serviceAreas}
                    onChange={(e) => setServiceAreas(e.target.value)}
                    rows={3}
                    placeholder="Sector 4, Downtown, North District"
                    className="w-full rounded-lg border border-gray-200 p-2.5 focus:border-transparent focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full rounded-lg bg-blue-600 py-2.5 text-white hover:bg-blue-700" disabled={loading}>
              {loading ? "Please wait…" : isLogin ? "Sign In" : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-600">
            {isLogin ? "Don't have an account?" : "Already have an account?"} {" "}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin);
                setError("");
              }}
              className="font-medium text-blue-600 hover:underline"
            >
              {isLogin ? "Create account" : "Sign in"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;
