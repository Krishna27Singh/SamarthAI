import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";

import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [ngoName, setNgoName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!fullName.trim()) {
        throw new Error("Please enter your full name.");
      }

      if (!ngoName.trim()) {
        throw new Error("Please enter your NGO name.");
      }

      const createdRole = await signup(
        email,
        password,
        "NGO" as UserRole,
        [ngoName.trim()],
        ["Primary Service Region"],
      );
      navigate(createdRole === "NGO" ? "/dashboard" : "/field-app");
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Unable to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div
        className="hidden md:block md:w-1/2 min-h-screen bg-cover bg-center"
        style={{ backgroundImage: "url('/images/hero.jpg')" }}
      />

      <div className="w-full md:w-1/2 min-h-screen flex items-center justify-center px-6 py-12" style={{ backgroundColor: "#F0F8FF" }}>
        <div className="w-full max-w-md bg-white rounded-2xl shadow-[0_4px_14px_0_rgba(0,118,255,0.05)] p-8">
            <div className="flex items-center gap-3 mb-6">
              <img src="/images/samarthlogo.png" alt="Samarth" className="h-9 w-auto object-contain" />
              <span className="font-heading text-lg font-semibold text-[#1E293B]">Samarth AI</span>
            </div>

            <h1 className="font-heading text-2xl font-bold text-[#1E293B]">Create account</h1>
            <p className="mt-1 text-sm text-slate-600">Set up your NGO access in seconds.</p>

            {error && (
              <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  className="focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.org"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="focus-visible:ring-2 focus-visible:ring-[#2563EB]"
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
                  className="focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="ngoName">NGO Name</Label>
                <Input
                  id="ngoName"
                  type="text"
                  placeholder="Samarth Relief Trust"
                  value={ngoName}
                  onChange={(e) => setNgoName(e.target.value)}
                  required
                  className="focus-visible:ring-2 focus-visible:ring-[#2563EB]"
                />
              </div>

              <Button type="submit" className="w-full bg-[#2563EB] text-white hover:bg-[#1e4fd8]" disabled={loading}>
                {loading ? "Creating account..." : "Create Account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-600">
              Already have an account? {" "}
              <Link to="/login" className="font-medium text-[#2563EB] hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
  );
};

export default Signup;
