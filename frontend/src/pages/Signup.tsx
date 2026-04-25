import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, Truck } from "lucide-react";

import { useAuth, UserRole } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const Signup = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("NGO");
  const [skillsBio, setSkillsBio] = useState("");
  const [locationZone, setLocationZone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (role === "Volunteer" && (!skillsBio.trim() || !locationZone.trim())) {
        throw new Error("Please fill Skills & Bio and Primary Location Zone for volunteer signup.");
      }

      const createdRole = await signup(
        email,
        password,
        role,
        role === "Volunteer" ? skillsBio.trim() : undefined,
        role === "Volunteer" ? locationZone.trim() : undefined,
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
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-center bg-primary px-16">
        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-foreground/20">
            <Truck className="h-7 w-7 text-primary-foreground" />
          </div>
          <span className="font-heading text-3xl font-bold text-primary-foreground">SamarthAI</span>
        </div>
        <h2 className="font-heading text-4xl font-bold leading-tight text-primary-foreground">
          Join the response network
        </h2>
        <p className="mt-4 text-lg text-primary-foreground/70 max-w-md">
          Register as an NGO operator or field volunteer and start coordinating relief operations.
        </p>
      </div>

      <div className="flex flex-1 items-center justify-center bg-background px-6">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary">
              <Truck className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-heading text-xl font-bold text-foreground">SamarthAI</span>
          </div>

          <h1 className="font-heading text-2xl font-bold text-foreground">Create account</h1>
          <p className="mt-1 text-sm text-muted-foreground">Sign up and choose your role</p>

          {error && (
            <div className="mt-4 flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="mt-6 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.org"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
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
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <select
                id="role"
                value={role}
                onChange={(e) => {
                  const nextRole = e.target.value as UserRole;
                  setRole(nextRole);
                  if (nextRole !== "Volunteer") {
                    setSkillsBio("");
                    setLocationZone("");
                  }
                }}
                className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <option value="NGO">NGO</option>
                <option value="Volunteer">Volunteer</option>
              </select>
            </div>

            {role === "Volunteer" && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="skillsBio">Skills &amp; Bio</Label>
                  <textarea
                    id="skillsBio"
                    value={skillsBio}
                    onChange={(e) => setSkillsBio(e.target.value)}
                    required
                    placeholder="I am a registered nurse with an off-road vehicle"
                    className="w-full min-h-24 rounded-md border border-input bg-background px-3 py-2 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="locationZone">Primary Location Zone</Label>
                  <Input
                    id="locationZone"
                    type="text"
                    value={locationZone}
                    onChange={(e) => setLocationZone(e.target.value)}
                    required
                    placeholder="Sector 4"
                  />
                </div>
              </>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Creating account..." : "Create Account"}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link to="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
