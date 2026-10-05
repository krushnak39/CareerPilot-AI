import { useEffect, useMemo, useState } from "react";
import {
  CheckCircle2,
  Circle,
  ChevronDown,
  ChevronRight,
  Map,
  Search,
  Filter,
  ArrowUpDown,
} from "lucide-react";
import toast from "react-hot-toast";

import {
  getLearningRoadmaps,
  updateLearningRoadmapTopic,
} from "../api/learningRoadmaps";

const LearningRoadmap = () => {
  const [roadmaps, setRoadmaps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedRoadmaps, setExpandedRoadmaps] = useState({});
  const [updatingTopicId, setUpdatingTopicId] = useState(null);

  // Task 7: Search / Filter / Sort
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [sortOption, setSortOption] = useState("newest");

  const fetchRoadmaps = async () => {
    try {
      setLoading(true);

      const response = await getLearningRoadmaps();

      if (response?.success) {
        setRoadmaps(response.data || []);
      } else {
        setRoadmaps([]);
      }
    } catch (error) {
      console.error("Get Learning Roadmaps Error:", error);

      toast.error(
        error?.response?.data?.message ||
          "Failed to load learning roadmaps"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const toggleRoadmap = (roadmapId) => {
    setExpandedRoadmaps((previous) => ({
      ...previous,
      [roadmapId]: !previous[roadmapId],
    }));
  };

  const handleTopicToggle = async (topic) => {
    try {
      setUpdatingTopicId(topic.id);

      const response = await updateLearningRoadmapTopic(
        topic.id,
        {
          completed: !topic.completed,
        }
      );

      if (!response?.success) {
        throw new Error(
          response?.message || "Failed to update topic"
        );
      }

      setRoadmaps((previousRoadmaps) =>
        previousRoadmaps.map((roadmap) => ({
          ...roadmap,
          modules: (roadmap.modules || []).map((module) => ({
            ...module,
            topics: (module.topics || []).map((currentTopic) =>
              currentTopic.id === topic.id
                ? {
                    ...currentTopic,
                    completed: !currentTopic.completed,
                  }
                : currentTopic
            ),
          })),
        }))
      );

      toast.success(
        topic.completed
          ? "Topic marked as incomplete"
          : "Topic completed"
      );
    } catch (error) {
      console.error("Update Roadmap Topic Error:", error);

      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update topic"
      );
    } finally {
      setUpdatingTopicId(null);
    }
  };

  const getRoadmapProgress = (roadmap) => {
    const topics =
      roadmap.modules?.flatMap(
        (module) => module.topics || []
      ) || [];

    if (topics.length === 0) {
      return 0;
    }

    const completedTopics = topics.filter(
      (topic) => topic.completed
    ).length;

    return Math.round(
      (completedTopics / topics.length) * 100
    );
  };

  const getTopicCount = (roadmap) => {
    return (
      roadmap.modules?.reduce(
        (total, module) =>
          total + (module.topics?.length || 0),
        0
      ) || 0
    );
  };

  const getCompletedTopicCount = (roadmap) => {
    return (
      roadmap.modules?.reduce(
        (total, module) =>
          total +
          (module.topics || []).filter(
            (topic) => topic.completed
          ).length,
        0
      ) || 0
    );
  };

  // Task 7: Search, Filter and Sort
  const filteredRoadmaps = useMemo(() => {
    const searchValue = search.trim().toLowerCase();

    const filtered = roadmaps.filter((roadmap) => {
      const progress = getRoadmapProgress(roadmap);

      // Search roadmap, role, description,
      // module and topic data
      const searchableText = [
        roadmap.title,
        roadmap.description,
        roadmap.role,
        ...(roadmap.modules || []).flatMap((module) => [
          module.title,
          module.description,
          ...(module.topics || []).flatMap((topic) => [
            topic.title,
            topic.description,
          ]),
        ]),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch =
        !searchValue ||
        searchableText.includes(searchValue);

      // Status filter
      let matchesStatus = true;

      if (statusFilter === "COMPLETED") {
        matchesStatus = progress === 100;
      } else if (statusFilter === "IN_PROGRESS") {
        matchesStatus = progress > 0 && progress < 100;
      } else if (statusFilter === "NOT_STARTED") {
        matchesStatus = progress === 0;
      }

      return matchesSearch && matchesStatus;
    });

    // Sort
    return [...filtered].sort((a, b) => {
      const titleA = (a.title || "").toLowerCase();
      const titleB = (b.title || "").toLowerCase();

      const dateA = new Date(
        a.createdAt || 0
      ).getTime();

      const dateB = new Date(
        b.createdAt || 0
      ).getTime();

      if (sortOption === "newest") {
        return dateB - dateA;
      }

      if (sortOption === "oldest") {
        return dateA - dateB;
      }

      if (sortOption === "title-asc") {
        return titleA.localeCompare(titleB);
      }

      if (sortOption === "title-desc") {
        return titleB.localeCompare(titleA);
      }

      return 0;
    });
  }, [roadmaps, search, statusFilter, sortOption]);

 if (loading) {
  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-900 sm:p-6">
      <div className="mx-auto max-w-6xl">

        {/* Header Skeleton */}
        <div className="mb-6 animate-pulse overflow-hidden rounded-2xl bg-gray-200 p-6 dark:bg-gray-800 sm:p-8">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 shrink-0 rounded-xl bg-gray-300 dark:bg-gray-700" />

            <div className="flex-1 space-y-3">
              <div className="h-7 w-56 rounded bg-gray-300 dark:bg-gray-700" />

              <div className="h-4 w-full max-w-2xl rounded bg-gray-300 dark:bg-gray-700" />

              <div className="h-4 w-3/4 max-w-xl rounded bg-gray-300 dark:bg-gray-700" />
            </div>
          </div>
        </div>

        {/* Roadmap Skeletons */}
        <div className="space-y-5">
          {[1, 2].map((item) => (
            <div
              key={item}
              className="animate-pulse overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-gray-800"
            >
              {/* Roadmap Header */}
              <div className="p-5 sm:p-6">
                <div className="flex items-start justify-between gap-4">

                  <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="mt-1 h-5 w-5 shrink-0 rounded bg-gray-200 dark:bg-gray-700" />

                    <div className="min-w-0 flex-1 space-y-3">
                      <div className="h-6 w-64 rounded bg-gray-200 dark:bg-gray-700" />

                      <div className="h-4 w-full max-w-xl rounded bg-gray-200 dark:bg-gray-700" />

                      <div className="h-6 w-32 rounded-full bg-gray-200 dark:bg-gray-700" />
                    </div>
                  </div>

                  <div className="shrink-0 space-y-2">
                    <div className="ml-auto h-7 w-14 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-3 w-20 rounded bg-gray-200 dark:bg-gray-700" />
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-5 h-2 rounded-full bg-gray-200 dark:bg-gray-700" />
              </div>

              {/* Modules */}
              <div className="border-t border-gray-100 p-5 dark:border-gray-700 sm:p-6">
                <div className="space-y-4">

                  {[1, 2].map((module) => (
                    <div
                      key={module}
                      className="rounded-xl border border-gray-200 dark:border-gray-700"
                    >
                      {/* Module */}
                      <div className="bg-gray-50 p-4 dark:bg-gray-750">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />

                          <div className="space-y-2">
                            <div className="h-4 w-40 rounded bg-gray-200 dark:bg-gray-700" />
                            <div className="h-3 w-56 rounded bg-gray-200 dark:bg-gray-700" />
                          </div>
                        </div>
                      </div>

                      {/* Topics */}
                      <div className="space-y-4 p-4">
                        <div className="flex items-start gap-3">
                          <div className="h-5 w-5 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />

                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-48 rounded bg-gray-200 dark:bg-gray-700" />
                            <div className="h-3 w-72 max-w-full rounded bg-gray-200 dark:bg-gray-700" />
                          </div>
                        </div>

                        <div className="flex items-start gap-3">
                          <div className="h-5 w-5 shrink-0 rounded-full bg-gray-200 dark:bg-gray-700" />

                          <div className="flex-1 space-y-2">
                            <div className="h-4 w-56 rounded bg-gray-200 dark:bg-gray-700" />
                            <div className="h-3 w-64 max-w-full rounded bg-gray-200 dark:bg-gray-700" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}

  return (
    <div className="min-h-screen bg-gray-50 p-4 dark:bg-gray-900 sm:p-6">
      <div className="mx-auto max-w-6xl">

        {/* Header */}
        <div className="mb-6 overflow-hidden rounded-2xl bg-linear-to-r from-blue-600 to-indigo-600 p-6 text-white shadow-lg sm:p-8">
          <div className="flex items-start gap-4">
            <div className="rounded-xl bg-white/20 p-3">
              <Map size={28} />
            </div>

            <div>
              <h1 className="text-2xl font-bold sm:text-3xl">
                Learning Roadmap
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-blue-100 sm:text-base">
                Track your learning journey, complete topics,
                and monitor your progress step by step.
              </p>
            </div>
          </div>
        </div>

        {/* Search / Filter / Sort */}
        {roadmaps.length > 0 && (
          <div className="mb-6 rounded-2xl bg-white p-4 shadow-sm dark:bg-gray-800 sm:p-5">
            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">

              {/* Search */}
              <div className="relative">
                <Search
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  value={search}
                  onChange={(event) =>
                    setSearch(event.target.value)
                  }
                  placeholder="Search roadmaps, modules, topics..."
                  className="w-full rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-3 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <Filter
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <select
                  value={statusFilter}
                  onChange={(event) =>
                    setStatusFilter(event.target.value)
                  }
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-8 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                >
                  <option value="ALL">
                    All Roadmaps
                  </option>

                  <option value="IN_PROGRESS">
                    In Progress
                  </option>

                  <option value="COMPLETED">
                    Completed
                  </option>

                  <option value="NOT_STARTED">
                    Not Started
                  </option>
                </select>
              </div>

              {/* Sort */}
              <div className="relative">
                <ArrowUpDown
                  size={18}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <select
                  value={sortOption}
                  onChange={(event) =>
                    setSortOption(event.target.value)
                  }
                  className="w-full appearance-none rounded-xl border border-gray-200 bg-gray-50 py-2.5 pl-10 pr-8 text-sm text-gray-800 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-200"
                >
                  <option value="newest">
                    Newest First
                  </option>

                  <option value="oldest">
                    Oldest First
                  </option>

                  <option value="title-asc">
                    Title A-Z
                  </option>

                  <option value="title-desc">
                    Title Z-A
                  </option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {roadmaps.length === 0 ? (
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm dark:bg-gray-800">
            <Map
              size={48}
              className="mx-auto mb-4 text-gray-400"
            />

            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              No learning roadmaps yet
            </h2>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Your learning roadmaps will appear here.
            </p>
          </div>
        ) : filteredRoadmaps.length === 0 ? (
          /* No Search Results */
          <div className="rounded-2xl bg-white p-10 text-center shadow-sm dark:bg-gray-800">
            <Search
              size={48}
              className="mx-auto mb-4 text-gray-400"
            />

            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              No matching roadmaps
            </h2>

            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Try changing your search or filter.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatusFilter("ALL");
              }}
              className="mt-5 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-700"
            >
              Clear Search & Filter
            </button>
          </div>
        ) : (
          <div className="space-y-5">
            {filteredRoadmaps.map((roadmap) => {
              const progress = getRoadmapProgress(roadmap);
              const totalTopics = getTopicCount(roadmap);
              const completedTopics =
                getCompletedTopicCount(roadmap);

              const isExpanded =
                expandedRoadmaps[roadmap.id] ?? true;

              return (
                <div
                  key={roadmap.id}
                  className="overflow-hidden rounded-2xl bg-white shadow-sm dark:bg-gray-800"
                >

                  {/* Roadmap Header */}
                  <button
                    type="button"
                    onClick={() =>
                      toggleRoadmap(roadmap.id)
                    }
                    className="w-full p-5 text-left transition hover:bg-gray-50 dark:hover:bg-gray-750 sm:p-6"
                  >
                    <div className="flex items-start justify-between gap-4">

                      <div className="flex min-w-0 items-start gap-3">
                        <div className="mt-1 text-gray-500 dark:text-gray-400">
                          {isExpanded ? (
                            <ChevronDown size={20} />
                          ) : (
                            <ChevronRight size={20} />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h2 className="text-lg font-bold text-gray-900 dark:text-white sm:text-xl">
                            {roadmap.title}
                          </h2>

                          {roadmap.description && (
                            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                              {roadmap.description}
                            </p>
                          )}

                          {roadmap.role && (
                            <span className="mt-3 inline-block rounded-full bg-blue-100 px-3 py-1 text-xs font-medium text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                              {roadmap.role}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="shrink-0 text-right">
                        <div className="text-xl font-bold text-blue-600 dark:text-blue-400">
                          {progress}%
                        </div>

                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          {completedTopics}/{totalTopics} topics
                        </div>
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-5">
                      <div className="h-2 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
                        <div
                          className="h-full rounded-full bg-blue-600 transition-all duration-300"
                          style={{
                            width: `${progress}%`,
                          }}
                        />
                      </div>
                    </div>
                  </button>

                  {/* Modules */}
                  {isExpanded && (
                    <div className="border-t border-gray-100 px-5 pb-5 dark:border-gray-700 sm:px-6 sm:pb-6">
                      {(roadmap.modules || []).length === 0 ? (
                        <p className="py-6 text-center text-sm text-gray-500 dark:text-gray-400">
                          No modules added to this roadmap yet.
                        </p>
                      ) : (
                        <div className="space-y-4 pt-5">
                          {[...(roadmap.modules || [])]
                            .sort(
                              (a, b) =>
                                (a.order || 0) -
                                (b.order || 0)
                            )
                            .map((module, moduleIndex) => (
                              <div
                                key={module.id}
                                className="rounded-xl border border-gray-200 dark:border-gray-700"
                              >

                                {/* Module */}
                                <div className="bg-gray-50 p-4 dark:bg-gray-750">
                                  <div className="flex items-start gap-3">

                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-sm font-bold text-blue-700 dark:bg-blue-900/40 dark:text-blue-300">
                                      {moduleIndex + 1}
                                    </div>

                                    <div>
                                      <h3 className="font-semibold text-gray-900 dark:text-white">
                                        {module.title}
                                      </h3>

                                      {module.description && (
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                                          {module.description}
                                        </p>
                                      )}
                                    </div>

                                  </div>
                                </div>

                                {/* Topics */}
                                <div className="divide-y divide-gray-100 dark:divide-gray-700">
                                  {(module.topics || []).length === 0 ? (
                                    <p className="p-4 text-sm text-gray-500 dark:text-gray-400">
                                      No topics added yet.
                                    </p>
                                  ) : (
                                    [...(module.topics || [])]
                                      .sort(
                                        (a, b) =>
                                          (a.order || 0) -
                                          (b.order || 0)
                                      )
                                      .map((topic) => (
                                        <button
                                          key={topic.id}
                                          type="button"
                                          onClick={() =>
                                            handleTopicToggle(
                                              topic
                                            )
                                          }
                                          disabled={
                                            updatingTopicId ===
                                            topic.id
                                          }
                                          className="flex w-full items-start gap-3 p-4 text-left transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:hover:bg-gray-750"
                                        >
                                          <div className="mt-0.5 shrink-0">
                                            {topic.completed ? (
                                              <CheckCircle2
                                                size={21}
                                                className="text-green-500"
                                              />
                                            ) : (
                                              <Circle
                                                size={21}
                                                className="text-gray-400"
                                              />
                                            )}
                                          </div>

                                          <div className="min-w-0 flex-1">
                                            <div
                                              className={`text-sm font-medium ${
                                                topic.completed
                                                  ? "text-gray-400 line-through"
                                                  : "text-gray-800 dark:text-gray-200"
                                              }`}
                                            >
                                              {topic.title}
                                            </div>

                                            {topic.description && (
                                              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                                {
                                                  topic.description
                                                }
                                              </p>
                                            )}

                                            {topic.dueDate && (
                                              <p className="mt-2 text-xs text-gray-400">
                                                Due:{" "}
                                                {new Date(
                                                  topic.dueDate
                                                ).toLocaleDateString()}
                                              </p>
                                            )}
                                          </div>
                                        </button>
                                      ))
                                  )}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningRoadmap;