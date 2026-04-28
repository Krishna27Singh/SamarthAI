import { ArrowLeft, Award, ClipboardCheck, Timer, UserCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

const ProfileView = () => {
  return (
    <div className="min-h-screen px-4 py-8" style={{ backgroundColor: "#F0F8FF" }}>
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div className="flex items-center justify-between">
          <Link
            to="/field-app"
            className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 shadow-[0_4px_14px_0_rgba(0,118,255,0.05)] hover:bg-blue-50"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Field App
          </Link>
        </div>

        <div className="rounded-2xl bg-white p-6 shadow-[0_4px_14px_0_rgba(0,118,255,0.05)]">
          <div className="flex items-center gap-4">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-blue-100">
              <UserCircle2 className="h-12 w-12 text-blue-600" />
            </div>
            <div>
              <h1 className="font-heading text-2xl font-bold text-slate-800">John Doe</h1>
              <p className="font-body text-sm text-slate-600">Volunteer</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-xl bg-white p-5 shadow-[0_4px_14px_0_rgba(0,118,255,0.05)]">
            <div className="mb-3 inline-flex rounded-lg bg-blue-100 p-2 text-blue-600">
              <ClipboardCheck className="h-5 w-5" />
            </div>
            <p className="font-body text-sm text-slate-600">Missions Completed</p>
            <p className="font-heading mt-2 text-3xl font-bold text-slate-800">27</p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-[0_4px_14px_0_rgba(0,118,255,0.05)]">
            <div className="mb-3 inline-flex rounded-lg bg-blue-100 p-2 text-blue-600">
              <Timer className="h-5 w-5" />
            </div>
            <p className="font-body text-sm text-slate-600">Avg. Completion Time</p>
            <p className="font-heading mt-2 text-3xl font-bold text-slate-800">1h 15m</p>
          </div>

          <div className="rounded-xl bg-white p-5 shadow-[0_4px_14px_0_rgba(0,118,255,0.05)]">
            <div className="mb-3 inline-flex rounded-lg bg-blue-100 p-2 text-blue-600">
              <Award className="h-5 w-5" />
            </div>
            <p className="font-body text-sm text-slate-600">Active Certifications</p>
            <ul className="font-body mt-2 list-disc pl-5 text-sm text-slate-700">
              <li>First Aid</li>
              <li>Search &amp; Rescue</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileView;
