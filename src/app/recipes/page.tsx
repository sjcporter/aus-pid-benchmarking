"use client";

import { useState, useEffect, useMemo } from "react";

interface ToolkitQuery {
  id: number | string;
  title: string;
  label: string;
  category: "inputs" | "outputs";
  pid_type: string;
  subcategory: string;
  description: string;
  tables: string[];
  open_data: boolean;
  colab_url: string | null;
}

const PID_COLORS: Record<string, string> = {
  ROR: "bg-blue-100 text-blue-800 border-blue-200",
  RAiD: "bg-purple-100 text-purple-800 border-purple-200",
  DOI: "bg-green-100 text-green-800 border-green-200",
  IGSN: "bg-amber-100 text-amber-800 border-amber-200",
  ORCID: "bg-orange-100 text-orange-800 border-orange-200",
};

export default function RecipesPage() {
  const [queries, setQueries] = useState<ToolkitQuery[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [pidFilter, setPidFilter] = useState<string>("all");
  const [openOnly, setOpenOnly] = useState(false);
  const [expandedId, setExpandedId] = useState<number | string | null>(null);

  useEffect(() => {
    fetch("/data/meta/toolkit-queries.json")
      .then((r) => r.json())
      .then((d: ToolkitQuery[]) => {
        setQueries(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const pidTypes = useMemo(
    () => [...new Set(queries.map((q) => q.pid_type))].sort(),
    [queries]
  );

  const subcategories = useMemo(
    () => [...new Set(queries.map((q) => q.subcategory))].sort(),
    [queries]
  );

  const filteredQueries = useMemo(() => {
    return queries.filter((q) => {
      if (categoryFilter !== "all" && q.category !== categoryFilter) return false;
      if (pidFilter !== "all" && q.pid_type !== pidFilter) return false;
      if (openOnly && !q.open_data) return false;
      if (
        searchTerm &&
        !q.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !q.description.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !q.subcategory.toLowerCase().includes(searchTerm.toLowerCase())
      )
        return false;
      return true;
    });
  }, [queries, categoryFilter, pidFilter, openOnly, searchTerm]);

  const groupedQueries = useMemo(() => {
    const groups: Record<string, ToolkitQuery[]> = {};
    for (const q of filteredQueries) {
      const key = q.subcategory;
      if (!groups[key]) groups[key] = [];
      groups[key].push(q);
    }
    return groups;
  }, [filteredQueries]);

  const openCount = useMemo(
    () => filteredQueries.filter((q) => q.open_data).length,
    [filteredQueries]
  );

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-text mb-2">
          Benchmarking Recipes
        </h1>
        <div className="animate-pulse bg-gray-200 rounded-lg h-96" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text mb-2">
        Benchmarking Recipes
      </h1>
      <p className="text-brand-muted mb-6">
        Reproducible queries from the Australian PID Benchmarking Toolkit. Each
        recipe documents the BigQuery tables used and links to an executable
        Google Colab notebook. Filter by PID type, category, or open-data
        availability.
      </p>

      {/* Filters */}
      <div className="bg-brand-surface rounded-lg border border-brand-border p-4 mb-6">
        <div className="flex flex-wrap gap-4 items-end">
          {/* Search */}
          <div>
            <label className="block text-xs text-brand-muted mb-1">
              Search recipes
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type to search..."
              className="px-3 py-1.5 border border-brand-border rounded text-sm w-56"
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-xs text-brand-muted mb-1">
              Category
            </label>
            <div className="flex gap-1">
              {["all", "inputs", "outputs"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1.5 text-xs rounded-full border transition-colors ${
                    categoryFilter === cat
                      ? "bg-brand-primary text-white border-brand-primary"
                      : "bg-white text-brand-muted border-brand-border hover:border-brand-primary"
                  }`}
                >
                  {cat === "all"
                    ? "All"
                    : cat === "inputs"
                      ? "Research Inputs"
                      : "Research Outputs"}
                </button>
              ))}
            </div>
          </div>

          {/* PID Type */}
          <div>
            <label className="block text-xs text-brand-muted mb-1">
              PID Type
            </label>
            <div className="flex flex-wrap gap-1">
              <button
                onClick={() => setPidFilter("all")}
                className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                  pidFilter === "all"
                    ? "bg-brand-primary text-white border-brand-primary"
                    : "bg-white text-brand-muted border-brand-border hover:border-brand-primary"
                }`}
              >
                All
              </button>
              {pidTypes.map((pid) => (
                <button
                  key={pid}
                  onClick={() => setPidFilter(pid === pidFilter ? "all" : pid)}
                  className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                    pidFilter === pid
                      ? "bg-brand-primary text-white border-brand-primary"
                      : PID_COLORS[pid] || "bg-gray-100 text-gray-800 border-gray-200"
                  }`}
                >
                  {pid}
                </button>
              ))}
            </div>
          </div>

          {/* Open data toggle */}
          <div className="flex items-center gap-2">
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={openOnly}
                onChange={(e) => setOpenOnly(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-brand-primary"></div>
              <span className="ml-2 text-xs text-brand-muted">
                Open data only
              </span>
            </label>
          </div>

          {/* Counts */}
          <div className="text-xs text-brand-muted ml-auto">
            Showing {filteredQueries.length} of {queries.length} recipes
            <span className="mx-1">|</span>
            {openCount} use open data only
          </div>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        <div className="bg-brand-surface rounded-lg border border-brand-border p-3 text-center">
          <div className="text-2xl font-bold text-brand-text">
            {queries.length}
          </div>
          <div className="text-xs text-brand-muted">Total Recipes</div>
        </div>
        <div className="bg-brand-surface rounded-lg border border-brand-border p-3 text-center">
          <div className="text-2xl font-bold text-brand-text">
            {queries.filter((q) => q.category === "inputs").length}
          </div>
          <div className="text-xs text-brand-muted">Research Inputs</div>
        </div>
        <div className="bg-brand-surface rounded-lg border border-brand-border p-3 text-center">
          <div className="text-2xl font-bold text-brand-text">
            {queries.filter((q) => q.category === "outputs").length}
          </div>
          <div className="text-xs text-brand-muted">Research Outputs</div>
        </div>
        <div className="bg-brand-surface rounded-lg border border-brand-border p-3 text-center">
          <div className="text-2xl font-bold text-green-700">
            {queries.filter((q) => q.open_data).length}
          </div>
          <div className="text-xs text-brand-muted">Open Data Only</div>
        </div>
      </div>

      {/* Grouped recipe cards */}
      {filteredQueries.length === 0 ? (
        <div className="bg-brand-surface rounded-lg border border-brand-border p-8 text-center text-brand-muted">
          No recipes match the current filters.
        </div>
      ) : (
        Object.entries(groupedQueries).map(([subcategory, group]) => (
          <div key={subcategory} className="mb-6">
            <h2 className="text-lg font-semibold text-brand-text mb-3 flex items-center gap-2">
              <span
                className={`inline-block w-2.5 h-2.5 rounded-full ${
                  group[0].category === "inputs"
                    ? "bg-blue-500"
                    : "bg-emerald-500"
                }`}
              />
              {subcategory}
              <span className="text-sm font-normal text-brand-muted">
                ({group.length} recipe{group.length !== 1 ? "s" : ""})
              </span>
            </h2>
            <div className="grid gap-3">
              {group.map((q) => (
                <div
                  key={q.id}
                  className="bg-brand-surface rounded-lg border border-brand-border p-4 hover:border-brand-primary transition-colors"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2 mb-2">
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() =>
                          setExpandedId(expandedId === q.id ? null : q.id)
                        }
                        className="text-left w-full"
                      >
                        <h3 className="font-medium text-brand-text leading-tight hover:text-brand-primary transition-colors">
                          {q.title}
                        </h3>
                      </button>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {/* PID badge */}
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
                          PID_COLORS[q.pid_type] ||
                          "bg-gray-100 text-gray-800 border-gray-200"
                        }`}
                      >
                        {q.pid_type}
                      </span>
                      {/* Open/Licensed indicator */}
                      {q.open_data ? (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-200">
                          Open
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
                          Licensed
                        </span>
                      )}
                      {/* Category badge */}
                      <span
                        className={`px-2 py-0.5 text-xs font-medium rounded-full border ${
                          q.category === "inputs"
                            ? "bg-blue-50 text-blue-700 border-blue-200"
                            : "bg-emerald-50 text-emerald-700 border-emerald-200"
                        }`}
                      >
                        {q.category === "inputs" ? "Input" : "Output"}
                      </span>
                    </div>
                  </div>

                  {/* Expanded details */}
                  {expandedId === q.id && (
                    <div className="mt-3 pt-3 border-t border-brand-border">
                      <p className="text-sm text-brand-muted mb-3">
                        {q.description}
                      </p>
                      <div className="mb-3">
                        <div className="text-xs font-medium text-brand-muted mb-1">
                          Tables Used
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {q.tables.map((table) => {
                            const isLicensed =
                              table.startsWith("dimensions-ai") ||
                              table.startsWith("altmetric") ||
                              table.includes("sentence_matches");
                            return (
                              <span
                                key={table}
                                className={`inline-block px-2 py-0.5 text-xs rounded font-mono ${
                                  isLicensed
                                    ? "bg-yellow-50 text-yellow-800 border border-yellow-200"
                                    : "bg-gray-50 text-gray-700 border border-gray-200"
                                }`}
                              >
                                {table}
                                {isLicensed && (
                                  <span className="ml-1 text-yellow-600">
                                    *
                                  </span>
                                )}
                              </span>
                            );
                          })}
                        </div>
                        {q.tables.some(
                          (t) =>
                            t.startsWith("dimensions-ai") ||
                            t.startsWith("altmetric") ||
                            t.includes("sentence_matches")
                        ) && (
                          <div className="text-xs text-yellow-600 mt-1">
                            * Licensed table -- requires institutional access
                          </div>
                        )}
                      </div>
                      <div className="text-xs text-brand-muted">
                        Label:{" "}
                        <code className="px-1 py-0.5 bg-gray-100 rounded">
                          {q.label}
                        </code>
                      </div>
                    </div>
                  )}

                  {/* Footer with Colab link */}
                  <div className="flex items-center justify-between mt-2">
                    <button
                      onClick={() =>
                        setExpandedId(expandedId === q.id ? null : q.id)
                      }
                      className="text-xs text-brand-muted hover:text-brand-primary transition-colors"
                    >
                      {expandedId === q.id ? "Show less" : "Show details"}
                    </button>
                    {q.colab_url && (
                      <a
                        href={q.colab_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-md bg-brand-primary text-white hover:bg-brand-primary/90 transition-colors"
                      >
                        <svg
                          className="w-3.5 h-3.5"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                        </svg>
                        Open in Colab
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {/* Legend / footnote */}
      <div className="mt-8 bg-brand-surface rounded-lg border border-brand-border p-4">
        <h3 className="text-sm font-medium text-brand-text mb-2">
          About These Recipes
        </h3>
        <div className="text-xs text-brand-muted space-y-1">
          <p>
            Each recipe corresponds to a benchmarking query from the{" "}
            <em>Australian PID Benchmarking Toolkit</em>. Recipes marked{" "}
            <span className="inline-block px-1.5 py-0.5 text-xs font-medium rounded-full bg-green-50 text-green-700 border border-green-200">
              Open
            </span>{" "}
            use only openly available data tables and can be run without
            institutional data licenses. Recipes marked{" "}
            <span className="inline-block px-1.5 py-0.5 text-xs font-medium rounded-full bg-yellow-50 text-yellow-700 border border-yellow-200">
              Licensed
            </span>{" "}
            require access to proprietary datasets such as Dimensions or
            Altmetric.
          </p>
          <p>
            PID types covered:{" "}
            {subcategories.map((s, i) => (
              <span key={s}>
                {i > 0 && ", "}
                {s}
              </span>
            ))}
            .
          </p>
        </div>
      </div>
    </div>
  );
}
