import { Link, useParams } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import { useCustomer } from '../hooks/useCustomers';
import MetricCard from '../components/ui/MetricCard';
import StatusDonut from '../components/customers/StatusDonut';
import StatusBar from '../components/customers/StatusBar';
import CustomerInvoiceHistory from '../components/customers/CustomerInvoiceHistory';
import InvoiceModal from '../components/invoices/InvoiceModal';
import { formatCurrency, formatNumber, initials } from '../utils/format';
import { useState } from 'react';

export default function CustomerProfilePage() {
  const { id } = useParams();
  const { data, isLoading, error } = useCustomer(id);
  // Modal state shared with the history table
  const [editing, setEditing] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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

      <CustomerInvoiceHistory
        invoices={invoices}
        onEdit={(inv) => {
          setEditing(inv);
          setModalOpen(true);
        }}
      />

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
