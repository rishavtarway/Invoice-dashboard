import { useEffect, useState } from 'react';
import Input from '../ui/Input';
import Select from '../ui/Select';
import Button from '../ui/Button';
import { Search, X } from 'lucide-react';
import { STATUSES, TAX_RATES } from '../../schemas/invoiceSchema';

const ALL = '__all__';

function hasActiveFilters(filters) {
  return Boolean(
    filters.search ||
      filters.status ||
      filters.taxRate !== '' ||
      filters.issueDateFrom ||
      filters.issueDateTo ||
      filters.dueDateFrom ||
      filters.dueDateTo
  );
}

export default function InvoiceFilters({ value, onChange, onClear }) {
  const [searchInput, setSearchInput] = useState(value.search || '');

  useEffect(() => {
    setSearchInput(value.search || '');
  }, [value.search]);

  useEffect(() => {
    // Debounce search so we don't refetch on every keystroke
    const id = setTimeout(() => {
      if (searchInput !== value.search) {
        onChange({ ...value, search: searchInput, page: 1 });
      }
    }, 400);
    return () => clearTimeout(id);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  // Any filter change resets to page 1
  const set = (key, v) => onChange({ ...value, [key]: v, page: key !== 'page' ? 1 : value.page });
  const clear = () => {
    setSearchInput('');
    onClear();
  };

  return (
    <div className="flex flex-col gap-3 border-b border-border bg-surface px-4 py-3 lg:flex-row lg:flex-wrap lg:items-end">
      <div className="lg:w-72">
        <Input
          label="Search"
          type="search"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search invoice ID or customer…"
        />
      </div>
      <div className="lg:w-44">
        <Select
          label="Status"
          value={value.status || ''}
          onChange={(e) => set('status', e.target.value || undefined)}
        >
          <option value={ALL}>All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>
      <div className="lg:w-36">
        <Select
          label="Tax rate"
          value={value.taxRate === '' || value.taxRate == null ? ALL : String(value.taxRate)}
          onChange={(e) =>
            set('taxRate', e.target.value === ALL ? undefined : Number(e.target.value))
          }
        >
          <option value={ALL}>All</option>
          {TAX_RATES.map((r) => (
            <option key={r} value={r}>
              {r}%
            </option>
          ))}
        </Select>
      </div>
      <div className="lg:w-40">
        <Input
          label="Issue from"
          type="date"
          value={value.issueDateFrom || ''}
          onChange={(e) => set('issueDateFrom', e.target.value || undefined)}
        />
      </div>
      <div className="lg:w-40">
        <Input
          label="Issue to"
          type="date"
          value={value.issueDateTo || ''}
          onChange={(e) => set('issueDateTo', e.target.value || undefined)}
        />
      </div>
      <div className="lg:w-40">
        <Input
          label="Due from"
          type="date"
          value={value.dueDateFrom || ''}
          onChange={(e) => set('dueDateFrom', e.target.value || undefined)}
        />
      </div>
      <div className="lg:w-40">
        <Input
          label="Due to"
          type="date"
          value={value.dueDateTo || ''}
          onChange={(e) => set('dueDateTo', e.target.value || undefined)}
        />
      </div>
      {hasActiveFilters(value) && (
        <Button variant="ghost" size="md" onClick={clear} className="lg:ml-auto">
          <X size={14} /> Clear filters
        </Button>
      )}
    </div>
  );
}
