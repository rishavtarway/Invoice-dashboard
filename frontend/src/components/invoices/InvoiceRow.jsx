import { useNavigate } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import StatusBadge from './StatusBadge';
import { formatCurrency, formatDate } from '../../utils/format';

export default function InvoiceRow({ invoice, onEdit, onDelete, deleting }) {
  const navigate = useNavigate();
  const { customerId } = invoice;

  return (
    <tr className="border-b border-border last:border-b-0 hover:bg-canvas/60">
      <td className="px-4 py-2.5 font-mono text-xs text-ink">{invoice.invoiceId}</td>
      <td className="px-4 py-2.5">
        <button
          type="button"
          onClick={() => customerId?._id && navigate(`/customers/${customerId._id}`)}
          className="text-left text-ink hover:underline"
        >
          {customerId?.name || '—'}
        </button>
      </td>
      <td className="px-4 py-2.5 text-inkSecondary">{customerId?.company || '—'}</td>
      <td className="px-4 py-2.5 text-right tabular-nums">{formatCurrency(invoice.amount)}</td>
      <td className="px-4 py-2.5 text-center text-inkSecondary">{invoice.taxRate}%</td>
      <td className="px-4 py-2.5 text-right font-medium tabular-nums">
        {formatCurrency(invoice.total)}
      </td>
      <td className="px-4 py-2.5">
        <StatusBadge status={invoice.status} />
      </td>
      <td className="px-4 py-2.5 text-inkSecondary">{formatDate(invoice.issueDate)}</td>
      <td className="px-4 py-2.5 text-inkSecondary">{formatDate(invoice.dueDate)}</td>
      <td className="px-4 py-2.5 text-right">
        <div className="flex items-center justify-end gap-1">
          <button
            type="button"
            onClick={() => onEdit(invoice)}
            className="rounded-md p-1.5 text-inkSecondary hover:bg-canvas hover:text-ink"
            aria-label="Edit"
            disabled={deleting}
          >
            <Pencil size={14} />
          </button>
          {deleting ? (
            <button
              type="button"
              onClick={onDelete}
              className="rounded-md border border-statusOverdue bg-statusOverdue px-2 py-0.5 text-xs font-medium text-white"
            >
              Confirm?
            </button>
          ) : (
            <button
              type="button"
              onClick={() => onDelete(invoice)}
              className="rounded-md p-1.5 text-inkSecondary hover:bg-statusOverdueBg hover:text-statusOverdue"
              aria-label="Delete"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
}
