import {
  User,
  Mail,
  GraduationCap,
  Briefcase,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useUser } from "../context/UserContext";
import { getDashboard } from "../api/dashboard";

function Profile() {
  const { user, loading } = useUser();

  const [summary, setSummary] = useState(null);

  useEffect(() => {
    const loadSummary = async () => {
      try {
        const response = await getDashboard();
        setSummary(response?.data?.data || null);
      } catch (error) {
        console.error("Profile summary error:", error);
      }
    };

    loadSummary();
  }, []);

  const analysis = summary?.analysis;
  const pct = (value) =>
    value === null || value === undefined
      ? "—"
      : `${Math.round(value)}%`;

  if (loading) {
    return (
      <div className="p-10 text-center text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
        Loading profile details...
      </div>
    );
  }

  const userName = user?.fullName || user?.name || "User";
  const userGoal = user?.careerGoal || "CareerPilot AI Candidate";
  const userEmail = user?.email || "No email provided";
  const userPhone = user?.phone || "Not added";
  const userLocation = user?.location || "Not added";
  const joinedDate = user?.createdAt
    ? `Joined ${user.createdAt.slice(0, 10)}`
    : "Joined Recently";

  return (
    <div className="space-y-8 fade">
      {/* Title */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          My Profile
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Manage your AI career persona and personal account attributes.
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden">
        {/* Cover Banner */}
        <div className="h-28 sm:h-36 bg-linear-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        </div>

        {/* Profile Card Header */}
        <div className="px-6 sm:px-8 pb-8">
          <div className="flex flex-col sm:flex-row items-center sm:items-end justify-between gap-4 -mt-12 sm:-mt-14 mb-6">
            {/* User Avatar & Details */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 text-center sm:text-left">
              <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-slate-900 text-blue-400 shadow-xl ring-4 ring-white dark:ring-slate-900 flex items-center justify-center shrink-0 border border-slate-700/50 relative z-10 font-black text-2xl">
                {userName.charAt(0).toUpperCase()}
              </div>

              <div className="sm:pb-1 space-y-1">
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white">
                    {userName}
                  </h2>
                  <span className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 border border-blue-500/20">
                    <Sparkles size={10} /> Candidate
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
                  {userGoal}
                </p>
              </div>
            </div>

            {/* Edit Profile Action */}
            <button className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md shadow-blue-500/20 transition hover:scale-105 active:scale-95 w-full sm:w-auto">
              <Edit size={16} />
              Edit Profile
            </button>
          </div>

          {/* Info Panels */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-8">
            {/* Personal Details */}
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Personal Information
              </h3>

              <div className="space-y-3.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-3">
                  <Mail size={18} className="text-blue-500 shrink-0" />
                  <span>{userEmail}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone size={18} className="text-blue-500 shrink-0" />
                  <span>{userPhone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin size={18} className="text-blue-500 shrink-0" />
                  <span>{userLocation}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-blue-500 shrink-0" />
                  <span>{joinedDate}</span>
                </div>
              </div>
            </div>

            {/* Career Details */}
            <div className="bg-slate-50 dark:bg-slate-800/40 rounded-2xl p-6 border border-slate-200/60 dark:border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Career Information
              </h3>

              <div className="space-y-3.5 text-xs sm:text-sm text-slate-600 dark:text-slate-300">
                <div className="flex items-center gap-3">
                  <GraduationCap size={18} className="text-blue-500 shrink-0" />
                  <span>{user?.education || "Not added"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Briefcase size={18} className="text-blue-500 shrink-0" />
                  <span>{user?.jobTitle || "Not added"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <User size={18} className="text-blue-500 shrink-0" />
                  <span>{userGoal}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Performance Summary Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-200/50 dark:border-blue-900/30 rounded-2xl p-4 text-center">
              <h4 className="text-2xl font-black text-blue-600 dark:text-blue-400">
                {pct(analysis?.topMatch)}
              </h4>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
                Top Career Match
              </p>
            </div>

            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-900/30 rounded-2xl p-4 text-center">
              <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                {pct(analysis?.atsScore)}
              </h4>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
                ATS Score
              </p>
            </div>

            <div className="bg-purple-50 dark:bg-purple-950/30 border border-purple-200/50 dark:border-purple-900/30 rounded-2xl p-4 text-center">
              <h4 className="text-2xl font-black text-purple-600 dark:text-purple-400">
                {pct(summary?.learningProgress ?? 0)}
              </h4>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
                Learning Progress
              </p>
            </div>

            <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/30 rounded-2xl p-4 text-center">
              <h4 className="text-2xl font-black text-amber-600 dark:text-amber-400">
                {analysis ? analysis.skillGaps : "—"}
              </h4>
              <p className="text-xs font-semibold text-slate-600 dark:text-slate-400 mt-1">
                Skill Gaps
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Profile;