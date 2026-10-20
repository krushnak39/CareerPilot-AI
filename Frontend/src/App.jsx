import { useEffect } from "react";
import StudyMaterials from "./pages/StudyMaterials";
import LearningRoadmap from "./pages/LearningRoadmap";

import {
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

import DashboardLayout from "./layouts/DashboardLayout";

import Dashboard from "./pages/Dashboard";
import Resume from "./pages/Resume";
import Learning from "./pages/Learning";
import Interview from "./pages/Interview";
import Jobs from "./pages/Jobs";
import Profile from "./pages/Profile";
import Setting from "./pages/Setting";
import NotFound from "./pages/NotFound";

// ==========================
// PROTECTED ROUTE
// ==========================
function ProtectedRoute({
  children,
}) {
  const token =
    localStorage.getItem(
      "token"
    );

  if (!token) {
    return (
      <Navigate
        to="/login"
        replace
      />
    );
  }

  return children;
}

function App() {
  // ==========================
  // LOAD SAVED THEME
  // ==========================
  useEffect(() => {
    const isDark =
      localStorage.getItem(
        "theme"
      ) === "dark" ||
      (
        !(
          "theme" in
          localStorage
        ) &&
        window.matchMedia(
          "(prefers-color-scheme: dark)"
        ).matches
      );

    if (isDark) {
      document.documentElement
        .classList
        .add("dark");
    } else {
      document.documentElement
        .classList
        .remove("dark");
    }
  }, []);

  return (
    <Routes>

      {/* ====================== */}
      {/* PUBLIC ROUTES */}
      {/* ====================== */}

      <Route
        path="/"
        element={<Home />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      <Route
        path="/register"
        element={<Register />}
      />

      <Route
        path="/forgot-password"
        element={
          <ForgotPassword />
        }
      />

      <Route
        path="/reset-password"
        element={
          <ResetPassword />
        }
      />

      {/* ====================== */}
      {/* PROTECTED ROUTES */}
      {/* ====================== */}

      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route
          path="/dashboard"
          element={
            <Dashboard />
          }
        />

        <Route
          path="/resume"
          element={
            <Resume />
          }
        />

        <Route
          path="/learning"
          element={
            <Learning />
          }
        />

        <Route
          path="/study-materials"
          element={
              <StudyMaterials />
            }
          />

          <Route
            path="/learning-roadmap"
            element={
                <LearningRoadmap />
              }
          />

        <Route
          path="/interview"
          element={
            <Interview />
          }
        />

        <Route
          path="/jobs"
          element={
            <Jobs />
          }
        />

        <Route
          path="/profile"
          element={
            <Profile />
          }
        />

        <Route
          path="/settings"
          element={
            <Setting />
          }
        />
      </Route>

      {/* ====================== */}
      {/* 404 ROUTE */}
      {/* ====================== */}

      <Route
        path="*"
        element={
          <NotFound />
        }
      />

    </Routes>
  );
}

export default App;