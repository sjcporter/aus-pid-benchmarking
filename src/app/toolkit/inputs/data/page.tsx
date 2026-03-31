"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import ChartContainer from "@/components/charts/ChartContainer";
import MetricCard from "@/components/content/MetricCard";
import { basePath } from "@/lib/basepath";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface CountryRow {
  country: string;
  total: number;
  [pid: string]: string | number;
}

interface RepoData {
  pid_systems: string[];
  countries: CountryRow[];
}

export default function DataPage() {
  const [data, setData] = useState<RepoData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${basePath}/data/inputs/repositories-pid-systems.json`)
      .then((r) => r.json())
      .then((d: RepoData) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const top20 = useMemo(() => {
    if (!data) return [];
    return [...data.countries]
      .sort((a, b) => b.total - a.total)
      .slice(0, 20);
  }, [data]);

  const australiaRow = useMemo(
    () => data?.countries.find((c) => c.country === "AUS") ?? null,
    [data]
  );

  const australiaRank = useMemo(() => {
    if (!data) return 0;
    const sorted = [...data.countries].sort((a, b) => b.total - a.total);
    return sorted.findIndex((c) => c.country === "AUS") + 1;
  }, [data]);

  const totalRepos = useMemo(
    () => data?.countries.reduce((sum, c) => sum + c.total, 0) ?? 0,
    [data]
  );

  // Heatmap data: reversed so the top country appears at the top
  const heatmapZ = useMemo(() => {
    if (!data) return [];
    const reversed = [...top20].reverse();
    return reversed.map((c) =>
      data.pid_systems.map((pid) => (c[pid] as number) || 0)
    );
  }, [data, top20]);

  const heatmapY = useMemo(() => [...top20].reverse().map((c) => c.country), [top20]);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-text mb-2">
          Research Data
        </h1>
        <div className="animate-pulse bg-gray-200 rounded-lg h-96" />
      </div>
    );
  }

  if (!data) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-text mb-2">
          Research Data
        </h1>
        <p className="text-brand-muted">Failed to load data.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text mb-2">
        Research Data
      </h1>
      <p className="text-brand-muted mb-1">
        Distribution of persistent identifier systems used across research data
        repositories worldwide. This analysis shows which PID systems (DOI, ARK,
        Handle, etc.) are adopted by repositories in each country, based on
        re3data registry information.
      </p>
      <p className="text-xs italic text-gray-400 mt-2 mb-6">
        Analysis summary generated with AI assistance
      </p>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Total Repositories"
          value={totalRepos.toLocaleString()}
          subtitle="Across all countries"
        />
        <MetricCard
          label="Countries"
          value={data.countries.length.toLocaleString()}
          subtitle="With registered repositories"
        />
        <MetricCard
          label="Australia Repositories"
          value={australiaRow?.total.toLocaleString() ?? "N/A"}
          subtitle={`Ranked #${australiaRank} globally`}
        />
        <MetricCard
          label="PID Systems Tracked"
          value={data.pid_systems.length}
          subtitle="Including DOI, ARK, Handle, IGSN"
        />
      </div>

      {/* Heatmap */}
      <ChartContainer
        title="Repository PID Systems by Country (Top 20)"
        subtitle="Number of repositories using each PID system, by country"
        source="re3data.org - Registry of Research Data Repositories."
        toolkitRef="Section 2.6"
        recipeLink="/recipes"
      >
        <Plot
          data={[
            {
              z: heatmapZ,
              x: data.pid_systems,
              y: heatmapY,
              type: "heatmap" as const,
              colorscale: [
                [0, "#f7fbff"],
                [0.1, "#deebf7"],
                [0.25, "#9ecae1"],
                [0.5, "#4292c6"],
                [0.75, "#2171b5"],
                [1, "#08306b"],
              ],
              hovertemplate:
                "<b>%{y}</b><br>PID: %{x}<br>Repositories: %{z}<extra></extra>",
              colorbar: {
                title: { text: "Repositories", side: "right" as const },
                thickness: 15,
              },
            },
          ]}
          layout={{
            height: 600,
            margin: { l: 60, r: 80, t: 10, b: 60 },
            xaxis: {
              title: { text: "PID System" },
              tickangle: -45,
            },
            yaxis: {
              title: { text: "" },
              automargin: true,
            },
            plot_bgcolor: "#fff",
            paper_bgcolor: "#fff",
            font: {
              family: "var(--font-geist-sans), sans-serif",
              size: 12,
            },
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

      {/* Data Table */}
      <div className="mt-6">
        <ChartContainer
          title="Repository Counts by Country and PID System"
          source="re3data.org - Registry of Research Data Repositories."
          recipeLink="/recipes"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border text-left text-brand-muted">
                  <th className="pb-2 font-medium">Country</th>
                  <th className="pb-2 font-medium text-right">Total</th>
                  {data.pid_systems.map((pid) => (
                    <th key={pid} className="pb-2 font-medium text-right">
                      {pid}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {top20.map((c) => (
                  <tr
                    key={c.country}
                    className={`border-b border-gray-50 hover:bg-gray-50 ${
                      c.country === "AUS" ? "bg-blue-50 font-medium" : ""
                    }`}
                  >
                    <td className="py-2 font-medium">{c.country}</td>
                    <td className="py-2 text-right">
                      {c.total.toLocaleString()}
                    </td>
                    {data.pid_systems.map((pid) => (
                      <td key={pid} className="py-2 text-right">
                        {((c[pid] as number) || 0).toLocaleString()}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartContainer>
      </div>

      {/* Key Insights */}
      <div className="mt-6 bg-brand-surface rounded-lg border border-brand-border p-5">
        <h3 className="font-semibold text-brand-text mb-3">
          Key Insights: Australia&apos;s Position
        </h3>
        <ul className="space-y-2 text-sm text-brand-muted">
          <li>
            Australia ranks <strong>#{australiaRank}</strong> globally with{" "}
            <strong>{australiaRow?.total.toLocaleString()}</strong> registered
            research data repositories, placing it among the top tier of
            research-intensive nations.
          </li>
          <li>
            DOI is the dominant PID system globally, but a significant number of
            repositories in every country still use{" "}
            <strong>no persistent identifiers</strong> (&quot;none&quot; column),
            representing a major gap in research data discoverability.
          </li>
          <li>
            Australia has{" "}
            <strong>
              {australiaRow
                ? ((australiaRow["DOI"] as number) || 0).toLocaleString()
                : "N/A"}
            </strong>{" "}
            repositories using DOIs, accounting for{" "}
            {australiaRow
              ? (
                  (((australiaRow["DOI"] as number) || 0) / australiaRow.total) *
                  100
                ).toFixed(1)
              : "N/A"}
            % of its total -- indicating relatively strong DOI adoption compared
            to many peer countries.
          </li>
          <li>
            Handle (hdl) remains a commonly used system across all countries,
            reflecting legacy infrastructure from institutional repository
            platforms.
          </li>
        </ul>
        <p className="text-xs italic text-gray-400 mt-2">
          Analysis summary generated with AI assistance
        </p>
      </div>
    </div>
  );
}
