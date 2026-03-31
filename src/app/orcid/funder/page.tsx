"use client";

import { useState, useEffect, useMemo } from "react";
import ScatterPlot, { type ScatterDataPoint } from "@/components/charts/ScatterPlot";
import ChartContainer from "@/components/charts/ChartContainer";
import type { FunderAdoptionRow } from "@/types/adoption";

type SortField = "funder" | "country" | "region" | "research_pool" | "percentage_orcid" | "orcid_completeness";
type SortDir = "asc" | "desc";

export default function FunderPage() {
  const [data, setData] = useState<FunderAdoptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [minPool, setMinPool] = useState(1000);
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [highlightEntity, setHighlightEntity] = useState<string | undefined>();

  // State for the full funders table
  const [tableSearch, setTableSearch] = useState("");
  const [sortField, setSortField] = useState<SortField>("research_pool");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  useEffect(() => {
    fetch("/data/orcid/funder-adoption.json")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const regions = useMemo(() => [...new Set(data.map((d) => d.region))].sort(), [data]);

  const filteredData = useMemo(() => {
    return data.filter((d) => {
      if (d.research_pool < minPool) return false;
      if (selectedRegions.size > 0 && !selectedRegions.has(d.region)) return false;
      if (searchTerm && !d.funder.toLowerCase().includes(searchTerm.toLowerCase()))
        return false;
      return true;
    });
  }, [data, minPool, selectedRegions, searchTerm]);

  const scatterData: ScatterDataPoint[] = useMemo(
    () =>
      filteredData.map((d) => ({
        entity: d.funder,
        x: d.orcid_completeness,
        y: d.percentage_orcid,
        size: d.research_pool,
        group: d.region,
        extraText: `Country: ${d.country}<br>Region: ${d.region}`,
      })),
    [filteredData]
  );

  const toggleRegion = (region: string) => {
    setSelectedRegions((prev) => {
      const next = new Set(prev);
      if (next.has(region)) next.delete(region);
      else next.add(region);
      return next;
    });
  };

  const australianFunders = useMemo(
    () => filteredData.filter((d) => d.country === "Australia").sort((a, b) => b.percentage_orcid - a.percentage_orcid),
    [filteredData]
  );

  const arcAdoption = useMemo(
    () => data.find((d) => d.funder === "Australian Research Council")?.percentage_orcid,
    [data]
  );

  const nhmrcAdoption = useMemo(
    () => data.find((d) => d.funder === "National Health and Medical Research Council")?.percentage_orcid,
    [data]
  );

  const nhmrcCompleteness = useMemo(
    () => data.find((d) => d.funder === "National Health and Medical Research Council")?.orcid_completeness,
    [data]
  );

  // Full table: search, sort
  const allFundersTableData = useMemo(() => {
    let rows = [...data];
    if (tableSearch) {
      const term = tableSearch.toLowerCase();
      rows = rows.filter(
        (d) =>
          d.funder.toLowerCase().includes(term) ||
          d.country.toLowerCase().includes(term) ||
          d.region.toLowerCase().includes(term)
      );
    }
    rows.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc" ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDir === "asc" ? aVal - bVal : bVal - aVal;
      }
      return 0;
    });
    return rows;
  }, [data, tableSearch, sortField, sortDir]);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "funder" || field === "country" || field === "region" ? "asc" : "desc");
    }
  };

  const sortIndicator = (field: SortField) => {
    if (sortField !== field) return "";
    return sortDir === "asc" ? " \u25B2" : " \u25BC";
  };

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-text mb-2">ORCID Adoption by Funder</h1>
        <div className="animate-pulse bg-gray-200 rounded-lg h-96" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text mb-2">ORCID Adoption by Funder</h1>
      <p className="text-brand-muted mb-4">
        ORCID adoption and completeness by research funder, 2020-2024. Bubble size represents the
        number of researchers in the funder&apos;s research pool.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-sm text-brand-text">
        <p>
          <strong>Key finding:</strong>{" "}
          {arcAdoption != null && nhmrcAdoption != null && nhmrcCompleteness != null ? (
            <>
              Researchers funded by ARC have {arcAdoption.toFixed(1)}% ORCID adoption; NHMRC{" "}
              {nhmrcAdoption.toFixed(1)}%. NHMRC has the 2nd highest ORCID adoption rate globally.
              ARC funded researchers have the 6th highest average ORCID completeness rate globally
              ({nhmrcCompleteness != null ? `NHMRC completeness: ${nhmrcCompleteness.toFixed(1)}%` : ""}).
            </>
          ) : (
            <span className="animate-pulse">Loading funder statistics...</span>
          )}
        </p>
      </div>

      {/* Filters */}
      <div className="bg-brand-surface rounded-lg border border-brand-border p-4 mb-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs text-brand-muted mb-1">Search funder</label>
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
              min={100}
              max={10000}
              step={100}
              value={minPool}
              onChange={(e) => setMinPool(Number(e.target.value))}
              className="w-40"
            />
          </div>
          <div>
            <label className="block text-xs text-brand-muted mb-1">Regions</label>
            <div className="flex flex-wrap gap-1">
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => toggleRegion(region)}
                  className={`px-2 py-0.5 text-xs rounded-full border transition-colors ${
                    selectedRegions.size === 0 || selectedRegions.has(region)
                      ? "bg-brand-primary text-white border-brand-primary"
                      : "bg-white text-brand-muted border-brand-border"
                  }`}
                >
                  {region}
                </button>
              ))}
            </div>
          </div>
          <div className="text-xs text-brand-muted">
            Showing {filteredData.length} of {data.length} funders
          </div>
        </div>
      </div>

      {/* Main scatter plot */}
      <ChartContainer
        title="ORCID Adoption and Completeness by Funder, 2020-2024"
        source="Dimensions, ORCID. Aggregate statistics only."
        toolkitRef="Section 3.1.2"
      >
        <ScatterPlot
          data={scatterData}
          xLabel="ORCID Completeness (%)"
          yLabel="ORCID Adoption (%)"
          sizeLabel="Research Pool"
          height={550}
          highlightEntity={highlightEntity}
          colorBy="region"
        />
      </ChartContainer>

      {/* Australian funders highlight table */}
      {australianFunders.length > 0 && (
        <div className="mt-6">
          <ChartContainer
            title="Australian Funders"
            subtitle="Highlighted from the scatter plot above"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-border text-left text-brand-muted">
                    <th className="pb-2 font-medium">Funder</th>
                    <th className="pb-2 font-medium text-right">Research Pool</th>
                    <th className="pb-2 font-medium text-right">ORCID Adoption</th>
                    <th className="pb-2 font-medium text-right">ORCID Completeness</th>
                  </tr>
                </thead>
                <tbody>
                  {australianFunders.map((f) => (
                    <tr
                      key={f.funder}
                      className="border-b border-gray-50 hover:bg-gray-50 cursor-pointer"
                      onMouseEnter={() => setHighlightEntity(f.funder)}
                      onMouseLeave={() => setHighlightEntity(undefined)}
                    >
                      <td className="py-2 font-medium">{f.funder}</td>
                      <td className="py-2 text-right">{f.research_pool.toLocaleString()}</td>
                      <td className="py-2 text-right">{f.percentage_orcid.toFixed(1)}%</td>
                      <td className="py-2 text-right">{f.orcid_completeness.toFixed(1)}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartContainer>
        </div>
      )}

      {/* Full funders table */}
      <div className="mt-6">
        <ChartContainer
          title="All Funders"
          subtitle="Search and sort to explore all funders globally. Click column headers to sort."
        >
          <div className="mb-3">
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Search by funder, country, or region..."
              className="px-3 py-1.5 border border-brand-border rounded text-sm w-72"
            />
            <span className="ml-3 text-xs text-brand-muted">
              {allFundersTableData.length} funder{allFundersTableData.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="overflow-x-auto max-h-[500px] overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-white">
                <tr className="border-b border-brand-border text-left text-brand-muted">
                  <th
                    className="pb-2 font-medium cursor-pointer hover:text-brand-text select-none"
                    onClick={() => handleSort("funder")}
                  >
                    Funder{sortIndicator("funder")}
                  </th>
                  <th
                    className="pb-2 font-medium cursor-pointer hover:text-brand-text select-none"
                    onClick={() => handleSort("country")}
                  >
                    Country{sortIndicator("country")}
                  </th>
                  <th
                    className="pb-2 font-medium cursor-pointer hover:text-brand-text select-none"
                    onClick={() => handleSort("region")}
                  >
                    Region{sortIndicator("region")}
                  </th>
                  <th
                    className="pb-2 font-medium text-right cursor-pointer hover:text-brand-text select-none"
                    onClick={() => handleSort("research_pool")}
                  >
                    Research Pool{sortIndicator("research_pool")}
                  </th>
                  <th
                    className="pb-2 font-medium text-right cursor-pointer hover:text-brand-text select-none"
                    onClick={() => handleSort("percentage_orcid")}
                  >
                    ORCID Adoption %{sortIndicator("percentage_orcid")}
                  </th>
                  <th
                    className="pb-2 font-medium text-right cursor-pointer hover:text-brand-text select-none"
                    onClick={() => handleSort("orcid_completeness")}
                  >
                    ORCID Completeness %{sortIndicator("orcid_completeness")}
                  </th>
                </tr>
              </thead>
              <tbody>
                {allFundersTableData.map((d) => {
                  const isAustralian = d.country === "Australia";
                  return (
                    <tr
                      key={`${d.funder}-${d.country}`}
                      className={`border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                        isAustralian ? "bg-blue-50" : ""
                      }`}
                      onMouseEnter={() => setHighlightEntity(d.funder)}
                      onMouseLeave={() => setHighlightEntity(undefined)}
                    >
                      <td className="py-2 font-medium">{d.funder}</td>
                      <td className="py-2 text-brand-muted">{d.country}</td>
                      <td className="py-2 text-brand-muted">{d.region}</td>
                      <td className="py-2 text-right">{d.research_pool.toLocaleString()}</td>
                      <td className="py-2 text-right">{d.percentage_orcid.toFixed(1)}%</td>
                      <td className="py-2 text-right">{d.orcid_completeness.toFixed(1)}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </ChartContainer>
      </div>
    </div>
  );
}
