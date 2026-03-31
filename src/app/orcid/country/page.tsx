"use client";

import { useState, useEffect, useMemo } from "react";
import ScatterPlot, { type ScatterDataPoint } from "@/components/charts/ScatterPlot";
import ChartContainer from "@/components/charts/ChartContainer";

interface CountryAdoptionRow {
  entity: string;
  country: string;
  income_group: string;
  region: string;
  research_pool: number;
  orcid_researchers: number;
  percentage_orcid: number;
  orcid_completeness: number;
  date_range: string;
}

type DateRangeFilter = "2020-2024" | "2015-2019" | "Both";

const ALL_REGIONS = [
  "East Asia & Pacific",
  "Europe & Central Asia",
  "Latin America & Caribbean",
  "Middle East & North Africa",
  "North America",
  "South Asia",
  "Sub-Saharan Africa",
];

export default function OrcidCountryPage() {
  const [data, setData] = useState<CountryAdoptionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [minPool, setMinPool] = useState(5000);
  const [selectedRegions, setSelectedRegions] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");
  const [dateRange, setDateRange] = useState<DateRangeFilter>("2020-2024");
  const [highlightEntity, setHighlightEntity] = useState<string | undefined>();

  useEffect(() => {
    fetch("/data/orcid/country-adoption.json")
      .then((r) => r.json())
      .then((d) => {
        setData(d);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const regions = useMemo(() => {
    const dataRegions = new Set(data.map((d) => d.region));
    return ALL_REGIONS.filter((r) => dataRegions.has(r));
  }, [data]);

  const filteredData = useMemo(() => {
    return data.filter((d) => {
      if (d.research_pool < minPool) return false;
      if (selectedRegions.size > 0 && !selectedRegions.has(d.region)) return false;
      if (searchTerm && !d.country.toLowerCase().includes(searchTerm.toLowerCase()))
        return false;
      if (dateRange !== "Both" && d.date_range !== dateRange) return false;
      return true;
    });
  }, [data, minPool, selectedRegions, searchTerm, dateRange]);

  const filteredCountryCount = useMemo(() => {
    const countries = new Set(filteredData.map((d) => d.country));
    return countries.size;
  }, [filteredData]);

  const totalCountryCount = useMemo(() => {
    const countries = new Set(
      data
        .filter((d) => dateRange === "Both" || d.date_range === dateRange)
        .map((d) => d.country)
    );
    return countries.size;
  }, [data, dateRange]);

  const scatterData: ScatterDataPoint[] = useMemo(() => {
    if (dateRange !== "Both") {
      return filteredData.map((d) => ({
        entity: d.country,
        x: d.orcid_completeness,
        y: d.percentage_orcid,
        size: d.research_pool,
        group: d.region,
        extraText: `Region: ${d.region}<br>Period: ${d.date_range}`,
      }));
    }

    // When "Both" is selected, suffix the entity name with the period so both points show
    return filteredData.map((d) => ({
      entity: `${d.country} (${d.date_range})`,
      x: d.orcid_completeness,
      y: d.percentage_orcid,
      size: d.research_pool,
      group: d.date_range === "2020-2024" ? d.region : `${d.region} (2015-2019)`,
      extraText: `Region: ${d.region}<br>Period: ${d.date_range}`,
    }));
  }, [filteredData, dateRange]);

  const toggleRegion = (region: string) => {
    setSelectedRegions((prev) => {
      const next = new Set(prev);
      if (next.has(region)) next.delete(region);
      else next.add(region);
      return next;
    });
  };

  const top20 = useMemo(() => {
    const periodData = dateRange === "Both"
      ? filteredData.filter((d) => d.date_range === "2020-2024")
      : filteredData;
    return [...periodData].sort((a, b) => b.percentage_orcid - a.percentage_orcid).slice(0, 20);
  }, [filteredData, dateRange]);

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-brand-text mb-2">ORCID Adoption by Country</h1>
        <div className="animate-pulse bg-gray-200 rounded-lg h-96" />
      </div>
    );
  }

  const dateRangeOptions: DateRangeFilter[] = ["2020-2024", "2015-2019", "Both"];

  const chartTitle = dateRange === "Both"
    ? "ORCID Adoption and Completeness by Country, 2015-2024"
    : `ORCID Adoption and Completeness by Country, ${dateRange}`;

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text mb-2">ORCID Adoption by Country</h1>
      <p className="text-brand-muted mb-4">
        To benchmark Australia&apos;s ORCID adoption at a country level, we compare the total number
        of identifiable researchers within Dimensions that have claimed an affiliation to an
        institution within a country in a five-year period. These profiles are then matched to an
        ORCID identity, allowing the percentage of researchers by country that have an ORCID to be
        measured.
      </p>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4 text-sm text-brand-text space-y-2">
        <p>
          <strong>Key finding:</strong> Within the period 2020-2024, Australia has an estimated
          adoption rate of 71%. This is the 3rd highest ORCID adoption rate for countries with
          estimated researcher pools of greater than 50,000. The average completeness of these
          records is 53%, ranking 2nd against the same set of countries.
        </p>
        <p>
          <strong>Progress:</strong> In the period 2015-2019, an estimated 48% of Australian
          researchers had created an ORCID. In the subsequent 5 year period, ORCID adoption
          increased by 23 percentage points.
        </p>
      </div>

      {/* Filters */}
      <div className="bg-brand-surface rounded-lg border border-brand-border p-4 mb-4">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs text-brand-muted mb-1">Search country</label>
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
              min={1000}
              max={100000}
              step={1000}
              value={minPool}
              onChange={(e) => setMinPool(Number(e.target.value))}
              className="w-40"
            />
          </div>
          <div>
            <label className="block text-xs text-brand-muted mb-1">Date range</label>
            <div className="flex gap-1">
              {dateRangeOptions.map((option) => (
                <button
                  key={option}
                  onClick={() => setDateRange(option)}
                  className={`px-3 py-1 text-xs rounded border transition-colors ${
                    dateRange === option
                      ? "bg-brand-primary text-white border-brand-primary"
                      : "bg-white text-brand-muted border-brand-border hover:border-brand-primary"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
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
            Showing {filteredCountryCount} of {totalCountryCount} countries
          </div>
        </div>
      </div>

      {/* Main scatter plot */}
      <ChartContainer
        title={chartTitle}
        source="Dimensions, ORCID. Aggregate statistics only."
        toolkitRef="Section 3.1.1"
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

      {/* Top 20 countries table */}
      <div className="mt-6">
        <ChartContainer
          title={`Top 20 Countries by ORCID Adoption${dateRange !== "Both" ? ` (${dateRange})` : " (2020-2024)"}`}
          subtitle="Sorted by ORCID adoption rate. Hover a row to highlight on the scatter plot."
        >
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-brand-border text-left text-brand-muted">
                  <th className="pb-2 font-medium">Country</th>
                  <th className="pb-2 font-medium">Region</th>
                  <th className="pb-2 font-medium text-right">Research Pool</th>
                  <th className="pb-2 font-medium text-right">ORCID Adoption %</th>
                  <th className="pb-2 font-medium text-right">ORCID Completeness %</th>
                </tr>
              </thead>
              <tbody>
                {top20.map((d) => {
                  const isAustralia = d.country === "Australia";
                  return (
                    <tr
                      key={d.country}
                      className={`border-b border-gray-50 hover:bg-gray-50 cursor-pointer ${
                        isAustralia ? "bg-blue-50 font-medium" : ""
                      }`}
                      onMouseEnter={() => setHighlightEntity(
                        dateRange === "Both" ? `${d.country} (${d.date_range})` : d.country
                      )}
                      onMouseLeave={() => setHighlightEntity(undefined)}
                    >
                      <td className="py-2 font-medium">{d.country}</td>
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
