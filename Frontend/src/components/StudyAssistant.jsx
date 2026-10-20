import { useState } from "react";

import { Sparkles, LoaderCircle } from "lucide-react";

import toast from "react-hot-toast";

import { runStudyAssistant } from "../api/studyMaterials";

const ACTIONS = [
  { id: "summary", label: "Summary" },
  { id: "flashcards", label: "Flashcards" },
  { id: "quiz", label: "Quiz" },
  { id: "ask", label: "Ask a question" },
];

function Flashcard({ card }) {
  const [flipped, setFlipped] = useState(false);

  return (
    <button
      type="button"
      onClick={() => setFlipped((v) => !v)}
      className="text-left rounded-2xl border border-slate-200 dark:border-slate-700 p-4 bg-slate-50 dark:bg-slate-950 hover:border-blue-500 transition-colors"
    >
      <p className="text-[10px] uppercase tracking-wide text-slate-400 mb-1">
        {flipped ? "Answer" : "Question (tap to flip)"}
      </p>

      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
        {flipped ? card.back : card.front}
      </p>
    </button>
  );
}

function QuizItem({ item, index }) {
  const [picked, setPicked] = useState(null);

  return (
    <div className="rounded-2xl border border-slate-200 dark:border-slate-700 p-4 space-y-2">
      <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
        {index + 1}. {item.question}
      </p>

      <div className="flex flex-wrap gap-2">
        {item.options.map((option) => {
          const isPicked = picked === option;
          const isRight = option === item.answer;

          let tone =
            "border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200";

          if (picked) {
            if (isRight) {
              tone =
                "border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400";
            } else if (isPicked) {
              tone =
                "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400";
            }
          }

          return (
            <button
              key={option}
              type="button"
              disabled={Boolean(picked)}
              onClick={() => setPicked(option)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-semibold ${tone}`}
            >
              {option}
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function StudyAssistant({ materials = [] }) {
  const [materialId, setMaterialId] = useState("");
  const [question, setQuestion] = useState("");
  const [loadingAction, setLoadingAction] = useState(null);
  const [output, setOutput] = useState(null);

  if (materials.length === 0) {
    return null;
  }

  const selectedId = materialId || materials[0].id;

  const run = async (action) => {
    if (action === "ask" && !question.trim()) {
      toast.error("Type a question first");
      return;
    }

    try {
      setLoadingAction(action);
      setOutput(null);

      const response = await runStudyAssistant(
        selectedId,
        action,
        question.trim()
      );

      setOutput({ action, data: response.data });
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          "Study assistant failed. Please try again."
      );
    } finally {
      setLoadingAction(null);
    }
  };

  const data = output?.data;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 mb-8 border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-5">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
          <Sparkles size={20} />
        </div>

        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
          AI Study Assistant
        </h2>
      </div>

      <select
        value={selectedId}
        onChange={(e) => {
          setMaterialId(e.target.value);
          setOutput(null);
        }}
        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-100 p-2.5"
      >
        {materials.map((m) => (
          <option key={m.id} value={m.id}>
            {m.title || m.fileName}
          </option>
        ))}
      </select>

      <input
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        placeholder="Type a question to use with 'Ask a question'"
        className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-800 dark:text-slate-100 p-2.5 outline-none focus:border-blue-500"
      />

      <div className="flex flex-wrap gap-2">
        {ACTIONS.map((a) => (
          <button
            key={a.id}
            type="button"
            disabled={Boolean(loadingAction)}
            onClick={() => run(a.id)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white text-xs font-bold transition-colors"
          >
            {loadingAction === a.id && (
              <LoaderCircle
                size={14}
                className="animate-spin"
              />
            )}
            {a.label}
          </button>
        ))}
      </div>

      {output?.action === "summary" && (
        <ul className="list-disc pl-5 text-sm text-slate-700 dark:text-slate-200 space-y-1.5">
          {(data.summary || []).map((line) => (
            <li key={line}>{line}</li>
          ))}
        </ul>
      )}

      {output?.action === "ask" && (
        <div className="space-y-3 text-sm text-slate-700 dark:text-slate-200">
          <p className="font-semibold">{data.answer}</p>

          {(data.passages || []).slice(1).map((p) => (
            <p
              key={p}
              className="text-xs text-slate-500 dark:text-slate-400 border-l-2 border-slate-300 dark:border-slate-700 pl-3"
            >
              {p}
            </p>
          ))}
        </div>
      )}

      {output?.action === "flashcards" && (
        <>
          {(data.flashcards || []).length === 0 ? (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              No definitions found in this material to build flashcards from.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-3">
              {data.flashcards.map((card) => (
                <Flashcard key={card.front} card={card} />
              ))}
            </div>
          )}
        </>
      )}

      {output?.action === "quiz" && (
        <>
          {(data.quiz || []).length === 0 ? (
            <p className="text-sm text-amber-600 dark:text-amber-400">
              No definitions found in this material to build a quiz from.
            </p>
          ) : (
            <div className="space-y-3">
              {data.quiz.map((item, i) => (
                <QuizItem key={item.question} item={item} index={i} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
