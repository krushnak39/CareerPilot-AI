import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  BriefcaseBusiness,
  Building2,
  MapPin,
  CalendarDays,
  Plus,
  Pencil,
  Trash2,
  LoaderCircle,
  X,
  Search,
  Filter,
  ArrowUpDown,
} from "lucide-react";

import toast from "react-hot-toast";

import {
  createJob,
  getJobs,
  updateJob,
  deleteJob,
} from "../api/jobs";

import ConfirmModal from "../components/ConfirmModal";

function Jobs() {
  const [jobs, setJobs] = useState([]);

  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);

  const [deletingId, setDeletingId] = useState(null);

  const [pendingDeleteJob, setPendingDeleteJob] = useState(null);

  const [editingId, setEditingId] = useState(null);

  const [showForm, setShowForm] = useState(false);

  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState("ALL");

  const [sortOption, setSortOption] = useState("newest");

  const initialForm = {
    jobTitle: "",
    company: "",
    location: "",
    jobType: "",
    description: "",
    status: "SAVED",
    appliedDate: "",
  };

  const [form, setForm] = useState(initialForm);

  // ==========================
  // LOAD JOBS
  // ==========================
  const fetchJobs = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await getJobs();

      setJobs(response.data || []);
    } catch (err) {
      console.error("Fetch Jobs Error:", err);

      const message =
        err.response?.data?.message ||
        "Unable to load your jobs.";

      setError(message);

      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  // ==========================
  // FORM CHANGE
  // ==========================
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  // ==========================
  // RESET FORM
  // ==========================
  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(false);
  };

  // ==========================
  // OPEN CREATE FORM
  // ==========================
  const openCreateForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowForm(true);
    setError("");
  };

  // ==========================
  // OPEN EDIT FORM
  // ==========================
  const openEditForm = (job) => {
    setEditingId(job.id);

    setForm({
      jobTitle: job.jobTitle || "",

      company: job.company || "",

      location: job.location || "",

      jobType: job.jobType || "",

      description: job.description || "",

      status: job.status || "SAVED",

      appliedDate: job.appliedDate
        ? new Date(job.appliedDate)
            .toISOString()
            .split("T")[0]
        : "",
    });

    setShowForm(true);
    setError("");
  };

  // ==========================
  // SAVE JOB
  // ==========================
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !form.jobTitle.trim() ||
      !form.company.trim()
    ) {
      toast.error(
        "Job title and company are required."
      );

      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        ...form,

        jobTitle: form.jobTitle.trim(),

        company: form.company.trim(),

        location: form.location.trim(),

        jobType: form.jobType.trim(),

        description: form.description.trim(),

        appliedDate: form.appliedDate || null,
      };

      let response;

      if (editingId) {
        response = await updateJob(
          editingId,
          payload
        );

        toast.success(
          response.message ||
            "Job application updated successfully."
        );
      } else {
        response = await createJob(payload);

        toast.success(
          response.message ||
            "Job application created successfully."
        );
      }

      resetForm();

      await fetchJobs();
    } catch (err) {
      console.error("Save Job Error:", err);

      toast.error(
        err.response?.data?.message ||
          "Unable to save job application."
      );
    } finally {
      setSaving(false);
    }
  };

  // ==========================
  // QUICK STATUS UPDATE
  // ==========================
  const handleStatusChange = async (
    job,
    status
  ) => {
    try {
      setError("");

      const response = await updateJob(
        job.id,
        {
          status,
        }
      );

      toast.success(
        response.message ||
          "Application status updated."
      );

      await fetchJobs();
    } catch (err) {
      console.error(
        "Status Update Error:",
        err
      );

      toast.error(
        err.response?.data?.message ||
          "Unable to update status."
      );
    }
  };

  // ==========================
  // OPEN DELETE MODAL
  // ==========================
  const requestDelete = (job) => {
    setPendingDeleteJob(job);
    setError("");
  };

  // ==========================
  // CLOSE DELETE MODAL
  // ==========================
  const cancelDelete = () => {
    if (deletingId) {
      return;
    }

    setPendingDeleteJob(null);
  };

  // ==========================
  // CONFIRM DELETE
  // ==========================
  const confirmDelete = async () => {
    if (!pendingDeleteJob) {
      return;
    }

    try {
      setDeletingId(pendingDeleteJob.id);

      setError("");

      const response = await deleteJob(
        pendingDeleteJob.id
      );

      toast.success(
        response.message ||
          "Job application deleted successfully."
      );

      setPendingDeleteJob(null);

      await fetchJobs();
    } catch (err) {
      console.error(
        "Delete Job Error:",
        err
      );

      toast.error(
        err.response?.data?.message ||
          "Unable to delete job application."
      );
    } finally {
      setDeletingId(null);
    }
  };

  // ==========================
  // SEARCH + FILTER + SORT
  // ==========================
  const filteredJobs = useMemo(() => {
    const query = search
      .trim()
      .toLowerCase();

    const result = jobs.filter((job) => {
      const matchesSearch =
        !query ||
        job.jobTitle
          ?.toLowerCase()
          .includes(query) ||
        job.company
          ?.toLowerCase()
          .includes(query) ||
        job.location
          ?.toLowerCase()
          .includes(query);

      const matchesStatus =
        statusFilter === "ALL" ||
        job.status === statusFilter;

      return (
        matchesSearch &&
        matchesStatus
      );
    });

    const getTimestamp = (value) => {
      if (!value) {
        return 0;
      }

      const timestamp =
        new Date(value).getTime();

      return Number.isNaN(timestamp)
        ? 0
        : timestamp;
    };

    return [...result].sort((a, b) => {
      switch (sortOption) {
        case "oldest":
          return (
            getTimestamp(a.createdAt) -
            getTimestamp(b.createdAt)
          );

        case "title-asc":
          return (
            a.jobTitle || ""
          ).localeCompare(
            b.jobTitle || ""
          );

        case "title-desc":
          return (
            b.jobTitle || ""
          ).localeCompare(
            a.jobTitle || ""
          );

        case "company-asc":
          return (
            a.company || ""
          ).localeCompare(
            b.company || ""
          );

        case "company-desc":
          return (
            b.company || ""
          ).localeCompare(
            a.company || ""
          );

        case "applied-newest":
          return (
            getTimestamp(b.appliedDate) -
            getTimestamp(a.appliedDate)
          );

        case "applied-oldest":
          return (
            getTimestamp(a.appliedDate) -
            getTimestamp(b.appliedDate)
          );

        case "newest":
        default:
          return (
            getTimestamp(b.createdAt) -
            getTimestamp(a.createdAt)
          );
      }
    });
  }, [
    jobs,
    search,
    statusFilter,
    sortOption,
  ]);

  // ==========================
  // STATUS STYLE
  // ==========================
  const getStatusStyle = (status) => {
    switch (status) {
      case "APPLIED":
        return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";

      case "INTERVIEW":
        return "bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20";

      case "OFFER":
        return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";

      case "REJECTED":
        return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";

      default:
        return "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20";
    }
  };

  return (
    <>
      <div className="space-y-6">

        {/* ==========================
            HEADER
        ========================== */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">

          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
              Job Tracker
            </h1>

            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Save jobs, track applications
              and update your progress from
              saved to offer.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateForm}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-lg shadow-blue-500/20 transition"
          >
            <Plus size={17} />
            Add Job
          </button>

        </div>

        {/* ==========================
            LOAD ERROR
        ========================== */}
        {error && (
          <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3">
            <p className="text-xs font-semibold text-rose-600 dark:text-rose-400 text-center">
              {error}
            </p>
          </div>
        )}

        {/* ==========================
            CREATE / EDIT FORM
        ========================== */}
        {showForm && (
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">

            <div className="flex items-center justify-between mb-5">

              <div>
                <h2 className="text-base font-black text-slate-900 dark:text-white">
                  {editingId
                    ? "Edit Job Application"
                    : "Add Job Application"}
                </h2>

                <p className="text-xs text-slate-400 mt-1">
                  Keep the important details
                  together in one place.
                </p>
              </div>

              <button
                type="button"
                onClick={resetForm}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <X size={18} />
              </button>

            </div>

            <form
              onSubmit={handleSubmit}
              className="grid sm:grid-cols-2 gap-4"
            >

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Job Title *
                </label>

                <input
                  name="jobTitle"
                  value={form.jobTitle}
                  onChange={handleChange}
                  placeholder="Backend Developer"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Company *
                </label>

                <input
                  name="company"
                  value={form.company}
                  onChange={handleChange}
                  placeholder="Infosys"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Location
                </label>

                <input
                  name="location"
                  value={form.location}
                  onChange={handleChange}
                  placeholder="Pune"
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Job Type
                </label>

                <select
                  name="jobType"
                  value={form.jobType}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
                >
                  <option value="">
                    Select type
                  </option>

                  <option value="Full Time">
                    Full Time
                  </option>

                  <option value="Part Time">
                    Part Time
                  </option>

                  <option value="Internship">
                    Internship
                  </option>

                  <option value="Contract">
                    Contract
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Status
                </label>

                <select
                  name="status"
                  value={form.status}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
                >
                  <option value="SAVED">
                    Saved
                  </option>

                  <option value="APPLIED">
                    Applied
                  </option>

                  <option value="INTERVIEW">
                    Interview
                  </option>

                  <option value="OFFER">
                    Offer
                  </option>

                  <option value="REJECTED">
                    Rejected
                  </option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Applied Date
                </label>

                <input
                  type="date"
                  name="appliedDate"
                  value={form.appliedDate}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-600 dark:text-slate-300 mb-1.5">
                  Job Description
                </label>

                <textarea
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Paste or write important job details..."
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="sm:col-span-2 flex justify-end gap-2">

                <button
                  type="button"
                  onClick={resetForm}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition disabled:opacity-50"
                >

                  {saving && (
                    <LoaderCircle
                      size={15}
                      className="animate-spin"
                    />
                  )}

                  {editingId
                    ? "Save Changes"
                    : "Add Job"}

                </button>

              </div>

            </form>

          </div>
        )}

        {/* ==========================
            SEARCH + FILTER + SORT
        ========================== */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-4 border border-slate-200/80 dark:border-slate-800 shadow-sm">

          <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">

            {/* SEARCH */}
            <div className="relative">

              <Search
                size={16}
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                type="text"
                value={search}
                onChange={(e) =>
                  setSearch(e.target.value)
                }
                placeholder="Search by role, company or location..."
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-900 dark:text-white outline-none focus:border-blue-500"
              />

            </div>

            {/* STATUS FILTER */}
            <div className="relative">

              <Filter
                size={15}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />

              <select
                value={statusFilter}
                onChange={(e) =>
                  setStatusFilter(
                    e.target.value
                  )
                }
                className="pl-9 pr-8 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-700 dark:text-slate-200 outline-none"
              >
                <option value="ALL">
                  All Statuses
                </option>

                <option value="SAVED">
                  Saved
                </option>

                <option value="APPLIED">
                  Applied
                </option>

                <option value="INTERVIEW">
                  Interview
                </option>

                <option value="OFFER">
                  Offer
                </option>

                <option value="REJECTED">
                  Rejected
                </option>
              </select>

            </div>

            {/* SORT */}
            <div className="relative">

              <ArrowUpDown
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />

              <select
                value={sortOption}
                onChange={(e) =>
                  setSortOption(
                    e.target.value
                  )
                }
                className="pl-9 pr-8 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-sm text-slate-700 dark:text-slate-200 outline-none"
              >
                <option value="newest">
                  Newest Added
                </option>

                <option value="oldest">
                  Oldest Added
                </option>

                <option value="title-asc">
                  Job Title A-Z
                </option>

                <option value="title-desc">
                  Job Title Z-A
                </option>

                <option value="company-asc">
                  Company A-Z
                </option>

                <option value="company-desc">
                  Company Z-A
                </option>

                <option value="applied-newest">
                  Applied Date Newest
                </option>

                <option value="applied-oldest">
                  Applied Date Oldest
                </option>
              </select>

            </div>

          </div>

        </div>

        {/* ==========================
            JOB APPLICATIONS
        ========================== */}
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 border border-slate-200/80 dark:border-slate-800 shadow-sm">

          <div className="flex items-center justify-between mb-5">

            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                Applications
              </h2>

              <p className="text-[11px] text-slate-400 mt-1">
                {filteredJobs.length} of{" "}
                {jobs.length} job applications
              </p>
            </div>

            <div className="px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold">
              {jobs.length}
            </div>

          </div>

          {loading && (
            <div className="flex items-center justify-center gap-2 py-10 text-slate-400">

              <LoaderCircle
                size={18}
                className="animate-spin"
              />

              <span className="text-xs font-semibold">
                Loading applications...
              </span>

            </div>
          )}

          {!loading &&
            filteredJobs.length === 0 && (
              <div className="border border-dashed border-slate-200 dark:border-slate-700 rounded-2xl p-10 text-center">

                <BriefcaseBusiness
                  size={34}
                  className="mx-auto text-slate-300 dark:text-slate-600"
                />

                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 mt-3">
                  No job applications found
                </p>

                <p className="text-xs text-slate-400 mt-1">
                  Add your first job or change
                  your current filters.
                </p>

              </div>
            )}

          {!loading &&
            filteredJobs.length > 0 && (
              <div className="space-y-4">

                {filteredJobs.map(
                  (job) => (
                    <div
                      key={job.id}
                      className="rounded-2xl border border-slate-200 dark:border-slate-700/80 bg-slate-50 dark:bg-slate-800/60 p-4"
                    >

                      <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">

                        <div className="flex items-start gap-3 min-w-0">

                          <div className="w-11 h-11 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">

                            <BriefcaseBusiness
                              size={21}
                            />

                          </div>

                          <div className="min-w-0">

                            <div className="flex flex-wrap items-center gap-2">

                              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                                {job.jobTitle}
                              </h3>

                              <span
                                className={`text-[9px] uppercase tracking-wide font-black px-2 py-0.5 rounded-full border ${getStatusStyle(
                                  job.status
                                )}`}
                              >
                                {job.status}
                              </span>

                            </div>

                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-2 text-[10px] text-slate-500 dark:text-slate-400">

                              <span className="inline-flex items-center gap-1.5">

                                <Building2
                                  size={12}
                                />

                                {job.company}

                              </span>

                              {job.location && (
                                <span className="inline-flex items-center gap-1.5">

                                  <MapPin
                                    size={12}
                                  />

                                  {job.location}

                                </span>
                              )}

                              {job.appliedDate && (
                                <span className="inline-flex items-center gap-1.5">

                                  <CalendarDays
                                    size={12}
                                  />

                                  Applied{" "}

                                  {new Date(
                                    job.appliedDate
                                  ).toLocaleDateString()}

                                </span>
                              )}

                            </div>

                            {job.jobType && (
                              <p className="text-[10px] text-slate-400 mt-1.5">
                                {job.jobType}
                              </p>
                            )}

                            {job.description && (
                              <p className="text-xs text-slate-600 dark:text-slate-300 mt-3 max-w-3xl whitespace-pre-wrap">
                                {job.description}
                              </p>
                            )}

                          </div>

                        </div>

                        <div className="flex flex-wrap items-center gap-2">

                          <select
                            value={job.status}
                            onChange={(e) =>
                              handleStatusChange(
                                job,
                                e.target.value
                              )
                            }
                            className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 text-xs font-bold text-slate-700 dark:text-slate-200 outline-none"
                          >
                            <option value="SAVED">
                              Saved
                            </option>

                            <option value="APPLIED">
                              Applied
                            </option>

                            <option value="INTERVIEW">
                              Interview
                            </option>

                            <option value="OFFER">
                              Offer
                            </option>

                            <option value="REJECTED">
                              Rejected
                            </option>
                          </select>

                          <button
                            type="button"
                            onClick={() =>
                              openEditForm(job)
                            }
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 transition"
                          >
                            <Pencil
                              size={14}
                            />

                            Edit
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              requestDelete(job)
                            }
                            disabled={
                              deletingId ===
                              job.id
                            }
                            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-500/10 hover:bg-rose-500 hover:text-white border border-rose-500/20 transition disabled:opacity-50"
                          >

                            {deletingId ===
                            job.id ? (
                              <LoaderCircle
                                size={14}
                                className="animate-spin"
                              />
                            ) : (
                              <Trash2
                                size={14}
                              />
                            )}

                            {deletingId ===
                            job.id
                              ? "Deleting..."
                              : "Delete"}

                          </button>

                        </div>

                      </div>

                    </div>
                  )
                )}

              </div>
            )}

        </div>

      </div>

      {/* ==========================
          CONFIRM DELETE MODAL
      ========================== */}
      <ConfirmModal
        open={Boolean(
          pendingDeleteJob
        )}
        title="Delete Job Application?"
        message={
          pendingDeleteJob
            ? `Are you sure you want to delete "${pendingDeleteJob.jobTitle}" at ${pendingDeleteJob.company}? This action cannot be undone.`
            : ""
        }
        confirmText="Delete Job"
        cancelText="Cancel"
        loading={Boolean(deletingId)}
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
      />
    </>
  );
}

export default Jobs;