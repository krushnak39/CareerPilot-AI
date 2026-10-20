import { useState } from "react";

import { Sparkles, LoaderCircle } from "lucide-react";

import toast from "react-hot-toast";

import { analyzeResume } from "../api/resume";
import { createRoadmapFromAnalysis } from "../api/learningRoadmaps";

function ScoreBar({ label, value }) {
  const pct = Math.max(0, Math.min(100, Number(value) || 0));

  return (
    <div>
      <div className="flex justify-between text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1">
        <span>{label}</span>
        <span>{pct}%</span>
      </div>

      <div className="h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
        <div
          className="h-full rounded-full bg-blue-600"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Chips({ items, tone }) {
  if (!items || items.length === 0) {
    return (
      <p className="text-xs text-slate-400">
        None
      </p>
    );
  }

  const color =
    tone === "bad"
      ? "bg-rose-500/10 text-rose-600 dark:text-rose-400"
      : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <span
          key={item}
          className={`px-2.5 py-1 rounded-lg text-xs font-semibold ${color}`}
        >
          {item}
        </span>
      ))}
    </div>
  );
}

export default function ResumeAnalysis({ resumes = [] }) {
  const primary =
    resumes.find((r) => r.isPrimary) ||
    resumes[0];

  const [jobDescription, setJobDescription] =
    useState("");
  const [loading, setLoading] =
    useState(false);
  const [result, setResult] =
    useState(null);

  if (!primary) {
    return null;
  }

  const handleAnalyze = async () => {
    try {
      setLoading(true);
      setResult(null);

      const response = await analyzeResume(
        primary.id,
        jobDescription
      );

      setResult(response.data);
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Resume analysis failed. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const careers =
    result?.career_recommendations || [];

  const handleSaveRoadmap = async (career) => {
    try {
      await createRoadmapFromAnalysis(
        career.career,
        career.roadmap
      );

      toast.success(
        "Roadmap saved. Open Learning Roadmap to view it."
      );
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Could not save roadmap"
      );
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <Sparkles size={20} />
        </div>

        <div>
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
            AI Resume Analysis
          </h2>

          <p className="text-xs text-slate-500 dark:text-slate-400">
            Analyzing:{" "}
            {primary.title || primary.fileName}
          </p>
        </div>
      </div>

      <textarea
        value={jobDescription}
        onChange={(e) =>
          setJobDescription(e.target.value)
        }
        rows={4}
        placeholder="Optional: paste a job description to get an ATS score for that role"
        className="w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-100 p-3 outline-none focus:border-blue-500"
      />

      <button
        type="button"
        onClick={handleAnalyze}
        disabled={loading}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-sm font-bold transition-colors"
      >
        {loading ? (
          <>
            <LoaderCircle
              size={16}
              className="animate-spin"
            />
            Analyzing...
          </>
        ) : (
          <>
            <Sparkles size={16} />
            Analyze Resume
          </>
        )}
      </button>

      {result && (
        <div className="space-y-6 pt-2">
          {result.domain && (
            <div className="text-sm text-slate-700 dark:text-slate-200">
              Detected domain:{" "}
              <span className="font-bold">
                {result.domain.domain_name}
              </span>{" "}
              (confidence{" "}
              {Math.round(
                (result.domain.confidence || 0) * 100
              )}
              %)
            </div>
          )}

          {result.status ===
            "insufficient_information" && (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              {result.message}
            </p>
          )}

          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2">
              Detected skills
            </h3>

            <Chips
              items={(result.skills || []).map(
                (s) => s.name
              )}
            />
          </div>

          {result.ats && (
            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                ATS match for the job description
              </h3>

              <ScoreBar
                label="ATS score"
                value={result.ats.score}
              />

              {result.ats.message && (
                <p className="text-xs text-amber-600 dark:text-amber-400">
                  {result.ats.message}
                </p>
              )}

              <p className="text-xs font-semibold text-slate-500">
                Matched
              </p>
              <Chips items={result.ats.matched} />

              <p className="text-xs font-semibold text-slate-500">
                Missing
              </p>
              <Chips
                items={result.ats.missing}
                tone="bad"
              />
            </div>
          )}

          {careers.length > 0 && (
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Career recommendations
              </h3>

              {careers.slice(0, 3).map((career) => (
                <div
                  key={career.career}
                  className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3"
                >
                  <ScoreBar
                    label={career.career}
                    value={career.match_score}
                  />

                  <p className="text-xs font-semibold text-slate-500">
                    Matched skills
                  </p>
                  <Chips
                    items={career.matched_skills}
                  />

                  <p className="text-xs font-semibold text-slate-500">
                    Skills to learn
                  </p>
                  <Chips
                    items={career.missing_skills}
                    tone="bad"
                  />

                  {career.roadmap?.length > 0 && (
                    <ol className="list-decimal pl-5 text-xs text-slate-600 dark:text-slate-300 space-y-1">
                      {career.roadmap.map((step) => (
                        <li
                          key={`${career.career}-${step.skill}`}
                        >
                          {step.skill} (
                          {step.priority},{" "}
                          {step.learning_duration})
                        </li>
                      ))}
                    </ol>
                  )}

                  {career.roadmap?.length > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        handleSaveRoadmap(career)
                      }
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors"
                    >
                      Save as Learning Roadmap
                    </button>
                  )}

                  {career.interview_questions
                    ?.length > 0 && (
                    <details className="text-xs text-slate-600 dark:text-slate-300">
                      <summary className="cursor-pointer font-semibold text-slate-700 dark:text-slate-200">
                        Practice interview questions (
                        {career.interview_questions.length})
                      </summary>

                      <ul className="list-disc pl-5 mt-2 space-y-1">
                        {career.interview_questions.map(
                          (q) => (
                            <li
                              key={`${career.career}-${q.question_number}`}
                            >
                              {q.question}
                            </li>
                          )
                        )}
                      </ul>
                    </details>
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
