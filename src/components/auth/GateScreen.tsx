"use client";

import { useState, useEffect } from "react";

const STORAGE_KEY = "pid-dashboard-access";
const ACCESS_CODE = "ardc2025";

export default function GateScreen({ children }: { children: React.ReactNode }) {
  const [granted, setGranted] = useState(false);
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored === "granted") {
      setGranted(true);
    }
    setChecking(false);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim().toLowerCase() === ACCESS_CODE) {
      sessionStorage.setItem(STORAGE_KEY, "granted");
      setGranted(true);
    } else {
      setError(true);
      setTimeout(() => setError(false), 2000);
    }
  };

  if (checking) return null;
  if (granted) return <>{children}</>;

  return (
    <div className="min-h-screen bg-brand-bg flex items-center justify-center px-4">
      <div className="max-w-md w-full">
        <div className="bg-brand-surface rounded-lg border border-brand-border p-8 shadow-sm">
          <h1 className="text-xl font-bold text-brand-text mb-1">
            Australian National PID Benchmarking Dashboard
          </h1>
          <p className="text-sm text-brand-muted mb-6">
            This dashboard is currently in development. Content is subject to
            change and should not yet be cited or redistributed.
          </p>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-6 text-sm text-amber-800">
            Please enter the access code to continue. If you have been given
            access to review this dashboard, you will have received the code
            from the project team.
          </div>

          <form onSubmit={handleSubmit}>
            <label className="block text-xs text-brand-muted mb-1">
              Access code
            </label>
            <div className="flex gap-2">
              <input
                type="password"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Enter access code"
                className={`flex-1 px-3 py-2 border rounded text-sm ${
                  error ? "border-red-400 bg-red-50" : "border-brand-border"
                }`}
                autoFocus
              />
              <button
                type="submit"
                className="px-4 py-2 bg-brand-primary text-white text-sm rounded hover:opacity-90"
              >
                Enter
              </button>
            </div>
            {error && (
              <p className="text-xs text-red-600 mt-1">
                Incorrect access code. Please try again.
              </p>
            )}
          </form>
        </div>

        <p className="text-xs text-brand-muted text-center mt-4">
          Commissioned by ARDC &middot; Produced by Digital Science
        </p>
      </div>
    </div>
  );
}
