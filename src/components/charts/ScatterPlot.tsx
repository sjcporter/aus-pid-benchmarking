"use client";

import dynamic from "next/dynamic";
import { incomeGroupColors, regionColors } from "@/lib/colors";

const Plot = dynamic(() => import("react-plotly.js"), { ssr: false });

export interface ScatterDataPoint {
  entity: string;
  x: number;
  y: number;
  size: number;
  group: string;
  extraText?: string;
}

interface ScatterPlotProps {
  data: ScatterDataPoint[];
  xLabel?: string;
  yLabel?: string;
  sizeLabel?: string;
  height?: number;
  highlightEntity?: string;
  maxBubbleSize?: number;
  colorBy?: "income_group" | "region" | "default";
}

export default function ScatterPlot({
  data,
  xLabel = "ORCID Completeness (%)",
  yLabel = "ORCID Adoption (%)",
  sizeLabel = "Research Pool",
  height = 500,
  highlightEntity,
  maxBubbleSize = 40,
  colorBy = "income_group",
}: ScatterPlotProps) {
  const groups = [...new Set(data.map((d) => d.group))];

  const traces = groups.map((group) => {
    const points = data.filter((d) => d.group === group);
    const colorMap = colorBy === "region" ? regionColors : incomeGroupColors;
    const color = colorMap[group] || "#999";

    return {
      x: points.map((p) => p.x),
      y: points.map((p) => p.y),
      text: points.map(
        (p) =>
          `<b>${p.entity}</b><br>${xLabel}: ${p.x.toFixed(1)}%<br>${yLabel}: ${p.y.toFixed(1)}%<br>${sizeLabel}: ${p.size.toLocaleString()}${p.extraText ? `<br>${p.extraText}` : ""}`
      ),
      hoverinfo: "text" as const,
      mode: "markers" as const,
      name: group,
      marker: {
        size: points.map((p) => p.size),
        sizemode: "area" as const,
        sizeref: (2.0 * Math.max(...data.map((d) => d.size))) / maxBubbleSize ** 2,
        color: points.map((p) =>
          highlightEntity && p.entity !== highlightEntity ? `${color}40` : color
        ),
        line: {
          width: points.map((p) =>
            highlightEntity && p.entity === highlightEntity ? 3 : 1
          ),
          color: points.map((p) =>
            highlightEntity && p.entity === highlightEntity ? "#000" : `${color}80`
          ),
        },
      },
      type: "scatter" as const,
    };
  });

  return (
    <Plot
      data={traces}
      layout={{
        height,
        margin: { l: 60, r: 20, t: 10, b: 50 },
        xaxis: {
          title: { text: xLabel },
          ticksuffix: "%",
          range: [0, 100],
          gridcolor: "#f0f0f0",
        },
        yaxis: {
          title: { text: yLabel },
          ticksuffix: "%",
          range: [0, 100],
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
  );
}
