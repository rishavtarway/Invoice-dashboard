import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { useInvoices } from '../hooks/useInvoices';
import { useTop5Customers } from '../hooks/useCustomers';
import MetricCard from '../components/ui/MetricCard';
import Top5Card from '../components/customers/Top5Card';
import { formatCurrency, formatNumber } from '../utils/format';
import api from '../api/axios';
import { TrendingUp, Users, Receipt, Calculator } from 'lucide-react';

export default function SummaryPage() {
  const navigate = useNavigate();
  const { data: top5 = [], isLoading: top5Loading } = useTop5Customers();

  const { data: invoicesPage } = useInvoices({ page: 1, limit: 1 });
  const totalInvoices = invoicesPage?.pagination?.total || 0;

  const { data: customers = [] } = useQuery({
    queryKey: ['customers', 'count'],
    queryFn: () => api.get('/customers').then((r) => r.data),
  });

  const topTotal = top5.reduce((s, c) => s + c.totalBilled, 0);

  return (
    <div className="flex flex-col gap-6 px-6 py-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Summary</h1>
        <p className="text-xs text-inkSecondary">High-level metrics across the entire dataset</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total invoices"
          value={formatNumber(totalInvoices)}
          hint="All statuses"
          className="bg-surface"
        />
        <MetricCard
          label="Customers"
          value={formatNumber(customers.length)}
          hint="1:1 with company"
          className="bg-surface"
        />
        <MetricCard
          label="Top 5 combined"
          value={formatCurrency(topTotal, { hideCentsIfZero: true })}
          hint="Excludes Void"
          className="bg-surface"
        />
        <MetricCard
          label="Tax rates"
          value="0 · 3 · 5 · 18 · 28%"
          hint="GST buckets"
          className="bg-surface"
        />
      </div>

      <section>
        <div className="mb-3 flex items-center gap-2">
          <TrendingUp size={16} className="text-inkSecondary" />
          <h2 className="text-sm font-semibold text-ink">Top customers by value</h2>
          <span className="text-xs text-muted">(excludes Void invoices)</span>
        </div>
        {top5Loading ? (
          <div className="rounded-lg border border-border bg-surface px-4 py-12 text-center text-sm text-inkSecondary">
            Loading top customers…
          </div>
        ) : top5.length === 0 ? (
          <div className="rounded-lg border border-border bg-surface px-4 py-12 text-center text-sm text-inkSecondary">
            No data yet. Seed the database to see the top 5.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {top5.map((c, idx) => (
              <button
                key={c.customer._id}
                type="button"
                onClick={() => navigate(`/customers/${c.customer._id}`)}
                className="text-left transition-transform hover:-translate-y-0.5"
              >
                <Top5Card
                  rank={idx + 1}
                  customer={c.customer}
                  totalBilled={c.totalBilled}
                  invoiceCount={c.invoiceCount}
                />
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
            <Receipt size={14} /> About this dataset
          </div>
          <p className="text-sm text-ink">
            2,000 invoices spread across 61 customers (1:1 with company), 6 statuses
            (Draft, Sent, Paid, Unpaid, Overdue, Void), 5 tax rates (0, 3, 5, 18, 28).
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
            <Users size={14} /> Outstanding
          </div>
          <p className="text-sm text-ink">
            Outstanding is the sum of totals for invoices in <strong>Unpaid</strong> or{' '}
            <strong>Overdue</strong> status.
          </p>
        </div>
        <div className="rounded-lg border border-border bg-surface p-4">
          <div className="mb-2 flex items-center gap-2 text-xs font-medium uppercase tracking-wide text-muted">
            <Calculator size={14} /> Tax formula
          </div>
          <p className="font-mono text-xs text-ink">tax = round(amount × rate / 100, 2)</p>
          <p className="mt-1 font-mono text-xs text-ink">total = amount + tax</p>
        </div>
      </section>
    </div>
  );
}
