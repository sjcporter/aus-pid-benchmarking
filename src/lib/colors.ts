export const pidColors = {
  orcid: "#A6CE39",
  ror: "#53B14E",
  doi: "#FCB426",
  raid: "#2D9CDB",
  igsn: "#9B51E0",
} as const;

export const incomeGroupColors: Record<string, string> = {
  "High income": "#1F407A",
  "Upper middle income": "#2D9CDB",
  "Lower middle income": "#F2994A",
  "Low income": "#EB5757",
};

// World Bank region colors - matching report Datawrapper charts
export const regionColors: Record<string, string> = {
  "East Asia & Pacific": "#1F407A",
  "Europe & Central Asia": "#4FB8E0",
  "Latin America & Caribbean": "#F2994A",
  "Middle East & North Africa": "#EB5757",
  "North America": "#47AB4C",
  "South Asia": "#9B51E0",
  "Sub-Saharan Africa": "#A6CE39",
};

export const brand = {
  primary: "#1f407a",
  secondary: "#4FB8E0",
  background: "#F8F9FA",
  surface: "#FFFFFF",
  text: "#2C3132",
  textMuted: "#6B7280",
  accent: "#47AB4C",
  border: "#E5E7EB",
} as const;
