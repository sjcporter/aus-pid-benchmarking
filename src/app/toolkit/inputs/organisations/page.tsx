"use client";

import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import ChartContainer from "@/components/charts/ChartContainer";
import MetricCard from "@/components/content/MetricCard";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface RorByYear {
  year: number;
  affiliation_links: number;
}

interface RorPublisher {
  publisher: string;
  affiliations: number;
}

interface MissingOrg {
  org_type: string;
  count: number;
}

interface RorFieldOfResearch {
  field_of_research: string;
  pubs_with_affiliations: number;
  australian: number;
  percentage: number;
}

export default function OrganisationsPage() {
  const [yearData, setYearData] = useState<RorByYear[]>([]);
  const [publisherData, setPublisherData] = useState<RorPublisher[]>([]);
  const [missingOrgs, setMissingOrgs] = useState<MissingOrg[]>([]);
  const [forData, setForData] = useState<RorFieldOfResearch[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/data/inputs/ror-assertions-by-year.json").then((r) => r.json()),
      fetch("/data/inputs/ror-publishers.json").then((r) => r.json()),
      fetch("/data/inputs/missing-organisations.json").then((r) => r.json()),
      fetch("/data/inputs/ror-field-of-research.json").then((r) => r.json()),
    ])
      .then(([yearly, publishers, missing, forResearch]) => {
        setYearData(yearly);
        setPublisherData(publishers);
        setMissingOrgs(missing);
        setForData(forResearch);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalAssertions = yearData.reduce((sum, d) => sum + d.affiliation_links, 0);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-text mb-2">Research Organisations (ROR)</h1>
        <div className="animate-pulse bg-gray-200 rounded-lg h-96" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text mb-2">Research Organisations (ROR)</h1>
      <p className="text-brand-muted mb-6">
        The Research Organization Registry (ROR) provides unique, persistent identifiers for
        research organisations worldwide. Tracking ROR adoption in Crossref metadata reveals how
        publishers are linking authors to their affiliated institutions using structured,
        machine-readable identifiers rather than free-text strings.
      </p>

      {/* Key metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard
          label="Total ROR assertions (2020-2024)"
          value={totalAssertions.toLocaleString()}
          subtitle="Direct ROR links in Crossref metadata"
        />
        <MetricCard
          label="Potential affiliations"
          value="1,180,610"
          subtitle="Australian-affiliated publications in the same period"
          color="#EB5757"
        />
        <MetricCard
          label="ROR coverage"
          value={`${((totalAssertions / 1180610) * 100).toFixed(2)}%`}
          subtitle="Direct ROR links as share of potential"
          color="#F2994A"
        />
      </div>

      {/* Key insight */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-amber-900">
          <span className="font-semibold">Key insight:</span> Only {totalAssertions.toLocaleString()} direct ROR links were
          made between 2020 and 2024 out of 1,180,610 potential Australian-affiliated publications.
          While growth is accelerating year-on-year, ROR adoption in publisher metadata remains at
          a very early stage.
        </p>
      </div>

      {/* Line chart: ROR assertions by year */}
      <ChartContainer
        title="ROR Assertions in Crossref by Year (2020-2024)"
        subtitle="Number of Australian-affiliated publications with direct ROR links"
        source="Crossref. Australian ROR IDs only."
        toolkitRef="Section 4.2"
        recipeLink="/recipes"
      >
        <Plot
          data={[
            {
              x: yearData.map((d) => d.year),
              y: yearData.map((d) => d.affiliation_links),
              type: "scatter" as const,
              mode: "lines+markers" as const,
              line: { color: "#1f407a", width: 3 },
              marker: { size: 8, color: "#1f407a" },
              hovertemplate:
                "<b>%{x}</b><br>ROR assertions: %{y:,}<extra></extra>",
            },
          ]}
          layout={{
            height: 400,
            margin: { l: 60, r: 20, t: 10, b: 50 },
            xaxis: {
              title: { text: "Year" },
              dtick: 1,
              gridcolor: "#f0f0f0",
            },
            yaxis: {
              title: { text: "Affiliation links" },
              gridcolor: "#f0f0f0",
              rangemode: "tozero" as const,
            },
            plot_bgcolor: "#fff",
            paper_bgcolor: "#fff",
            font: { family: "var(--font-geist-sans), sans-serif", size: 12 },
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

      {/* Horizontal bar chart: Top publishers */}
      <div className="mt-6">
        <ChartContainer
          title="Top Publishers with Australian ROR Assertions"
          subtitle="Publishers that include the most direct ROR affiliation links for Australian organisations"
          source="Crossref. Australian ROR IDs only."
          recipeLink="/recipes"
        >
          <Plot
            data={[
              {
                y: [...publisherData].reverse().map((d) => d.publisher),
                x: [...publisherData].reverse().map((d) => d.affiliations),
                type: "bar" as const,
                orientation: "h" as const,
                marker: { color: "#2D9CDB" },
                hovertemplate:
                  "<b>%{y}</b><br>Affiliations: %{x:,}<extra></extra>",
              },
            ]}
            layout={{
              height: Math.max(400, publisherData.length * 28),
              margin: { l: 280, r: 20, t: 10, b: 50 },
              xaxis: {
                title: { text: "Number of ROR affiliation links" },
                gridcolor: "#f0f0f0",
              },
              yaxis: {
                automargin: true,
              },
              plot_bgcolor: "#fff",
              paper_bgcolor: "#fff",
              font: { family: "var(--font-geist-sans), sans-serif", size: 11 },
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

      {/* Missing Organisations Bar Chart */}
      {missingOrgs.length > 0 && (
        <div className="mt-6">
          <ChartContainer
            title="Australian Organisations in Dimensions without a ROR ID"
            subtitle={`${missingOrgs.reduce((s, d) => s + d.count, 0).toLocaleString()} Australian publishing organisations in Dimensions do not have a ROR ID (531 at time of report, October 2025)`}
            source="Dimensions. Australian publishing organisations without a matching ROR identifier. Count increases as new organisations are added to Dimensions."
            recipeLink="/recipes"
          >
            <Plot
              data={[
                {
                  x: missingOrgs.map((d) => d.org_type),
                  y: missingOrgs.map((d) => d.count),
                  type: "bar" as const,
                  marker: { color: "#EB5757" },
                  hovertemplate:
                    "<b>%{x}</b><br>Count: %{y:,}<extra></extra>",
                },
              ]}
              layout={{
                height: 400,
                margin: { l: 60, r: 20, t: 10, b: 80 },
                xaxis: {
                  title: { text: "Organisation Type" },
                  gridcolor: "#f0f0f0",
                },
                yaxis: {
                  title: { text: "Number of Organisations" },
                  gridcolor: "#f0f0f0",
                  rangemode: "tozero" as const,
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
      )}

      {/* ROR by Field of Research Table */}
      {forData.length > 0 && (
        <div className="mt-6">
          <ChartContainer
            title="ROR Affiliation Coverage by Field of Research"
            subtitle="Publications with direct ROR affiliation assertions, broken down by ANZSRC Field of Research"
            source="Crossref. Direct ROR affiliation assertions in publications, by Field of Research."
            recipeLink="/recipes"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-border text-left text-brand-muted">
                    <th className="pb-2 font-medium">Field of Research</th>
                    <th className="pb-2 font-medium text-right">Publications with Affiliations</th>
                    <th className="pb-2 font-medium text-right">Australian Affiliations</th>
                    <th className="pb-2 font-medium text-right">Australian %</th>
                  </tr>
                </thead>
                <tbody>
                  {[...forData]
                    .sort((a, b) => b.pubs_with_affiliations - a.pubs_with_affiliations)
                    .map((d) => (
                      <tr
                        key={d.field_of_research}
                        className="border-b border-gray-50 hover:bg-gray-50"
                      >
                        <td className="py-2 font-medium">{d.field_of_research}</td>
                        <td className="py-2 text-right">
                          {d.pubs_with_affiliations.toLocaleString()}
                        </td>
                        <td className="py-2 text-right">
                          {d.australian.toLocaleString()}
                        </td>
                        <td className="py-2 text-right">{d.percentage}%</td>
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
