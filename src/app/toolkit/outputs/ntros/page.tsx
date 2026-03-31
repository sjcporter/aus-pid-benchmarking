"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import ChartContainer from "@/components/charts/ChartContainer";
import MetricCard from "@/components/content/MetricCard";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface NtroRow {
  resource_type: string;
  works: number;
}

export default function NtrosPage() {
  const [data, setData] = useState<NtroRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/data/outputs/ntros.json")
      .then((r) => r.json())
      .then((d: NtroRow[]) => {
        setData(d.sort((a, b) => b.works - a.works));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalWorks = useMemo(
    () => data.reduce((sum, d) => sum + d.works, 0),
    [data]
  );

  const topType = useMemo(
    () => (data.length > 0 ? data[0] : null),
    [data]
  );

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-text mb-2">
          Non-Traditional Research Outputs (NTROs)
        </h1>
        <div className="animate-pulse bg-gray-200 rounded-lg h-96" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text mb-2">
        Non-Traditional Research Outputs (NTROs)
      </h1>
      <p className="text-brand-muted mb-6">
        Non-Traditional Research Outputs encompass a broad range of scholarly
        work beyond journal articles, including datasets, software, creative
        works, and other output types. Persistent identifiers enable these
        diverse outputs to be discovered, cited, and linked to their creators.
      </p>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard
          label="Total Works"
          value={totalWorks.toLocaleString()}
          subtitle={`Across ${data.length} resource types`}
        />
        <MetricCard
          label="Largest Category"
          value={topType ? topType.resource_type : "N/A"}
          subtitle={
            topType ? `${topType.works.toLocaleString()} works` : ""
          }
        />
        <MetricCard
          label="Resource Types"
          value={data.length.toLocaleString()}
          subtitle="Distinct output categories"
        />
      </div>

      {/* Horizontal Bar Chart with Log Scale */}
      <ChartContainer
        title="Works by Resource Type"
        subtitle="Logarithmic scale due to large variation in work counts across types"
        source="DataCite. Resource types from DataCite metadata, 2020-2024."
      >
        <Plot
          data={[
            {
              y: [...data].reverse().map((d) => d.resource_type),
              x: [...data].reverse().map((d) => d.works),
              type: "bar" as const,
              orientation: "h" as const,
              marker: {
                color: [...data].reverse().map((_, i) => {
                  const colors = [
                    "#1f407a",
                    "#2d5a9e",
                    "#3b74c2",
                    "#5a8fd4",
                    "#7aabe0",
                    "#A6CE39",
                    "#b8d86a",
                    "#cae29b",
                  ];
                  return colors[i % colors.length];
                }),
              },
              hovertemplate:
                "<b>%{y}</b><br>Works: %{x:,.0f}<extra></extra>",
            },
          ]}
          layout={{
            height: Math.max(500, data.length * 32),
            margin: { l: 200, r: 30, t: 10, b: 50 },
            xaxis: {
              title: { text: "Number of Works" },
              type: "log" as const,
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

      {/* Data Table */}
      <div className="mt-6">
        <ChartContainer
          title="All Resource Types"
          source="DataCite. Resource types from DataCite metadata, 2020-2024."
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border text-left text-brand-muted">
                  <th className="pb-2 font-medium">Resource Type</th>
                  <th className="pb-2 font-medium text-right">Total Works</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <tr
                    key={d.resource_type}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-2 font-medium">{d.resource_type}</td>
                    <td className="py-2 text-right">
                      {d.works.toLocaleString()}
                    </td>
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
