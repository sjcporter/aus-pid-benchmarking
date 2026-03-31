import Link from "next/link";

const scenarios = [
  {
    scenario: "Researcher moves between institutions",
    pids: "ORCID, ROR",
    benefit: "Publication history follows the researcher, not the institution",
  },
  {
    scenario: "Grant application requires track record",
    pids: "ORCID, DOI, Grant ID",
    benefit: "Automated CV generation from ORCID profile, linked to grant outputs",
  },
  {
    scenario: "Dataset cited in a publication",
    pids: "DOI (dataset), DOI (publication)",
    benefit: "Data citation creates provenance chain from data to finding",
  },
  {
    scenario: "Instrument used in experiment",
    pids: "PIDINST, DOI (dataset), ORCID",
    benefit: "Complete provenance from instrument to data to publication to researcher",
  },
  {
    scenario: "Sample collected in field study",
    pids: "IGSN, DOI (dataset), ROR",
    benefit: "Physical sample linked to digital record, institution, and publications",
  },
  {
    scenario: "Research activity spanning multiple institutions",
    pids: "RAiD, ROR, ORCID",
    benefit: "Single identifier for the activity linking all participants and outputs",
  },
];

export default function ReproducibilityPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-brand-text mb-2">
        Reproducibility, Provenance & Reducing Academic Burden
      </h1>
      <p className="text-brand-muted mb-6">
        Objective 3 of the Australian National PID Strategy: improve research
        reproducibility, provenance and attribution while minimising
        administrative burden. PIDs create machine-readable links between
        research entities that enable automated tracking and reduce manual
        reporting.
      </p>

      <div className="bg-brand-surface rounded-lg border border-brand-border mb-6">
        <div className="px-5 pt-5 pb-2">
          <h3 className="font-semibold text-brand-text">
            Scenarios for Reducing Academic Burden through PIDs
          </h3>
        </div>
        <div className="overflow-x-auto px-5 pb-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-brand-border text-left text-brand-muted">
                <th className="pb-2 font-medium pr-4">Scenario</th>
                <th className="pb-2 font-medium pr-4">PIDs Involved</th>
                <th className="pb-2 font-medium">Benefit</th>
              </tr>
            </thead>
            <tbody>
              {scenarios.map((s) => (
                <tr key={s.scenario} className="border-b border-gray-50">
                  <td className="py-3 pr-4 font-medium">{s.scenario}</td>
                  <td className="py-3 pr-4">
                    <div className="flex flex-wrap gap-1">
                      {s.pids.split(", ").map((pid) => (
                        <span
                          key={pid}
                          className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded"
                        >
                          {pid}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 text-brand-muted">{s.benefit}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-brand-surface rounded-lg border border-brand-border p-5">
          <h3 className="font-semibold text-brand-text mb-2">
            How Inputs Recommendations Support This Objective
          </h3>
          <p className="text-sm text-brand-muted">
            Research input benchmarks (ROR, RAiD, Grants, IGSN, Instruments)
            create the foundation for reproducibility by ensuring every component
            of a research activity has a persistent, resolvable identifier.
          </p>
          <Link
            href="/toolkit/inputs"
            className="text-sm text-brand-primary mt-2 inline-block"
          >
            View Research Inputs benchmarks &rarr;
          </Link>
        </div>
        <div className="bg-brand-surface rounded-lg border border-brand-border p-5">
          <h3 className="font-semibold text-brand-text mb-2">
            How Outputs Recommendations Support This Objective
          </h3>
          <p className="text-sm text-brand-muted">
            Research output benchmarks ensure that publications, datasets,
            reports, and dissertations are all identified and linked back to their
            inputs, creating complete provenance chains.
          </p>
          <Link
            href="/toolkit/outputs"
            className="text-sm text-brand-primary mt-2 inline-block"
          >
            View Research Outputs benchmarks &rarr;
          </Link>
        </div>
      </div>

      {/* --- Key Recommendations Supporting Reproducibility --- */}
      <section className="mb-6">
        <h2 className="text-lg font-semibold text-brand-text mb-4">
          Key Recommendations Supporting This Objective
        </h2>
        <div className="grid grid-cols-1 gap-3">
          <Link
            href="/recommendations#R9"
            className="bg-brand-surface rounded-lg border border-brand-border p-4 hover:border-brand-primary hover:shadow-sm transition-all block"
          >
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 text-xs font-bold text-brand-primary bg-blue-50 px-2 py-0.5 rounded">
                R9
              </span>
              <p className="text-sm text-brand-muted">
                Australian research institutions work with their repository
                vendors to ensure that their workflows are &ldquo;ORCID
                first&rdquo; for all data types.
              </p>
            </div>
          </Link>
          <Link
            href="/recommendations#R6"
            className="bg-brand-surface rounded-lg border border-brand-border p-4 hover:border-brand-primary hover:shadow-sm transition-all block"
          >
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 text-xs font-bold text-brand-primary bg-blue-50 px-2 py-0.5 rounded">
                R6
              </span>
              <p className="text-sm text-brand-muted">
                The creation of a grant should trigger the creation of a RAiD
                (or the association of an existing RAiD). Creating a RAiD as
                soon as a project has been funded means that research objects,
                people and other associated metadata can begin to be associated
                with it from day one.
              </p>
            </div>
          </Link>
          <Link
            href="/recommendations#R11"
            className="bg-brand-surface rounded-lg border border-brand-border p-4 hover:border-brand-primary hover:shadow-sm transition-all block"
          >
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 text-xs font-bold text-brand-primary bg-blue-50 px-2 py-0.5 rounded">
                R11
              </span>
              <p className="text-sm text-brand-muted">
                Encourage links between instruments and the rest of the PID
                graph. As data and outputs are created from instruments, they
                should include a link to the instrument as standard.
              </p>
            </div>
          </Link>
          <Link
            href="/recommendations#R10"
            className="bg-brand-surface rounded-lg border border-brand-border p-4 hover:border-brand-primary hover:shadow-sm transition-all block"
          >
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 text-xs font-bold text-brand-primary bg-blue-50 px-2 py-0.5 rounded">
                R10
              </span>
              <p className="text-sm text-brand-muted">
                The Australian Research Community determine new minimum
                standards for IGSN records. IGSN records should be more firmly
                integrated into the PID graph.
              </p>
            </div>
          </Link>
        </div>
      </section>

      <Link
        href="/recommendations"
        className="text-brand-primary text-sm underline"
      >
        View all 19 recommendations &rarr;
      </Link>
    </div>
  );
}
