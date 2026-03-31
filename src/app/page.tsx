import Link from "next/link";
import MetricCard from "@/components/content/MetricCard";
import {
  Users,
  Database,
  BookOpen,
  ChefHat,
  Lightbulb,
} from "lucide-react";

const highlights = [
  {
    title: "ORCID Benchmarking",
    href: "/orcid",
    icon: Users,
    description:
      "Australia has 71% ORCID adoption (3rd highest globally). Explore trends by country, funder, publisher, field, and institution.",
    color: "#A6CE39",
  },
  {
    title: "Research Inputs",
    href: "/toolkit/inputs",
    icon: Database,
    description:
      "Benchmarks for ROR organisations, RAiD activities, grants, facilities, research data, IGSN samples, and instruments.",
    color: "#2D9CDB",
  },
  {
    title: "Research Outputs",
    href: "/toolkit/outputs",
    icon: BookOpen,
    description:
      "Reports, methods, NTROs, dissertations, and publications. Australia is 3rd globally for DOI-identified dissertations.",
    color: "#FCB426",
  },
  {
    title: "Benchmarking Recipes",
    href: "/recipes",
    icon: ChefHat,
    description:
      "44 toolkit queries with SQL, data sources, and executable Google Colab notebooks.",
    color: "#9B51E0",
  },
  {
    title: "Recommendations",
    href: "/recommendations",
    icon: Lightbulb,
    description:
      "19 recommendations across research inputs, outputs, and ORCID adoption to advance PID strategy.",
    color: "#47AB4C",
  },
];

export default function Home() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text mt-2 mb-2">
        Australian National PID Benchmarking Dashboard
      </h1>
      <p className="text-brand-muted mb-8">
        Interactive companion to the{" "}
        <a
          href="https://doi.org/10.6084/m9.figshare.29281667"
          target="_blank"
          rel="noopener noreferrer"
          className="text-brand-primary underline"
        >
          Australian National PID Benchmarking Toolkit
        </a>
        . Explore persistent identifier adoption across Australian research
        infrastructure, commissioned by ARDC and produced by Digital Science.
      </p>

      {/* --- Introduction --- */}
      <section className="mb-8 bg-brand-surface rounded-lg border border-brand-border p-6">
        <h2 className="text-lg font-semibold text-brand-text mb-3">
          About the Australian National PID Strategy
        </h2>
        <p className="text-sm text-brand-muted mb-4">
          The Australian Persistent Identifier Strategy is a critical national
          initiative to benefit the Australian people by strengthening our
          digital information ecosystem, the quality of our research and our
          capacity for effective research engagement, innovation and impact.
        </p>

        <h3 className="text-sm font-semibold text-brand-text mb-2">
          What are Persistent Identifiers?
        </h3>
        <p className="text-sm text-brand-muted mb-3">
          Persistent identifiers (PIDs) are long-lasting digital references to
          entities such as researchers, organisations, research outputs, and
          physical samples. Unlike URLs that can break over time, PIDs are
          designed to remain stable and resolvable indefinitely. They form the
          connective tissue of the global research information ecosystem,
          enabling unambiguous identification, reliable linking, and
          trustworthy attribution. The key PIDs covered by this toolkit are:
        </p>
        <ul className="text-sm text-brand-muted mb-4 ml-4 list-disc space-y-1">
          <li>
            <strong className="text-brand-text">ORCID</strong> &mdash;
            uniquely identifies researchers, ensuring their work is correctly
            attributed regardless of name changes, shared names, or career
            moves between institutions.
          </li>
          <li>
            <strong className="text-brand-text">ROR</strong> &mdash; the
            Research Organization Registry provides unique identifiers for
            every research organisation worldwide, enabling consistent
            affiliation data.
          </li>
          <li>
            <strong className="text-brand-text">DOI</strong> &mdash; Digital
            Object Identifiers provide permanent links to research outputs
            such as journal articles, datasets, dissertations, and reports.
          </li>
          <li>
            <strong className="text-brand-text">RAiD</strong> &mdash;
            Research Activity Identifiers link together the people,
            organisations, outputs, and funding associated with a research
            project or activity.
          </li>
          <li>
            <strong className="text-brand-text">IGSN</strong> &mdash; the
            International Generic Sample Number identifies physical samples
            and specimens collected in the field, connecting the material world
            to the digital research record.
          </li>
        </ul>

        <h3 className="text-sm font-semibold text-brand-text mb-2">
          The Five Objectives of the Strategy
        </h3>
        <ol className="text-sm text-brand-muted mb-4 ml-4 list-decimal space-y-1">
          <li>
            Ensure Australian researchers, research outputs, and research
            activities are globally discoverable and unambiguously identified.
          </li>
          <li>
            Enable seamless linking between researchers, their organisations,
            grants, outputs, and the instruments and samples they use.
          </li>
          <li>
            Reduce administrative burden by allowing information to travel with
            researchers across systems and institutions.
          </li>
          <li>
            Strengthen the quality and trustworthiness of Australia&apos;s
            research information infrastructure.
          </li>
          <li>
            Position Australia as a global leader in the adoption and
            governance of persistent identifiers for research.
          </li>
        </ol>

        <p className="text-sm text-brand-muted">
          This toolkit and dashboard were commissioned by the{" "}
          <strong className="text-brand-text">
            Australian Research Data Commons (ARDC)
          </strong>{" "}
          and produced by{" "}
          <strong className="text-brand-text">Digital Science</strong> to
          provide the first comprehensive benchmark of PID adoption in
          Australia, measuring progress against global comparators and
          identifying areas where further action is needed.
        </p>
      </section>

      {/* --- Metric cards --- */}
      <h2 className="text-lg font-semibold text-brand-text mb-3">
        Australia at a Glance
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <MetricCard
          value="71%"
          label="ORCID Adoption"
          subtitle="3rd highest globally"
          color="#A6CE39"
        />
        <MetricCard
          value="75,210"
          label="Dissertations with DOIs"
          subtitle="3rd globally"
          color="#1f407a"
        />
        <MetricCard
          value="5.8M"
          label="IGSN Samples"
          subtitle="~77% of global registrations"
          color="#9B51E0"
        />
        <MetricCard
          value="19"
          label="Recommendations"
          subtitle="Across inputs, outputs & ORCID"
          color="#47AB4C"
        />
      </div>

      {/* --- Key Findings --- */}
      <section className="mb-8 bg-brand-surface rounded-lg border border-brand-border p-6">
        <h2 className="text-lg font-semibold text-brand-text mb-3">
          Key Findings
        </h2>
        <ul className="text-sm text-brand-muted space-y-3">
          <li className="flex gap-2">
            <span className="font-bold text-[#A6CE39] shrink-0">01</span>
            <span>
              Australia has <strong className="text-brand-text">71% ORCID adoption</strong>,
              making it the 3rd highest country globally among those with 50,000
              or more active researchers. ORCID adoption increased from 48% to
              71% between the 2015-2019 and 2020-2024 measurement periods
              &mdash; a 23 percentage-point jump driven by coordinated
              institutional and funder mandates.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-[#A6CE39] shrink-0">02</span>
            <span>
              Australian funders{" "}
              <strong className="text-brand-text">ARC and NHMRC</strong> are
              among the global leaders in ORCID adoption, with researcher
              uptake exceeding 97% for both agencies &mdash; evidence that
              funder mandates are a highly effective lever.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-[#1f407a] shrink-0">03</span>
            <span>
              Australia is{" "}
              <strong className="text-brand-text">3rd globally</strong> for
              DOI-identified dissertations with 75,210 registered &mdash;
              reflecting strong thesis deposit practices in Australian
              universities.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-[#9B51E0] shrink-0">04</span>
            <span>
              Australia dominates IGSN registration with{" "}
              <strong className="text-brand-text">5.8 million samples</strong>{" "}
              (approximately 77% of global registrations), yet these samples
              have 0 name identifiers attached &mdash; they are effectively
              disconnected from the wider PID graph, limiting their
              discoverability and reuse.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-[#2D9CDB] shrink-0">05</span>
            <span>
              <strong className="text-brand-text">RAiD adoption is at a very
              early stage</strong> with only 69 RAiDs created in total. As a
              newer PID type, RAiD represents a significant opportunity to link
              research activities with their associated people, outputs, and
              funding.
            </span>
          </li>
          <li className="flex gap-2">
            <span className="font-bold text-[#FCB426] shrink-0">06</span>
            <span>
              Australian{" "}
              <strong className="text-brand-text">Open Access rates have
              plateaued at approximately 65%</strong> in 2024, suggesting that
              further policy or infrastructure interventions may be needed to
              push beyond this threshold.
            </span>
          </li>
        </ul>
      </section>

      {/* --- Section navigation --- */}
      <h2 className="text-lg font-semibold text-brand-text mb-3">
        Explore the Dashboard
      </h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {highlights.map((section) => {
          const Icon = section.icon;
          return (
            <Link
              key={section.href}
              href={section.href}
              className="bg-brand-surface rounded-lg border border-brand-border p-5 hover:shadow-sm transition-all group"
              style={{
                borderLeftWidth: "3px",
                borderLeftColor: section.color,
              }}
            >
              <div className="flex items-center gap-3 mb-2">
                <Icon
                  size={20}
                  style={{ color: section.color }}
                />
                <h3 className="font-semibold text-brand-text group-hover:text-brand-primary transition-colors">
                  {section.title}
                </h3>
              </div>
              <p className="text-sm text-brand-muted">
                {section.description}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 p-4 bg-brand-surface rounded-lg border border-brand-border text-sm text-brand-muted">
        <p>
          Data sourced from Crossref, DataCite, ORCID, ROR, Dimensions, and
          re3data. Analysis period: 2020-2024 with historical comparison to
          2015-2019. See{" "}
          <Link href="/recipes" className="text-brand-primary underline">
            Benchmarking Recipes
          </Link>{" "}
          for methodology.
        </p>
      </div>
    </div>
  );
}
