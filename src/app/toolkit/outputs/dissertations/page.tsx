"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import ChartContainer from "@/components/charts/ChartContainer";
import MetricCard from "@/components/content/MetricCard";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface DissertationRow {
  client_id: string;
  repository: string;
  dissertations: number;
}

interface CountryRow {
  country: string | null;
  dissertations: number;
}

interface AuOrcidRorRow {
  client_id: string;
  repository: string;
  dissertations: number;
  with_orcid: number;
  with_ror: number;
  pct_orcid: number;
  pct_ror: number;
}

const COUNTRY_NAMES: Record<string, string> = {
  BR: "Brazil",
  US: "United States",
  AU: "Australia",
  DE: "Germany",
  GB: "United Kingdom",
  NL: "Netherlands",
  CO: "Colombia",
  AT: "Austria",
  ES: "Spain",
  CH: "Switzerland",
  SA: "Saudi Arabia",
  PL: "Poland",
  CN: "China",
  NZ: "New Zealand",
  IE: "Ireland",
  PA: "Panama",
};

export default function DissertationsPage() {
  const [data, setData] = useState<DissertationRow[]>([]);
  const [countryData, setCountryData] = useState<CountryRow[]>([]);
  const [auOrcidRorData, setAuOrcidRorData] = useState<AuOrcidRorRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/data/outputs/dissertations.json").then((r) => r.json()),
      fetch("/data/outputs/dissertations-by-country.json").then((r) => r.json()),
      fetch("/data/outputs/dissertations-au-orcid-ror.json").then((r) => r.json()),
    ])
      .then(([diss, countries, auOrcidRor]: [DissertationRow[], CountryRow[], AuOrcidRorRow[]]) => {
        setData(diss);
        setCountryData(countries);
        setAuOrcidRorData(auOrcidRor.sort((a, b) => b.dissertations - a.dissertations));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalDissertations = useMemo(
    () => data.reduce((sum, d) => sum + d.dissertations, 0),
    [data]
  );

  const top20 = useMemo(() => {
    return [...data]
      .sort((a, b) => b.dissertations - a.dissertations)
      .slice(0, 20);
  }, [data]);

  const top10Countries = useMemo(() => {
    return countryData
      .filter((d) => d.country !== null)
      .sort((a, b) => b.dissertations - a.dissertations)
      .slice(0, 10);
  }, [countryData]);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-text mb-2">
          Dissertations
        </h1>
        <div className="animate-pulse bg-gray-200 rounded-lg h-96" />
      </div>
    );
  }

  if (!data.length) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-text mb-2">
          Dissertations
        </h1>
        <p className="text-brand-muted">Failed to load data.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text mb-2">
        Dissertations
      </h1>
      <p className="text-brand-muted mb-6">
        Benchmarking DOI adoption for dissertations and theses across
        repositories worldwide. This analysis measures how well universities and
        institutional repositories are assigning persistent identifiers to
        graduate research outputs, enabling long-term discoverability and
        citation tracking.
      </p>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard
          label="Total Dissertations with DOIs"
          value={totalDissertations.toLocaleString()}
          subtitle="Across all repositories globally"
        />
        <MetricCard
          label="Repositories"
          value={data.length.toLocaleString()}
          subtitle="With registered dissertations"
        />
        <MetricCard
          label="Australia"
          value="75,210"
          subtitle="3rd globally for dissertations with DOIs"
        />
      </div>

      {/* Horizontal Bar Chart - Top 20 */}
      <ChartContainer
        title="Top 20 Repositories by Dissertation Count"
        subtitle="Repositories with the most dissertations assigned DOIs"
        source="DataCite, Crossref."
        toolkitRef="Section 4.4"
        recipeLink="/recipes"
      >
        <Plot
          data={[
            {
              type: "bar" as const,
              orientation: "h" as const,
              y: [...top20].reverse().map((d) => d.repository),
              x: [...top20].reverse().map((d) => d.dissertations),
              marker: {
                color: "#1f407a",
              },
              hovertemplate:
                "<b>%{y}</b><br>Dissertations: %{x:,}<extra></extra>",
            },
          ]}
          layout={{
            height: 600,
            margin: { l: 280, r: 40, t: 10, b: 50 },
            xaxis: {
              title: { text: "Dissertations" },
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
          title="Dissertations by Repository"
          source="DataCite, Crossref."
          recipeLink="/recipes"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border text-left text-brand-muted">
                  <th className="pb-2 font-medium">Repository</th>
                  <th className="pb-2 font-medium">Client ID</th>
                  <th className="pb-2 font-medium text-right">Dissertations</th>
                </tr>
              </thead>
              <tbody>
                {[...data]
                  .sort((a, b) => b.dissertations - a.dissertations)
                  .map((d) => (
                    <tr
                      key={d.client_id}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      <td className="py-2 font-medium">{d.repository}</td>
                      <td className="py-2 text-brand-muted">{d.client_id}</td>
                      <td className="py-2 text-right">
                        {d.dissertations.toLocaleString()}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </ChartContainer>
      </div>

      {/* Dissertations by Country - Horizontal Bar Chart */}
      {top10Countries.length > 0 && (
        <div className="mt-6">
          <ChartContainer
            title="Dissertations by Country (Top 10)"
            subtitle="Countries with the most dissertations assigned DOIs via DataCite"
            source="DataCite."
            recipeLink="/recipes"
          >
            <Plot
              data={[
                {
                  type: "bar" as const,
                  orientation: "h" as const,
                  y: [...top10Countries]
                    .reverse()
                    .map((d) => COUNTRY_NAMES[d.country!] ?? d.country!),
                  x: [...top10Countries].reverse().map((d) => d.dissertations),
                  marker: {
                    color: [...top10Countries]
                      .reverse()
                      .map((d) =>
                        d.country === "AU" ? "#47AB4C" : "#1f407a"
                      ),
                  },
                  hovertemplate:
                    "<b>%{y}</b><br>Dissertations: %{x:,}<extra></extra>",
                },
              ]}
              layout={{
                height: 420,
                margin: { l: 160, r: 40, t: 10, b: 50 },
                xaxis: {
                  title: { text: "Dissertations with DOIs" },
                  gridcolor: "#f0f0f0",
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
        </div>
      )}

      {/* Australian Repository PID Interoperability for Dissertations */}
      {auOrcidRorData.length > 0 && (
        <div className="mt-6">
          <ChartContainer
            title="Australian Repository PID Interoperability for Dissertations"
            subtitle="ORCID and ROR adoption rates across Australian dissertation repositories"
            source="DataCite."
            recipeLink="/recipes"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-border text-left text-brand-muted">
                    <th className="pb-2 pr-4 font-medium">Repository</th>
                    <th className="pb-2 px-4 font-medium text-right">Dissertations</th>
                    <th className="pb-2 px-4 font-medium text-right">With ORCID</th>
                    <th className="pb-2 px-4 font-medium text-right">% ORCID</th>
                    <th className="pb-2 px-4 font-medium text-right">With ROR</th>
                    <th className="pb-2 pl-4 font-medium text-right">% ROR</th>
                  </tr>
                </thead>
                <tbody>
                  {auOrcidRorData.map((d) => {
                    const isHighOrcid = d.pct_orcid >= 50;
                    const isHighRor = d.pct_ror >= 50;
                    return (
                      <tr
                        key={d.client_id}
                        className="border-b border-gray-50 hover:bg-gray-50"
                      >
                        <td className="py-2 pr-4 font-medium">{d.repository}</td>
                        <td className="py-2 px-4 text-right">
                          {d.dissertations.toLocaleString()}
                        </td>
                        <td className="py-2 px-4 text-right">
                          {d.with_orcid.toLocaleString()}
                        </td>
                        <td className={`py-2 px-4 text-right font-medium ${isHighOrcid ? "text-green-700" : "text-brand-muted"}`}>
                          {d.pct_orcid.toFixed(1)}%
                        </td>
                        <td className="py-2 px-4 text-right">
                          {d.with_ror.toLocaleString()}
                        </td>
                        <td className={`py-2 pl-4 text-right font-medium ${isHighRor ? "text-green-700" : "text-brand-muted"}`}>
                          {d.pct_ror.toFixed(1)}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </ChartContainer>
        </div>
      )}

      {/* Key Insights */}
      <div className="mt-6 bg-brand-surface rounded-lg border border-brand-border p-5">
        <h3 className="font-semibold text-brand-text mb-3">
          Key Insights: Australia&apos;s Position
        </h3>
        <ul className="space-y-2 text-sm text-brand-muted">
          <li>
            Australia is the <strong>3rd largest publisher</strong> of
            dissertations with DOIs globally, with{" "}
            <strong>75,210 dissertations</strong> registered across its
            institutional repositories.
          </li>
          <li>
            Australian universities are strong adopters of DOIs for theses and
            dissertations, reflecting well-established institutional repository
            infrastructure and metadata practices.
          </li>
          <li>
            The global landscape is dominated by a long tail of repositories,
            with the top 20 accounting for a significant share of all
            dissertation DOIs.
          </li>
        </ul>
      </div>
    </div>
  );
}
