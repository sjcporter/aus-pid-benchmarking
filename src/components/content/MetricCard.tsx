interface MetricCardProps {
  label: string;
  value: string | number;
  subtitle?: string;
  color?: string;
}

export default function MetricCard({ label, value, subtitle, color = "#1f407a" }: MetricCardProps) {
  return (
    <div className="bg-brand-surface rounded-lg border border-brand-border p-5">
      <p className="text-sm text-brand-muted mb-1">{label}</p>
      <p className="text-3xl font-bold" style={{ color }}>
        {value}
      </p>
      {subtitle && <p className="text-sm text-brand-muted mt-1">{subtitle}</p>}
    </div>
  );
}
