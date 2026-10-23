import { useEffect, useState } from "react";
import { Sparkles, LoaderCircle } from "lucide-react";
import toast from "react-hot-toast";
import { getResumes } from "../api/resume";
import { generateInterviewQuestions, errorMessage } from "../api/ai";

export default function InterviewAIQuestions() {
  const [resumes, setResumes] = useState([]);
  const [resumeId, setResumeId] = useState("");
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [notes, setNotes] = useState({});

  useEffect(() => {
    getResumes()
      .then((res) => {
        const list = res?.data || res || [];
        setResumes(Array.isArray(list) ? list : []);
        const primary = (Array.isArray(list) ? list : []).find((r) => r.isPrimary);
        if (primary) setResumeId(primary.id);
      })
      .catch(() => {});
  }, []);

  const generate = async () => {
    if (!resumeId && !role.trim()) {
      return toast.error("Choose a resume or enter a target role");
    }
    try {
      setLoading(true);
      const res = await generateInterviewQuestions({
        resumeId: resumeId || undefined,
        role: role.trim() || undefined,
        limit: 10,
      });
      setQuestions(res.data.questions);
      setNotes({});
    } catch (error) {
      toast.error(errorMessage(error, "Could not generate questions"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="rounded-3xl border border-violet-200/70 bg-white p-4 shadow-sm dark:border-violet-500/20 dark:bg-slate-900 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        <Sparkles size={18} className="text-violet-600" />
        <h2 className="text-sm font-bold text-slate-900 dark:text-white">
          AI interview questions for you
        </h2>
      </div>
      <p className="mb-4 text-xs text-slate-500 dark:text-slate-400">
        Questions are generated from your analyzed resume skills, detected domain and skill gaps.
      </p>

      <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto]">
        <select
          value={resumeId}
          onChange={(e) => setResumeId(e.target.value)}
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        >
          <option value="">No resume (use role only)</option>
          {resumes.map((r) => (
            <option key={r.id} value={r.id}>
              {r.title || r.fileName}
            </option>
          ))}
        </select>
        <input
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="Target role (e.g. Backend Developer)"
          className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-white"
        />
        <button
          onClick={generate}
          disabled={loading}
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-violet-600 px-4 py-2 text-sm font-bold text-white disabled:opacity-60"
        >
          {loading && <LoaderCircle size={15} className="animate-spin" />}
          Generate
        </button>
      </div>

      {questions.length > 0 && (
        <ol className="mt-5 space-y-3">
          {questions.map((q, i) => (
            <li key={q.question_number} className="rounded-xl border border-slate-200 p-3 dark:border-slate-700">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  {i + 1}. {q.question}
                </p>
                <span className="shrink-0 rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-bold uppercase text-violet-600">
                  {q.type}
                </span>
              </div>
              <textarea
                rows={2}
                value={notes[i] || ""}
                onChange={(e) => setNotes((n) => ({ ...n, [i]: e.target.value }))}
                placeholder="Practice your answer here..."
                className="mt-2 w-full rounded-lg border border-slate-200 bg-slate-50 p-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
              />
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
