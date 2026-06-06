import { formatCurrency, computeTax } from '../../utils/format';

// Live preview of server-computed tax/total
export default function InvoiceFormPreview({ amount, taxRate }) {
  const a = Number(amount) || 0;
  const r = Number(taxRate) || 0;
  const tax = computeTax(a, r);
  const total = a + tax;
  return (
    <div className="rounded-md border border-border bg-canvas px-3 py-2 text-xs text-inkSecondary">
      Tax <span className="font-medium text-ink">{formatCurrency(tax)}</span> · Total{' '}
      <span className="font-medium text-ink">{formatCurrency(total)}</span>{' '}
      <span className="text-muted">(computed)</span>
    </div>
  );
}
