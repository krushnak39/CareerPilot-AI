import { Link } from "react-router-dom";
import { ArrowRight, Sparkles } from "lucide-react";

import Navbar from "../components/Navbar";
import Features from "../components/Features";
import HowItWorks from "../components/HowItWorks";
import Stats from "../components/Stats";
import Testimonials from "../components/Testimonials";
import FAQ from "../components/FAQ";
import Footer from "../components/Footer";

function Home() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <section
        id="home"
        className="relative overflow-hidden bg-linear-to-b from-blue-50/50 via-slate-50 to-white dark:from-slate-900/50 dark:via-slate-950 dark:to-slate-950 border-b border-slate-200/80 dark:border-slate-800/80"
      >
        {/* Glow backdrop decorative accent */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-125 h-75 bg-blue-500/10 dark:bg-blue-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 md:py-24 lg:py-32 relative z-10">
          <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12 lg:gap-16">
            {/* Left Copy & CTA */}
            <div className="flex-1 text-center lg:text-left space-y-6">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs sm:text-sm font-semibold border border-blue-500/20">
                <Sparkles size={14} /> Next-Gen AI Career Companion
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tight leading-[1.1]">
                Accelerate Your Career With{" "}
                <span className="bg-linear-to-r from-blue-600 via-indigo-600 to-blue-500 dark:from-blue-400 dark:via-indigo-400 dark:to-blue-300 bg-clip-text text-transparent">
                  CareerPilot AI
                </span>
              </h1>

              <p className="text-base sm:text-lg md:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-2xl mx-auto lg:mx-0">
                Analyze your resume against ATS benchmarks, identify critical skill gaps, practice mock AI interviews, and master job-ready skills faster.
              </p>

              <div className="pt-2 flex flex-col sm:flex-row items-center lg:items-start justify-center lg:justify-start gap-4">
                <Link to="/login" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold shadow-lg shadow-blue-500/25 transition-all duration-300 hover:scale-105 active:scale-95">
                    Upload Resume <ArrowRight size={18} />
                  </button>
                </Link>

                <Link to="/register" className="w-full sm:w-auto">
                  <button className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 px-8 py-4 rounded-xl font-bold border border-slate-700/50 shadow-md transition-all duration-300 hover:scale-105 active:scale-95">
                    Start Learning Free
                  </button>
                </Link>
              </div>
            </div>

            {/* Right Hero Graphic */}
            <div className="flex-1 flex justify-center w-full">
              <div className="relative group">
                <div className="absolute -inset-1 rounded-3xl bg-linear-to-r from-blue-600 to-indigo-600 opacity-20 dark:opacity-40 blur-xl group-hover:opacity-40 transition duration-500"></div>
                <img
                  src="/ai-hero.png"
                  alt="CareerPilot AI Illustration"
                  className="relative w-full max-w-xs sm:max-w-sm md:max-w-md lg:max-w-xl h-auto drop-shadow-2xl rounded-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Sections */}
      <Features />
      <HowItWorks />
      <Stats />
      <Testimonials />
      <FAQ />
      <Footer />
    </div>
  );
}

export default Home;