import { ChevronLeft, ChevronRight } from 'lucide-react';
import Button from '../ui/Button';

// Build a windowed list: 1, …, current-1, current, current+1, …, total
function pageNumbers(current, total) {
  if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  const arr = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < arr.length; i += 1) {
    if (i > 0 && arr[i] - arr[i - 1] > 1) result.push('…');
    result.push(arr[i]);
  }
  return result;
}

export default function Pagination({ page, totalPages, onPageChange, total, limit }) {
  if (totalPages <= 1) {
    return (
      <div className="flex items-center justify-between border-t border-border px-4 py-3 text-xs text-inkSecondary">
        <span>
          Showing {total > 0 ? 1 : 0}–{total} of {total.toLocaleString('en-IN')} {total === 1 ? 'invoice' : 'invoices'}
        </span>
      </div>
    );
  }

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  const pages = pageNumbers(page, totalPages);

  return (
    <div className="flex flex-col gap-2 border-t border-border px-4 py-3 text-xs text-inkSecondary sm:flex-row sm:items-center sm:justify-between">
      <span>
        Showing {start.toLocaleString('en-IN')}–{end.toLocaleString('en-IN')} of {total.toLocaleString('en-IN')}{' '}
        {total === 1 ? 'invoice' : 'invoices'}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1}
        >
          <ChevronLeft size={14} />
          Prev
        </Button>
        {pages.map((p, idx) =>
          p === '…' ? (
            <span key={`gap-${idx}`} className="px-2 text-muted">
              …
            </span>
          ) : (
            <button
              key={p}
              type="button"
              onClick={() => onPageChange(p)}
              className={[
                'h-8 min-w-[2rem] rounded-md border px-2 text-xs',
                p === page
                  ? 'border-ink bg-ink text-white'
                  : 'border-border bg-surface text-ink hover:bg-canvas',
              ].join(' ')}
            >
              {p}
            </button>
          )
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
        >
          Next
          <ChevronRight size={14} />
        </Button>
      </div>
    </div>
  );
}
