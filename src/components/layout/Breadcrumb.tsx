"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const labelMap: Record<string, string> = {
  toolkit: "Toolkit",
  inputs: "Research Inputs",
  outputs: "Research Outputs",
  organisations: "Organisations (ROR)",
  activities: "Activities (RAiD)",
  grants: "Grants",
  facilities: "Facilities",
  data: "Research Data",
  samples: "Samples (IGSN)",
  instruments: "Instruments",
  reports: "Reports",
  methods: "Methods",
  ntros: "NTROs",
  dissertations: "Dissertations",
  publications: "Publications",
  reproducibility: "Reproducibility",
  impact: "Impact",
  capability: "Capability",
  orcid: "ORCID Benchmarking",
  country: "By Country",
  funder: "By Funder",
  publisher: "By Publisher",
  "field-of-research": "By Field of Research",
  institution: "By Institution",
  recipes: "Recipes",
  recommendations: "Recommendations",
  report: "Full Report",
};

export default function Breadcrumb() {
  const pathname = usePathname();
  if (pathname === "/") return null;

  const segments = pathname.split("/").filter(Boolean);
  const crumbs = segments.map((seg, i) => ({
    label: labelMap[seg] || seg,
    href: "/" + segments.slice(0, i + 1).join("/"),
  }));

  return (
    <nav className="flex items-center gap-1 text-sm text-brand-muted px-6 py-3">
      <Link href="/" className="hover:text-brand-primary">
        Home
      </Link>
      {crumbs.map((crumb, i) => (
        <span key={crumb.href} className="flex items-center gap-1">
          <ChevronRight size={12} />
          {i === crumbs.length - 1 ? (
            <span className="text-brand-text font-medium">{crumb.label}</span>
          ) : (
            <Link href={crumb.href} className="hover:text-brand-primary">
              {crumb.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
