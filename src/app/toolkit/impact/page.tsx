import Link from "next/link";

const behaviours = [
  {
    behaviour: "Funders can track grant outputs automatically",
    benchmark: "% of publications with valid grant IDs in funding metadata",
    link: "/toolkit/inputs/grants",
  },
  {
    behaviour: "Research data is cited when used",
    benchmark: "Data citation rate by field and country",
    link: "/toolkit/inputs/data",
  },
  {
    behaviour: "Institutional research output is discoverable",
    benchmark: "Repository coverage with DOIs, ORCID, and ROR",
    link: "/toolkit/inputs/organisations",
  },
  {
    behaviour: "Research impact includes non-traditional outputs",
    benchmark: "NTRO coverage in DataCite with persistent identifiers",
    link: "/toolkit/outputs/ntros",
  },
  {
    behaviour: "Policy impact is trackable",
    benchmark: "Altmetric attention measures linked to PID-identified outputs",
    link: "/toolkit/outputs/reports",
  },
];

export default function ImpactPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-brand-text mb-2">
        Impact & Evaluation
      </h1>
      <p className="text-brand-muted mb-6">
        Objective 4: improve our ability to understand the impact of research
        inputs and evaluate research quality, impact and evidence of public
        benefit. PIDs enable automated impact tracking across the full research
        lifecycle.
      </p>

      <div className="bg-brand-surface rounded-lg border border-brand-border mb-6">
        <div className="px-5 pt-5 pb-2">
          <h3 className="font-semibold text-brand-text">
            Desired Behaviours and Measurable Benchmarks
          </h3>
        </div>
        <div className="overflow-x-auto px-5 pb-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border text-left text-brand-muted">
                <th className="pb-2 font-medium pr-4">Desired Behaviour</th>
                <th className="pb-2 font-medium pr-4">Measurable Benchmark</th>
                <th className="pb-2 font-medium">Explore</th>
              </tr>
            </thead>
            <tbody>
              {behaviours.map((b) => (
                <tr key={b.behaviour} className="border-b border-gray-50">
                  <td className="py-3 pr-4 font-medium">{b.behaviour}</td>
                  <td className="py-3 pr-4 text-brand-muted">{b.benchmark}</td>
                  <td className="py-3">
                    <Link
                      href={b.link}
                      className="text-brand-primary text-xs underline"
                    >
                      View data &rarr;
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Link
        href="/recommendations"
        className="text-brand-primary text-sm underline"
      >
        View all 19 recommendations &rarr;
      </Link>
    </div>
  );
}
