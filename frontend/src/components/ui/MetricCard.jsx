export default function MetricCard({ label, value, hint, className = '' }) {
  return (
    <div
      className={`rounded-lg border border-border bg-surface p-4 ${className}`}
    >
      <div className="text-xs font-medium uppercase tracking-wide text-muted">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-ink">{value}</div>
      {hint && <div className="mt-1 text-xs text-inkSecondary">{hint}</div>}
    </div>
  );
}
