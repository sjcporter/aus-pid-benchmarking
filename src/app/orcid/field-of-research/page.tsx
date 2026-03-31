"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import ScatterPlot, { type ScatterDataPoint } from "@/components/charts/ScatterPlot";
import ChartContainer from "@/components/charts/ChartContainer";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface SubjectCategoryRow {
  entity: string;
  field_of_research: string;
  research_pool: number;
  orcid_researchers: number;
  percentage_orcid: number;
  orcid_completeness: number;
  scope: "global" | "australia";
  date_range: string;
}

type ViewMode = "global" | "australia" | "comparison";
type SortKey = "field_of_research" | "research_pool" | "percentage_orcid" | "orcid_completeness";
type ComparisonSortKey =
  | "field_of_research"
  | "global_adoption"
  | "au_adoption"
  | "adoption_diff"
  | "global_completeness"
  | "au_completeness"
  | "completeness_diff";

interface ComparisonRow {
  field_of_research: string;
  global_adoption: number;
  au_adoption: number;
  adoption_diff: number;
  global_completeness: number;
  au_completeness: number;
  completeness_diff: number;
}

export default function OrcidFieldOfResearchPage() {
  const [allData, setAllData] = useState<SubjectCategoryRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("global");
  const [sortKey, setSortKey] = useState<SortKey>("percentage_orcid");
  const [sortAsc, setSortAsc] = useState(false);
  const [compSortKey, setCompSortKey] = useState<ComparisonSortKey>("adoption_diff");
  const [compSortAsc, setCompSortAsc] = useState(false);
  const [highlightEntity, setHighlightEntity] = useState<string | undefined>();

  useEffect(() => {
    fetch("/data/orcid/subject-category.json")
      .then((r) => r.json())
      .then((d: SubjectCategoryRow[]) => {
        setAllData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // Split data by scope
  const globalData = useMemo(() => allData.filter((d) => d.scope === "global"), [allData]);
  const auData = useMemo(() => allData.filter((d) => d.scope === "australia"), [allData]);

  // Active data for scatter depends on view mode
  const activeData = useMemo(() => {
    if (viewMode === "australia") return auData;
    return globalData;
  }, [viewMode, globalData, auData]);

  const scatterData: ScatterDataPoint[] = useMemo(
    () =>
      activeData.map((d) => ({
        entity: d.field_of_research,
        x: d.orcid_completeness,
        y: d.percentage_orcid,
        size: d.research_pool,
        group: "Field of Research",
        extraText: `Researchers: ${d.orcid_researchers.toLocaleString()} / ${d.research_pool.toLocaleString()}`,
      })),
    [activeData]
  );

  // Comparison data
  const comparisonData: ComparisonRow[] = useMemo(() => {
    const globalMap = new Map<string, SubjectCategoryRow>();
    globalData.forEach((d) => globalMap.set(d.field_of_research, d));

    return auData
      .map((au) => {
        const gl = globalMap.get(au.field_of_research);
        if (!gl) return null;
        return {
          field_of_research: au.field_of_research,
          global_adoption: gl.percentage_orcid,
          au_adoption: au.percentage_orcid,
          adoption_diff: au.percentage_orcid - gl.percentage_orcid,
          global_completeness: gl.orcid_completeness,
          au_completeness: au.orcid_completeness,
          completeness_diff: au.orcid_completeness - gl.orcid_completeness,
        };
      })
      .filter(Boolean) as ComparisonRow[];
  }, [globalData, auData]);

  // Sorted comparison data
  const sortedComparison = useMemo(() => {
    return [...comparisonData].sort((a, b) => {
      const aVal = a[compSortKey];
      const bVal = b[compSortKey];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return compSortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return compSortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [comparisonData, compSortKey, compSortAsc]);

  // Bar chart data: grouped bars for global and Australian side-by-side
  const barChartSorted = useMemo(() => {
    const globalMap = new Map<string, number>();
    globalData.forEach((d) => globalMap.set(d.field_of_research, d.percentage_orcid));

    const auMap = new Map<string, number>();
    auData.forEach((d) => auMap.set(d.field_of_research, d.percentage_orcid));

    // Get all unique fields, sort by global adoption ascending for horizontal bar
    const allFields = [...new Set([...globalMap.keys(), ...auMap.keys()])];
    return allFields
      .map((f) => ({
        field: f,
        global: globalMap.get(f) ?? 0,
        australia: auMap.get(f) ?? 0,
      }))
      .sort((a, b) => a.global - b.global);
  }, [globalData, auData]);

  // Scatter table sorting
  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(key === "field_of_research");
    }
  };

  const sortedData = useMemo(() => {
    return [...activeData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
  }, [activeData, sortKey, sortAsc]);

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return "";
    return sortAsc ? " \u25B2" : " \u25BC";
  };

  const handleCompSort = (key: ComparisonSortKey) => {
    if (compSortKey === key) {
      setCompSortAsc((prev) => !prev);
    } else {
      setCompSortKey(key);
      setCompSortAsc(key === "field_of_research");
    }
  };

  const compSortIndicator = (key: ComparisonSortKey) => {
    if (compSortKey !== key) return "";
    return compSortAsc ? " \u25B2" : " \u25BC";
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-text mb-2">
          ORCID Adoption by Field of Research
        </h1>
        <div className="animate-pulse bg-gray-200 rounded-lg h-96" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text mb-2">
        ORCID Adoption by Field of Research
      </h1>

      {/* Introductory context from the report */}
      <div className="prose prose-sm max-w-none mb-6 space-y-3">
        <p className="text-brand-muted leading-relaxed">
          ORCID adoption varies significantly by field of research. Psychology has the highest global
          adoption at 67%, while Biomedical and Clinical Sciences has the lowest at 47% with 33%
          completeness.
        </p>
        <p className="text-brand-muted leading-relaxed font-medium">
          Australian ORCID adoption exceeds the global average in most fields. The largest Australian
          advantage is in Law and Legal Studies (+28% adoption) and Creative Arts (+26% adoption).
        </p>
      </div>

      {/* View mode toggle */}
      <div className="bg-brand-surface rounded-lg border border-brand-border p-4 mb-6">
        <label className="block text-xs text-brand-muted mb-2">View</label>
        <div className="inline-flex rounded-md shadow-sm" role="group">
          {(["global", "australia", "comparison"] as ViewMode[]).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-4 py-2 text-sm font-medium border ${
                viewMode === mode
                  ? "bg-[#1f407a] text-white border-[#1f407a] z-10"
                  : "bg-white text-brand-text border-brand-border hover:bg-gray-50"
              } ${mode === "global" ? "rounded-l-md" : ""} ${
                mode === "comparison" ? "rounded-r-md" : ""
              } ${mode === "australia" ? "-ml-px" : ""} ${
                mode === "comparison" ? "-ml-px" : ""
              }`}
            >
              {mode === "global" ? "Global" : mode === "australia" ? "Australia" : "Comparison"}
            </button>
          ))}
        </div>
      </div>

      {/* Scatter plot - shown in Global and Australia modes */}
      {viewMode !== "comparison" && (
        <ChartContainer
          title={`ORCID Adoption vs Completeness by Field of Research${viewMode === "australia" ? " (Australia)" : " (Global)"}`}
          subtitle="Bubble size represents the number of researchers in each field's research pool, 2020-2024"
          source="Dimensions, ORCID. Aggregate statistics only."
          toolkitRef="Section 3.1.4"
        >
          <ScatterPlot
            data={scatterData}
            xLabel="ORCID Completeness (%)"
            yLabel="ORCID Adoption (%)"
            sizeLabel="Research Pool"
            height={500}
            highlightEntity={highlightEntity}
          />
        </ChartContainer>
      )}

      {/* Comparison table - shown in Comparison mode */}
      {viewMode === "comparison" && (
        <ChartContainer
          title="Global vs Australian ORCID Adoption by Field of Research"
          subtitle="Sorted by adoption difference. Fields where Australia leads are highlighted."
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border text-left text-brand-muted">
                  <th
                    className="pb-2 pr-3 font-medium cursor-pointer hover:text-brand-text"
                    onClick={() => handleCompSort("field_of_research")}
                  >
                    Field of Research{compSortIndicator("field_of_research")}
                  </th>
                  <th
                    className="pb-2 px-3 font-medium text-right cursor-pointer hover:text-brand-text"
                    onClick={() => handleCompSort("global_adoption")}
                  >
                    Global Adoption %{compSortIndicator("global_adoption")}
                  </th>
                  <th
                    className="pb-2 px-3 font-medium text-right cursor-pointer hover:text-brand-text"
                    onClick={() => handleCompSort("au_adoption")}
                  >
                    AU Adoption %{compSortIndicator("au_adoption")}
                  </th>
                  <th
                    className="pb-2 px-3 font-medium text-right cursor-pointer hover:text-brand-text"
                    onClick={() => handleCompSort("adoption_diff")}
                  >
                    Difference{compSortIndicator("adoption_diff")}
                  </th>
                  <th
                    className="pb-2 px-3 font-medium text-right cursor-pointer hover:text-brand-text"
                    onClick={() => handleCompSort("global_completeness")}
                  >
                    Global Completeness %{compSortIndicator("global_completeness")}
                  </th>
                  <th
                    className="pb-2 px-3 font-medium text-right cursor-pointer hover:text-brand-text"
                    onClick={() => handleCompSort("au_completeness")}
                  >
                    AU Completeness %{compSortIndicator("au_completeness")}
                  </th>
                  <th
                    className="pb-2 pl-3 font-medium text-right cursor-pointer hover:text-brand-text"
                    onClick={() => handleCompSort("completeness_diff")}
                  >
                    Difference{compSortIndicator("completeness_diff")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedComparison.map((d) => {
                  const auLeads = d.adoption_diff > 0;
                  return (
                    <tr
                      key={d.field_of_research}
                      className={`border-b border-gray-50 hover:bg-gray-50 ${
                        auLeads ? "bg-green-50/50" : ""
                      }`}
                    >
                      <td className="py-2 pr-3 font-medium">{d.field_of_research}</td>
                      <td className="py-2 px-3 text-right">{d.global_adoption.toFixed(1)}%</td>
                      <td className="py-2 px-3 text-right">{d.au_adoption.toFixed(1)}%</td>
                      <td
                        className={`py-2 px-3 text-right font-medium ${
                          d.adoption_diff > 0
                            ? "text-green-700"
                            : d.adoption_diff < 0
                            ? "text-red-600"
                            : ""
                        }`}
                      >
                        {d.adoption_diff > 0 ? "+" : ""}
                        {d.adoption_diff.toFixed(1)}%
                      </td>
                      <td className="py-2 px-3 text-right">{d.global_completeness.toFixed(1)}%</td>
                      <td className="py-2 px-3 text-right">{d.au_completeness.toFixed(1)}%</td>
                      <td
                        className={`py-2 pl-3 text-right font-medium ${
                          d.completeness_diff > 0
                            ? "text-green-700"
                            : d.completeness_diff < 0
                            ? "text-red-600"
                            : ""
                        }`}
                      >
                        {d.completeness_diff > 0 ? "+" : ""}
                        {d.completeness_diff.toFixed(1)}%
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ChartContainer>
      )}

      {/* Grouped horizontal bar chart: Global vs Australian adoption */}
      <div className="mt-6">
        <ChartContainer
          title="ORCID Adoption Rate by Field of Research"
          subtitle="Global vs Australian adoption percentage, 2020-2024"
          source="Dimensions, ORCID. Aggregate statistics only."
        >
          <Plot
            data={[
              {
                type: "bar" as const,
                orientation: "h" as const,
                y: barChartSorted.map((d) => d.field),
                x: barChartSorted.map((d) => d.global),
                name: "Global",
                text: barChartSorted.map((d) => `${d.global.toFixed(1)}%`),
                textposition: "outside" as const,
                marker: {
                  color: "#1f407a",
                },
                hovertext: barChartSorted.map(
                  (d) =>
                    `<b>${d.field}</b><br>Global Adoption: ${d.global.toFixed(1)}%`
                ),
                hoverinfo: "text" as const,
              },
              {
                type: "bar" as const,
                orientation: "h" as const,
                y: barChartSorted.map((d) => d.field),
                x: barChartSorted.map((d) => d.australia),
                name: "Australia",
                text: barChartSorted.map((d) => `${d.australia.toFixed(1)}%`),
                textposition: "outside" as const,
                marker: {
                  color: "#A6CE39",
                },
                hovertext: barChartSorted.map(
                  (d) =>
                    `<b>${d.field}</b><br>Australian Adoption: ${d.australia.toFixed(1)}%`
                ),
                hoverinfo: "text" as const,
              },
            ]}
            layout={{
              height: Math.max(600, barChartSorted.length * 36),
              margin: { l: 280, r: 80, t: 10, b: 40 },
              barmode: "group" as const,
              xaxis: {
                title: { text: "ORCID Adoption (%)" },
                ticksuffix: "%",
                range: [0, Math.max(...barChartSorted.map((d) => Math.max(d.global, d.australia))) * 1.15],
                gridcolor: "#f0f0f0",
              },
              yaxis: {
                automargin: true,
              },
              legend: {
                orientation: "h" as const,
                yanchor: "bottom" as const,
                y: 1.02,
                xanchor: "left" as const,
                x: 0,
              },
              plot_bgcolor: "#fff",
              paper_bgcolor: "#fff",
              font: { family: "var(--font-geist-sans), sans-serif", size: 12 },
              hovermode: "closest" as const,
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
      </div>

      {/* Data table */}
      <div className="mt-6">
        <ChartContainer
          title={`All Fields of Research${viewMode === "australia" ? " (Australia)" : viewMode === "comparison" ? "" : " (Global)"}`}
          subtitle={`${activeData.length} fields, sorted by ${sortKey.replace(/_/g, " ")}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border text-left text-brand-muted">
                  <th
                    className="pb-2 font-medium cursor-pointer hover:text-brand-text"
                    onClick={() => handleSort("field_of_research")}
                  >
                    Field of Research{sortIndicator("field_of_research")}
                  </th>
                  <th
                    className="pb-2 font-medium text-right cursor-pointer hover:text-brand-text"
                    onClick={() => handleSort("research_pool")}
                  >
                    Research Pool{sortIndicator("research_pool")}
                  </th>
                  <th
                    className="pb-2 font-medium text-right cursor-pointer hover:text-brand-text"
                    onClick={() => handleSort("percentage_orcid")}
                  >
                    ORCID Adoption{sortIndicator("percentage_orcid")}
                  </th>
                  <th
                    className="pb-2 font-medium text-right cursor-pointer hover:text-brand-text"
                    onClick={() => handleSort("orcid_completeness")}
                  >
                    ORCID Completeness{sortIndicator("orcid_completeness")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((d) => (
                  <tr
                    key={d.field_of_research}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                    onMouseEnter={() => setHighlightEntity(d.field_of_research)}
                    onMouseLeave={() => setHighlightEntity(undefined)}
                  >
                    <td className="py-2 font-medium">{d.field_of_research}</td>
                    <td className="py-2 text-right">{d.research_pool.toLocaleString()}</td>
                    <td className="py-2 text-right">{d.percentage_orcid.toFixed(1)}%</td>
                    <td className="py-2 text-right">{d.orcid_completeness.toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartContainer>
      </div>
    </div>
  );
}
