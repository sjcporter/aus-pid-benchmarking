export default function ReportPage() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-brand-text mt-2 mb-2">
        Full Report
      </h1>
      <p className="text-brand-muted mb-6">
        Australian National Persistent Identifier (PID) Benchmarking Toolkit
        &mdash; Final Report, October 2025. Published by Digital Science,
        commissioned by the Australian Research Data Commons (ARDC).
      </p>

      <div className="bg-brand-surface rounded-lg border border-brand-border overflow-hidden">
        <iframe
          src="https://widgets.figshare.com/articles/29281667/embed?show_title=1"
          width="100%"
          height="800"
          style={{ border: "none" }}
          title="Australian National PID Benchmarking Toolkit"
          allowFullScreen
        />
      </div>

      <div className="mt-4 text-sm text-brand-muted">
        <p>
          <strong className="text-brand-text">Citation:</strong> Porter, S.,
          Wastl, J., Draux, H., &amp; Campbell, A. (2025). Australian National
          Persistent Identifier (PID) Benchmarking Toolkit. Digital Science.{" "}
          <a
            href="https://doi.org/10.6084/m9.figshare.29281667"
            target="_blank"
            rel="noopener noreferrer"
            className="text-brand-primary underline"
          >
            https://doi.org/10.6084/m9.figshare.29281667
          </a>
        </p>
      </div>
    </div>
  );
}
