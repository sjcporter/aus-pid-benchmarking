"use client";

import Link from "next/link";
import { basePath } from "@/lib/basepath";

export default function TopBar() {
  return (
    <header className="h-14 bg-brand-primary text-white flex items-center px-6 shrink-0">
      <Link href="/" className="flex items-center gap-3">
        <span className="font-semibold text-lg">Australian National PID Benchmarking Dashboard</span>
      </Link>
      <div className="ml-auto flex items-center gap-5 text-sm">
        <Link
          href="/report"
          className="opacity-80 hover:opacity-100 transition-opacity"
        >
          Full Report
        </Link>
        <a
          href="https://www.ardc.edu.au"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${basePath}/images/ardc-logo.png`}
            alt="ARDC"
            width={80}
            height={28}
            className="brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
          />
        </a>
        <a
          href="https://www.digital-science.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={`${basePath}/images/ds-logo.png`}
            alt="Digital Science"
            width={100}
            height={28}
            className="brightness-0 invert opacity-80 hover:opacity-100 transition-opacity"
          />
        </a>
      </div>
    </header>
  );
}
