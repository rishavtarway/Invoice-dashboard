import { useNavigate } from 'react-router-dom';
import { useSummary, useTop5Customers } from '../hooks/useCustomers';
import MetricCard from '../components/ui/MetricCard';
import Top5Card from '../components/customers/Top5Card';
import { formatCurrency, formatNumber } from '../utils/format';
import { TrendingUp } from 'lucide-react';

export default function SummaryPage() {
  const navigate = useNavigate();
  const { data: summary, isLoading: summaryLoading } = useSummary();
  const { data: top5 = [], isLoading: top5Loading } = useTop5Customers();

  return (
    <div className="flex flex-col gap-6 px-6 py-6">
      <div>
        <h1 className="text-xl font-semibold text-ink">Summary</h1>
        <p className="text-xs text-inkSecondary">High-level metrics across the entire dataset</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          label="Total billed"
          value={summary ? formatCurrency(summary.totalBilled, { hideCentsIfZero: true }) : '—'}
          hint={summaryLoading ? 'Loading…' : 'Excludes Void'}
        />
        <MetricCard
          label="Total tax"
          value={summary ? formatCurrency(summary.totalTax, { hideCentsIfZero: true }) : '—'}
          hint={summaryLoading ? 'Loading…' : 'Excludes Void'}
        />
        <MetricCard
          label="# Invoices"
          value={summary ? formatNumber(summary.invoiceCount) : '—'}
          hint="All statuses"
        />
        <MetricCard
          label="# Customers"
          value={summary ? formatNumber(summary.customerCount) : '—'}
          hint="1:1 with company"
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
    </div>
  );
}
