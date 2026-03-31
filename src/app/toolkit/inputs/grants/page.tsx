"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import ChartContainer from "@/components/charts/ChartContainer";
import MetricCard from "@/components/content/MetricCard";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface GrantRow {
  funder_url: string;
  grants: number;
}

interface GrantTimeseries {
  year: number;
  publications: number;
  pct_grant_id: number;
  pct_funder_id: number;
  pct_funder_doi_crossref: number;
  pct_grant_award_crossref: number;
}

export default function GrantsPage() {
  const [data, setData] = useState<GrantRow[]>([]);
  const [tsData, setTsData] = useState<GrantTimeseries[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/data/inputs/grants-crossref.json").then((r) => r.json()),
      fetch("/data/inputs/grants-timeseries.json").then((r) => r.json()),
    ])
      .then(([grantRows, timeseries]: [GrantRow[], GrantTimeseries[]]) => {
        setData(grantRows.sort((a, b) => b.grants - a.grants));
        setTsData(timeseries.sort((a, b) => a.year - b.year));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalGrants = useMemo(
    () => data.reduce((sum, d) => sum + d.grants, 0),
    [data]
  );

  const topFunders = useMemo(() => data.slice(0, 15), [data]);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-text mb-2">Grants</h1>
        <div className="animate-pulse bg-gray-200 rounded-lg h-96" />
      </div>
    );
  }

  const lineColors = ["#1f407a", "#e8792b", "#2ca02c", "#d62728"];
  const seriesKeys: (keyof GrantTimeseries)[] = [
    "pct_grant_id",
    "pct_funder_id",
    "pct_funder_doi_crossref",
    "pct_grant_award_crossref",
  ];
  const seriesLabels = [
    "% with Grant ID",
    "% with Funder ID",
    "% with Funder DOI (Crossref)",
    "% with Grant Award (Crossref)",
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text mb-2">Grants</h1>
      <p className="text-brand-muted mb-6">
        Grant identifiers provide persistent, machine-readable links between research funding
        awards and the publications, datasets, and other outputs they support. When publishers
        include structured grant identifiers in Crossref metadata, it becomes possible to track
        the full impact of research investment. This page examines the current state of grant
        identifier adoption in Australian research.
      </p>

      {/* Key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard
          label="Total Grants in Crossref"
          value={totalGrants.toLocaleString()}
          subtitle="Structured grant identifiers registered globally"
        />
        <MetricCard
          label="Number of Funders"
          value={data.length.toLocaleString()}
          subtitle="Organisations with grant IDs in Crossref"
        />
        <MetricCard
          label="Grant IDs registered by ARDC"
          value={90}
          subtitle="Australian grants with persistent identifiers"
          color="#F2994A"
        />
      </div>

      {/* Key insight */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-amber-900">
          <span className="font-semibold">Key insight:</span> Only 90 grant identifiers
          registered in Crossref by ARDC. Most Australian funders lack persistent grant IDs.
          While many Australian publications acknowledge grant funding in their text, very few
          use structured, persistent identifiers that enable automated tracking and reporting.
          This represents a significant gap in the PID ecosystem.
        </p>
      </div>

      {/* Horizontal bar chart of funders by grant count */}
      <ChartContainer
        title="Grant Identifiers in Crossref by Funder"
        subtitle="Top funders ranked by number of structured grant IDs registered in Crossref"
        source="Crossref Metadata."
        toolkitRef="Section 4.3"
      >
        <Plot
          data={[
            {
              y: [...topFunders].reverse().map((d) => d.funder_url),
              x: [...topFunders].reverse().map((d) => d.grants),
              type: "bar" as const,
              orientation: "h" as const,
              marker: { color: "#1f407a" },
              hovertemplate:
                "<b>%{y}</b><br>Grants: %{x:,.0f}<extra></extra>",
            },
          ]}
          layout={{
            height: Math.max(450, topFunders.length * 32),
            margin: { l: 220, r: 30, t: 10, b: 50 },
            xaxis: {
              title: { text: "Number of Grants" },
              gridcolor: "#f0f0f0",
            },
            yaxis: {
              automargin: true,
            },
            plot_bgcolor: "#fff",
            paper_bgcolor: "#fff",
            font: {
              family: "var(--font-geist-sans), sans-serif",
              size: 12,
            },
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

      {/* Multi-line chart: Grant metadata over time */}
      <div className="mt-6">
        <ChartContainer
          title="Australian Publications with Grant Information"
          subtitle="Percentage of Australian publications that include grant funding metadata, over time"
          source="Dimensions. Australian research articles 2010-2024."
        >
          <Plot
            data={seriesKeys.map((key, i) => ({
              x: tsData.map((d) => d.year),
              y: tsData.map((d) => d[key] as number),
              type: "scatter" as const,
              mode: "lines+markers" as const,
              name: seriesLabels[i],
              line: { color: lineColors[i], width: 2.5 },
              marker: { size: 5, color: lineColors[i] },
              hovertemplate: `<b>${seriesLabels[i]}</b><br>Year: %{x}<br>%{y:.1f}%<extra></extra>`,
            }))}
            layout={{
              height: 450,
              margin: { l: 60, r: 20, t: 10, b: 50 },
              xaxis: {
                title: { text: "Year" },
                dtick: 2,
                gridcolor: "#f0f0f0",
              },
              yaxis: {
                title: { text: "Percentage (%)" },
                gridcolor: "#f0f0f0",
                range: [0, 45],
              },
              plot_bgcolor: "#fff",
              paper_bgcolor: "#fff",
              font: {
                family: "var(--font-geist-sans), sans-serif",
                size: 12,
              },
              legend: {
                orientation: "h" as const,
                yanchor: "bottom" as const,
                y: -0.35,
                xanchor: "center" as const,
                x: 0.5,
                font: { size: 11 },
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
      </div>

      {/* Data table */}
      <div className="mt-6">
        <ChartContainer
          title="All Funders"
          subtitle={`${data.length} funders with grant identifiers in Crossref`}
          source="Crossref Metadata."
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border text-left text-brand-muted">
                  <th className="pb-2 font-medium">Funder URL</th>
                  <th className="pb-2 font-medium text-right">Grants</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <tr
                    key={d.funder_url}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-2 font-medium">{d.funder_url}</td>
                    <td className="py-2 text-right">{d.grants.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartContainer>
      </div>

      {/* Recipe reference */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          See Benchmarking Recipe TK-8 for the grant registration query.
        </p>
      </div>

      {/* Methodology note */}
      <div className="mt-6 bg-brand-surface rounded-lg border border-brand-border p-5">
        <h3 className="font-semibold text-brand-text mb-2">Methodology note</h3>
        <p className="text-sm text-brand-muted">
          Grant identifier data is sourced from Crossref metadata. The bar chart above shows grant
          identifiers that have been formally registered and linked to publications through
          Crossref&apos;s funder registry. The Dimensions time-series chart includes
          text-mined grant acknowledgements and reveals a larger volume of grant-linked
          publications, but structured PID-based links remain rare.
        </p>
      </div>
    </div>
  );
}
