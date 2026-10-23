import { useEffect, useState } from "react";
import { Sparkles, LoaderCircle, MessageCircle, Layers, ListChecks } from "lucide-react";
import toast from "react-hot-toast";
import {
  askStudyMaterial,
  generateFlashcards,
  getFlashcards,
  generateQuiz,
  getQuiz,
  submitQuizResult,
  errorMessage,
} from "../api/ai";

const tabBtn = (active) =>
  `inline-flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition ${
    active ? "bg-violet-600 text-white" : "bg-violet-500/10 text-violet-600 hover:bg-violet-500/20"
  }`;

export default function StudyAIPanel({ material }) {
  const [tab, setTab] = useState(null);
  const [busy, setBusy] = useState(false);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState(null);
  const [cards, setCards] = useState([]);
  const [flipped, setFlipped] = useState({});
  const [quiz, setQuiz] = useState([]);
  const [picked, setPicked] = useState({});
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    getFlashcards(material.id).then((r) => setCards(r.data || [])).catch(() => {});
    getQuiz(material.id).then((r) => setQuiz(r.data || [])).catch(() => {});
  }, [material.id]);

  const guard = async (fn) => {
    try {
      setBusy(true);
      await fn();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setBusy(false);
    }
  };

  const ask = () =>
    guard(async () => {
      if (!question.trim()) return toast.error("Type a question first");
      const res = await askStudyMaterial(material.id, question);
      setAnswer(res.data);
    });

  const makeCards = () =>
    guard(async () => {
      const res = await generateFlashcards(material.id);
      setCards(res.data);
      setFlipped({});
      if (!res.data.length) toast("Not enough content for flashcards");
    });

  const makeQuiz = () =>
    guard(async () => {
      const res = await generateQuiz(material.id);
      setQuiz(res.data);
      setPicked({});
      setSubmitted(false);
      if (!res.data.length) toast("Not enough content for a quiz");
    });

  const submitQuiz = () =>
    guard(async () => {
      const results = quiz.map((q, i) => ({ topic: q.topic, correct: picked[i] === q.answerIndex }));
      await submitQuizResult(results);
      setSubmitted(true);
      const score = results.filter((r) => r.correct).length;
      toast.success(`Score: ${score}/${results.length}`);
    });

  return (
    <div className="mt-4 rounded-2xl border border-violet-200/60 bg-violet-50/40 p-4 dark:border-violet-500/20 dark:bg-violet-500/5">
      <div className="flex flex-wrap items-center gap-2">
        <Sparkles size={15} className="text-violet-600" />
        <span className="mr-2 text-xs font-bold text-slate-700 dark:text-slate-200">AI Study Tools</span>
        <button className={tabBtn(tab === "ask")} onClick={() => setTab("ask")}>
          <MessageCircle size={14} /> Ask
        </button>
        <button className={tabBtn(tab === "cards")} onClick={() => setTab("cards")}>
          <Layers size={14} /> Flashcards
        </button>
        <button className={tabBtn(tab === "quiz")} onClick={() => setTab("quiz")}>
          <ListChecks size={14} /> Quiz
        </button>
      </div>

      {tab === "ask" && (
        <div className="mt-3 space-y-3">
          <div className="flex gap-2">
            <input
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && ask()}
              placeholder="Ask a question about this material"
              className="flex-1 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs dark:border-slate-700 dark:bg-slate-800 dark:text-white"
            />
            <button onClick={ask} disabled={busy} className="rounded-xl bg-violet-600 px-4 text-xs font-bold text-white disabled:opacity-60">
              {busy ? <LoaderCircle size={14} className="animate-spin" /> : "Ask"}
            </button>
          </div>
          {answer && (
            <div className="rounded-xl bg-white p-3 text-sm text-slate-700 dark:bg-slate-800 dark:text-slate-200">
              <p>{answer.answer}</p>
              <p className="mt-2 text-[11px] text-slate-400">
                Answered by {answer.mode === "ollama" ? "local LLM" : "retrieval (no LLM running)"}
              </p>
            </div>
          )}
        </div>
      )}

      {tab === "cards" && (
        <div className="mt-3 space-y-3">
          <button onClick={makeCards} disabled={busy} className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-60">
            {busy ? "Generating..." : cards.length ? "Regenerate flashcards" : "Generate flashcards"}
          </button>
          <div className="grid gap-2 sm:grid-cols-2">
            {cards.map((c, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setFlipped((f) => ({ ...f, [i]: !f[i] }))}
                className="min-h-[90px] rounded-xl border border-slate-200 bg-white p-3 text-left text-sm dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
              >
                <span className="text-[10px] font-bold uppercase text-violet-600">
                  {flipped[i] ? "Answer" : "Question"} (tap to flip)
                </span>
                <p className="mt-1">{flipped[i] ? c.back : c.front}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {tab === "quiz" && (
        <div className="mt-3 space-y-3">
          <button onClick={makeQuiz} disabled={busy} className="rounded-xl bg-violet-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-60">
            {busy ? "Generating..." : quiz.length ? "New quiz" : "Generate quiz"}
          </button>
          {quiz.map((q, i) => (
            <div key={i} className="rounded-xl bg-white p-3 dark:bg-slate-800">
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                {i + 1}. {q.question}
              </p>
              <div className="mt-2 grid gap-1.5">
                {q.options.map((o, oi) => {
                  const chosen = picked[i] === oi;
                  const right = submitted && oi === q.answerIndex;
                  const wrong = submitted && chosen && oi !== q.answerIndex;
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={submitted}
                      onClick={() => setPicked((p) => ({ ...p, [i]: oi }))}
                      className={`rounded-lg border px-3 py-1.5 text-left text-xs ${
                        right
                          ? "border-emerald-500 bg-emerald-500/10 text-emerald-700"
                          : wrong
                          ? "border-red-500 bg-red-500/10 text-red-700"
                          : chosen
                          ? "border-violet-500 bg-violet-500/10"
                          : "border-slate-200 dark:border-slate-700 dark:text-slate-200"
                      }`}
                    >
                      {o}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {quiz.length > 0 && !submitted && (
            <button
              onClick={submitQuiz}
              disabled={busy || Object.keys(picked).length < quiz.length}
              className="rounded-xl bg-emerald-600 px-4 py-2 text-xs font-bold text-white disabled:opacity-50"
            >
              Submit answers
            </button>
          )}
        </div>
      )}
    </div>
  );
}
