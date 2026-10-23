import { useEffect, useState } from "react";
import { getWeakTopics } from "../api/ai";

export default function WeakTopics() {
  const [topics, setTopics] = useState([]);
  useEffect(() => {
    getWeakTopics().then((r) => setTopics(r.data || [])).catch(() => {});
  }, []);
  if (!topics.length) return null;
  return (
    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 p-4 dark:border-amber-500/20 dark:bg-amber-500/5">
      <p className="text-sm font-bold text-amber-700 dark:text-amber-400">Weak topics to revise</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {topics.map((t) => (
          <span key={t.id} className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-amber-700 dark:bg-slate-800">
            {t.topic} · {t.wrongCount} wrong
          </span>
        ))}
      </div>
    </div>
  );
}
