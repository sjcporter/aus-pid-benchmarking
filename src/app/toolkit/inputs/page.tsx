"use client";

import Link from "next/link";
import {
  Building2,
  Compass,
  HandCoins,
  Warehouse,
  Database,
  TestTubes,
  Microscope,
} from "lucide-react";

const sections = [
  {
    title: "Organisations (ROR)",
    href: "/toolkit/inputs/organisations",
    icon: Building2,
    description:
      "Benchmarking Research Organization Registry (ROR) adoption across publishers, funders, and data repositories.",
  },
  {
    title: "Activities (RAiD)",
    href: "/toolkit/inputs/activities",
    icon: Compass,
    description:
      "Tracking the adoption of Research Activity Identifiers (RAiD) for linking research projects and their outputs.",
  },
  {
    title: "Grants",
    href: "/toolkit/inputs/grants",
    icon: HandCoins,
    description:
      "Measuring persistent identifier usage for research grants, connecting funding to outputs and outcomes.",
  },
  {
    title: "Facilities",
    href: "/toolkit/inputs/facilities",
    icon: Warehouse,
    description:
      "Assessing PID adoption for research facilities, enabling discovery and attribution of shared infrastructure.",
  },
  {
    title: "Research Data",
    href: "/toolkit/inputs/data",
    icon: Database,
    description:
      "Benchmarking DOI and PID adoption for research datasets across Australian repositories and institutions.",
  },
  {
    title: "Samples (IGSN)",
    href: "/toolkit/inputs/samples",
    icon: TestTubes,
    description:
      "Evaluating International Generic Sample Number (IGSN) adoption for physical samples and specimens.",
  },
  {
    title: "Instruments",
    href: "/toolkit/inputs/instruments",
    icon: Microscope,
    description:
      "Tracking persistent identifiers for research instruments and equipment registered in DataCite.",
  },
];

export default function InputsPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text mb-2">
        Benchmarks for Research Inputs
      </h1>
      <blockquote className="border-l-4 border-brand-primary bg-brand-surface rounded-r-lg pl-4 pr-5 py-4 mb-6 text-sm text-brand-muted italic">
        &ldquo;The strategy is accompanied by an evolving roadmap, which
        facilitates a stakeholder-driven approach to designing an actionable
        national collaborative plan. These benchmarks for research inputs assess
        how well persistent identifiers are adopted across the entities that go
        INTO research: organisations, activities, grants, facilities, data,
        samples, and instruments.&rdquo;
      </blockquote>

      <p className="text-brand-muted mb-6">
        Research inputs are the foundational resources that enable research
        activities. This section benchmarks persistent identifier adoption across
        7 types of research inputs, measuring how well Australian institutions
        are connecting their organisations, grants, data, instruments, and other
        resources into the global research infrastructure. Strong PID coverage
        for inputs improves discoverability, reproducibility, and attribution.
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
