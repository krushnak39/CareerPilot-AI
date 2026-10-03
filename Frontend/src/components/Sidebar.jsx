import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  FileText,
  BookOpen,
  Mic,
  BriefcaseBusiness,
  User,
  Settings,
  LogOut,
  BrainCircuit,
  X,
} from "lucide-react";

import { useUser } from "../context/UserContext";

function Sidebar({
  sidebarOpen,
  setSidebarOpen,
}) {
  const { setUser } =
    useUser();

  const handleLogout = () => {
    localStorage.removeItem(
      "token"
    );

    localStorage.removeItem(
      "user"
    );

    localStorage.removeItem(
      "isLoggedIn"
    );

    setUser(null);

    window.location.href =
      "/login";
  };

  const navItemClass = ({
    isActive,
  }) =>
    `flex items-center gap-3.5 rounded-xl px-4 py-3 text-sm font-semibold transition-all duration-300 relative group ${
      isActive
        ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 dark:bg-blue-500 dark:shadow-blue-500/20"
        : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-100"
    }`;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {sidebarOpen && (
        <div
          onClick={() =>
            setSidebarOpen(
              false
            )
          }
          className="fixed inset-0 z-40 bg-slate-950/50 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-72 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800/80 shadow-2xl lg:shadow-none transition-transform duration-300 ease-in-out shrink-0 ${
          sidebarOpen
            ? "translate-x-0"
            : "-translate-x-full lg:translate-x-0"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-200/80 dark:border-slate-800/80">
          <div className="flex items-center gap-3">

            <div className="rounded-xl bg-linear-to-tr from-blue-600 to-indigo-600 p-2.5 shadow-md shadow-blue-500/20">
              <BrainCircuit
                size={24}
                className="text-white"
              />
            </div>

            <div>
              <h1 className="text-xl font-bold bg-linear-to-tr from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent">
                CareerPilot AI
              </h1>

              <p className="text-xs font-medium text-slate-400 dark:text-slate-500">
                Smart Career Assistant
              </p>
            </div>

          </div>

          <button
            onClick={() =>
              setSidebarOpen(
                false
              )
            }
            className="rounded-xl p-1.5 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 py-6 space-y-1.5 custom-scrollbar">

          <NavLink
            to="/dashboard"
            onClick={() =>
              setSidebarOpen(
                false
              )
            }
            className={
              navItemClass
            }
          >
            <LayoutDashboard
              size={20}
            />

            Dashboard
          </NavLink>

          <NavLink
            to="/resume"
            onClick={() =>
              setSidebarOpen(
                false
              )
            }
            className={
              navItemClass
            }
          >
            <FileText
              size={20}
            />

            Resume Analyzer
          </NavLink>

          <NavLink
            to="/jobs"
            onClick={() =>
              setSidebarOpen(
                false
              )
            }
            className={
              navItemClass
            }
          >
            <BriefcaseBusiness
              size={20}
            />

            Job Tracker
          </NavLink>

          <NavLink
            to="/learning"
            onClick={() =>
              setSidebarOpen(
                false
              )
            }
            className={
              navItemClass
            }
          >
            <BookOpen
              size={20}
            />

            Learning Assistant
          </NavLink>

          {/* Study Materials */}
          <NavLink
            to="/study-materials"
            onClick={() =>
              setSidebarOpen(
                false
              )
            }
            className={
              navItemClass
            }
          >
            <BookOpen
              size={20}
            />

            Study Materials
          </NavLink>

          <NavLink
            to="/interview"
            onClick={() =>
              setSidebarOpen(
                false
              )
            }
            className={
              navItemClass
            }
          >
            <Mic
              size={20}
            />

            Interview Prep
          </NavLink>

          <NavLink
            to="/profile"
            onClick={() =>
              setSidebarOpen(
                false
              )
            }
            className={
              navItemClass
            }
          >
            <User
              size={20}
            />

            Profile
          </NavLink>

          <NavLink
            to="/settings"
            onClick={() =>
              setSidebarOpen(
                false
              )
            }
            className={
              navItemClass
            }
          >
            <Settings
              size={20}
            />

            Settings
          </NavLink>

        </nav>

        {/* Footer Logout */}
        <div className="p-4 border-t border-slate-200/80 dark:border-slate-800/80">

          <button
            onClick={
              handleLogout
            }
            className="flex w-full items-center justify-center gap-2.5 rounded-xl bg-rose-500/10 hover:bg-rose-500 text-rose-600 hover:text-white dark:bg-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-600 dark:hover:text-white px-4 py-3 text-sm font-semibold transition-all duration-200 hover:shadow-lg hover:shadow-rose-500/20 active:scale-95 border border-rose-200/50 dark:border-rose-900/30"
          >
            <LogOut
              size={18}
            />

            Logout
          </button>

        </div>

      </aside>
    </>
  );
}

export default Sidebar;