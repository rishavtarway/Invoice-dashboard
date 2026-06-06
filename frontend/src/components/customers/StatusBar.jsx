import { STATUS_COLORS, STATUS_ORDER } from '../../utils/statusColors';

export default function StatusBar({ breakdown }) {
  const total = STATUS_ORDER.reduce((s, k) => s + (breakdown[k] || 0), 0);
  if (total === 0) return null;

  return (
    <div>
      <div className="flex h-3 w-full overflow-hidden rounded-full border border-border bg-surface">
        {STATUS_ORDER.map((status) => {
          const count = breakdown[status] || 0;
          if (!count) return null;
          const pct = (count / total) * 100;
          return (
            <div
              key={status}
              className="h-full"
              style={{ width: `${pct}%`, backgroundColor: STATUS_COLORS[status] }}
              title={`${status}: ${count}`}
            />
          );
        })}
      </div>
      <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs">
        {STATUS_ORDER.map((status) => {
          const count = breakdown[status] || 0;
          if (!count) return null;
          return (
            <div key={status} className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: STATUS_COLORS[status] }}
              />
              <span className="text-ink">
                {status} <span className="text-inkSecondary">({count})</span>
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
