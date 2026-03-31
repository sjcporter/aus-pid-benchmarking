"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import ChartContainer from "@/components/charts/ChartContainer";
import MetricCard from "@/components/content/MetricCard";
import { basePath } from "@/lib/basepath";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface InstrumentRecord {
  client_id: string;
  name: string;
  instruments: number;
}

const AUSTRALIAN_CLIENT_IDS = [
  "uniwa.repo",
  "pawsey.repo",
  "uq.repo",
  "ardcx.curtin",
];

export default function InstrumentsPage() {
  const [data, setData] = useState<InstrumentRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${basePath}/data/inputs/instruments.json`)
      .then((r) => r.json())
      .then((d: InstrumentRecord[]) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalInstruments = useMemo(
    () => data.reduce((sum, d) => sum + d.instruments, 0),
    [data]
  );

  const australianData = useMemo(
    () => data.filter((d) => AUSTRALIAN_CLIENT_IDS.includes(d.client_id)),
    [data]
  );

  const australianInstruments = useMemo(
    () => australianData.reduce((sum, d) => sum + d.instruments, 0),
    [australianData]
  );

  const sortedData = useMemo(
    () => [...data].sort((a, b) => a.instruments - b.instruments),
    [data]
  );

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-text mb-2">Instruments</h1>
        <div className="animate-pulse bg-gray-200 rounded-lg h-96" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text mb-2">Instruments</h1>
      <p className="text-brand-muted mb-6">
        Persistent identifiers for research instruments registered in DataCite.
        Instrument PIDs enable tracking of equipment usage, linking outputs to
        the instruments that produced them, and supporting reproducibility.
      </p>

      {/* Key insight */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-amber-900">
          <span className="font-semibold">Key insight:</span> 69 Australian
          instruments registered in DataCite — 36% of the 191 instruments with the
          current &apos;Instrument&apos; resource type, or 14% of all 484 instrument registrations
          including legacy entries. This represents a significant opportunity for
          Australian institutions to improve instrument discoverability and tracking.
        </p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          label="Global Instruments (current)"
          value={totalInstruments.toLocaleString()}
          subtitle="Current 'Instrument' resource type (484 including legacy)"
          color="#1f407a"
        />
        <MetricCard
          label="Australian Instruments"
          value={australianInstruments.toLocaleString()}
          subtitle={`${((australianInstruments / totalInstruments) * 100).toFixed(0)}% of global total`}
          color="#A6CE39"
        />
        <MetricCard
          label="Repositories"
          value={data.length}
          subtitle="With instrument registrations"
        />
        <MetricCard
          label="Australian Repositories"
          value={australianData.length}
          subtitle="Contributing instrument PIDs"
          color="#47AB4C"
        />
      </div>

      {/* Horizontal bar chart */}
      <ChartContainer
        title="Instruments Registered by Repository"
        subtitle="Count of instrument PIDs registered in DataCite, by repository"
        source="DataCite API. Instrument registrations as of 2025."
        toolkitRef="Section 5.7"
        recipeLink="/recipes"
      >
        <Plot
          data={[
            {
              type: "bar",
              orientation: "h",
              y: sortedData.map((d) => d.name),
              x: sortedData.map((d) => d.instruments),
              marker: {
                color: sortedData.map((d) =>
                  AUSTRALIAN_CLIENT_IDS.includes(d.client_id)
                    ? "#A6CE39"
                    : "#1f407a"
                ),
              },
              hovertemplate: "%{y}<br>Instruments: %{x}<extra></extra>",
            },
          ]}
          layout={{
            height: Math.max(400, sortedData.length * 40),
            margin: { l: 300, r: 40, t: 20, b: 50 },
            xaxis: {
              title: { text: "Number of Instruments" },
              gridcolor: "#e5e7eb",
            },
            yaxis: {
              automargin: true,
            },
            paper_bgcolor: "transparent",
            plot_bgcolor: "transparent",
            font: { family: "inherit", size: 12, color: "#374151" },
          }}
          config={{ responsive: true, displayModeBar: false }}
          style={{ width: "100%" }}
        />
        <p className="text-xs text-brand-muted mt-2">
          Australian repositories are highlighted in green.
        </p>
      </ChartContainer>

      {/* Data table */}
      <div className="mt-6">
        <ChartContainer
          title="All Instrument Registrations"
          subtitle="Complete list of repositories with instrument PIDs in DataCite"
          recipeLink="/recipes"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border text-left text-brand-muted">
                  <th className="pb-2 font-medium">Repository</th>
                  <th className="pb-2 font-medium">Client ID</th>
                  <th className="pb-2 font-medium text-right">Instruments</th>
                  <th className="pb-2 font-medium text-right">Share</th>
                </tr>
              </thead>
              <tbody>
                {[...data]
                  .sort((a, b) => b.instruments - a.instruments)
                  .map((d) => (
                    <tr
                      key={d.client_id}
                      className={`border-b border-gray-50 hover:bg-gray-50 ${
                        AUSTRALIAN_CLIENT_IDS.includes(d.client_id)
                          ? "bg-green-50"
                          : ""
                      }`}
                    >
                      <td className="py-2 font-medium">{d.name}</td>
                      <td className="py-2 text-brand-muted">{d.client_id}</td>
                      <td className="py-2 text-right">
                        {d.instruments.toLocaleString()}
                      </td>
                      <td className="py-2 text-right">
                        {((d.instruments / totalInstruments) * 100).toFixed(1)}%
                      </td>
                    </tr>
                  ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-brand-border font-semibold">
                  <td className="py-2">Total</td>
                  <td className="py-2"></td>
                  <td className="py-2 text-right">
                    {totalInstruments.toLocaleString()}
                  </td>
                  <td className="py-2 text-right">100%</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </ChartContainer>
      </div>
    </div>
  );
}
