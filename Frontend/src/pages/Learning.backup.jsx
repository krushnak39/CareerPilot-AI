import { useState } from "react";
import { BookOpen, FileText, HelpCircle, Layers, MessageSquare, Trash2, Sparkles } from "lucide-react";

function Learning() {
  const [selectedFile, setSelectedFile] = useState(null);

  const handleFileChange = (e) => {
    if (e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  return (
    <div className="space-y-8 fade">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Learning Assistant
        </h1>
        <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm mt-1">
          Upload course notes, slides, or documents to generate study aids.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-10 border border-slate-200/80 dark:border-slate-800 shadow-sm">
        <div className="border-2 border-dashed border-indigo-300 dark:border-indigo-900/60 hover:border-indigo-500 rounded-3xl p-8 sm:p-12 text-center transition bg-indigo-50/20 dark:bg-slate-950/40">
          <div className="w-16 h-16 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-4">
            <BookOpen size={32} />
          </div>

          <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
            Upload Study Material
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Supports PDF, PPT, DOCX, or Images
          </p>

          <label
            htmlFor="notes-input"
            className="inline-flex items-center gap-2 mt-6 bg-indigo-600 hover:bg-indigo-700 text-white text-xs sm:text-sm font-bold px-6 py-3 rounded-xl cursor-pointer shadow-md shadow-indigo-500/20 transition hover:scale-105 active:scale-95"
          >
            Choose Notes
          </label>
          <input
            id="notes-input"
            type="file"
            accept=".pdf,.ppt,.pptx,.doc,.docx,.jpg,.png"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>

      {/* Selected Material Card */}
      {selectedFile && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 border border-slate-200/80 dark:border-slate-800 shadow-sm flex items-center justify-between fade">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
              <FileText size={20} />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {selectedFile.name}
              </p>
              <p className="text-[10px] text-slate-400">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
            </div>
          </div>

          <button
            onClick={() => setSelectedFile(null)}
            className="text-xs font-bold text-rose-600 dark:text-rose-400 hover:underline"
          >
            Remove
          </button>
        </div>
      )}

      {/* Action AI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <button className="flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold shadow-md shadow-purple-500/20 transition hover:scale-[1.02] active:scale-95">
          <Sparkles size={16} /> Summary
        </button>

        <button className="flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-500/20 transition hover:scale-[1.02] active:scale-95">
          <HelpCircle size={16} /> Quiz
        </button>

        <button className="flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shadow-md shadow-amber-500/20 transition hover:scale-[1.02] active:scale-95">
          <Layers size={16} /> Flashcards
        </button>

        <button className="flex items-center justify-center gap-2.5 p-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-500/20 transition hover:scale-[1.02] active:scale-95">
          <MessageSquare size={16} /> Ask AI
        </button>
      </div>
    </div>
  );
}

export default Learning;