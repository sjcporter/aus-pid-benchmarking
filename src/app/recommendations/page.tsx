"use client";

import { useState, useEffect, useMemo } from "react";

interface Recommendation {
  id: string;
  reference: string;
  section: string;
  category: "inputs" | "outputs" | "orcid";
  text: string;
}

type FilterCategory = "all" | "inputs" | "outputs" | "orcid";

const categoryStyles: Record<
  "inputs" | "outputs" | "orcid",
  { bg: string; border: string; badge: string; badgeText: string; accent: string }
> = {
  inputs: {
    bg: "bg-blue-50",
    border: "border-blue-200",
    badge: "bg-blue-100",
    badgeText: "text-blue-800",
    accent: "border-l-blue-500",
  },
  outputs: {
    bg: "bg-amber-50",
    border: "border-amber-200",
    badge: "bg-amber-100",
    badgeText: "text-amber-800",
    accent: "border-l-amber-500",
  },
  orcid: {
    bg: "bg-green-50",
    border: "border-green-200",
    badge: "bg-green-100",
    badgeText: "text-green-800",
    accent: "border-l-green-500",
  },
};

const categoryLabels: Record<"inputs" | "outputs" | "orcid", string> = {
  inputs: "Inputs",
  outputs: "Outputs",
  orcid: "ORCID",
};

export default function RecommendationsPage() {
  const [data, setData] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");

  useEffect(() => {
    fetch("/data/meta/recommendations.json")
      .then((r) => r.json())
      .then((d: Recommendation[]) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const c = { inputs: 0, outputs: 0, orcid: 0 };
    data.forEach((r) => {
      c[r.category]++;
    });
    return c;
  }, [data]);

  const filtered = useMemo(() => {
    if (activeFilter === "all") return data;
    return data.filter((r) => r.category === activeFilter);
  }, [data, activeFilter]);

  const tabs: { key: FilterCategory; label: string }[] = [
    { key: "all", label: "All" },
    { key: "inputs", label: "Inputs" },
    { key: "outputs", label: "Outputs" },
    { key: "orcid", label: "ORCID" },
  ];

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-text mb-2">Recommendations</h1>
        <div className="animate-pulse bg-gray-200 rounded-lg h-96" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text mb-2">Recommendations</h1>
      <p className="text-brand-muted mb-6">
        Key recommendations from the ORCID and PID audit for improving persistent identifier
        adoption across Australian research inputs, outputs, and ORCID integration.
      </p>

      {/* Category counts */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {(["inputs", "outputs", "orcid"] as const).map((cat) => {
          const style = categoryStyles[cat];
          return (
            <div
              key={cat}
              className={`${style.bg} ${style.border} border rounded-lg p-4 text-center`}
            >
              <div className={`text-2xl font-bold ${style.badgeText}`}>{counts[cat]}</div>
              <div className={`text-sm ${style.badgeText} font-medium`}>
                {categoryLabels[cat]}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="bg-brand-surface rounded-lg border border-brand-border p-4 mb-6">
        <div className="flex gap-2">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveFilter(tab.key)}
              className={`px-4 py-1.5 text-sm rounded-full border transition-colors ${
                activeFilter === tab.key
                  ? "bg-brand-primary text-white border-brand-primary"
                  : "bg-white text-brand-muted border-brand-border hover:border-brand-primary"
              }`}
            >
              {tab.label}
              <span className="ml-1.5 opacity-75">
                ({tab.key === "all" ? data.length : counts[tab.key as keyof typeof counts]})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Recommendation cards */}
      <div className="space-y-4">
        {filtered.map((rec) => {
          const style = categoryStyles[rec.category];
          return (
            <div
              key={rec.id}
              className={`rounded-lg border ${style.border} ${style.accent} border-l-4 p-5`}
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-brand-text">{rec.id}</span>
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full font-medium ${style.badge} ${style.badgeText}`}
                  >
                    {categoryLabels[rec.category]}
                  </span>
                </div>
                <span className="text-xs text-brand-muted font-mono shrink-0">
                  {rec.reference}
                </span>
              </div>
              <div className="text-sm font-semibold text-brand-text mb-1">{rec.section}</div>
              <p className="text-sm text-brand-muted leading-relaxed">{rec.text}</p>
            </div>
          );
        })}
      </div>

      {filtered.length === 0 && (
        <div className="bg-brand-surface rounded-lg border border-brand-border p-8 text-center text-brand-muted">
          No recommendations found for this category.
        </div>
      )}
    </div>
  );
}
