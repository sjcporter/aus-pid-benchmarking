"use client";

import { useState, useEffect, useMemo } from "react";
import ChartContainer from "@/components/charts/ChartContainer";
import MetricCard from "@/components/content/MetricCard";

interface Facility {
  ror_id: string;
  facility: string;
  publications: number;
}

interface DimensionsFacility {
  facility: string;
  grid_id: string;
  publications: number;
}

type SortField = "facility" | "publications";
type SortDir = "asc" | "desc";

export default function FacilitiesPage() {
  const [data, setData] = useState<Facility[]>([]);
  const [dimData, setDimData] = useState<DimensionsFacility[]>([]);
  const [loading, setLoading] = useState(true);
  const [sortField, setSortField] = useState<SortField>("publications");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [searchTerm, setSearchTerm] = useState("");
  const [dimSortField, setDimSortField] = useState<"facility" | "publications">("publications");
  const [dimSortDir, setDimSortDir] = useState<SortDir>("desc");
  const [dimSearchTerm, setDimSearchTerm] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/data/inputs/facilities.json").then((r) => r.json()),
      fetch("/data/inputs/facilities-dimensions.json").then((r) => r.json()),
    ])
      .then(([facilities, dimFacilities]: [Facility[], DimensionsFacility[]]) => {
        setData(facilities);
        setDimData(dimFacilities);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(field === "facility" ? "asc" : "desc");
    }
  };

  const sortIndicator = (field: SortField) => {
    if (sortField !== field) return "";
    return sortDir === "asc" ? " \u25B2" : " \u25BC";
  };

  const filtered = useMemo(() => {
    let rows = [...data];
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      rows = rows.filter((d) => d.facility.toLowerCase().includes(term));
    }
    rows.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return sortDir === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
    return rows;
  }, [data, sortField, sortDir, searchTerm]);

  const totalPublications = useMemo(
    () => data.reduce((sum, d) => sum + d.publications, 0),
    [data]
  );

  const handleDimSort = (field: "facility" | "publications") => {
    if (dimSortField === field) {
      setDimSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setDimSortField(field);
      setDimSortDir(field === "facility" ? "asc" : "desc");
    }
  };

  const dimSortIndicator = (field: "facility" | "publications") => {
    if (dimSortField !== field) return "";
    return dimSortDir === "asc" ? " \u25B2" : " \u25BC";
  };

  const filteredDim = useMemo(() => {
    let rows = [...dimData];
    if (dimSearchTerm) {
      const term = dimSearchTerm.toLowerCase();
      rows = rows.filter((d) => d.facility.toLowerCase().includes(term));
    }
    rows.sort((a, b) => {
      const aVal = a[dimSortField];
      const bVal = b[dimSortField];
      if (typeof aVal === "string" && typeof bVal === "string") {
        return dimSortDir === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      return dimSortDir === "asc"
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
    return rows;
  }, [dimData, dimSortField, dimSortDir, dimSearchTerm]);

  const totalDimPublications = useMemo(
    () => dimData.reduce((sum, d) => sum + d.publications, 0),
    [dimData]
  );

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-text mb-2">
          Research Facilities
        </h1>
        <div className="animate-pulse bg-gray-200 rounded-lg h-96" />
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text mb-2">
        Research Facilities
      </h1>
      <p className="text-brand-muted mb-6">
        Australian research facilities identified in scholarly publications
        through their ROR (Research Organization Registry) identifiers. These
        facilities include synchrotrons, research institutes, and centres of
        excellence that contribute to Australia&apos;s research output.
      </p>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MetricCard
          label="Total Facilities"
          value={data.length.toLocaleString()}
          subtitle="Unique research facilities with ROR IDs"
        />
        <MetricCard
          label="Total Publications"
          value={totalPublications.toLocaleString()}
          subtitle="Publications linked to facilities"
        />
        <MetricCard
          label="Avg Publications per Facility"
          value={
            data.length > 0
              ? (totalPublications / data.length).toFixed(1)
              : "0"
          }
          subtitle="Mean publications per facility"
        />
      </div>

      {/* Search filter */}
      <div className="bg-brand-surface rounded-lg border border-brand-border p-4 mb-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs text-brand-muted mb-1">
              Search facility
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Type to search..."
              className="px-3 py-1.5 border border-brand-border rounded text-sm w-64"
            />
          </div>
          <div className="text-xs text-brand-muted">
            Showing {filtered.length} of {data.length} facilities
          </div>
        </div>
      </div>

      {/* Facilities Table */}
      <ChartContainer
        title="Research Facilities with ROR Identifiers"
        source="Crossref, ROR. Facilities identified through directly asserted ROR affiliations in Crossref metadata, 2020-2024."
        toolkitRef="Section 2.2.4"
        recipeLink="/recipes"
      >
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border text-left text-brand-muted">
                <th
                  className="pb-2 font-medium cursor-pointer hover:text-brand-text select-none"
                  onClick={() => handleSort("facility")}
                >
                  Facility{sortIndicator("facility")}
                </th>
                <th className="pb-2 font-medium">ROR ID</th>
                <th
                  className="pb-2 font-medium text-right cursor-pointer hover:text-brand-text select-none"
                  onClick={() => handleSort("publications")}
                >
                  Publications{sortIndicator("publications")}
                </th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((f) => {
                const rorId = f.ror_id.replace("https://ror.org/", "");
                return (
                  <tr
                    key={f.ror_id}
                    className="border-b border-gray-50 hover:bg-gray-50"
                  >
                    <td className="py-2 font-medium">{f.facility}</td>
                    <td className="py-2">
                      <a
                        href={f.ror_id}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-brand-primary hover:underline"
                      >
                        {rorId}
                      </a>
                    </td>
                    <td className="py-2 text-right">
                      {f.publications.toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ChartContainer>

      {/* Comparison note */}
      {dimData.length > 0 && (
        <>
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-sm text-blue-900">
              <span className="font-semibold">Note:</span> The table above shows facilities identified through{" "}
              <strong>direct ROR assertions</strong> in Crossref metadata. The table below shows facilities identified
              through <strong>algorithmic identification via Dimensions</strong> using GRID IDs. Differences in counts
              reflect the two distinct identification methods.
            </p>
          </div>

          {/* Dimensions search filter */}
          <div className="bg-brand-surface rounded-lg border border-brand-border p-4 mb-4">
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-xs text-brand-muted mb-1">
                  Search facility (Dimensions)
                </label>
                <input
                  type="text"
                  value={dimSearchTerm}
                  onChange={(e) => setDimSearchTerm(e.target.value)}
                  placeholder="Type to search..."
                  className="px-3 py-1.5 border border-brand-border rounded text-sm w-64"
                />
              </div>
              <div className="text-xs text-brand-muted">
                Showing {filteredDim.length} of {dimData.length} facilities |{" "}
                Total publications: {totalDimPublications.toLocaleString()}
              </div>
            </div>
          </div>

          {/* Dimensions Facilities Table */}
          <ChartContainer
            title="Facilities by Publication Volume (Dimensions)"
            subtitle="Australian research facilities identified algorithmically via Dimensions using GRID identifiers"
            source="Dimensions. Algorithmic identification of Australian research facilities via GRID IDs."
            recipeLink="/recipes"
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-brand-border text-left text-brand-muted">
                    <th
                      className="pb-2 font-medium cursor-pointer hover:text-brand-text select-none"
                      onClick={() => handleDimSort("facility")}
                    >
                      Facility{dimSortIndicator("facility")}
                    </th>
                    <th className="pb-2 font-medium">GRID ID</th>
                    <th
                      className="pb-2 font-medium text-right cursor-pointer hover:text-brand-text select-none"
                      onClick={() => handleDimSort("publications")}
                    >
                      Publications{dimSortIndicator("publications")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDim.map((f) => (
                    <tr
                      key={f.grid_id}
                      className="border-b border-gray-50 hover:bg-gray-50"
                    >
                      <td className="py-2 font-medium">{f.facility}</td>
                      <td className="py-2">
                        <span className="text-brand-muted font-mono text-xs">
                          {f.grid_id}
                        </span>
                      </td>
                      <td className="py-2 text-right">
                        {f.publications.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </ChartContainer>
        </>
      )}
    </div>
  );
}
