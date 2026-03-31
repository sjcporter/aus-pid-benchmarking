"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { usePathname } from "next/navigation";
import {
  MessageSquarePlus,
  X,
  Copy,
  Trash2,
  Download,
  ChevronLeft,
  ChevronRight,
  Eye,
  List,
  Reply,
} from "lucide-react";

interface Annotation {
  id: string;
  page: string;
  text: string;
  type: "bug" | "suggestion" | "question" | "content";
  timestamp: string;
  response?: string;
  status?: "open" | "resolved" | "wontfix";
}

const TYPE_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  bug: { label: "Bug", color: "text-red-700", bg: "bg-red-50 border-red-200" },
  suggestion: { label: "Suggestion", color: "text-blue-700", bg: "bg-blue-50 border-blue-200" },
  question: { label: "Question", color: "text-amber-700", bg: "bg-amber-50 border-amber-200" },
  content: { label: "Content", color: "text-green-700", bg: "bg-green-50 border-green-200" },
};

const STATUS_STYLES: Record<string, { label: string; color: string; bg: string }> = {
  open: { label: "Open", color: "text-orange-700", bg: "bg-orange-50 border-orange-300" },
  resolved: { label: "Resolved", color: "text-emerald-700", bg: "bg-emerald-50 border-emerald-300" },
  wontfix: { label: "Won't Fix", color: "text-gray-600", bg: "bg-gray-100 border-gray-300" },
};

const STORAGE_KEY = "pid-dashboard-annotations";

function loadAnnotations(): Annotation[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveAnnotations(annotations: Annotation[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(annotations));
}

type ReviewFilter = "all" | "open" | "current-page";

export default function AnnotationPanel() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [annotations, setAnnotations] = useState<Annotation[]>([]);
  const [newText, setNewText] = useState("");
  const [newType, setNewType] = useState<Annotation["type"]>("suggestion");
  const [showAll, setShowAll] = useState(false);
  const [copied, setCopied] = useState(false);

  // Response tracking
  const [respondingTo, setRespondingTo] = useState<string | null>(null);
  const [responseText, setResponseText] = useState("");

  // Review mode
  const [reviewMode, setReviewMode] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [reviewFilter, setReviewFilter] = useState<ReviewFilter>("all");

  useEffect(() => {
    setAnnotations(loadAnnotations());
  }, []);

  const pageAnnotations = annotations.filter((a) => a.page === pathname);
  const displayAnnotations = showAll ? annotations : pageAnnotations;

  // Filtered annotations for review mode
  const reviewAnnotations = useMemo(() => {
    switch (reviewFilter) {
      case "open":
        return annotations.filter((a) => !a.status || a.status === "open");
      case "current-page":
        return annotations.filter((a) => a.page === pathname);
      case "all":
      default:
        return annotations;
    }
  }, [annotations, reviewFilter, pathname]);

  // Keep review index in bounds when the filtered list changes
  useEffect(() => {
    if (reviewAnnotations.length === 0) {
      setReviewIndex(0);
    } else if (reviewIndex >= reviewAnnotations.length) {
      setReviewIndex(reviewAnnotations.length - 1);
    }
  }, [reviewAnnotations.length, reviewIndex]);

  const addAnnotation = useCallback(() => {
    if (!newText.trim()) return;
    const annotation: Annotation = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      page: pathname,
      text: newText.trim(),
      type: newType,
      timestamp: new Date().toISOString(),
      status: "open",
    };
    const updated = [...annotations, annotation];
    setAnnotations(updated);
    saveAnnotations(updated);
    setNewText("");
  }, [newText, newType, pathname, annotations]);

  const deleteAnnotation = useCallback(
    (id: string) => {
      const updated = annotations.filter((a) => a.id !== id);
      setAnnotations(updated);
      saveAnnotations(updated);
      if (respondingTo === id) {
        setRespondingTo(null);
        setResponseText("");
      }
    },
    [annotations, respondingTo]
  );

  const setStatus = useCallback(
    (id: string, status: "open" | "resolved" | "wontfix") => {
      const updated = annotations.map((a) => (a.id === id ? { ...a, status } : a));
      setAnnotations(updated);
      saveAnnotations(updated);
    },
    [annotations]
  );

  const submitResponse = useCallback(
    (id: string) => {
      if (!responseText.trim()) return;
      const updated = annotations.map((a) =>
        a.id === id ? { ...a, response: responseText.trim() } : a
      );
      setAnnotations(updated);
      saveAnnotations(updated);
      setRespondingTo(null);
      setResponseText("");
    },
    [annotations, responseText]
  );

  const clearResponse = useCallback(
    (id: string) => {
      const updated = annotations.map((a) =>
        a.id === id ? { ...a, response: undefined } : a
      );
      setAnnotations(updated);
      saveAnnotations(updated);
    },
    [annotations]
  );

  const clearAll = useCallback(() => {
    setAnnotations([]);
    saveAnnotations([]);
    setRespondingTo(null);
    setResponseText("");
  }, []);

  // Review mode navigation
  const goNext = useCallback(() => {
    setReviewIndex((i) => Math.min(i + 1, reviewAnnotations.length - 1));
  }, [reviewAnnotations.length]);

  const goPrev = useCallback(() => {
    setReviewIndex((i) => Math.max(i - 1, 0));
  }, []);

  // Keyboard navigation for review mode
  useEffect(() => {
    if (!reviewMode || !open) return;
    const handler = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLInputElement
      ) {
        return;
      }
      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        goNext();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        goPrev();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [reviewMode, open, goNext, goPrev]);

  const formatForExport = useCallback(() => {
    const toExport = showAll ? annotations : pageAnnotations;
    if (toExport.length === 0) return "No annotations to export.";

    const grouped: Record<string, Annotation[]> = {};
    for (const a of toExport) {
      if (!grouped[a.page]) grouped[a.page] = [];
      grouped[a.page].push(a);
    }

    let out = "# Dashboard Annotations\n\n";
    for (const [page, anns] of Object.entries(grouped)) {
      out += `## Page: ${page}\n\n`;
      for (const a of anns) {
        out += `- **[${TYPE_STYLES[a.type].label}]** ${a.text}\n`;
        if (a.status) {
          out += `  - **Status:** ${a.status}\n`;
        }
        if (a.response) {
          out += `  - **Response:** ${a.response}\n`;
        }
      }
      out += "\n";
    }
    return out;
  }, [annotations, pageAnnotations, showAll]);

  const copyToClipboard = useCallback(() => {
    navigator.clipboard.writeText(formatForExport()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [formatForExport]);

  const downloadJSON = useCallback(() => {
    const toExport = showAll ? annotations : pageAnnotations;
    const blob = new Blob([JSON.stringify(toExport, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "pid-dashboard-annotations.json";
    a.click();
    URL.revokeObjectURL(url);
  }, [annotations, pageAnnotations, showAll]);

  // Shared annotation card renderer (used in both list and review mode)
  const renderAnnotationCard = (a: Annotation, fullWidth: boolean) => {
    const isResponding = respondingTo === a.id;
    const status = a.status || "open";

    return (
      <div
        key={a.id}
        className={`${fullWidth ? "p-4" : "p-2.5"} rounded border text-sm ${TYPE_STYLES[a.type].bg}`}
      >
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className={`text-xs font-medium ${TYPE_STYLES[a.type].color}`}>
                {TYPE_STYLES[a.type].label}
              </span>
              {(showAll || fullWidth) && (
                <span className="text-xs text-brand-muted font-mono">{a.page}</span>
              )}
            </div>
            <p className={`text-brand-text ${fullWidth ? "text-base" : ""}`}>{a.text}</p>

            {/* Status pills */}
            <div className="flex items-center gap-1 mt-2">
              {(["open", "resolved", "wontfix"] as const).map((s) => (
                <button
                  key={s}
                  onClick={() => setStatus(a.id, s)}
                  className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                    status === s
                      ? STATUS_STYLES[s].bg + " " + STATUS_STYLES[s].color + " font-medium"
                      : "bg-white/60 text-brand-muted border-brand-border hover:bg-white"
                  }`}
                >
                  {STATUS_STYLES[s].label}
                </button>
              ))}
            </div>

            {/* Existing response display */}
            {a.response && !isResponding && (
              <div className="mt-2 pl-3 border-l-2 border-brand-border">
                <p className="text-xs font-medium text-brand-muted mb-0.5">Response</p>
                <p className="text-sm text-brand-text">{a.response}</p>
                <button
                  onClick={() => clearResponse(a.id)}
                  className="text-xs text-red-500 hover:text-red-700 mt-1"
                >
                  Remove response
                </button>
              </div>
            )}

            {/* Respond form */}
            {isResponding && (
              <div className="mt-2">
                <textarea
                  value={responseText}
                  onChange={(e) => setResponseText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && e.metaKey) submitResponse(a.id);
                    if (e.key === "Escape") {
                      setRespondingTo(null);
                      setResponseText("");
                    }
                  }}
                  placeholder="Write a response..."
                  className="w-full px-2 py-1.5 border border-brand-border rounded text-sm resize-none h-16 bg-white"
                  autoFocus
                />
                <div className="flex items-center gap-1.5 mt-1">
                  <button
                    onClick={() => submitResponse(a.id)}
                    disabled={!responseText.trim()}
                    className="px-2.5 py-1 text-xs bg-brand-primary text-white rounded disabled:opacity-40"
                  >
                    Save
                  </button>
                  <button
                    onClick={() => {
                      setRespondingTo(null);
                      setResponseText("");
                    }}
                    className="px-2.5 py-1 text-xs text-brand-muted border border-brand-border rounded hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <span className="text-xs text-brand-muted ml-1">Cmd+Enter to save</span>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-col items-center gap-1 shrink-0">
            {!isResponding && (
              <button
                onClick={() => {
                  setRespondingTo(a.id);
                  setResponseText(a.response || "");
                }}
                className="p-1 rounded hover:bg-white/50 text-brand-muted"
                title="Respond"
              >
                <Reply size={12} />
              </button>
            )}
            <button
              onClick={() => deleteAnnotation(a.id)}
              className="p-1 rounded hover:bg-white/50 text-brand-muted"
              title="Delete"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-brand-primary text-white px-4 py-2.5 rounded-full shadow-lg hover:shadow-xl transition-shadow"
      >
        <MessageSquarePlus size={18} />
        <span className="text-sm font-medium">
          Annotate
          {annotations.length > 0 && (
            <span className="ml-1.5 bg-white/20 px-1.5 py-0.5 rounded-full text-xs">
              {annotations.length}
            </span>
          )}
        </span>
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 w-96 max-h-[70vh] bg-white rounded-lg shadow-2xl border border-brand-border flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-brand-border">
            <div>
              <h3 className="font-semibold text-brand-text text-sm">Annotations</h3>
              <p className="text-xs text-brand-muted">
                {showAll
                  ? `${annotations.length} total`
                  : `${pageAnnotations.length} on this page`}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => {
                  setReviewMode(!reviewMode);
                  setReviewIndex(0);
                }}
                className={`p-1.5 rounded transition-colors ${
                  reviewMode
                    ? "bg-brand-primary text-white"
                    : "text-brand-muted hover:text-brand-primary hover:bg-gray-100"
                }`}
                title={reviewMode ? "List view" : "Review mode"}
              >
                {reviewMode ? <List size={14} /> : <Eye size={14} />}
              </button>
              <button
                onClick={() => setShowAll(!showAll)}
                className="text-xs text-brand-muted hover:text-brand-primary px-2 py-1 rounded"
              >
                {showAll ? "This page" : "All pages"}
              </button>
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded hover:bg-gray-100"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Review Mode */}
          {reviewMode ? (
            <div className="flex-1 overflow-y-auto flex flex-col">
              {/* Review filter bar */}
              <div className="flex items-center gap-1 px-4 py-2 border-b border-brand-border bg-gray-50">
                {(
                  [
                    { key: "all", label: "All" },
                    { key: "open", label: "Open only" },
                    { key: "current-page", label: "This page" },
                  ] as { key: ReviewFilter; label: string }[]
                ).map((f) => (
                  <button
                    key={f.key}
                    onClick={() => {
                      setReviewFilter(f.key);
                      setReviewIndex(0);
                    }}
                    className={`px-2.5 py-1 text-xs rounded-full border transition-colors ${
                      reviewFilter === f.key
                        ? "bg-brand-primary text-white border-brand-primary"
                        : "bg-white text-brand-muted border-brand-border hover:bg-gray-100"
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>

              {reviewAnnotations.length === 0 ? (
                <div className="flex-1 flex items-center justify-center p-6">
                  <p className="text-sm text-brand-muted text-center">
                    No annotations match this filter.
                  </p>
                </div>
              ) : (
                <>
                  {/* Navigation bar */}
                  <div className="flex items-center justify-between px-4 py-2 border-b border-brand-border">
                    <button
                      onClick={goPrev}
                      disabled={reviewIndex === 0}
                      className="p-1.5 rounded border border-brand-border hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={14} />
                    </button>
                    <span className="text-xs font-medium text-brand-muted">
                      {reviewIndex + 1} of {reviewAnnotations.length}
                    </span>
                    <button
                      onClick={goNext}
                      disabled={reviewIndex === reviewAnnotations.length - 1}
                      className="p-1.5 rounded border border-brand-border hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={14} />
                    </button>
                  </div>

                  {/* Single annotation display */}
                  <div className="flex-1 overflow-y-auto px-4 py-3">
                    {renderAnnotationCard(reviewAnnotations[reviewIndex], true)}
                  </div>

                  {/* Keyboard hint */}
                  <div className="px-4 py-2 border-t border-brand-border">
                    <p className="text-xs text-brand-muted text-center">
                      Use arrow keys to navigate
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <>
              {/* Add new */}
              <div className="px-4 py-3 border-b border-brand-border">
                <div className="flex gap-1 mb-2">
                  {(Object.keys(TYPE_STYLES) as Annotation["type"][]).map((t) => (
                    <button
                      key={t}
                      onClick={() => setNewType(t)}
                      className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                        newType === t
                          ? TYPE_STYLES[t].bg + " " + TYPE_STYLES[t].color + " border"
                          : "bg-white text-brand-muted border-brand-border"
                      }`}
                    >
                      {TYPE_STYLES[t].label}
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <textarea
                    value={newText}
                    onChange={(e) => setNewText(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && e.metaKey) addAnnotation();
                    }}
                    placeholder={`Add a ${newType} for ${pathname}...`}
                    className="flex-1 px-3 py-1.5 border border-brand-border rounded text-sm resize-none h-16"
                  />
                  <button
                    onClick={addAnnotation}
                    disabled={!newText.trim()}
                    className="self-end px-3 py-1.5 bg-brand-primary text-white text-sm rounded disabled:opacity-40"
                  >
                    Add
                  </button>
                </div>
                <p className="text-xs text-brand-muted mt-1">Cmd+Enter to submit</p>
              </div>

              {/* List */}
              <div className="flex-1 overflow-y-auto px-4 py-2">
                {displayAnnotations.length === 0 ? (
                  <p className="text-sm text-brand-muted text-center py-4">
                    No annotations yet. Add one above.
                  </p>
                ) : (
                  <div className="space-y-2">
                    {[...displayAnnotations].reverse().map((a) =>
                      renderAnnotationCard(a, false)
                    )}
                  </div>
                )}
              </div>
            </>
          )}

          {/* Export footer */}
          {annotations.length > 0 && (
            <div className="px-4 py-3 border-t border-brand-border">
              <div className="flex items-center gap-2">
                <button
                  onClick={copyToClipboard}
                  className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs bg-brand-primary text-white rounded hover:opacity-90"
                >
                  <Copy size={12} />
                  {copied ? "Copied!" : "Copy as Markdown"}
                </button>
                <button
                  onClick={downloadJSON}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs border border-brand-border rounded hover:bg-gray-50"
                >
                  <Download size={12} />
                  JSON
                </button>
                <button
                  onClick={clearAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-red-600 border border-red-200 rounded hover:bg-red-50"
                >
                  <Trash2 size={12} />
                  Clear
                </button>
              </div>
              <p className="text-xs text-brand-muted mt-2">
                Copy the markdown and paste it into your Claude conversation as feedback.
              </p>
            </div>
          )}
        </div>
      )}
    </>
  );
}
