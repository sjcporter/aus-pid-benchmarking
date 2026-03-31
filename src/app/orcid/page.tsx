"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import MetricCard from "@/components/content/MetricCard";
import { Globe, Landmark, Newspaper, FlaskConical, Building2 } from "lucide-react";
import { basePath } from "@/lib/basepath";

interface CountryData {
  country: string;
  percentage_orcid: number;
  orcid_completeness: number;
  research_pool: number;
  date_range: string;
}

export default function OrcidOverview() {
  const [australia, setAustralia] = useState<CountryData | null>(null);

  useEffect(() => {
    fetch(`${basePath}/data/orcid/country-adoption.json`)
      .then((r) => r.json())
      .then((data: CountryData[]) => {
        const au = data.find(
          (d) => d.country === "Australia" && d.date_range === "2020-2024"
        );
        if (au) setAustralia(au);
      });
  }, []);

  const sections = [
    {
      title: "By Country",
      href: "/orcid/country",
      icon: Globe,
      description:
        "Compare ORCID adoption and completeness across 198 countries, with time period comparison.",
    },
    {
      title: "By Funder",
      href: "/orcid/funder",
      icon: Landmark,
      description:
        "Analyse how research funders drive ORCID adoption. Australian funders lead globally.",
    },
    {
      title: "By Publisher",
      href: "/orcid/publisher",
      icon: Newspaper,
      description:
        "Track publisher ORCID workflows and the journey from initial adoption to best practice.",
    },
    {
      title: "By Field of Research",
      href: "/orcid/field-of-research",
      icon: FlaskConical,
      description:
        "Explore ORCID adoption across 22 fields of research and Australia's comparative advantage.",
    },
    {
      title: "By Institution",
      href: "/orcid/institution",
      icon: Building2,
      description:
        "Compare ORCID adoption across Australian research institutions.",
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text mb-2">
        ORCID Benchmarking in Practice
      </h1>
      <p className="text-brand-muted mb-6">
        Did Vision 2020 make a difference? This section benchmarks the impact of
        the 2017 Australian ORCID strategy, comparing adoption and completeness
        across countries, funders, publishers, fields of research, and
        institutions.
      </p>

      {/* --- Vision 2020 Context --- */}
      <section className="mb-8 bg-brand-surface rounded-lg border border-brand-border p-6">
        <h2 className="text-lg font-semibold text-brand-text mb-3">
          Vision 2020: The Australian ORCID Strategy
        </h2>
        <blockquote className="border-l-4 border-[#A6CE39] pl-4 mb-4 italic text-sm text-brand-muted">
          &ldquo;Our vision is that, by 2020, all Australian researchers,
          regardless of institutional affiliation, will be able to easily claim
          and manage the data regarding their research grants, research and
          research-related outputs through ORCID and that their details will
          travel with them as they build their careers.&rdquo;
          <br />
          <span className="not-italic font-semibold text-brand-text block mt-2">
            &mdash; VISION 2020 (2017), Australian ORCID Governance Committee
          </span>
        </blockquote>

        <p className="text-sm text-brand-muted mb-3">
          Vision 2020 was the product of a broad coalition of Australian
          universities, research institutions, funders, and publishers who
          recognised that a coordinated national approach was essential to
          realise the full benefits of ORCID. The strategy brought together the
          Australian Research Council (ARC), the National Health and Medical
          Research Council (NHMRC), Universities Australia, the Australian
          Access Federation, and the Australian Research Data Commons (ARDC) to
          drive adoption through shared governance, integrated systems, and
          funder mandates. Rather than leaving ORCID uptake to individual
          organisations, this coalition ensured that ORCID identifiers became a
          standard part of grant applications, institutional repositories, and
          publisher workflows across the country.
        </p>

        <p className="text-sm text-brand-muted">
          Australia&apos;s combined interventions to establish ORCID as a key
          part of the national research ecosystem have been successful so far,
          and benchmarking the adoption of persistent identifiers is achievable
          and provides a powerful lens through which we can understand progress.
        </p>
      </section>

      {/* --- Metric cards with definitions --- */}
      {australia && (
        <div className="mb-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <MetricCard
              label="ORCID Adoption"
              value={`${australia.percentage_orcid.toFixed(1)}%`}
              subtitle="Australian researchers with ORCID"
              color="#A6CE39"
            />
            <MetricCard
              label="ORCID Completeness"
              value={`${australia.orcid_completeness.toFixed(1)}%`}
              subtitle="Works matched in ORCID profiles"
              color="#1f407a"
            />
            <MetricCard
              label="Research Pool"
              value={australia.research_pool.toLocaleString()}
              subtitle="Active Australian researchers"
            />
            <MetricCard
              label="ORCID Researchers"
              value={Math.round(australia.percentage_orcid * australia.research_pool / 100).toLocaleString()}
              subtitle="With ORCID profiles"
              color="#47AB4C"
            />
          </div>

          {/* Definitions and progress note */}
          <div className="bg-brand-surface rounded-lg border border-brand-border p-5 space-y-3">
            <div>
              <h3 className="text-sm font-semibold text-brand-text mb-1">
                ORCID Adoption
              </h3>
              <p className="text-sm text-brand-muted">
                The percentage of researchers (identified in Dimensions with 5+
                years of publication history and 5+ publications) who have an
                ORCID identity. Measured over the period 2000-2024.
              </p>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-brand-text mb-1">
                ORCID Completeness
              </h3>
              <p className="text-sm text-brand-muted">
                The average percentage of works assertions with DOIs recorded in
                ORCID compared to the number of publications recorded in
                Dimensions for those researchers.
              </p>
            </div>
            <div className="pt-2 border-t border-brand-border">
              <p className="text-sm text-brand-muted">
                <strong className="text-brand-text">Progress:</strong> ORCID
                adoption increased from 48% (2015-2019) to 71% (2020-2024)
                &mdash; a 23 percentage point increase. Completeness rose from
                50% to 53%.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* --- Section navigation --- */}
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
                <h3 className="font-semibold text-brand-text">{section.title}</h3>
              </div>
              <p className="text-sm text-brand-muted">{section.description}</p>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
