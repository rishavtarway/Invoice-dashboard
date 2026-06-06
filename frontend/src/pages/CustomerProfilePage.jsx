import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useCustomer } from '../hooks/useCustomers';
import MetricCard from '../components/ui/MetricCard';
import StatusDonut from '../components/customers/StatusDonut';
import StatusBadge from '../components/invoices/StatusBadge';
import Button from '../components/ui/Button';
import { formatCurrency, formatDate, formatNumber, initials } from '../utils/format';
import { STATUS_COLORS, STATUS_ORDER } from '../utils/statusColors';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import InvoiceModal from '../components/invoices/InvoiceModal';
import { useDeleteInvoice } from '../hooks/useInvoices';

function StatusBar({ breakdown }) {
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

export default function CustomerProfilePage() {
  const { id } = useParams();
  const { data, isLoading, error } = useCustomer(id);
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const deleteInvoice = useDeleteInvoice();

  if (isLoading) {
    return (
      <div className="px-6 py-12 text-center text-sm text-inkSecondary">Loading customer…</div>
    );
  }
  if (error) {
    return (
      <div className="px-6 py-12 text-center text-sm text-statusOverdue">
        {error.message}
      </div>
    );
  }
  if (!data) return null;

  const { customer, metrics, statusBreakdown, invoices } = data;

  return (
    <div className="flex flex-col gap-6 px-6 py-6">
      <nav className="flex items-center gap-1 text-xs text-inkSecondary">
        <Link to="/invoices" className="inline-flex items-center gap-1 hover:text-ink">
          <Home size={12} /> Invoices
        </Link>
        <ChevronRight size={12} className="text-muted" />
        <span className="text-ink">Customer</span>
        <ChevronRight size={12} className="text-muted" />
        <span className="text-ink">{customer.name}</span>
      </nav>

      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-ink text-sm font-semibold text-white">
          {initials(customer.name)}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-ink">{customer.name}</h1>
          <p className="text-sm text-inkSecondary">{customer.company}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <MetricCard
          label="Total billed"
          value={formatCurrency(metrics.totalBilled, { hideCentsIfZero: true })}
          hint="Excludes Void"
        />
        <MetricCard label="Total tax" value={formatCurrency(metrics.totalTax, { hideCentsIfZero: true })} />
        <MetricCard
          label="Outstanding"
          value={formatCurrency(metrics.outstanding, { hideCentsIfZero: true })}
          hint="Unpaid + Overdue"
        />
        <MetricCard label="# Invoices" value={formatNumber(metrics.invoiceCount)} />
      </div>

      <section className="rounded-lg border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold text-ink">Status breakdown</h2>
        <StatusBar breakdown={statusBreakdown} />
      </section>

      <section className="rounded-lg border border-border bg-surface p-4">
        <h2 className="mb-3 text-sm font-semibold text-ink">Status distribution</h2>
        <StatusDonut breakdown={statusBreakdown} />
      </section>

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
                    <td className="px-4 py-2.5 text-right tabular-nums">
                      {formatCurrency(inv.amount)}
                    </td>
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
                          onClick={() => {
                            setEditing(inv);
                            setModalOpen(true);
                          }}
                          className="rounded-md p-1.5 text-inkSecondary hover:bg-canvas hover:text-ink"
                        >
                          <Pencil size={14} />
                        </button>
                        {pendingDeleteId === inv._id ? (
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => {
                              deleteInvoice.mutate(inv._id, {
                                onSettled: () => setPendingDeleteId(null),
                              });
                            }}
                          >
                            Confirm?
                          </Button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setPendingDeleteId(inv._id)}
                            className="rounded-md p-1.5 text-inkSecondary hover:bg-statusOverdueBg hover:text-statusOverdue"
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

      <InvoiceModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditing(null);
        }}
        invoice={editing}
      />
    </div>
  );
}
