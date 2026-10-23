import { useEffect, useState } from "react";
import { Sparkles, LoaderCircle, ChevronDown, ChevronUp, Map } from "lucide-react";
import toast from "react-hot-toast";
import {
  analyzeResume,
  getResumeAnalysis,
  generateRoadmapFromResume,
  errorMessage,
} from "../api/ai";

const chip = "inline-block rounded-full px-2.5 py-1 text-xs font-semibold";

export default function ResumeAIPanel({ resume }) {
  const [open, setOpen] = useState(false);
  const [jd, setJd] = useState("");
  const [loading, setLoading] = useState(false);
  const [roadmapLoading, setRoadmapLoading] = useState("");
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getResumeAnalysis(resume.id)
      .then((res) => !cancelled && setAnalysis(res.data))
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [resume.id]);

  const run = async () => {
    try {
      setLoading(true);
      const res = await analyzeResume(resume.id, jd);
      setAnalysis(res.data);
      setOpen(true);
      toast.success("Resume analysis complete");
    } catch (error) {
      toast.error(errorMessage(error, "Analysis failed"));
    } finally {
      setLoading(false);
    }
  };

  const makeRoadmap = async (career) => {
    try {
      setRoadmapLoading(career);
      await generateRoadmapFromResume(resume.id, career);
      toast.success(`Roadmap created - see Learning Roadmap`);
    } catch (error) {
      toast.error(errorMessage(error, "Could not create roadmap"));
    } finally {
      setRoadmapLoading("");
    }
  };

  const score = analysis?.ats?.score ?? null;
  const scoreColor =
    score >= 75 ? "text-emerald-600" : score >= 50 ? "text-amber-600" : "text-red-600";

  return (
    <div className="border-t border-slate-200 dark:border-slate-700 bg-white/60 dark:bg-slate-900/40 p-4">
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={run}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white hover:bg-violet-700 disabled:opacity-60"
        >
          {loading ? <LoaderCircle size={15} className="animate-spin" /> : <Sparkles size={15} />}
          {analysis ? "Re-analyze with AI" : "Analyze with AI"}
        </button>

        {score !== null && (
          <span className={`text-sm font-extrabold ${scoreColor}`}>ATS score: {score}%</span>
        )}

        {analysis && (
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            className="ml-auto inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300"
          >
            {open ? "Hide" : "Show"} results
            {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
          </button>
        )}
      </div>

      <textarea
        value={jd}
        onChange={(e) => setJd(e.target.value)}
        rows={2}
        placeholder="Optional: paste a job description to score this resume against it"
        className="mt-3 w-full rounded-xl border border-slate-200 bg-white p-3 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
      />

      {open && analysis && (
        <div className="mt-4 space-y-4 text-sm text-slate-700 dark:text-slate-200">
          {analysis.status === "insufficient_information" && (
            <p className="rounded-xl bg-amber-50 p-3 text-xs text-amber-700">{analysis.message}</p>
          )}

          <div>
            <p className="mb-2 text-xs font-bold uppercase text-slate-500">
              Domain: {analysis.domain?.domain_name} (
              {Math.round((analysis.domain?.confidence || 0) * 100)}% confidence)
            </p>
            <div className="flex flex-wrap gap-1.5">
              {(analysis.skills || []).map((s) => (
                <span key={s.id} className={`${chip} bg-blue-500/10 text-blue-600`}>
                  {s.name}
                </span>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-bold uppercase text-slate-500">
              ATS match ({analysis.ats.source === "job_description" ? "job description" : "best career"})
            </p>
            <div className="flex flex-wrap gap-1.5">
              {analysis.ats.matched.map((s) => (
                <span key={s} className={`${chip} bg-emerald-500/10 text-emerald-600`}>✓ {s}</span>
              ))}
              {analysis.ats.missing.map((s) => (
                <span key={s} className={`${chip} bg-red-500/10 text-red-600`}>✗ {s}</span>
              ))}
            </div>
          </div>

          {(analysis.careerRecommendations || []).length > 0 && (
            <div className="space-y-3">
              <p className="text-xs font-bold uppercase text-slate-500">Career recommendations</p>
              {analysis.careerRecommendations.slice(0, 3).map((c) => (
                <div
                  key={c.career}
                  className="rounded-xl border border-slate-200 p-3 dark:border-slate-700"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold">
                      {c.career} <span className="text-violet-600">{c.match_score}% match</span>
                    </p>
                    <button
                      type="button"
                      onClick={() => makeRoadmap(c.career)}
                      disabled={!c.roadmap?.length || roadmapLoading === c.career}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 px-3 py-1.5 text-xs font-bold text-emerald-600 disabled:opacity-50"
                    >
                      {roadmapLoading === c.career ? (
                        <LoaderCircle size={13} className="animate-spin" />
                      ) : (
                        <Map size={13} />
                      )}
                      Create roadmap
                    </button>
                  </div>
                  {c.missing_skills.length > 0 && (
                    <p className="mt-2 text-xs text-slate-500">
                      Skill gap ({c.skill_gap}%): {c.missing_skills.join(", ")}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
