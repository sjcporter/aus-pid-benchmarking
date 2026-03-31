"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import ChartContainer from "@/components/charts/ChartContainer";
import MetricCard from "@/components/content/MetricCard";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface ProtocolYear {
  year: number;
  articles: number;
}

interface ProtocolJournal {
  journal: string;
  publisher: string | null;
  articles: number;
}

interface DataCiteProtocol {
  repository: string;
  resource_type: string;
  resource_subtype: string | null;
  works: number;
}

type JournalSortKey = "journal" | "publisher" | "articles";
type DataCiteSortKey = "repository" | "resource_type" | "works";

export default function MethodsPage() {
  const [data, setData] = useState<ProtocolYear[]>([]);
  const [journalData, setJournalData] = useState<ProtocolJournal[]>([]);
  const [dataciteProtocols, setDataciteProtocols] = useState<DataCiteProtocol[]>([]);
  const [loading, setLoading] = useState(true);
  const [journalSortKey, setJournalSortKey] = useState<JournalSortKey>("articles");
  const [journalSortAsc, setJournalSortAsc] = useState(false);
  const [dcSortKey, setDcSortKey] = useState<DataCiteSortKey>("works");
  const [dcSortAsc, setDcSortAsc] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/data/outputs/protocols-year.json").then((r) => r.json()),
      fetch("/data/outputs/protocol-journals.json").then((r) => r.json()),
      fetch("/data/outputs/datacite-protocols.json").then((r) => r.json()),
    ])
      .then(([yearData, journals, dcProtocols]: [ProtocolYear[], ProtocolJournal[], DataCiteProtocol[]]) => {
        setData(yearData.sort((a, b) => a.year - b.year));
        setJournalData(journals);
        setDataciteProtocols(dcProtocols);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalArticles = useMemo(
    () => data.reduce((sum, d) => sum + d.articles, 0),
    [data]
  );

  const peakYear = useMemo(
    () =>
      data.length > 0
        ? data.reduce((max, d) => (d.articles > max.articles ? d : max))
        : null,
    [data]
  );

  const latestYear = useMemo(
    () => (data.length > 0 ? data[data.length - 1] : null),
    [data]
  );

  const earliestYear = useMemo(
    () => (data.length > 0 ? data[0] : null),
    [data]
  );

  const growthFactor = useMemo(() => {
    if (earliestYear && latestYear && earliestYear.articles > 0) {
      return (latestYear.articles / earliestYear.articles).toFixed(0);
    }
    return "N/A";
  }, [earliestYear, latestYear]);

  // --- Journal table sorting ---
  const handleJournalSort = (key: JournalSortKey) => {
    if (journalSortKey === key) {
      setJournalSortAsc((prev) => !prev);
    } else {
      setJournalSortKey(key);
      setJournalSortAsc(key === "journal" || key === "publisher");
    }
  };

  const sortedJournalData = useMemo(() => {
    return [...journalData].sort((a, b) => {
      const aVal = a[journalSortKey];
      const bVal = b[journalSortKey];
      if (journalSortKey === "articles") {
        return journalSortAsc
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      }
      const aStr = (aVal ?? "") as string;
      const bStr = (bVal ?? "") as string;
      return journalSortAsc ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [journalData, journalSortKey, journalSortAsc]);

  const journalSortIndicator = (key: JournalSortKey) => {
    if (journalSortKey !== key) return "";
    return journalSortAsc ? " \u25B2" : " \u25BC";
  };

  // --- DataCite protocols table sorting ---
  const handleDcSort = (key: DataCiteSortKey) => {
    if (dcSortKey === key) {
      setDcSortAsc((prev) => !prev);
    } else {
      setDcSortKey(key);
      setDcSortAsc(key === "repository" || key === "resource_type");
    }
  };

  const sortedDcProtocols = useMemo(() => {
    return [...dataciteProtocols].sort((a, b) => {
      const aVal = a[dcSortKey];
      const bVal = b[dcSortKey];
      if (dcSortKey === "works") {
        return dcSortAsc
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      }
      const aStr = (aVal ?? "") as string;
      const bStr = (bVal ?? "") as string;
      return dcSortAsc ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr);
    });
  }, [dataciteProtocols, dcSortKey, dcSortAsc]);

  const dcSortIndicator = (key: DataCiteSortKey) => {
    if (dcSortKey !== key) return "";
    return dcSortAsc ? " \u25B2" : " \u25BC";
  };

  const totalDcWorks = useMemo(
    () => dataciteProtocols.reduce((sum, d) => sum + d.works, 0),
    [dataciteProtocols]
  );

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-text mb-2">
          Research Methods &amp; Protocols
        </h1>
        <div className="animate-pulse bg-gray-200 rounded-lg h-96" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text mb-2">
        Research Methods &amp; Protocols
      </h1>
      <p className="text-brand-muted mb-6">
        Tracking the growth of protocol publishing in dedicated journals and
        repositories. Protocols describe detailed research methods and are
        increasingly recognised as citable research outputs with their own DOIs.
      </p>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard
          label="Total Protocol Articles"
          value={totalArticles.toLocaleString()}
          subtitle={`From ${data.length > 0 ? data[0].year : ""} to ${data.length > 0 ? data[data.length - 1].year : ""}`}
        />
        <MetricCard
          label="Peak Year"
          value={peakYear ? peakYear.year.toString() : "N/A"}
          subtitle={
            peakYear
              ? `${peakYear.articles.toLocaleString()} articles published`
              : ""
          }
        />
        <MetricCard
          label="Growth Factor"
          value={`${growthFactor}x`}
          subtitle={
            earliestYear && latestYear
              ? `From ${earliestYear.articles.toLocaleString()} (${earliestYear.year}) to ${latestYear.articles.toLocaleString()} (${latestYear.year})`
              : ""
          }
        />
      </div>

      {/* Line Chart */}
      <ChartContainer
        title="Protocol Journal Articles by Year (2000-2024)"
        subtitle="Growth in protocol and methods publishing over time"
        source="Crossref. Protocol journals identified by title matching."
      >
        <Plot
          data={[
            {
              x: data.map((d) => d.year),
              y: data.map((d) => d.articles),
              type: "scatter" as const,
              mode: "lines+markers" as const,
              name: "Protocol Articles",
              line: { color: "#1f407a", width: 3 },
              marker: { size: 6, color: "#1f407a" },
              fill: "tozeroy" as const,
              fillcolor: "rgba(31, 64, 122, 0.1)",
              hovertemplate:
                "<b>Year: %{x}</b><br>Articles: %{y:,.0f}<extra></extra>",
            },
          ]}
          layout={{
            height: 450,
            margin: { l: 70, r: 20, t: 10, b: 50 },
            xaxis: {
              title: { text: "Year" },
              dtick: 2,
              gridcolor: "#f0f0f0",
            },
            yaxis: {
              title: { text: "Number of Articles" },
              gridcolor: "#f0f0f0",
            },
            plot_bgcolor: "#fff",
            paper_bgcolor: "#fff",
            font: {
              family: "var(--font-geist-sans), sans-serif",
              size: 12,
            },
            hovermode: "x unified" as const,
          }}
          config={{
            responsive: true,
            displayModeBar: true,
            modeBarButtonsToRemove: ["lasso2d", "select2d"],
            displaylogo: false,
          }}
          style={{ width: "100%" }}
        />
      </ChartContainer>

      {/* Key Insight */}
      <div className="mt-6 bg-amber-50 rounded-lg border border-amber-200 p-5">
        <h3 className="font-semibold text-brand-text mb-3">
          Key Insight: Rapid Growth in Protocol Publishing
        </h3>
        <p className="text-sm text-brand-muted">
          Protocol publishing has grown{" "}
          <strong>{growthFactor}x</strong> since {earliestYear?.year ?? 2000},
          reflecting increasing recognition that detailed methods descriptions
          are valuable, citable research outputs. Dedicated protocol journals
          such as <em>STAR Protocols</em>, <em>Nature Protocols</em>, and{" "}
          <em>Bio-protocol</em> have driven this growth by providing formal
          publication venues with DOIs, enabling proper citation tracking and
          credit for methodological contributions.
        </p>
      </div>

      {/* Sortable Protocol Journals Table */}
      <div className="mt-6">
        <ChartContainer
          title="Protocol Journals"
          subtitle="A curated list of dedicated protocol and methods journals"
          source="Crossref. Protocol journal articles identified by journal title."
        >
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-brand-surface">
                <tr className="border-b border-brand-border text-left text-brand-muted">
                  <th
                    className="pb-2 pr-4 font-medium cursor-pointer hover:text-brand-text"
                    onClick={() => handleJournalSort("journal")}
                  >
                    Journal{journalSortIndicator("journal")}
                  </th>
                  <th
                    className="pb-2 px-4 font-medium cursor-pointer hover:text-brand-text"
                    onClick={() => handleJournalSort("publisher")}
                  >
                    Publisher{journalSortIndicator("publisher")}
                  </th>
                  <th
                    className="pb-2 pl-4 font-medium text-right cursor-pointer hover:text-brand-text"
                    onClick={() => handleJournalSort("articles")}
                  >
                    Articles{journalSortIndicator("articles")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedJournalData.map((d, i) => (
                  <tr
                    key={`${d.journal}-${i}`}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-2 pr-4 font-medium">{d.journal}</td>
                    <td className="py-2 px-4 text-brand-muted">{d.publisher ?? "Unknown"}</td>
                    <td className="py-2 pl-4 text-right">{d.articles.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartContainer>
      </div>

      {/* DataCite Works with 'Protocol' in Title */}
      {sortedDcProtocols.length > 0 && (
        <div className="mt-6">
          <ChartContainer
            title="DataCite Works with 'Protocol' in Title"
            subtitle={`${totalDcWorks.toLocaleString()} works across ${dataciteProtocols.length} repository/type combinations`}
            source="DataCite. Works with 'protocol' in the title field."
            recipeLink="/recipes"
          >
            <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-brand-surface">
                  <tr className="border-b border-brand-border text-left text-brand-muted">
                    <th
                      className="pb-2 pr-4 font-medium cursor-pointer hover:text-brand-text"
                      onClick={() => handleDcSort("repository")}
                    >
                      Repository{dcSortIndicator("repository")}
                    </th>
                    <th
                      className="pb-2 px-4 font-medium cursor-pointer hover:text-brand-text"
                      onClick={() => handleDcSort("resource_type")}
                    >
                      Resource Type{dcSortIndicator("resource_type")}
                    </th>
                    <th
                      className="pb-2 pl-4 font-medium text-right cursor-pointer hover:text-brand-text"
                      onClick={() => handleDcSort("works")}
                    >
                      Works{dcSortIndicator("works")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedDcProtocols.map((d, i) => (
                    <tr
                      key={`${d.repository}-${d.resource_type}-${i}`}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      <td className="py-2 pr-4 font-medium">{d.repository}</td>
                      <td className="py-2 px-4 text-brand-muted">
                        {d.resource_type}
                        {d.resource_subtype ? ` / ${d.resource_subtype}` : ""}
                      </td>
                      <td className="py-2 pl-4 text-right">{d.works.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartContainer>
        </div>
      )}
    </div>
  );
}
