"use client";

import { useState, useEffect, useMemo } from "react";
import dynamic from "next/dynamic";
import ScatterPlot, { type ScatterDataPoint } from "@/components/charts/ScatterPlot";
import ChartContainer from "@/components/charts/ChartContainer";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

interface PublisherEngagement {
  entity: string;
  publisher: string;
  publications: number;
  pct_two_or_more_orcids: number;
  pct_any_orcid: number;
  pct_one_orcid: number;
}

interface PublisherYear {
  year: number;
  publisher: string;
  publications: number;
  two_or_more: number;
  any_number_of_orcids: number;
}

type TableSortKey = "publisher" | "publications" | "pct_any_orcid" | "pct_two_or_more_orcids" | "pct_one_orcid";

export default function OrcidPublisherPage() {
  const [engagementData, setEngagementData] = useState<PublisherEngagement[]>([]);
  const [publisherYearData, setPublisherYearData] = useState<PublisherYear[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [minPublications, setMinPublications] = useState(5000);
  const [tableSortKey, setTableSortKey] = useState<TableSortKey>("publications");
  const [tableSortAsc, setTableSortAsc] = useState(false);

  useEffect(() => {
    Promise.all([
      fetch("/data/orcid/publisher-engagement.json").then((r) => r.json()),
      fetch("/data/orcid/publisher-year.json").then((r) => r.json()),
    ])
      .then(([engagement, yearData]: [PublisherEngagement[], PublisherYear[]]) => {
        setEngagementData(engagement);
        setPublisherYearData(yearData);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  // --- Top 20 publishers by total publications for sparklines ---
  const top20Publishers = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const d of publisherYearData) {
      if (!d.publisher || d.publisher === "None") continue;
      totals[d.publisher] = (totals[d.publisher] || 0) + d.publications;
    }
    return Object.entries(totals)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([name]) => name);
  }, [publisherYearData]);

  // --- Scatter plot filtering ---
  const filteredEngagement = useMemo(() => {
    return engagementData.filter((d) => {
      if (d.publications < minPublications) return false;
      if (searchTerm && !(d.publisher || "").toLowerCase().includes(searchTerm.toLowerCase()))
        return false;
      return true;
    });
  }, [engagementData, minPublications, searchTerm]);

  const scatterData: ScatterDataPoint[] = useMemo(
    () =>
      filteredEngagement.map((d) => ({
        entity: d.publisher,
        x: d.pct_two_or_more_orcids,
        y: d.pct_one_orcid,
        size: d.publications,
        group: "Publisher",
      })),
    [filteredEngagement]
  );

  // --- Table sorting ---
  const handleTableSort = (key: TableSortKey) => {
    if (tableSortKey === key) {
      setTableSortAsc((prev) => !prev);
    } else {
      setTableSortKey(key);
      setTableSortAsc(key === "publisher");
    }
  };

  const sortedTableData = useMemo(() => {
    const sorted = [...engagementData].sort((a, b) => {
      const aVal = a[tableSortKey];
      const bVal = b[tableSortKey];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return tableSortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return tableSortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return sorted;
  }, [engagementData, tableSortKey, tableSortAsc]);

  const sortIndicator = (key: TableSortKey) => {
    if (tableSortKey !== key) return "";
    return tableSortAsc ? " \u25B2" : " \u25BC";
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-text mb-2">ORCID Adoption by Publisher</h1>
        <div className="animate-pulse bg-gray-200 rounded-lg h-96" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text mb-2">ORCID Adoption by Publisher</h1>

      {/* Narrative context from the report */}
      <div className="prose prose-sm max-w-none mb-8 space-y-4">
        <p className="text-brand-muted leading-relaxed">
          In 2016, many publishers signed on to the commitment to require at least the corresponding
          author to connect their ORCID iD, understanding that all authors should have the option to
          assert their relationship to the article. Most publishers began by implementing the first
          requirement with support for additional authors proceeding at different paces.
        </p>
        <p className="text-brand-muted leading-relaxed">
          Even some 9 years on from the original declaration, publisher workflows for Elsevier and
          Springer Nature still marginally favour the collection of a single ORCID for the
          corresponding author, leaving most authors the additional work of asserting their
          relationship to a publication after the fact. Newer publishers such as PLoS, MDPI, and
          eLife take a more progressive approach.
        </p>
        <p className="text-brand-muted leading-relaxed">
          There is no evidence to suggest that the collection of more than one ORCID on an article is
          being systematically prevented. This suggests that within a national strategy, it is up to
          Australian researchers to insist that their ORCID is associated with their authorship
          regardless of the role that they played on the paper.
        </p>
        <p className="text-brand-muted leading-relaxed">
          Beyond collecting ORCIDs during submission, publishers also have a responsibility to pass
          this metadata onto Crossref. As the data makes clear, by 2024 most publishers are passing
          on ORCID assertions for most of their journals; however, Frontiers stands out as one journal
          that fails on this measure. In 2024, Frontiers articles made up 1.4% of Australian
          publications output.
        </p>
      </div>

      {/* Small-multiples sparkline grid: top 10 publishers */}
      <div className="mb-6">
        <ChartContainer
          title="ORCID Assertions by Publisher and Year"
          subtitle="Percentage of journals with any ORCID records passed to Crossref, top 20 publishers by volume, 2020-2024"
          source="Crossref Metadata."
        >
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-4">
            {top20Publishers.map((publisher) => {
              const rows = publisherYearData
                .filter((d) => d.publisher === publisher)
                .sort((a, b) => a.year - b.year);
              const years = rows.map((r) => r.year);
              const values = rows.map((r) => r.any_number_of_orcids);
              const latest = values.length > 0 ? values[values.length - 1] : 0;
              const isLowPerformer = latest < 10;
              return (
                <div
                  key={publisher}
                  className="bg-white border border-gray-100 rounded-lg p-3"
                >
                  <p className="text-xs font-medium text-brand-text truncate mb-1" title={publisher}>
                    {publisher}
                  </p>
                  <p className={`text-lg font-bold mb-1 ${isLowPerformer ? "text-red-600" : "text-brand-primary"}`}>
                    {latest.toFixed(0)}%
                  </p>
                  <Plot
                    data={[
                      {
                        x: years,
                        y: values,
                        type: "scatter" as const,
                        mode: "lines" as const,
                        line: { color: "#1f407a", width: 2 },
                        hovertemplate:
                          "<b>%{x}</b><br>%{y:.1f}%<extra></extra>",
                      },
                    ]}
                    layout={{
                      height: 60,
                      margin: { l: 0, r: 0, t: 0, b: 0 },
                      xaxis: {
                        visible: false,
                        range: [2019.5, 2024.5],
                      },
                      yaxis: {
                        visible: false,
                        range: [
                          Math.max(0, Math.min(...values) - 5),
                          Math.min(100, Math.max(...values) + 5),
                        ],
                      },
                      plot_bgcolor: "transparent",
                      paper_bgcolor: "transparent",
                      hovermode: "x" as const,
                    }}
                    config={{
                      responsive: true,
                      displayModeBar: false,
                    }}
                    style={{ width: "100%", height: 60 }}
                  />
                  <div className="flex justify-between text-[10px] text-brand-muted mt-0.5">
                    <span>2020</span>
                    <span>2024</span>
                  </div>
                </div>
              );
            })}
          </div>
        </ChartContainer>
      </div>

      {/* Filters */}
      <div className="bg-brand-surface rounded-lg border border-brand-border p-4 mb-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs text-brand-muted mb-1">Search publisher</label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type to search..."
              className="px-3 py-1.5 border border-brand-border rounded text-sm w-56"
            />
          </div>
          <div>
            <label className="block text-xs text-brand-muted mb-1">
              Min publications: {minPublications.toLocaleString()}
            </label>
            <input
              type="range"
              min={1000}
              max={50000}
              step={1000}
              value={minPublications}
              onChange={(e) => setMinPublications(Number(e.target.value))}
              className="w-48"
            />
          </div>
          <div className="text-xs text-brand-muted">
            Showing {filteredEngagement.length} of {engagementData.length} publishers
          </div>
        </div>
      </div>

      {/* Scatter plot */}
      <ChartContainer
        title="The Journey from Initial to Best Practice"
        subtitle="Percentage of multi-author journal articles by publisher in 2024"
        source="Dimensions, ORCID. Aggregate statistics only."
        toolkitRef="Section 3.1.3"
      >
        {(() => {
          const labelledPublishers: { name: string; color: string }[] = [
            { name: "Elsevier", color: "#555" },
            { name: "Springer Nature", color: "#555" },
            { name: "PLoS", color: "#555" },
            { name: "MDPI", color: "#555" },
            { name: "eLife", color: "#555" },
            { name: "Frontiers", color: "#dc2626" },
          ];
          const publisherAnnotations = labelledPublishers
            .map(({ name, color }) => {
              const point = filteredEngagement.find(
                (d) => d.publisher === name
              );
              if (!point) return null;
              return {
                x: point.pct_two_or_more_orcids,
                y: point.pct_one_orcid,
                xref: "x" as const,
                yref: "y" as const,
                text: name,
                showarrow: true,
                arrowhead: 2,
                arrowsize: 1,
                arrowwidth: 1,
                arrowcolor: color,
                ax: 30,
                ay: -25,
                font: { size: 11, color },
              };
            })
            .filter((a): a is NonNullable<typeof a> => a !== null);
          const quadrantAnnotations = [
            {
              x: 10,
              y: 45,
              xref: "x" as const,
              yref: "y" as const,
              text: "Original Commitment",
              showarrow: false,
              font: { size: 13, color: "gray" },
            },
            {
              x: 85,
              y: 5,
              xref: "x" as const,
              yref: "y" as const,
              text: "Best Practice",
              showarrow: false,
              font: { size: 13, color: "green" },
            },
          ];
          const sizeValues = filteredEngagement.map((d) => d.publications);
          const maxSize = Math.max(...sizeValues, 1);
          return (
            <Plot
              data={[
                {
                  x: filteredEngagement.map((d) => d.pct_two_or_more_orcids),
                  y: filteredEngagement.map((d) => d.pct_one_orcid),
                  text: filteredEngagement.map((d) => d.publisher),
                  marker: {
                    size: filteredEngagement.map(
                      (d) => Math.sqrt(d.publications / maxSize) * 40 + 5
                    ),
                    color: "#1f407a",
                    opacity: 0.7,
                  },
                  mode: "markers" as const,
                  type: "scatter" as const,
                  hovertemplate:
                    "<b>%{text}</b><br>2+ ORCIDs: %{x:.1f}%<br>1 ORCID: %{y:.1f}%<extra></extra>",
                },
              ]}
              layout={{
                height: 550,
                xaxis: {
                  title: { text: "Articles with 2+ ORCIDs (%)" },
                  zeroline: false,
                },
                yaxis: {
                  title: { text: "Articles with exactly 1 ORCID (%)" },
                  zeroline: false,
                },
                annotations: [
                  ...quadrantAnnotations,
                  ...publisherAnnotations,
                ],
                shapes: [
                  // "Original Commitment" zone: high single-ORCID, low multi-ORCID
                  {
                    type: "rect" as const,
                    xref: "x" as const,
                    yref: "y" as const,
                    x0: 0, y0: 20, x1: 40, y1: 55,
                    fillcolor: "rgba(200,200,200,0.12)",
                    line: { width: 0 },
                    layer: "below" as const,
                  },
                  // "Best Practice" zone: high multi-ORCID, low single-ORCID
                  {
                    type: "rect" as const,
                    xref: "x" as const,
                    yref: "y" as const,
                    x0: 60, y0: 0, x1: 100, y1: 20,
                    fillcolor: "rgba(71,171,76,0.08)",
                    line: { width: 0 },
                    layer: "below" as const,
                  },
                ],
                margin: { l: 60, r: 30, t: 20, b: 60 },
                plot_bgcolor: "#fff",
                paper_bgcolor: "#fff",
                hovermode: "closest" as const,
              }}
              config={{ responsive: true, displayModeBar: false }}
              style={{ width: "100%", height: 550 }}
            />
          );
        })()}
      </ChartContainer>

      {/* Publisher data table */}
      <div className="mt-6">
        <ChartContainer
          title="All Publishers"
          subtitle={`${engagementData.length} publishers, sorted by ${tableSortKey.replace(/_/g, " ").replace("pct ", "% ")}`}
        >
          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-brand-surface">
                <tr className="border-b border-brand-border text-left text-brand-muted">
                  <th
                    className="pb-2 pr-4 font-medium cursor-pointer hover:text-brand-text"
                    onClick={() => handleTableSort("publisher")}
                  >
                    Publisher{sortIndicator("publisher")}
                  </th>
                  <th
                    className="pb-2 px-4 font-medium text-right cursor-pointer hover:text-brand-text"
                    onClick={() => handleTableSort("publications")}
                  >
                    Publications{sortIndicator("publications")}
                  </th>
                  <th
                    className="pb-2 px-4 font-medium text-right cursor-pointer hover:text-brand-text"
                    onClick={() => handleTableSort("pct_one_orcid")}
                  >
                    % with 1 ORCID{sortIndicator("pct_one_orcid")}
                  </th>
                  <th
                    className="pb-2 px-4 font-medium text-right cursor-pointer hover:text-brand-text"
                    onClick={() => handleTableSort("pct_any_orcid")}
                  >
                    % with any ORCID{sortIndicator("pct_any_orcid")}
                  </th>
                  <th
                    className="pb-2 pl-4 font-medium text-right cursor-pointer hover:text-brand-text"
                    onClick={() => handleTableSort("pct_two_or_more_orcids")}
                  >
                    % with 2+ ORCIDs{sortIndicator("pct_two_or_more_orcids")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedTableData.map((d) => (
                  <tr
                    key={d.publisher}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-2 pr-4 font-medium">{d.publisher}</td>
                    <td className="py-2 px-4 text-right">{d.publications.toLocaleString()}</td>
                    <td className="py-2 px-4 text-right">{d.pct_one_orcid.toFixed(1)}%</td>
                    <td className="py-2 px-4 text-right">{d.pct_any_orcid.toFixed(1)}%</td>
                    <td className="py-2 pl-4 text-right">{d.pct_two_or_more_orcids.toFixed(1)}%</td>
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
