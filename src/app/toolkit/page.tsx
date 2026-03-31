import Link from "next/link";
import {
  Database,
  BookOpen,
  FileCheck,
  Lightbulb,
  Users,
} from "lucide-react";

const sections = [
  {
    title: "Research Inputs",
    href: "/toolkit/inputs",
    icon: Database,
    description:
      "Benchmarks for organisations (ROR), activities (RAiD), grants, facilities, research data, samples (IGSN), and instruments.",
    count: "7 benchmarks",
  },
  {
    title: "Research Outputs",
    href: "/toolkit/outputs",
    icon: BookOpen,
    description:
      "Benchmarks for reports, methods/protocols, NTROs, dissertations, and publications.",
    count: "5 benchmarks",
  },
  {
    title: "Reproducibility & Provenance",
    href: "/toolkit/reproducibility",
    icon: FileCheck,
    description:
      "How PIDs improve research reproducibility, provenance, and attribution while minimising administrative burden.",
  },
  {
    title: "Impact & Evaluation",
    href: "/toolkit/impact",
    icon: Lightbulb,
    description:
      "Understanding the impact of research inputs and evaluating research quality, impact and evidence of public benefit.",
  },
  {
    title: "Research Capability",
    href: "/toolkit/capability",
    icon: Users,
    description: "Mapping Australia's research capability through persistent identifiers.",
  },
];

export default function ToolkitPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text mb-2">
        PID Benchmarking Toolkit
      </h1>
      <p className="text-brand-muted mb-6">
        A comprehensive toolkit aligned to the Australian National PID
        Strategy&apos;s five objectives, benchmarking persistent identifier
        adoption across research inputs, outputs, reproducibility, impact, and
        capability. The toolkit provides the first systematic assessment of how
        well Australia&apos;s research infrastructure is connected through
        persistent identifiers, offering 44 benchmarking queries with
        reproducible methodology, international comparisons, and actionable
        recommendations. It is designed to help institutions, funders, and
        policymakers understand the current state of PID adoption and identify
        where coordinated effort is most needed to strengthen Australia&apos;s
        digital research ecosystem.
      </p>

      {/* --- Australian National PID Strategy Objectives --- */}
      <section className="mb-8">
        <h2 className="text-lg font-semibold text-brand-text mb-4">
          Australian National PID Strategy Objectives
        </h2>
        <div className="grid grid-cols-1 gap-3">
          {[
            {
              num: 1,
              text: "Increase the Findability, Accessibility, Interoperability and Reuse of inputs to research",
            },
            {
              num: 2,
              text: "Increase the Findability, Accessibility, Interoperability and Reuse of research outputs",
            },
            {
              num: 3,
              text: "Improve research reproducibility, provenance and attribution while minimising administrative burden",
            },
            {
              num: 4,
              text: "Improve our ability to understand the impact of research inputs and evaluate research quality, impact and evidence of public benefit",
            },
            {
              num: 5,
              text: "Improve our ability to map Australia\u2019s research capability",
            },
          ].map((obj) => (
            <div
              key={obj.num}
              className="bg-brand-surface rounded-lg border border-brand-border p-4 flex items-start gap-4"
            >
              <span className="flex-shrink-0 w-8 h-8 rounded-full bg-brand-primary text-white flex items-center justify-center text-sm font-bold">
                {obj.num}
              </span>
              <p className="text-sm text-brand-muted pt-1">{obj.text}</p>
            </div>
          ))}
        </div>
      </section>

      <h2 className="text-lg font-semibold text-brand-text mb-4">
        Explore the Toolkit
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                {section.count && (
                  <span className="text-xs bg-gray-100 text-brand-muted px-2 py-0.5 rounded ml-auto">
                    {section.count}
                  </span>
                )}
              </div>
              <p className="text-sm text-brand-muted">{section.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
