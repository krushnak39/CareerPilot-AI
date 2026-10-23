import { useEffect, useState } from "react";
import {
  BookOpen,
  FileText,
  CheckCircle,
  Play,
  Loader2,
} from "lucide-react";

const API_URL = "http://localhost:5000/api";

function Learning() {
  const [resources, setResources] = useState([]);
  const [selectedResource, setSelectedResource] = useState(null);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [starting, setStarting] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // ==========================
  // LOAD LEARNING RESOURCES
  // ==========================
  useEffect(() => {
    const loadResources = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await fetch(
          `${API_URL}/learning/resources`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = await response.json();

        if (!response.ok) {
          throw new Error(
            data.message || "Failed to load learning resources"
          );
        }

        setResources(data.data || []);
      } catch (err) {
        console.error("Learning resources error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      loadResources();
    } else {
      setLoading(false);
      setError("Please log in to access Learning.");
    }
  }, [token]);

  // ==========================
  // SELECT RESOURCE
  // ==========================
  const handleSelectResource = (resource) => {
    setSelectedResource(resource);
    setProgress(0);
    setError("");
  };

  // ==========================
  // START RESOURCE
  // ==========================
  const handleStartLearning = async () => {
    if (!selectedResource) return;

    try {
      setStarting(true);
      setError("");

      const response = await fetch(
        `${API_URL}/learning/resources/${selectedResource.id}/start`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to start learning"
        );
      }

      setProgress(data.data.progress || 0);
    } catch (err) {
      console.error("Start learning error:", err);
      setError(err.message);
    } finally {
      setStarting(false);
    }
  };

  // ==========================
  // UPDATE PROGRESS
  // ==========================
  const handleProgressUpdate = async (newProgress) => {
    if (!selectedResource) return;

    try {
      setUpdating(true);
      setError("");

      const response = await fetch(
        `${API_URL}/learning/resources/${selectedResource.id}/progress`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            progress: newProgress,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.message || "Failed to update progress"
        );
      }

      setProgress(data.data.progress);
    } catch (err) {
      console.error("Progress update error:", err);
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      {/* ==========================
          HEADER
      ========================== */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
          Learning Assistant
        </h1>

        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Explore learning resources and track your progress.
        </p>
      </div>

      {/* ==========================
          ERROR
      ========================== */}
      {error && (
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-medium text-rose-700 dark:border-rose-900/50 dark:bg-rose-950/30 dark:text-rose-400">
          {error}
        </div>
      )}

      {/* ==========================
          LOADING
      ========================== */}
      {loading ? (
        <div className="flex items-center justify-center rounded-3xl border border-slate-200 bg-white p-12 dark:border-slate-800 dark:bg-slate-900">
          <Loader2 className="animate-spin text-indigo-600" size={28} />
        </div>
      ) : (
        <>
          {/* ==========================
              RESOURCES
          ========================== */}
          <div>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                Learning Resources
              </h2>

              <span className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-bold text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400">
                {resources.length} resources
              </span>
            </div>

            {resources.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
                <BookOpen
                  className="mx-auto mb-3 text-slate-400"
                  size={36}
                />

                <p className="font-semibold text-slate-700 dark:text-slate-300">
                  No learning resources available.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                {resources.map((resource) => {
                  const isSelected =
                    selectedResource?.id === resource.id;

                  return (
                    <button
                      key={resource.id}
                      onClick={() =>
                        handleSelectResource(resource)
                      }
                      className={`text-left rounded-2xl border p-5 transition hover:-translate-y-1 ${
                        isSelected
                          ? "border-indigo-500 bg-indigo-50 shadow-md dark:border-indigo-500 dark:bg-indigo-950/30"
                          : "border-slate-200 bg-white hover:border-indigo-300 dark:border-slate-800 dark:bg-slate-900"
                      }`}
                    >
                      <div className="mb-4 flex items-center justify-between">
                        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400">
                          <FileText size={20} />
                        </div>

                        {resource.difficulty && (
                          <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {resource.difficulty}
                          </span>
                        )}
                      </div>

                      <h3 className="font-bold text-slate-900 dark:text-white">
                        {resource.title}
                      </h3>

                      {resource.description && (
                        <p className="mt-2 line-clamp-3 text-xs leading-5 text-slate-500 dark:text-slate-400">
                          {resource.description}
                        </p>
                      )}

                      <div className="mt-4 flex items-center gap-3 text-[11px] text-slate-400">
                        {resource.type && (
                          <span>{resource.type}</span>
                        )}

                        {resource.durationMin && (
                          <span>
                            {resource.durationMin} min
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* ==========================
              SELECTED RESOURCE
          ========================== */}
          {selectedResource && (
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Selected Resource
                  </p>

                  <h2 className="mt-1 text-xl font-black text-slate-900 dark:text-white">
                    {selectedResource.title}
                  </h2>

                  {selectedResource.description && (
                    <p className="mt-2 max-w-2xl text-sm text-slate-500 dark:text-slate-400">
                      {selectedResource.description}
                    </p>
                  )}
                </div>

                <button
                  onClick={handleStartLearning}
                  disabled={starting}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {starting ? (
                    <Loader2
                      size={17}
                      className="animate-spin"
                    />
                  ) : (
                    <Play size={17} />
                  )}

                  {starting
                    ? "Starting..."
                    : "Start Learning"}
                </button>
              </div>

              {/* ==========================
                  PROGRESS
              ========================== */}
              <div className="mt-7">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-700 dark:text-slate-300">
                    Progress
                  </span>

                  <span className="text-sm font-black text-indigo-600 dark:text-indigo-400">
                    {progress}%
                  </span>
                </div>

                <div className="h-3 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                  <div
                    className="h-full rounded-full bg-indigo-600 transition-all duration-500"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>

                {/* ==========================
                    PROGRESS BUTTONS
                ========================== */}
                <div className="mt-5 flex flex-wrap gap-2">
                  {[25, 50, 75, 100].map((value) => (
                    <button
                      key={value}
                      onClick={() =>
                        handleProgressUpdate(value)
                      }
                      disabled={updating}
                      className={`rounded-lg px-4 py-2 text-xs font-bold transition ${
                        progress >= value
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-indigo-50 dark:bg-slate-800 dark:text-slate-300"
                      } disabled:opacity-50`}
                    >
                      {value === 100
                        ? "Complete"
                        : `${value}%`}
                    </button>
                  ))}
                </div>

                {progress === 100 && (
                  <div className="mt-5 flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                    <CheckCircle size={18} />
                    Learning resource completed!
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Learning;