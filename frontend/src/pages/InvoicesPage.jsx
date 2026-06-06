import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Plus } from 'lucide-react';
import Button from '../components/ui/Button';
import InvoiceFilters from '../components/invoices/InvoiceFilters';
import InvoiceTable from '../components/invoices/InvoiceTable';
import InvoiceModal from '../components/invoices/InvoiceModal';
import Pagination from '../components/invoices/Pagination';
import { useDeleteInvoice, useInvoices } from '../hooks/useInvoices';

const DEFAULTS = {
  page: 1,
  limit: 20,
  sortBy: 'dueDate',
  sortOrder: 'asc',
  search: '',
  status: undefined,
  taxRate: '',
  issueDateFrom: undefined,
  issueDateTo: undefined,
  dueDateFrom: undefined,
  dueDateTo: undefined,
};

// URL search params are the single source of truth for filter state
function readParams(searchParams) {
  const out = { ...DEFAULTS };
  for (const [k, v] of searchParams.entries()) {
    if (k in out) {
      if (k === 'page' || k === 'limit') out[k] = Number(v) || DEFAULTS[k];
      else if (k === 'taxRate') out[k] = v === '' ? '' : Number(v);
      else if (v !== '') out[k] = v;
    }
  }
  return out;
}

function buildQuery(filters) {
  const params = {
    page: filters.page,
    limit: filters.limit,
    sortBy: filters.sortBy,
    sortOrder: filters.sortOrder,
  };
  if (filters.search) params.search = filters.search;
  if (filters.status) params.status = filters.status;
  if (filters.taxRate !== '' && filters.taxRate != null) params.taxRate = filters.taxRate;
  if (filters.issueDateFrom) params.issueDateFrom = filters.issueDateFrom;
  if (filters.issueDateTo) params.issueDateTo = filters.issueDateTo;
  if (filters.dueDateFrom) params.dueDateFrom = filters.dueDateFrom;
  if (filters.dueDateTo) params.dueDateTo = filters.dueDateTo;
  return params;
}

export default function InvoicesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => readParams(searchParams), [searchParams]);
  const apiParams = useMemo(() => buildQuery(filters), [filters]);

  const { data, isLoading, isFetching, error } = useInvoices(apiParams);
  const deleteInvoice = useDeleteInvoice();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  // Two-click delete with 3s window before reverting
  const [pendingDeleteId, setPendingDeleteId] = useState(null);
  const deleteTimer = useRef();

  useEffect(() => {
    return () => {
      if (deleteTimer.current) clearTimeout(deleteTimer.current);
    };
  }, []);

  const updateFilters = useCallback(
    (next) => {
      const sp = new URLSearchParams();
      for (const [k, v] of Object.entries(next)) {
        if (v === '' || v == null) continue;
        sp.set(k, String(v));
      }
      setSearchParams(sp, { replace: false });
    },
    [setSearchParams]
  );

  const onSort = (key) => {
    const nextOrder = filters.sortBy === key && filters.sortOrder === 'asc' ? 'desc' : 'asc';
    updateFilters({ ...filters, sortBy: key, sortOrder: nextOrder, page: 1 });
  };

  const onPageChange = (p) => updateFilters({ ...filters, page: p });

  const onClearFilters = () => updateFilters({ ...DEFAULTS, page: 1 });

  const openCreate = () => {
    setEditing(null);
    setModalOpen(true);
  };
  const openEdit = (invoice) => {
    setEditing(invoice);
    setModalOpen(true);
  };

  const handleDelete = (invoice) => {
    if (pendingDeleteId === invoice._id) {
      deleteInvoice.mutate(invoice._id, {
        onSettled: () => {
          setPendingDeleteId(null);
          if (deleteTimer.current) clearTimeout(deleteTimer.current);
        },
      });
    } else {
      setPendingDeleteId(invoice._id);
      if (deleteTimer.current) clearTimeout(deleteTimer.current);
      deleteTimer.current = setTimeout(() => setPendingDeleteId(null), 3000);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex flex-col gap-3 border-b border-border bg-surface px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-ink">Invoices</h1>
          <p className="text-xs text-inkSecondary">
            {data?.pagination?.total
              ? `${data.pagination.total.toLocaleString('en-IN')} invoices · page ${filters.page} of ${data.pagination.totalPages}`
              : 'Browse, filter and manage all invoices'}
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus size={14} /> New invoice
        </Button>
      </div>

      <InvoiceFilters value={filters} onChange={updateFilters} onClear={onClearFilters} />

      <div className="relative">
        {isFetching && !isLoading && (
          <div className="absolute right-4 top-2 z-10 rounded-full bg-canvas px-2 py-0.5 text-[10px] uppercase tracking-wide text-muted">
            Refreshing…
          </div>
        )}
        <div className="bg-surface">
          {error ? (
            <div className="px-6 py-12 text-center text-sm text-statusOverdue">
              Failed to load invoices: {error.message}
            </div>
          ) : (
            <InvoiceTable
              invoices={data?.data || []}
              loading={isLoading}
              sortBy={filters.sortBy}
              sortOrder={filters.sortOrder}
              onSort={onSort}
              onEdit={openEdit}
              onDelete={handleDelete}
              pendingDeleteId={pendingDeleteId}
            />
          )}
          {data?.pagination && (
            <Pagination
              page={filters.page}
              totalPages={data.pagination.totalPages}
              total={data.pagination.total}
              limit={data.pagination.limit}
              onPageChange={onPageChange}
            />
          )}
        </div>
      </div>

      <InvoiceModal open={modalOpen} onClose={() => setModalOpen(false)} invoice={editing} />
    </div>
  );
}
