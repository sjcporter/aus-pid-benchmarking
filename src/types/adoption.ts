export interface AdoptionDataPoint {
  entity: string;
  country?: string;
  income_group?: string;
  region?: string;
  research_pool: number;
  orcid_researchers: number;
  percentage_orcid: number;
  orcid_completeness: number;
  date_range?: string;
}

export interface FunderAdoptionRow {
  funder: string;
  country: string;
  income_group: string;
  region: string;
  research_pool: number;
  orcid_researchers: number;
  percentage_orcid: number;
  percentage_orcid_orcid: number;
  percentage_orcid_crossref: number;
  all_orcid_assertions: number;
  sum_only_dimensions_assertions: number;
  sum_all_orcid_assertions: number;
  orcid_completeness: number;
}

export interface Recommendation {
  id: string;
  reference: string;
  section: string;
  category: "inputs" | "outputs" | "orcid";
  text: string;
}

export interface TimeSeriesPoint {
  year: number;
  [seriesName: string]: number;
}
