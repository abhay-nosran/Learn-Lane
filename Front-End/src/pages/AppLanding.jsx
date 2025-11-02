
import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

const LandingPage = () => {
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          buttonRef.current && !buttonRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleGetStartedClick = (e) => {
    e.preventDefault();
    setShowDropdown(!showDropdown);
  };

  return (
    <div className="min-h-screen w-full bg-gray-900 text-gray-100 overflow-x-hidden">
      <header className="w-full bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded bg-indigo-600"></div>
            <span className="text-xl font-semibold">StudyPlan</span>
          </div>
          <nav className="hidden md:flex items-center gap-6 text-gray-300">
            <a href="#features" className="hover:text-indigo-400">Features</a>
            <a href="#how" className="hover:text-indigo-400">How it works</a>
            <a href="#faq" className="hover:text-indigo-400">FAQ</a>
            <Link
              to="/signin"
              className="px-4 py-2 rounded border border-indigo-600 text-indigo-400 hover:bg-indigo-600 hover:text-white transition-colors"
            >
              Sign In
            </Link>
            <div className="relative">
              <button
                ref={buttonRef}
                onClick={handleGetStartedClick}
                className="px-4 py-2 rounded bg-indigo-600 text-white hover:bg-indigo-500 transition-colors flex items-center gap-2"
              >
                Get Started
                <svg className={`w-4 h-4 transition-transform ${showDropdown ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path>
                </svg>
              </button>
              
              {showDropdown && (
                <div 
                  ref={dropdownRef}
                  className="absolute top-full right-0 mt-2 w-48 bg-gray-800 border border-white/10 rounded-lg shadow-xl backdrop-blur-sm z-50"
                >
                  <div className="py-2">
                    <Link
                      to="/signin"
                      className="block px-4 py-2 text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1"></path>
                        </svg>
                        Sign In
                      </div>
                    </Link>
                    <Link
                      to="/signup"
                      className="block px-4 py-2 text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
                        </svg>
                        Sign Up
                      </div>
                    </Link>
                    <hr className="my-2 border-white/10" />
                    <Link
                      to="/create"
                      className="block px-4 py-2 text-gray-300 hover:bg-white/5 hover:text-white transition-colors"
                      onClick={() => setShowDropdown(false)}
                    >
                      <div className="flex items-center gap-3">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
                        </svg>
                        Create Plan (Guest)
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="relative w-full overflow-hidden bg-gradient-to-br from-[#0b1220] via-[#0e1630] to-[#0b1220]">
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.15),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(14,165,233,0.12),transparent_35%)]" />
          <div className="relative max-w-6xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-10 items-center">
            <div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
                AI-powered study plans, with trusted resources
              </h1>
              <p className="mt-5 text-lg text-gray-300">
                Generate day-wise modules for any topic in seconds. Track progress,
                focus with a Pomodoro timer, and learn faster with curated links.
              </p>
              <div className="mt-8 flex items-center gap-4">
                <Link
                  to="/create"
                  className="px-6 py-3 rounded-lg bg-indigo-600 text-white font-medium hover:bg-indigo-500"
                >
                  Create a plan
                </Link>
                <a
                  href="#features"
                  className="px-6 py-3 rounded-lg border border-white/10 text-gray-100 hover:bg-white/5"
                >
                  Learn more
                </a>
              </div>
              <div className="mt-6 text-sm text-gray-400">
                No signup required. Works offline with local storage.
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 backdrop-blur rounded-xl p-5 shadow-xl">
              <div className="grid grid-cols-3 gap-3">
                {[...Array(9)].map((_, i) => (
                  <div
                    key={i}
                    className="h-20 rounded-lg bg-gradient-to-br from-white/10 to-white/[0.06] border border-white/[0.08] flex items-center justify-center text-sm text-gray-200"
                  >
                    Day {i + 1}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="w-full bg-gray-900">
          <div className="max-w-6xl mx-auto px-6 py-16">
            <h2 className="text-2xl md:text-3xl font-bold">Features</h2>
            <div className="mt-8 grid md:grid-cols-3 gap-6">
              <div className="p-6 rounded-lg bg-white/5 border border-white/10">
                <h3 className="font-semibold">Smart plan generator</h3>
                <p className="mt-2 text-gray-300">
                  Create day-wise modules and AI summaries for any topic. Attach references and links.
                </p>
              </div>
              <div className="p-6 rounded-lg bg-white/5 border border-white/10">
                <h3 className="font-semibold">Stay on track</h3>
                <p className="mt-2 text-gray-300">
                  Mark progress, use a Pomodoro timer, and receive gentle reminders.
                </p>
              </div>
              <div className="p-6 rounded-lg bg-white/5 border border-white/10">
                <h3 className="font-semibold">Insights & export</h3>
                <p className="mt-2 text-gray-300">
                  View analytics and export your plan as a PDF for sharing.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full bg-gray-900">
        <div className="max-w-6xl mx-auto px-6 py-6 text-sm text-gray-400">
          © {new Date().getFullYear()} StudyPlan. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
