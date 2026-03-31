"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ChartContainer from "@/components/charts/ChartContainer";
import MetricCard from "@/components/content/MetricCard";
import { basePath } from "@/lib/basepath";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface OaRatio {
  year: number;
  open_percentage: number;
  publications: number;
}

interface WorksNoPid {
  year: number;
  total_works: number;
  works_no_pid: number;
  pct_no_pid: number;
}

interface DblpConference {
  conference: string;
  papers: number;
  with_doi: number;
}

interface NoPidHeatmapRow {
  field_of_research: string;
  work_type: string;
  no_doi: number;
  total: number;
  pct_no_doi: number;
}

export default function PublicationsPage() {
  const [oaData, setOaData] = useState<OaRatio[]>([]);
  const [globalNoPid, setGlobalNoPid] = useState<WorksNoPid[]>([]);
  const [auNoPid, setAuNoPid] = useState<WorksNoPid[]>([]);
  const [dblpData, setDblpData] = useState<DblpConference[]>([]);
  const [heatmapData, setHeatmapData] = useState<NoPidHeatmapRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${basePath}/data/outputs/oa-ratio.json`).then((r) => r.json()),
      fetch(`${basePath}/data/outputs/works-no-pid-global.json`).then((r) => r.json()),
      fetch(`${basePath}/data/outputs/works-no-pid-au.json`).then((r) => r.json()),
      fetch(`${basePath}/data/outputs/dblp-conferences.json`).then((r) => r.json()),
      fetch(`${basePath}/data/outputs/no-pid-heatmap.json`).then((r) => r.json()),
    ])
      .then(([oa, global, au, dblp, heatmap]: [OaRatio[], WorksNoPid[], WorksNoPid[], DblpConference[], NoPidHeatmapRow[]]) => {
        setOaData(oa.sort((a, b) => a.year - b.year));
        setGlobalNoPid(global.sort((a, b) => a.year - b.year));
        setAuNoPid(au.sort((a, b) => a.year - b.year));
        setDblpData(dblp);
        setHeatmapData(heatmap);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-text mb-2">Publications</h1>
        <div className="animate-pulse bg-gray-200 rounded-lg h-96" />
      </div>
    );
  }

  const plotConfig = {
    responsive: true,
    displayModeBar: true,
    modeBarButtonsToRemove: ["lasso2d" as const, "select2d" as const],
    displaylogo: false,
  };

  const basePlotLayout = {
    plot_bgcolor: "#fff" as const,
    paper_bgcolor: "#fff" as const,
    font: {
      family: "var(--font-geist-sans), sans-serif",
      size: 12,
    },
    hovermode: "x unified" as const,
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text mb-2">
        Publications
      </h1>
      <p className="text-brand-muted mb-6">
        Benchmarking persistent identifier coverage across scholarly
        publications from Australian researchers and institutions. This analysis
        examines DOI adoption, Open Access trends, and PID gaps in the
        Australian publication landscape, comparing national performance against
        global benchmarks.
      </p>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard
          label="Closed Access"
          value="~35%"
          subtitle="Of Australian publications remain closed access"
        />
        <MetricCard
          label="Open Access"
          value="~65%"
          subtitle="Has plateaued at this level"
        />
        <MetricCard
          label="Key Gap"
          value="No PID"
          subtitle="Significant works still lack persistent identifiers"
        />
      </div>

      {/* Key Insights */}
      <div className="bg-brand-surface rounded-lg border border-brand-border p-5 mb-6">
        <h3 className="font-semibold text-brand-text mb-3">
          Key Insights
        </h3>
        <ul className="space-y-2 text-sm text-brand-muted">
          <li>
            Approximately <strong>35% of Australian publications</strong> remain
            closed access, limiting the reach and impact of publicly funded
            research.
          </li>
          <li>
            Open Access has <strong>plateaued at around 65%</strong>, suggesting
            that further progress will require new policy interventions or
            infrastructure investments.
          </li>
          <li>
            A significant proportion of scholarly works still lack persistent
            identifiers, creating gaps in discoverability, citation tracking,
            and research impact measurement.
          </li>
        </ul>
      </div>

      {/* Charts */}
      <div className="space-y-6">
        {/* OA Ratio Chart */}
        <ChartContainer
          title="Open Access percentage of Australian research output"
          subtitle="Proportion of publications available as Open Access over time"
          source="Dimensions. Australian research articles 2015-2024."
          toolkitRef="Section 4.5"
        >
          <Plot
            data={[
              {
                x: oaData.map((d) => d.year),
                y: oaData.map((d) => d.open_percentage),
                type: "scatter" as const,
                mode: "lines+markers" as const,
                name: "Open Access %",
                line: { color: "#1f407a", width: 3 },
                marker: { size: 6, color: "#1f407a" },
                fill: "tozeroy" as const,
                fillcolor: "rgba(31, 64, 122, 0.1)",
                hovertemplate:
                  "<b>%{x}</b><br>Open Access: %{y:.1f}%<extra></extra>",
              },
            ]}
            layout={{
              ...basePlotLayout,
              height: 400,
              margin: { l: 60, r: 20, t: 10, b: 50 },
              xaxis: {
                title: { text: "Year" },
                dtick: 1,
                gridcolor: "#f0f0f0",
              },
              yaxis: {
                title: { text: "Open Access (%)" },
                gridcolor: "#f0f0f0",
                range: [0, 100],
              },
            }}
            config={plotConfig}
            style={{ width: "100%" }}
          />
        </ChartContainer>

        {/* Global Works No PID */}
        <ChartContainer
          title="Global works with no persistent identifier"
          subtitle="Global trend of scholarly works lacking a PID"
          source="Dimensions. Global scholarly works 2014-2023."
          toolkitRef="Section 4.5"
        >
          <Plot
            data={[
              {
                x: globalNoPid.map((d) => d.year),
                y: globalNoPid.map((d) => d.pct_no_pid),
                type: "scatter" as const,
                mode: "lines+markers" as const,
                name: "% with no PID",
                line: { color: "#d62728", width: 3 },
                marker: { size: 6, color: "#d62728" },
                hovertemplate:
                  "<b>%{x}</b><br>No PID: %{y:.1f}%<extra></extra>",
              },
            ]}
            layout={{
              ...basePlotLayout,
              height: 400,
              margin: { l: 60, r: 20, t: 10, b: 50 },
              xaxis: {
                title: { text: "Year" },
                dtick: 1,
                gridcolor: "#f0f0f0",
              },
              yaxis: {
                title: { text: "Works with no PID (%)" },
                gridcolor: "#f0f0f0",
                range: [0, Math.max(...globalNoPid.map((d) => d.pct_no_pid)) + 5],
              },
            }}
            config={plotConfig}
            style={{ width: "100%" }}
          />
        </ChartContainer>

        {/* AU Works No PID */}
        <ChartContainer
          title="Australian works with no persistent identifier"
          subtitle="Australian-specific trend of works lacking a PID"
          source="Dimensions. Australian scholarly works 2014-2023."
          toolkitRef="Section 4.5"
        >
          <Plot
            data={[
              {
                x: auNoPid.map((d) => d.year),
                y: auNoPid.map((d) => d.pct_no_pid),
                type: "scatter" as const,
                mode: "lines+markers" as const,
                name: "% with no PID",
                line: { color: "#e8792b", width: 3 },
                marker: { size: 6, color: "#e8792b" },
                hovertemplate:
                  "<b>%{x}</b><br>No PID: %{y:.1f}%<extra></extra>",
              },
            ]}
            layout={{
              ...basePlotLayout,
              height: 400,
              margin: { l: 60, r: 20, t: 10, b: 50 },
              xaxis: {
                title: { text: "Year" },
                dtick: 1,
                gridcolor: "#f0f0f0",
              },
              yaxis: {
                title: { text: "Works with no PID (%)" },
                gridcolor: "#f0f0f0",
                range: [0, Math.max(...auNoPid.map((d) => d.pct_no_pid)) + 5],
              },
            }}
            config={plotConfig}
            style={{ width: "100%" }}
          />
        </ChartContainer>

        {/* dblp Conferences DOI Coverage Table */}
        {dblpData.length > 0 && (
          <ChartContainer
            title="DOI Coverage in Major Computer Science Conferences (dblp)"
            subtitle="Top conferences by paper count and their DOI assignment rates"
            source="dblp. 2024 conference proceedings."
            recipeLink="/recipes"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-border text-left text-brand-muted">
                    <th className="pb-2 font-medium">Conference</th>
                    <th className="pb-2 font-medium text-right">Papers</th>
                    <th className="pb-2 font-medium text-right">With DOI</th>
                    <th className="pb-2 font-medium text-right">DOI Coverage</th>
                  </tr>
                </thead>
                <tbody>
                  {dblpData.map((d) => {
                    const coverage = d.papers > 0 ? (d.with_doi / d.papers) * 100 : 0;
                    const isZeroCoverage = coverage === 0;
                    return (
                      <tr
                        key={d.conference}
                        className={`border-b border-gray-50 hover:bg-gray-50 ${isZeroCoverage ? "bg-red-50" : ""}`}
                      >
                        <td className="py-2 font-medium">{d.conference}</td>
                        <td className="py-2 text-right">
                          {d.papers.toLocaleString()}
                        </td>
                        <td className="py-2 text-right">
                          {d.with_doi.toLocaleString()}
                        </td>
                        <td className={`py-2 text-right ${isZeroCoverage ? "text-red-600 font-bold" : ""}`}>
                          {coverage.toFixed(1)}%
                          {isZeroCoverage && (
                            <span className="ml-1 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                              0%
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </ChartContainer>
        )}

        {/* No-PID Heatmap */}
        {heatmapData.length > 0 && (() => {
          const workTypes = [...new Set(heatmapData.map((d) => d.work_type))].sort();
          const fields = [...new Set(heatmapData.map((d) => d.field_of_research))].sort();

          // Build the z-matrix: rows = fields, columns = work_types
          const zMatrix = fields.map((field) =>
            workTypes.map((wt) => {
              const match = heatmapData.find(
                (d) => d.field_of_research === field && d.work_type === wt
              );
              return match ? match.pct_no_doi : null;
            })
          );

          // Custom hover text
          const hoverText = fields.map((field) =>
            workTypes.map((wt) => {
              const match = heatmapData.find(
                (d) => d.field_of_research === field && d.work_type === wt
              );
              if (!match) return "";
              return `${field}<br>${wt}<br>No DOI: ${match.pct_no_doi}% (${match.no_doi.toLocaleString()} of ${match.total.toLocaleString()})`;
            })
          );

          return (
            <ChartContainer
              title="Works with no DOI by Field of Research and Type (2024)"
              subtitle="Percentage of Australian scholarly works lacking a DOI, by ANZSRC Field of Research and work type"
              source="Dimensions. Australian scholarly works in 2024, by Field of Research and work type."
              recipeLink="/recipes"
            >
              <Plot
                data={[
                  {
                    z: zMatrix,
                    x: workTypes,
                    y: fields,
                    type: "heatmap" as const,
                    colorscale: [
                      [0, "#f0f9e8"],
                      [0.5, "#fdae61"],
                      [1, "#d73027"],
                    ],
                    text: hoverText as unknown as string[],
                    hovertemplate: "%{text}<extra></extra>",
                    colorbar: {
                      title: { text: "% No DOI", side: "right" as const },
                      ticksuffix: "%",
                    },
                    xgap: 2,
                    ygap: 2,
                  },
                ]}
                layout={{
                  ...basePlotLayout,
                  height: Math.max(500, fields.length * 28),
                  margin: { l: 280, r: 80, t: 10, b: 80 },
                  xaxis: {
                    title: { text: "Work Type" },
                    side: "bottom" as const,
                  },
                  yaxis: {
                    automargin: true,
                  },
                }}
                config={plotConfig}
                style={{ width: "100%" }}
              />
            </ChartContainer>
          );
        })()}
      </div>
    </div>
  );
}
