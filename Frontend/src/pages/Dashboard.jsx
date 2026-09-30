import DashboardCard from "../components/DashboardCard";
import ProgressChart from "../components/ProgressChart";
import {
  FileText,
  Target,
  BookOpen,
  Brain,
  ArrowRight,
  Sparkles,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { Link } from "react-router-dom";
import { useUser } from "../context/UserContext";
import { useEffect, useState } from "react";
import { getDashboard } from "../api/dashboard";

function Dashboard() {
  const { user } = useUser();
  const hour = new Date().getHours();

  let greeting = "Good Morning";
  if (hour >= 12 && hour < 17) {
    greeting = "Good Afternoon";
  } else if (hour >= 17) {
    greeting = "Good Evening";
  }

  const firstName = user?.fullName?.split(" ")[0] || "";
  const [stats, setStats] = useState({
  resumeCount: 0,
  jobCount: 0,
  interviewCount: 0,
});

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await getDashboard();
        if (response?.data?.data) {
          setStats(response.data.data);
        }
      } catch (error) {
        console.error("Dashboard Error:", error);
      }
    };

    fetchDashboard();
  }, []);

  return (
    <div className="space-y-8 fade">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-blue-600 via-indigo-600 to-blue-700 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 p-6 sm:p-8 lg:p-10 text-white shadow-xl shadow-blue-500/10 border border-blue-500/20">
        <div className="absolute top-0 right-0 -mt-8 -mr-8 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 dark:bg-blue-500/20 backdrop-blur-md text-xs font-semibold text-blue-100 dark:text-blue-300">
            <Sparkles size={14} /> AI Career Hub Active
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight">
           Welcome {user?.fullName?.trim().split(/\s+/)[0] || "User"} 👋
          </h1>

          <p className="text-sm sm:text-base text-blue-100/90 dark:text-slate-300 leading-relaxed">
            Welcome back to CareerPilot AI. Continue building your skills,
            improve your resume, and get one step closer to your dream career.
          </p>

          <div className="pt-2">
            <Link
              to="/resume"
              className="inline-flex items-center gap-2 rounded-xl bg-white text-blue-700 dark:bg-blue-500 dark:text-white px-6 py-3 text-sm font-bold shadow-md transition-all duration-300 hover:scale-105 active:scale-95 hover:shadow-xl"
            >
              Analyze Resume
              <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
       <DashboardCard
  title="Resumes"
  value={stats.resumeCount}
  icon={<FileText size={24} />}
  color="text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60"
/>

<DashboardCard
  title="Job Applications"
  value={stats.jobCount}
  icon={<Target size={24} />}
  color="text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60"
/>

<DashboardCard
  title="Interviews"
  value={stats.interviewCount}
  icon={<BookOpen size={24} />}
  color="text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/60"
/>

<DashboardCard
  title="AI Features"
  value="Coming Soon"
  icon={<Brain size={24} />}
  color="text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60"
/>
      </div>

      {/* Main Layout: Actions & Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          {/* Quick Actions */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5">
              Quick Actions
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <Link
                to="/resume"
                className="bg-slate-50 dark:bg-slate-800/60 hover:bg-blue-50 dark:hover:bg-blue-950/40 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-4 text-center transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <FileText size={24} />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Resume
                </p>
              </Link>

              <Link
                to="/learning"
                className="bg-slate-50 dark:bg-slate-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-4 text-center transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <BookOpen size={24} />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Learning
                </p>
              </Link>

              <Link
                to="/interview"
                className="bg-slate-50 dark:bg-slate-800/60 hover:bg-purple-50 dark:hover:bg-purple-950/40 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-4 text-center transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Target size={24} />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Interview
                </p>
              </Link>

              <Link
                to="/profile"
                className="bg-slate-50 dark:bg-slate-800/60 hover:bg-amber-50 dark:hover:bg-amber-950/40 border border-slate-200/60 dark:border-slate-700/60 rounded-2xl p-4 text-center transition-all duration-300 hover:-translate-y-1 group"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Brain size={24} />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Profile
                </p>
              </Link>
            </div>
          </div>

          {/* Activity Section */}
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-5 flex items-center gap-2">
              <Clock size={18} className="text-blue-500" /> Recent Activity
            </h2>

            <div className="space-y-3.5">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Resume analyzed successfully
                    </p>
                    <p className="text-[11px] text-slate-400">
                      ATS match updated
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">
                  Today
                </span>
              </div>

              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/50 dark:border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                    <CheckCircle2 size={18} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-900 dark:text-slate-100">
                      Learning roadmap generated
                    </p>
                    <p className="text-[11px] text-slate-400">
                      React & Node.js architecture
                    </p>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-slate-400">
                  Yesterday
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Chart */}
        <div className="lg:col-span-1">
          <ProgressChart />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;