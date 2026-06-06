import { useRef, useState } from 'react';
import { Pencil, Trash2 } from 'lucide-react';
import StatusBadge from '../invoices/StatusBadge';
import Button from '../ui/Button';
import { formatCurrency, formatDate, formatNumber } from '../../utils/format';
import { useDeleteInvoice } from '../../hooks/useInvoices';

// Two-click delete with 3s confirm window
export default function CustomerInvoiceHistory({ invoices, onEdit }) {
  const deleteInvoice = useDeleteInvoice();
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const timerRef = useRef();

  const armDelete = (id) => {
    setPendingDeleteId(id);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setPendingDeleteId(null), 3000);
  };

  const confirmDelete = (id) => {
    deleteInvoice.mutate(id, { onSettled: () => setPendingDeleteId(null) });
  };

  return (
    <section className="rounded-lg border border-border bg-surface">
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-ink">Invoice history</h2>
        <p className="text-xs text-inkSecondary">
          {formatNumber(invoices.length)} {invoices.length === 1 ? 'invoice' : 'invoices'} ·
          sorted by due date (newest first)
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left text-xs font-medium uppercase tracking-wide text-muted">
              <th className="px-4 py-2.5">Invoice</th>
              <th className="px-4 py-2.5 text-right">Amount</th>
              <th className="px-4 py-2.5 text-center">Tax %</th>
              <th className="px-4 py-2.5 text-right">Total</th>
              <th className="px-4 py-2.5">Status</th>
              <th className="px-4 py-2.5">Issued</th>
              <th className="px-4 py-2.5">Due</th>
              <th className="px-4 py-2.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-inkSecondary">
                  No invoices for this customer.
                </td>
              </tr>
            ) : (
              invoices.map((inv) => (
                <tr key={inv._id} className="border-b border-border last:border-b-0 hover:bg-canvas/60">
                  <td className="px-4 py-2.5 font-mono text-xs">{inv.invoiceId}</td>
                  <td className="px-4 py-2.5 text-right tabular-nums">{formatCurrency(inv.amount)}</td>
                  <td className="px-4 py-2.5 text-center text-inkSecondary">{inv.taxRate}%</td>
                  <td className="px-4 py-2.5 text-right font-medium tabular-nums">
                    {formatCurrency(inv.total)}
                  </td>
                  <td className="px-4 py-2.5">
                    <StatusBadge status={inv.status} />
                  </td>
                  <td className="px-4 py-2.5 text-inkSecondary">{formatDate(inv.issueDate)}</td>
                  <td className="px-4 py-2.5 text-inkSecondary">{formatDate(inv.dueDate)}</td>
                  <td className="px-4 py-2.5 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(inv)}
                        className="rounded-md p-1.5 text-inkSecondary hover:bg-canvas hover:text-ink"
                        aria-label="Edit"
                      >
                        <Pencil size={14} />
                      </button>
                      {pendingDeleteId === inv._id ? (
                        <Button variant="danger" size="sm" onClick={() => confirmDelete(inv._id)}>
                          Confirm?
                        </Button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => armDelete(inv._id)}
                          className="rounded-md p-1.5 text-inkSecondary hover:bg-statusOverdueBg hover:text-statusOverdue"
                          aria-label="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}
