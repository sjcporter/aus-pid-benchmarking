"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import ChartContainer from "@/components/charts/ChartContainer";
import MetricCard from "@/components/content/MetricCard";
import { basePath } from "@/lib/basepath";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface SampleYear {
  year: number;
  all_samples: number;
  australian_samples: number;
  percentage: number;
}

interface IgsnAffiliation {
  location: string;
  samples: number;
  creators: number;
  name_identifiers: number;
  affiliation_identifiers: number;
}

interface IgsnRelationship {
  location: string;
  relation_type: string;
  links: number;
}

export default function SamplesPage() {
  const [data, setData] = useState<SampleYear[]>([]);
  const [affiliationData, setAffiliationData] = useState<IgsnAffiliation[]>([]);
  const [relationshipData, setRelationshipData] = useState<IgsnRelationship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch(`${basePath}/data/inputs/igsn-samples.json`).then((r) => r.json()),
      fetch(`${basePath}/data/inputs/igsn-affiliations.json`).then((r) => r.json()),
      fetch(`${basePath}/data/inputs/igsn-relationships.json`).then((r) => r.json()),
    ])
      .then(([samples, affiliations, relationships]: [SampleYear[], IgsnAffiliation[], IgsnRelationship[]]) => {
        setData(samples.sort((a, b) => a.year - b.year));
        setAffiliationData(affiliations);
        setRelationshipData(relationships);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const totalAustralian = useMemo(
    () => data.reduce((sum, d) => sum + d.australian_samples, 0),
    [data]
  );

  const totalGlobal = useMemo(
    () => data.reduce((sum, d) => sum + d.all_samples, 0),
    [data]
  );

  const overallPercentage = useMemo(
    () => (totalGlobal > 0 ? (totalAustralian / totalGlobal) * 100 : 0),
    [totalAustralian, totalGlobal]
  );

  const latestYear = useMemo(
    () => (data.length > 0 ? data[data.length - 1] : null),
    [data]
  );

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-text mb-2">
          Samples &amp; Observations (IGSN)
        </h1>
        <div className="animate-pulse bg-gray-200 rounded-lg h-96" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text mb-2">
        Samples &amp; Observations (IGSN)
      </h1>
      <p className="text-brand-muted mb-6">
        International Generic Sample Number (IGSN) adoption for physical samples
        in Australian research collections. IGSN provides globally unique and
        persistent identifiers for physical samples, enabling citation, linking,
        and tracking across research datasets.
      </p>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Total Australian Samples"
          value={totalAustralian.toLocaleString()}
          subtitle={`Across ${data.length} years of data`}
        />
        <MetricCard
          label="Share of Global Samples"
          value={`${overallPercentage.toFixed(1)}%`}
          subtitle={`Of ${totalGlobal.toLocaleString()} total globally`}
        />
        <MetricCard
          label="Latest Year"
          value={latestYear ? latestYear.year.toString() : "N/A"}
          subtitle={
            latestYear
              ? `${latestYear.australian_samples.toLocaleString()} Australian samples`
              : ""
          }
        />
        <MetricCard
          label="Total Global Samples"
          value={totalGlobal.toLocaleString()}
          subtitle="All IGSN-registered samples"
        />
      </div>

      {/* Grouped Bar Chart */}
      <ChartContainer
        title="IGSN Sample Registrations by Year"
        subtitle="Global vs Australian samples (logarithmic scale)"
        source="IGSN Registry / DataCite."
        toolkitRef="Section 2.7"
        recipeLink="/recipes"
      >
        <Plot
          data={[
            {
              x: data.map((d) => d.year),
              y: data.map((d) => d.all_samples),
              name: "All Samples (Global)",
              type: "bar" as const,
              marker: { color: "#1f407a" },
              hovertemplate:
                "<b>Global</b><br>Year: %{x}<br>Samples: %{y:,.0f}<extra></extra>",
            },
            {
              x: data.map((d) => d.year),
              y: data.map((d) => d.australian_samples),
              name: "Australian Samples",
              type: "bar" as const,
              marker: { color: "#A6CE39" },
              hovertemplate:
                "<b>Australia</b><br>Year: %{x}<br>Samples: %{y:,.0f}<extra></extra>",
            },
          ]}
          layout={{
            height: 450,
            barmode: "group" as const,
            margin: { l: 70, r: 20, t: 10, b: 50 },
            xaxis: {
              title: { text: "Year" },
              dtick: 1,
              gridcolor: "#f0f0f0",
            },
            yaxis: {
              title: { text: "Number of Samples" },
              type: "log" as const,
              gridcolor: "#f0f0f0",
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
            font: {
              family: "var(--font-geist-sans), sans-serif",
              size: 12,
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

      {/* Percentage Line Chart */}
      <div className="mt-6">
        <ChartContainer
          title="Australian Share of IGSN Samples Over Time"
          subtitle="Percentage of global IGSN samples registered by Australian institutions"
          source="IGSN Registry / DataCite."
          recipeLink="/recipes"
        >
          <Plot
            data={[
              {
                x: data.map((d) => d.year),
                y: data.map((d) => d.percentage),
                type: "scatter" as const,
                mode: "lines+markers" as const,
                name: "Australian %",
                line: { color: "#1f407a", width: 3 },
                marker: { size: 8, color: "#1f407a" },
                fill: "tozeroy" as const,
                fillcolor: "rgba(31, 64, 122, 0.1)",
                hovertemplate:
                  "<b>Year: %{x}</b><br>Australian share: %{y:.1f}%<extra></extra>",
              },
            ]}
            layout={{
              height: 350,
              margin: { l: 60, r: 20, t: 10, b: 50 },
              xaxis: {
                title: { text: "Year" },
                dtick: 1,
                gridcolor: "#f0f0f0",
              },
              yaxis: {
                title: { text: "Australian Share (%)" },
                ticksuffix: "%",
                gridcolor: "#f0f0f0",
                range: [0, 100],
              },
              plot_bgcolor: "#fff",
              paper_bgcolor: "#fff",
              font: {
                family: "var(--font-geist-sans), sans-serif",
                size: 12,
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

      {/* Data Table */}
      <div className="mt-6">
        <ChartContainer title="IGSN Registrations by Year" source="IGSN Registry / DataCite." recipeLink="/recipes">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border text-left text-brand-muted">
                  <th className="pb-2 font-medium">Year</th>
                  <th className="pb-2 font-medium text-right">
                    All Samples (Global)
                  </th>
                  <th className="pb-2 font-medium text-right">
                    Australian Samples
                  </th>
                  <th className="pb-2 font-medium text-right">
                    Australian Share
                  </th>
                </tr>
              </thead>
              <tbody>
                {[...data].reverse().map((d) => (
                  <tr
                    key={d.year}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-2 font-medium">{d.year}</td>
                    <td className="py-2 text-right">
                      {d.all_samples.toLocaleString()}
                    </td>
                    <td className="py-2 text-right">
                      {d.australian_samples.toLocaleString()}
                    </td>
                    <td className="py-2 text-right">{d.percentage}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartContainer>
      </div>

      {/* Key Insight */}
      <div className="mt-6 bg-amber-50 rounded-lg border border-amber-200 p-5">
        <h3 className="font-semibold text-brand-text mb-3">
          Key Insight: PID Gap in Australian Sample Collections
        </h3>
        <p className="text-sm text-brand-muted">
          5.8M IGSN samples in Australian catalogues but{" "}
          <strong>0 name identifiers</strong> and{" "}
          <strong>0 affiliation identifiers</strong>. While Australia is a
          significant contributor to IGSN registrations -- accounting for a
          substantial share of global samples in several years -- none of these
          sample records include researcher identifiers (such as ORCID) or
          institutional affiliation identifiers (such as ROR). This represents a
          critical gap in linking physical samples to the researchers and
          institutions responsible for collecting, curating, and analysing them.
        </p>
      </div>

      {/* IGSN Affiliations Comparison Table */}
      {affiliationData.length > 0 && (
        <div className="mt-6">
          <ChartContainer
            title="IGSN Sample Metadata: Australia vs Rest of World"
            subtitle="Comparison of identifier richness in IGSN sample records"
            source="IGSN Registry / DataCite. Metadata completeness for sample creator and affiliation fields."
            recipeLink="/recipes"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-border text-left text-brand-muted">
                    <th className="pb-2 font-medium">Location</th>
                    <th className="pb-2 font-medium text-right">Samples</th>
                    <th className="pb-2 font-medium text-right">Creators</th>
                    <th className="pb-2 font-medium text-right">Name Identifiers</th>
                    <th className="pb-2 font-medium text-right">Affiliation Identifiers</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliationData.map((d) => {
                    const isAu = d.location === "Australia";
                    return (
                      <tr
                        key={d.location}
                        className="border-b border-gray-50 hover:bg-gray-50"
                      >
                        <td className="py-2 font-medium">{d.location}</td>
                        <td className="py-2 text-right">
                          {d.samples.toLocaleString()}
                        </td>
                        <td className="py-2 text-right">
                          {d.creators.toLocaleString()}
                        </td>
                        <td className={`py-2 text-right ${isAu && d.name_identifiers === 0 ? "text-red-600 font-bold" : ""}`}>
                          {d.name_identifiers.toLocaleString()}
                          {isAu && d.name_identifiers === 0 && (
                            <span className="ml-1 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                              none
                            </span>
                          )}
                        </td>
                        <td className={`py-2 text-right ${isAu && d.affiliation_identifiers === 0 ? "text-red-600 font-bold" : ""}`}>
                          {d.affiliation_identifiers.toLocaleString()}
                          {isAu && d.affiliation_identifiers === 0 && (
                            <span className="ml-1 text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded">
                              none
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
        </div>
      )}

      {/* IGSN Relationships Grouped Bar Chart */}
      {relationshipData.length > 0 && (() => {
        const relationTypes = [...new Set(relationshipData.map((d) => d.relation_type))];
        const auData = relationshipData.filter((d) => d.location === "Australia");
        const rowData = relationshipData.filter((d) => d.location === "Rest of World");
        return (
          <div className="mt-6">
            <ChartContainer
              title="IGSN Relationship Types: Australia vs Rest of World"
              subtitle="Linked relations between IGSN samples and other research objects"
              source="IGSN Registry / DataCite. Relationship metadata in IGSN records."
              recipeLink="/recipes"
            >
              <Plot
                data={[
                  {
                    x: relationTypes,
                    y: relationTypes.map((rt) => {
                      const match = auData.find((d) => d.relation_type === rt);
                      return match ? match.links : 0;
                    }),
                    name: "Australia",
                    type: "bar" as const,
                    marker: { color: "#1f407a" },
                    hovertemplate:
                      "<b>Australia</b><br>%{x}: %{y:,}<extra></extra>",
                  },
                  {
                    x: relationTypes,
                    y: relationTypes.map((rt) => {
                      const match = rowData.find((d) => d.relation_type === rt);
                      return match ? match.links : 0;
                    }),
                    name: "Rest of World",
                    type: "bar" as const,
                    marker: { color: "#A6CE39" },
                    hovertemplate:
                      "<b>Rest of World</b><br>%{x}: %{y:,}<extra></extra>",
                  },
                ]}
                layout={{
                  height: 450,
                  barmode: "group" as const,
                  margin: { l: 80, r: 20, t: 10, b: 100 },
                  xaxis: {
                    title: { text: "Relationship Type" },
                    gridcolor: "#f0f0f0",
                    tickangle: -30,
                  },
                  yaxis: {
                    title: { text: "Number of Links" },
                    type: "log" as const,
                    gridcolor: "#f0f0f0",
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
          </div>
        );
      })()}
    </div>
  );
}
