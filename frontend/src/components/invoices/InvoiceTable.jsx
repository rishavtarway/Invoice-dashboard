import { useState } from 'react';
import { ArrowUp, ArrowDown, ArrowUpDown } from 'lucide-react';
import InvoiceRow from './InvoiceRow';

const COLUMNS = [
  { key: 'invoiceId', label: 'Invoice ID', sortable: false, align: 'left', className: 'w-32' },
  { key: 'customer', label: 'Customer', sortable: true, sortKey: 'amount', align: 'left' },
  { key: 'company', label: 'Company', sortable: false, align: 'left' },
  { key: 'amount', label: 'Amount', sortable: true, sortKey: 'amount', align: 'right' },
  { key: 'taxRate', label: 'Tax %', sortable: false, align: 'center' },
  { key: 'total', label: 'Total', sortable: true, sortKey: 'total', align: 'right' },
  { key: 'status', label: 'Status', sortable: false, align: 'left' },
  { key: 'issueDate', label: 'Issued', sortable: false, align: 'left' },
  { key: 'dueDate', label: 'Due', sortable: true, sortKey: 'dueDate', align: 'left' },
  { key: 'actions', label: '', sortable: false, align: 'right', className: 'w-24' },
];

function SortIcon({ column, sortBy, sortOrder }) {
  if (!column.sortable) return null;
  if (sortBy !== column.sortKey) return <ArrowUpDown size={12} className="text-muted" />;
  return sortOrder === 'asc' ? (
    <ArrowUp size={12} className="text-ink" />
  ) : (
    <ArrowDown size={12} className="text-ink" />
  );
}

export default function InvoiceTable({
  invoices,
  loading,
  sortBy,
  sortOrder,
  onSort,
  onEdit,
  onDelete,
  pendingDeleteId,
}) {
  const [, setTick] = useState(0);

  return (
    <div className="overflow-x-auto scrollbar-thin">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-border bg-surface text-left text-xs font-medium uppercase tracking-wide text-muted">
            {COLUMNS.map((col) => {
              const isActive = col.sortable && sortBy === col.sortKey;
              return (
                <th
                  key={col.key}
                  scope="col"
                  className={[
                    'px-4 py-2.5',
                    col.align === 'right' && 'text-right',
                    col.align === 'center' && 'text-center',
                    col.className || '',
                    col.sortable && 'cursor-pointer select-none hover:text-ink',
                  ].join(' ')}
                  onClick={() => col.sortable && onSort(col.sortKey)}
                >
                  <span
                    className={`inline-flex items-center gap-1 ${
                      col.align === 'right' ? 'flex-row-reverse' : ''
                    }`}
                  >
                    {col.label}
                    <SortIcon column={col} sortBy={sortBy} sortOrder={sortOrder} />
                  </span>
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={COLUMNS.length} className="px-4 py-12 text-center text-inkSecondary">
                Loading invoices…
              </td>
            </tr>
          ) : invoices.length === 0 ? (
            <tr>
              <td colSpan={COLUMNS.length} className="px-4 py-12 text-center text-inkSecondary">
                No invoices match your filters.
              </td>
            </tr>
          ) : (
            invoices.map((inv) => (
              <InvoiceRow
                key={inv._id}
                invoice={inv}
                onEdit={() => {
                  setTick((t) => t + 1);
                  onEdit(inv);
                }}
                onDelete={() => onDelete(inv)}
                deleting={pendingDeleteId === inv._id}
              />
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
