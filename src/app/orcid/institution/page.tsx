"use client";

import { useState, useEffect, useMemo } from "react";
import ScatterPlot, { type ScatterDataPoint } from "@/components/charts/ScatterPlot";
import ChartContainer from "@/components/charts/ChartContainer";
import { basePath } from "@/lib/basepath";

interface InstitutionAdoptionRow {
  entity: string;
  institution: string;
  grid_id: string;
  country: string;
  research_pool: number;
  orcid_researchers: number;
  percentage_orcid: number;
  orcid_completeness: number;
}

type SortKey = "institution" | "research_pool" | "percentage_orcid" | "orcid_completeness";

export default function OrcidInstitutionPage() {
  const [data, setData] = useState<InstitutionAdoptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [minPool, setMinPool] = useState(500);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("research_pool");
  const [sortAsc, setSortAsc] = useState(false);
  const [highlightEntity, setHighlightEntity] = useState<string | undefined>();

  useEffect(() => {
    fetch(`${basePath}/data/orcid/institution-adoption-aus.json`)
      .then((r) => r.json())
      .then((d: InstitutionAdoptionRow[]) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const filteredData = useMemo(() => {
    return data.filter((d) => {
      if (d.institution === "Other") return false;
      if (d.research_pool < minPool) return false;
      if (searchTerm && !d.institution.toLowerCase().includes(searchTerm.toLowerCase()))
        return false;
      return true;
    });
  }, [data, minPool, searchTerm]);

  const scatterData: ScatterDataPoint[] = useMemo(
    () =>
      filteredData.map((d) => ({
        entity: d.institution,
        x: d.orcid_completeness,
        y: d.percentage_orcid,
        size: d.research_pool,
        group: "Australian Institution",
        extraText: `GRID: ${d.grid_id}<br>Researchers: ${d.orcid_researchers.toLocaleString()} / ${d.research_pool.toLocaleString()}`,
      })),
    [filteredData]
  );

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      setSortAsc((prev) => !prev);
    } else {
      setSortKey(key);
      setSortAsc(key === "institution");
    }
  };

  const sortedData = useMemo(() => {
    const sorted = [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortAsc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      return sortAsc ? (aVal as number) - (bVal as number) : (bVal as number) - (aVal as number);
    });
    return sorted;
  }, [filteredData, sortKey, sortAsc]);

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return "";
    return sortAsc ? " \u25B2" : " \u25BC";
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-text mb-2">
          ORCID Adoption by Australian Institution
        </h1>
        <div className="animate-pulse bg-gray-200 rounded-lg h-96" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text mb-2">
        ORCID Adoption by Australian Institution
      </h1>
      <p className="text-brand-muted mb-6">
        ORCID adoption and completeness across Australian research institutions,
        2020-2024. Bubble size represents the number of researchers in each
        institution&apos;s research pool. Use the filters below to narrow the view.
      </p>

      {/* Filter panel */}
      <div className="bg-brand-surface rounded-lg border border-brand-border p-4 mb-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs text-brand-muted mb-1">Search institution</label>
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
              Min research pool: {minPool.toLocaleString()}
            </label>
            <input
              type="range"
              min={50}
              max={5000}
              step={50}
              value={minPool}
              onChange={(e) => setMinPool(Number(e.target.value))}
              className="w-40"
            />
          </div>
          <div className="text-xs text-brand-muted">
            Showing {filteredData.length} of {data.filter((d) => d.institution !== "Other").length} institutions
          </div>
        </div>
      </div>

      {/* Scatter plot */}
      <ChartContainer
        title="ORCID Adoption vs Completeness by Australian Institution"
        source="Dimensions, ORCID. Aggregate statistics only."
        toolkitRef="Section 3.1.4"
      >
        <ScatterPlot
          data={scatterData}
          xLabel="ORCID Completeness (%)"
          yLabel="ORCID Adoption (%)"
          sizeLabel="Research Pool"
          height={550}
          highlightEntity={highlightEntity}
        />
      </ChartContainer>

      {/* Sortable table */}
      <div className="mt-6">
        <ChartContainer
          title="Australian Institutions"
          subtitle={`${filteredData.length} institutions, sorted by ${sortKey.replace(/_/g, " ")}`}
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border text-left text-brand-muted">
                  <th
                    className="pb-2 font-medium cursor-pointer hover:text-brand-text"
                    onClick={() => handleSort("institution")}
                  >
                    Institution{sortIndicator("institution")}
                  </th>
                  <th
                    className="pb-2 font-medium text-right cursor-pointer hover:text-brand-text"
                    onClick={() => handleSort("research_pool")}
                  >
                    Research Pool{sortIndicator("research_pool")}
                  </th>
                  <th
                    className="pb-2 font-medium text-right cursor-pointer hover:text-brand-text"
                    onClick={() => handleSort("percentage_orcid")}
                  >
                    ORCID Adoption{sortIndicator("percentage_orcid")}
                  </th>
                  <th
                    className="pb-2 font-medium text-right cursor-pointer hover:text-brand-text"
                    onClick={() => handleSort("orcid_completeness")}
                  >
                    ORCID Completeness{sortIndicator("orcid_completeness")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {sortedData.map((d) => (
                  <tr
                    key={d.grid_id}
                    className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                    onMouseEnter={() => setHighlightEntity(d.institution)}
                    onMouseLeave={() => setHighlightEntity(undefined)}
                  >
                    <td className="py-2 font-medium">{d.institution}</td>
                    <td className="py-2 text-right">{d.research_pool.toLocaleString()}</td>
                    <td className="py-2 text-right">{d.percentage_orcid.toFixed(1)}%</td>
                    <td className="py-2 text-right">{d.orcid_completeness.toFixed(1)}%</td>
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
