
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

function ProgressChart({ learningProgress = 0, skillGapCount = 0 }) {
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

  const safeLearningProgress = Math.min(
    100,
    Math.max(0, Number(learningProgress) || 0)
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="mb-6">
        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
          Career Progress
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Track your actual learning progress and skill gaps.
        </p>
      </div>

      <div className="w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={[{ name: "Learning", score: safeLearningProgress }]}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              vertical={false}
              stroke={isDark ? "#334155" : "#E2E8F0"}
            />

            <XAxis
              dataKey="name"
              tick={{
                fontSize: 12,
                fill: isDark ? "#94A3B8" : "#64748B",
              }}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              domain={[0, 100]}
              tickFormatter={(value) => `${value}%`}
              tick={{
                fontSize: 12,
                fill: isDark ? "#94A3B8" : "#64748B",
              }}
              tickLine={false}
              axisLine={false}
            />

            <Tooltip
              formatter={(value) => [`${value}%`, "Learning Progress"]}
              cursor={{
                fill: isDark ? "rgba(255,255,255,0.03)" : "#F1F5F9",
              }}
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
              name="Learning Progress"
              fill={isDark ? "#60A5FA" : "#2563EB"}
              radius={[8, 8, 0, 0]}
              maxBarSize={70}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/60 dark:border-slate-700/60 p-4">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Recorded Skill Gaps
        </p>
        <p className="mt-1 text-2xl font-bold text-slate-900 dark:text-white">
          {Math.max(0, Number(skillGapCount) || 0)}
        </p>
      </div>

      <p className="mt-3 text-xs text-slate-500 dark:text-slate-400">
        Learning progress is the average of your recorded learning resources.
        Skill gaps show the number of recorded gaps, not a percentage.
      </p>
    </div>
  );
}

export default ProgressChart;
