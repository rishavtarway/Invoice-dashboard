import { formatCurrency, formatNumber } from '../../utils/format';
import { TrendingUp } from 'lucide-react';

export default function Top5Card({ rank, customer, totalBilled, invoiceCount }) {
  return (
    <div className="rounded-lg border border-border bg-surface p-4">
      <div className="flex items-center justify-between">
        <div className="text-xs font-medium uppercase tracking-wide text-muted">Rank #{rank}</div>
        <TrendingUp size={14} className="text-inkSecondary" />
      </div>
      <div className="mt-2 text-sm font-semibold text-ink">{customer.name}</div>
      <div className="text-xs text-inkSecondary">{customer.company}</div>
      <div className="mt-3 text-xl font-semibold tabular-nums text-ink">
        {formatCurrency(totalBilled, { hideCentsIfZero: true })}
      </div>
      <div className="mt-0.5 text-xs text-inkSecondary">
        {formatNumber(invoiceCount)} {invoiceCount === 1 ? 'invoice' : 'invoices'}
      </div>
    </div>
  );
}
