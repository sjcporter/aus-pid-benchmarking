"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ChartContainer from "@/components/charts/ChartContainer";
import MetricCard from "@/components/content/MetricCard";
import { basePath } from "@/lib/basepath";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface RaidCount {
  name: string;
  count: number;
}

export default function ActivitiesPage() {
  const [data, setData] = useState<RaidCount[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${basePath}/data/inputs/raid-count.json`)
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalRaids = data.reduce((sum, d) => sum + d.count, 0);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-text mb-2">Research Activities (RAiD)</h1>
        <div className="animate-pulse bg-gray-200 rounded-lg h-96" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text mb-2">Research Activities (RAiD)</h1>
      <p className="text-brand-muted mb-6">
        The Research Activity Identifier (RAiD) is a persistent identifier for research projects
        and activities, designed to connect the people, organisations, outputs, and funding
        associated with a research endeavour. RAiD is an Australian-led initiative managed by the
        Australian Research Data Commons (ARDC).
      </p>

      {/* Key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <MetricCard
          label="Total RAiDs created"
          value={totalRaids}
          subtitle="Across all registered organisations"
        />
        <MetricCard
          label="Organisations using RAiD"
          value={data.length}
          subtitle="Institutions that have minted at least one RAiD"
          color="#2D9CDB"
        />
      </div>

      {/* Key insight */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-amber-900">
          <span className="font-semibold">Key insight:</span> Only 69 RAiDs have been created in
          total — adoption is at a very early stage. The vast majority were minted by a single
          institution (The University of Notre Dame Australia), indicating that while the
          infrastructure exists, broader uptake across the sector has not yet begun.
        </p>
      </div>

      {/* Bar chart of RAiD counts by organisation */}
      <ChartContainer
        title="RAiD Counts by Organisation"
        subtitle="Number of Research Activity Identifiers minted per institution"
        source="ARDC RAiD registry."
        toolkitRef="Section 4.5"
      >
        <Plot
          data={[
            {
              y: [...data].reverse().map((d) => d.name),
              x: [...data].reverse().map((d) => d.count),
              type: "bar" as const,
              orientation: "h" as const,
              marker: { color: "#1f407a" },
              hovertemplate:
                "<b>%{y}</b><br>RAiDs: %{x}<extra></extra>",
            },
          ]}
          layout={{
            height: Math.max(250, data.length * 50),
            margin: { l: 280, r: 20, t: 10, b: 50 },
            xaxis: {
              title: { text: "Number of RAiDs" },
              gridcolor: "#f0f0f0",
            },
            yaxis: {
              automargin: true,
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

      {/* Data table */}
      <div className="mt-6">
        <ChartContainer
          title="RAiD Registration Detail"
          subtitle="All organisations with registered RAiDs"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border text-left text-brand-muted">
                  <th className="pb-2 font-medium">Organisation</th>
                  <th className="pb-2 font-medium text-right">RAiDs Created</th>
                  <th className="pb-2 font-medium text-right">Share of Total</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <tr
                    key={d.name}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-2 font-medium">{d.name}</td>
                    <td className="py-2 text-right">{d.count}</td>
                    <td className="py-2 text-right">
                      {totalRaids > 0
                        ? `${((d.count / totalRaids) * 100).toFixed(1)}%`
                        : "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-brand-border font-semibold">
                  <td className="pt-2">Total</td>
                  <td className="pt-2 text-right">{totalRaids}</td>
                  <td className="pt-2 text-right">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </ChartContainer>
      </div>
    </div>
  );
}
