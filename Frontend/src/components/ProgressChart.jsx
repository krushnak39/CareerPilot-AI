import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

function ProgressChart({ data = [] }) {
  const hasData = data.some((item) => item.score > 0);

  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const checkDark = () =>
      document.documentElement.classList.contains("dark");
    setIsDark(checkDark());

    const observer = new MutationObserver(() => setIsDark(checkDark()));
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    return () => observer.disconnect();
  }, []);

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300">
      {/* Header */}
      <div className="mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
          Career Progress
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Calculated from your resume analysis, learning roadmaps and interviews.
        </p>
      </div>

      {!hasData && (
        <p className="mb-3 text-xs text-amber-600 dark:text-amber-400">
          No progress yet. Analyze your resume, complete roadmap topics or finish an interview to see your scores here.
        </p>
      )}

      {/* Chart Canvas */}
      <div className="w-full h-[260px] sm:h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={isDark ? "#334155" : "#E2E8F0"}
            />

            <XAxis
              dataKey="name"
              tick={{ fontSize: 12, fill: isDark ? "#94A3B8" : "#64748B" }}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 12, fill: isDark ? "#94A3B8" : "#64748B" }}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip
              cursor={{ fill: isDark ? "rgba(255,255,255,0.03)" : "#F1F5F9" }}
              contentStyle={{
                backgroundColor: isDark ? "#0F172A" : "#FFFFFF",
                borderColor: isDark ? "#334155" : "#E2E8F0",
                borderRadius: "16px",
                color: isDark ? "#F8FAFC" : "#0F172A",
                boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.2)",
              }}
            />

            <Bar
              dataKey="score"
              fill={isDark ? "#60A5FA" : "#2563EB"}
              radius={[8, 8, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default ProgressChart;