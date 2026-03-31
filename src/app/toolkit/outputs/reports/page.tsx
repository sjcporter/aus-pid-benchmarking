"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import ChartContainer from "@/components/charts/ChartContainer";
import MetricCard from "@/components/content/MetricCard";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface ReportRow {
  client_id: string;
  repository: string;
  reports: number;
}

interface ReportOrcidRorRow {
  client_id: string;
  repository: string;
  reports: number;
  with_orcid: number;
  with_ror: number;
  pct_orcid: number;
  pct_ror: number;
}

const AUSTRALIAN_KEYWORDS = [
  "australia",
  "rmit",
  "la trobe",
  "unsw",
  "swinburne",
  "monash",
  "melbourne",
  "sydney",
  "queensland",
  "adelaide",
  "western sydney",
  "curtin",
  "deakin",
  "griffith",
  "macquarie",
  "newcastle",
  "tasmania",
  "wollongong",
  "flinders",
  "charles sturt",
  "canberra",
  "james cook",
  "reserve bank",
];

const AUSTRALIAN_CLIENT_PREFIXES = ["ardcx.", "ardc."];

function isAustralian(row: ReportRow): boolean {
  const repoLower = row.repository.toLowerCase();
  const clientLower = row.client_id.toLowerCase();
  if (AUSTRALIAN_KEYWORDS.some((kw) => repoLower.includes(kw))) return true;
  if (AUSTRALIAN_CLIENT_PREFIXES.some((prefix) => clientLower.startsWith(prefix))) return true;
  return false;
}

export default function ReportsPage() {
  const [data, setData] = useState<ReportRow[]>([]);
  const [auOrcidRorData, setAuOrcidRorData] = useState<ReportOrcidRorRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/data/outputs/reports.json").then((r) => r.json()),
      fetch("/data/outputs/reports-au-orcid-ror.json").then((r) => r.json()),
    ])
      .then(([reports, auOrcidRor]: [ReportRow[], ReportOrcidRorRow[]]) => {
        setData(reports.sort((a, b) => b.reports - a.reports));
        setAuOrcidRorData(auOrcidRor.sort((a, b) => b.reports - a.reports));
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalReports = useMemo(
    () => data.reduce((sum, d) => sum + d.reports, 0),
    [data]
  );

  const topRepositories = useMemo(() => data.slice(0, 20), [data]);

  const australianRepos = useMemo(
    () => data.filter(isAustralian).sort((a, b) => b.reports - a.reports),
    [data]
  );

  const australianTotal = useMemo(
    () => australianRepos.reduce((sum, d) => sum + d.reports, 0),
    [australianRepos]
  );

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-text mb-2">
          Research Reports
        </h1>
        <div className="animate-pulse bg-gray-200 rounded-lg h-96" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text mb-2">
        Research Reports
      </h1>
      <p className="text-brand-muted mb-6">
        DOI adoption for research reports across repositories. Reports are a key
        research output type that benefits from persistent identification for
        discoverability and citation tracking.
      </p>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard
          label="Total Reports"
          value={totalReports.toLocaleString()}
          subtitle={`Across ${data.length} repositories`}
        />
        <MetricCard
          label="Top Repository"
          value={data.length > 0 ? data[0].repository : "N/A"}
          subtitle={
            data.length > 0
              ? `${data[0].reports.toLocaleString()} reports`
              : ""
          }
        />
        <MetricCard
          label="Repositories"
          value={data.length.toLocaleString()}
          subtitle="With registered reports"
        />
      </div>

      {/* Global Horizontal Bar Chart */}
      <ChartContainer
        title="Top Repositories by Report Count"
        subtitle="Top 20 repositories ranked by number of reports with DOIs"
        source="DataCite, Crossref."
      >
        <Plot
          data={[
            {
              y: [...topRepositories].reverse().map((d) => d.repository),
              x: [...topRepositories].reverse().map((d) => d.reports),
              type: "bar" as const,
              orientation: "h" as const,
              marker: { color: "#1f407a" },
              hovertemplate:
                "<b>%{y}</b><br>Reports: %{x:,.0f}<extra></extra>",
            },
          ]}
          layout={{
            height: Math.max(450, topRepositories.length * 28),
            margin: { l: 220, r: 30, t: 10, b: 50 },
            xaxis: {
              title: { text: "Number of Reports" },
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

      {/* Australian focus */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-brand-text mb-3">Australian Focus</h2>
        <div className="prose prose-sm max-w-none mb-6">
          <p className="text-brand-muted leading-relaxed">
            The report identifies 2 Australian repositories in the global top 20 for report
            publishing: the Reserve Bank of Australia (8,631 reports) and RMIT (1,095 reports).
          </p>
        </div>

        {australianRepos.length > 0 && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <MetricCard
                label="Australian Reports (in dataset)"
                value={australianTotal.toLocaleString()}
                subtitle={`Across ${australianRepos.length} Australian repositories`}
                color="#47AB4C"
              />
              <MetricCard
                label="Australian Repositories"
                value={australianRepos.length.toLocaleString()}
                subtitle="Repositories identified as Australian"
                color="#47AB4C"
              />
            </div>

            <ChartContainer
              title="Australian Repositories"
              subtitle="Australian repositories with DOI-registered reports"
              source="DataCite, Crossref."
            >
              {australianRepos.length > 1 ? (
                <Plot
                  data={[
                    {
                      y: [...australianRepos].reverse().map((d) => d.repository),
                      x: [...australianRepos].reverse().map((d) => d.reports),
                      type: "bar" as const,
                      orientation: "h" as const,
                      marker: { color: "#47AB4C" },
                      hovertemplate:
                        "<b>%{y}</b><br>Reports: %{x:,.0f}<extra></extra>",
                    },
                  ]}
                  layout={{
                    height: Math.max(200, australianRepos.length * 40),
                    margin: { l: 280, r: 30, t: 10, b: 50 },
                    xaxis: {
                      title: { text: "Number of Reports" },
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
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand-border text-left text-brand-muted">
                        <th className="pb-2 font-medium">Repository</th>
                        <th className="pb-2 font-medium">Client ID</th>
                        <th className="pb-2 font-medium text-right">Reports</th>
                      </tr>
                    </thead>
                    <tbody>
                      {australianRepos.map((d) => (
                        <tr
                          key={d.client_id}
                          className="border-b border-gray-50 hover:bg-gray-50"
                        >
                          <td className="py-2 font-medium">{d.repository}</td>
                          <td className="py-2 text-brand-muted">{d.client_id}</td>
                          <td className="py-2 text-right">
                            {d.reports.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </ChartContainer>

            {/* Australian table */}
            <div className="mt-4">
              <ChartContainer
                title="Australian Repositories Detail"
                source="DataCite, Crossref."
              >
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-brand-border text-left text-brand-muted">
                        <th className="pb-2 font-medium">Repository</th>
                        <th className="pb-2 font-medium">Client ID</th>
                        <th className="pb-2 font-medium text-right">Reports</th>
                      </tr>
                    </thead>
                    <tbody>
                      {australianRepos.map((d) => (
                        <tr
                          key={d.client_id}
                          className="border-b border-gray-50 hover:bg-gray-50"
                        >
                          <td className="py-2 font-medium">{d.repository}</td>
                          <td className="py-2 text-brand-muted">{d.client_id}</td>
                          <td className="py-2 text-right">
                            {d.reports.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </ChartContainer>
            </div>
          </>
        )}
      </div>

      {/* Australian Repository PID Interoperability for Reports */}
      {auOrcidRorData.length > 0 && (
        <div className="mt-6">
          <ChartContainer
            title="Australian Repository PID Interoperability for Reports"
            subtitle="ORCID and ROR adoption rates across Australian repositories publishing reports"
            source="DataCite."
            recipeLink="/recipes"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-border text-left text-brand-muted">
                    <th className="pb-2 pr-4 font-medium">Repository</th>
                    <th className="pb-2 px-4 font-medium text-right">Reports</th>
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
                          {d.reports.toLocaleString()}
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

      {/* Recipe reference */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-900">
          See Benchmarking Recipe TK-33 for the reports query.
        </p>
      </div>

      {/* Global Data Table */}
      <div className="mt-6">
        <ChartContainer
          title="All Repositories"
          source="DataCite, Crossref."
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border text-left text-brand-muted">
                  <th className="pb-2 font-medium">Repository</th>
                  <th className="pb-2 font-medium">Client ID</th>
                  <th className="pb-2 font-medium text-right">Reports</th>
                </tr>
              </thead>
              <tbody>
                {data.map((d) => (
                  <tr
                    key={d.client_id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-2 font-medium">{d.repository}</td>
                    <td className="py-2 text-brand-muted">{d.client_id}</td>
                    <td className="py-2 text-right">
                      {d.reports.toLocaleString()}
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
