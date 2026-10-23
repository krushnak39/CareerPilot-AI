
import { useEffect, useState } from "react";
import {
  User,
  Mail,
  GraduationCap,
  Briefcase,
  Phone,
  MapPin,
  Calendar,
  Edit,
  Sparkles,
  X,
  Save,
  Loader2,
} from "lucide-react";
import { useUser } from "../context/UserContext";
import { updateProfile } from "../api/profile";

const getProfileForm = (user) => {
  const profile = user?.profile || {};

  return {
    fullName: user?.fullName || user?.name || "",
    phone: profile.phone || user?.phone || "",
    bio: profile.bio || "",
    location: profile.location || user?.location || "",
    college: profile.college || "",
    degree: profile.degree || "",
    graduationYear: profile.graduationYear ?? "",
    skills: Array.isArray(profile.skills)
      ? profile.skills.join(", ")
      : "",
  };
};

function Profile() {
  const { user, setUser, loading } = useUser();

  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [form, setForm] = useState(() => getProfileForm(user));

  useEffect(() => {
    setForm(getProfileForm(user));
  }, [user]);

  if (loading) {
    return (
      <div className="p-10 text-center text-sm font-semibold text-slate-500 dark:text-slate-400 animate-pulse">
        Loading profile details...
      </div>
    );
  }

  const userName = user?.fullName || user?.name || "User";
  const profile = user?.profile || {};
  const userGoal = user?.careerGoal || "CareerPilot AI Candidate";
  const userEmail = user?.email || "No email provided";
  const userPhone = profile.phone || user?.phone || "+91 XXXXX XXXXX";
  const userLocation = profile.location || user?.location || "India";

  const joinedDate = user?.createdAt
    ? `Joined ${user.createdAt.slice(0, 10)}`
    : "Joined Recently";

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleEdit = () => {
    setForm(getProfileForm(user));
    setMessage("");
    setError("");
    setIsEditing(true);
  };

  const handleCancel = () => {
    setForm(getProfileForm(user));
    setIsEditing(false);
    setMessage("");
    setError("");
  };

  const handleSave = async (event) => {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const payload = {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        bio: form.bio.trim(),
        location: form.location.trim(),
        college: form.college.trim(),
        degree: form.degree.trim(),
        graduationYear:
          form.graduationYear === ""
            ? null
            : Number(form.graduationYear),
        skills: form.skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean),
      };

      if (
        payload.fullName.length < 2 ||
        payload.fullName.length > 60
      ) {
        throw new Error(
          "Full name must be between 2 and 60 characters."
        );
      }

      if (payload.bio.length > 500) {
        throw new Error("Bio must be 500 characters or less.");
      }

      if (
        payload.graduationYear !== null &&
        (!Number.isInteger(payload.graduationYear) ||
          payload.graduationYear < 1950 ||
          payload.graduationYear > 2100)
      ) {
        throw new Error(
          "Enter a valid graduation year between 1950 and 2100."
        );
      }

      const response = await updateProfile(payload);

      // updateProfile() already returns Axios response.data.
      // The updated user object is inside response.data.
      const result = response?.data;

      if (!result || (!result.id && !result.fullName)) {
        throw new Error(
          "Profile update response is missing user details."
        );
      }

      const updatedUser = {
        ...user,
        ...result,
        profile: {
          ...(user?.profile || {}),
          ...(result.profile || {}),
        },
      };

      setUser(updatedUser);

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      setForm(getProfileForm(updatedUser));
      setIsEditing(false);
      setMessage("Profile updated successfully!");
    } catch (err) {
      console.error("Update profile failed:", err);

      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to update profile. Please try again."
      );
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950 px-3 py-2.5 text-sm text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-blue-500";

  const labelClass =
    "block text-xs font-semibold text-slate-600 dark:text-slate-300 mb-1.5";

  return (
    <div className="space-y-8 fade">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          My Profile
        </h1>
        <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Manage your AI career persona and personal account attributes.
        </p>
      </div>

      {message && (
        <div
          role="status"
          className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/40 dark:text-emerald-300"
        >
          {message}
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300"
        >
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="relative h-28 overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 sm:h-36">
          <div className="pointer-events-none absolute right-0 top-0 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
        </div>

        <div className="px-6 pb-8 sm:px-8">
          <div className="-mt-12 mb-6 flex flex-col items-center justify-between gap-4 sm:-mt-14 sm:flex-row sm:items-end">
            <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-end sm:text-left">
              <div className="relative z-10 flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-slate-700/50 bg-slate-900 text-2xl font-black text-blue-400 shadow-xl ring-4 ring-white dark:ring-slate-900 sm:h-28 sm:w-28">
                {userName.charAt(0).toUpperCase()}
              </div>

              <div className="space-y-1 sm:pb-1">
                <div className="flex items-center justify-center gap-2 sm:justify-start">
                  <h2 className="text-xl font-extrabold text-slate-900 dark:text-white sm:text-2xl">
                    {userName}
                  </h2>
                  <span className="flex items-center gap-1 rounded-full border border-blue-500/20 bg-blue-500/10 px-2 py-0.5 text-[10px] font-bold text-blue-600 dark:text-blue-400">
                    <Sparkles size={10} />
                    Candidate
                  </span>
                </div>

                <p className="text-xs font-medium text-slate-500 dark:text-slate-400 sm:text-sm">
                  {userGoal}
                </p>
              </div>
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={handleEdit}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white shadow-md shadow-blue-500/20 transition hover:scale-105 hover:bg-blue-700 active:scale-95 sm:w-auto sm:text-sm"
              >
                <Edit size={16} />
                Edit Profile
              </button>
            )}
          </div>

          {isEditing && (
            <form
              onSubmit={handleSave}
              className="mt-8 space-y-6 rounded-2xl border border-blue-200 bg-blue-50/50 p-5 dark:border-blue-900 dark:bg-slate-800/50 sm:p-6"
            >
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                  Edit Your Profile
                </h3>

                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  aria-label="Close edit form"
                  className="rounded-lg p-2 text-slate-500 hover:bg-slate-200 disabled:opacity-50 dark:hover:bg-slate-700"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className={labelClass} htmlFor="fullName">
                    Full Name *
                  </label>
                  <input
                    id="fullName"
                    name="fullName"
                    value={form.fullName}
                    onChange={handleChange}
                    required
                    minLength={2}
                    maxLength={60}
                    className={inputClass}
                    placeholder="Enter your full name"
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="phone">
                    Phone
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter phone number"
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="location">
                    Location
                  </label>
                  <input
                    id="location"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="City, State"
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="college">
                    College / University
                  </label>
                  <input
                    id="college"
                    name="college"
                    value={form.college}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Enter college name"
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="degree">
                    Degree
                  </label>
                  <input
                    id="degree"
                    name="degree"
                    value={form.degree}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. B.Tech Computer Engineering"
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="graduationYear">
                    Graduation Year
                  </label>
                  <input
                    id="graduationYear"
                    name="graduationYear"
                    type="number"
                    min="1950"
                    max="2100"
                    value={form.graduationYear}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="e.g. 2027"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="skills">
                    Skills (comma-separated)
                  </label>
                  <input
                    id="skills"
                    name="skills"
                    value={form.skills}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Python, React, SQL"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className={labelClass} htmlFor="bio">
                    Bio
                  </label>
                  <textarea
                    id="bio"
                    name="bio"
                    rows={4}
                    maxLength={500}
                    value={form.bio}
                    onChange={handleChange}
                    className={inputClass}
                    placeholder="Write a short introduction about yourself"
                  />
                  <p className="mt-1 text-right text-xs text-slate-500">
                    {form.bio.length}/500 characters
                  </p>
                </div>
              </div>

              <div className="flex flex-col-reverse justify-end gap-3 sm:flex-row">
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
                >
                  <X size={16} />
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

          {!isEditing && (
            <>
              <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
                <div className="space-y-4 rounded-2xl border border-slate-200/60 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-800/40">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Personal Information
                  </h3>

                  <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300 sm:text-sm">
                    <div className="flex items-center gap-3">
                      <Mail size={18} className="shrink-0 text-blue-500" />
                      <span>{userEmail}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone size={18} className="shrink-0 text-blue-500" />
                      <span>{userPhone}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <MapPin size={18} className="shrink-0 text-blue-500" />
                      <span>{userLocation}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Calendar size={18} className="shrink-0 text-blue-500" />
                      <span>{joinedDate}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4 rounded-2xl border border-slate-200/60 bg-slate-50 p-6 dark:border-slate-800 dark:bg-slate-800/40">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                    Career Information
                  </h3>

                  <div className="space-y-3.5 text-xs text-slate-600 dark:text-slate-300 sm:text-sm">
                    <div className="flex items-center gap-3">
                      <GraduationCap size={18} className="shrink-0 text-blue-500" />
                      <span>
                        {profile.degree ||
                          user?.education ||
                          "B.Tech Computer Engineering"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <Briefcase size={18} className="shrink-0 text-blue-500" />
                      <span>
                        {user?.jobTitle || "Software Engineer Candidate"}
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <User size={18} className="shrink-0 text-blue-500" />
                      <span>{userGoal}</span>
                    </div>

                    {profile.college && (
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        {profile.college}
                      </p>
                    )}

                    {Array.isArray(profile.skills) &&
                      profile.skills.length > 0 && (
                        <p className="text-xs text-slate-500 dark:text-slate-400">
                          Skills: {profile.skills.join(", ")}
                        </p>
                      )}
                  </div>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
                <div className="rounded-2xl border border-blue-200/50 bg-blue-50 p-4 text-center dark:border-blue-900/30 dark:bg-blue-950/30">
                  <h4 className="text-2xl font-black text-blue-600 dark:text-blue-400">
                    82%
                  </h4>
                  <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Resume Score
                  </p>
                </div>

                <div className="rounded-2xl border border-emerald-200/50 bg-emerald-50 p-4 text-center dark:border-emerald-900/30 dark:bg-emerald-950/30">
                  <h4 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
                    78%
                  </h4>
                  <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    ATS Score
                  </p>
                </div>

                <div className="rounded-2xl border border-purple-200/50 bg-purple-50 p-4 text-center dark:border-purple-900/30 dark:bg-purple-950/30">
                  <h4 className="text-2xl font-black text-purple-600 dark:text-purple-400">
                    65%
                  </h4>
                  <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Learning Progress
                  </p>
                </div>

                <div className="rounded-2xl border border-amber-200/50 bg-amber-50 p-4 text-center dark:border-amber-900/30 dark:bg-amber-950/30">
                  <h4 className="text-2xl font-black text-amber-600 dark:text-amber-400">
                    12
                  </h4>
                  <p className="mt-1 text-xs font-semibold text-slate-600 dark:text-slate-400">
                    Skill Gaps
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default Profile;
