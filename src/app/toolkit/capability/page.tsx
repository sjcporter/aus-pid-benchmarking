import Link from "next/link";

export default function CapabilityPage() {
  return (
    <div className="max-w-4xl">
      <h1 className="text-2xl font-bold text-brand-text mb-2">
        Research Capability
      </h1>
      <p className="text-brand-muted mb-6">
        Objective 5: improve our ability to map Australia&apos;s research
        capability. ORCID adoption is the primary lens for understanding how
        well Australia&apos;s research workforce is connected to the global PID
        infrastructure.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Link
          href="/orcid/country"
          className="bg-brand-surface rounded-lg border border-brand-border p-5 hover:border-brand-primary transition-all"
        >
          <h3 className="font-semibold text-brand-text mb-1">
            Country-level ORCID Adoption
          </h3>
          <p className="text-sm text-brand-muted">
            Australia ranks 3rd globally for ORCID adoption among countries with
            50,000+ researchers. Compare with 198 countries.
          </p>
        </Link>
        <Link
          href="/orcid/institution"
          className="bg-brand-surface rounded-lg border border-brand-border p-5 hover:border-brand-primary transition-all"
        >
          <h3 className="font-semibold text-brand-text mb-1">
            Institutional ORCID Adoption
          </h3>
          <p className="text-sm text-brand-muted">
            Compare ORCID adoption across 177 Australian institutions. See which
            universities lead in adoption and completeness.
          </p>
        </Link>
        <Link
          href="/orcid/funder"
          className="bg-brand-surface rounded-lg border border-brand-border p-5 hover:border-brand-primary transition-all"
        >
          <h3 className="font-semibold text-brand-text mb-1">
            Funder-driven Adoption
          </h3>
          <p className="text-sm text-brand-muted">
            ARC and NHMRC are among the global leaders in ORCID adoption. See
            how funder mandates drive researcher behaviour.
          </p>
        </Link>
        <Link
          href="/orcid/field-of-research"
          className="bg-brand-surface rounded-lg border border-brand-border p-5 hover:border-brand-primary transition-all"
        >
          <h3 className="font-semibold text-brand-text mb-1">
            Field of Research Coverage
          </h3>
          <p className="text-sm text-brand-muted">
            Explore ORCID adoption across 22 fields of research and
            Australia&apos;s comparative advantage over the global average.
          </p>
        </Link>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-sm text-amber-800">
        The Vision 2020 strategy set targets for ORCID adoption that have been
        largely achieved. The ORCID 2030 vision should aim for authenticated
        ORCID mandates, publisher compliance, and institutional integration. See{" "}
        <Link href="/recommendations" className="underline">
          recommendations
        </Link>{" "}
        for proposed next steps.
      </div>
    </div>
  );
}
