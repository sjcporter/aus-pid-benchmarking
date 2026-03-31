"use client";

import Link from "next/link";
import {
  FileText,
  FlaskConical,
  Palette,
  GraduationCap,
  BookOpen,
} from "lucide-react";

const sections = [
  {
    title: "Reports",
    href: "/toolkit/outputs/reports",
    icon: FileText,
    description:
      "Benchmarking DOI adoption for research reports produced by Australian institutions and their global visibility.",
  },
  {
    title: "Methods",
    href: "/toolkit/outputs/methods",
    icon: FlaskConical,
    description:
      "Tracking persistent identifier usage for research methods and protocols, enabling reproducibility and reuse.",
  },
  {
    title: "NTROs",
    href: "/toolkit/outputs/ntros",
    icon: Palette,
    description:
      "Assessing PID adoption for Non-Traditional Research Outputs including creative works, exhibitions, and performances.",
  },
  {
    title: "Dissertations",
    href: "/toolkit/outputs/dissertations",
    icon: GraduationCap,
    description:
      "Benchmarking DOI adoption for dissertations and theses from Australian universities. Australia is the 3rd largest publisher of dissertations with DOIs globally.",
  },
  {
    title: "Publications",
    href: "/toolkit/outputs/publications",
    icon: BookOpen,
    description:
      "Benchmarking DOI adoption and Open Access trends for scholarly publications from Australian researchers and institutions.",
  },
];

export default function OutputsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text mb-2">
        Benchmarks for Research Outputs
      </h1>
      <p className="text-brand-muted mb-6">
        Research outputs are the products of research activities, from
        traditional publications to creative works. This section benchmarks
        persistent identifier adoption across 5 types of research outputs,
        measuring how well Australian institutions are connecting their reports,
        methods, dissertations, and publications into the global research
        infrastructure. Strong PID coverage for outputs improves
        discoverability, citation tracking, and impact measurement.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sections.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className="bg-brand-surface rounded-lg border border-brand-border p-5 hover:border-brand-primary hover:shadow-sm transition-all"
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon size={20} className="text-brand-primary" />
                <h3 className="font-semibold text-brand-text">
                  {section.title}
                </h3>
              </div>
              <p className="text-sm text-brand-muted">{section.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
