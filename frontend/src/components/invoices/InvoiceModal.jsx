import { useEffect, useMemo } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Modal from '../ui/Modal';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';
import { invoiceFormSchema, STATUSES, TAX_RATES } from '../../schemas/invoiceSchema';
import { toISODate } from '../../utils/format';
import { useCreateInvoice, useUpdateInvoice } from '../../hooks/useInvoices';
import { useCustomers } from '../../hooks/useCustomers';
import InvoiceFormPreview from './InvoiceFormPreview';

const today = () => toISODate(new Date());
const inDays = (n) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toISODate(d);
};

function getDefaults(invoice) {
  if (invoice) {
    return {
      customerId: invoice.customerId?._id || invoice.customerId,
      amount: invoice.amount,
      taxRate: invoice.taxRate,
      issueDate: toISODate(invoice.issueDate),
      dueDate: toISODate(invoice.dueDate),
      status: invoice.status,
    };
  }
  return {
    customerId: '',
    amount: '',
    taxRate: 18,
    issueDate: today(),
    dueDate: inDays(30),
    status: 'Draft',
  };
}

export default function InvoiceModal({ open, onClose, invoice }) {
  const isEdit = Boolean(invoice);
  const { data: customers = [], isLoading: loadingCustomers } = useCustomers();
  const create = useCreateInvoice();
  const update = useUpdateInvoice();

  const defaults = useMemo(() => getDefaults(invoice), [invoice]);
  const {
    register,
    handleSubmit,
    control,
    reset,
    watch,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: defaults,
  });

  // Reset form whenever the modal opens or the source invoice changes
  useEffect(() => {
    if (open) reset(defaults);
  }, [open, defaults, reset]);

  const amount = watch('amount');
  const taxRate = watch('taxRate');
  const customerId = watch('customerId');
  const company = customers.find((c) => c._id === customerId)?.company || '—';

  const onSubmit = (data) => {
    const payload = {
      ...data,
      amount: Number(data.amount),
      taxRate: Number(data.taxRate),
    };
    const action = isEdit
      ? update.mutateAsync({ id: invoice._id, payload })
      : create.mutateAsync(payload);
    action
      .then(() => onClose(true))
      .catch(() => {});
  };

  const submitting = isSubmitting || create.isLoading || update.isLoading;
  const apiError = create.error?.message || update.error?.message || null;

  return (
    <Modal
      open={open}
      onClose={() => onClose(false)}
      title={isEdit ? `Edit ${invoice.invoiceId}` : 'New invoice'}
      maxWidth="max-w-xl"
      footer={
        <>
          <Button variant="ghost" onClick={() => onClose(false)} disabled={submitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit(onSubmit)}
            disabled={submitting || loadingCustomers}
          >
            {submitting ? 'Saving…' : isEdit ? 'Save changes' : 'Save invoice'}
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        {apiError && (
          <div className="rounded-md border border-statusOverdue bg-statusOverdueBg px-3 py-2 text-xs text-statusOverdue">
            {apiError}
          </div>
        )}

        <Controller
          control={control}
          name="customerId"
          render={({ field }) => (
            <Select
              label="Customer"
              value={field.value || ''}
              onChange={field.onChange}
              error={errors.customerId?.message}
              disabled={loadingCustomers}
            >
              <option value="" disabled>
                {loadingCustomers ? 'Loading customers…' : 'Select a customer'}
              </option>
              {customers.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name} — {c.company}
                </option>
              ))}
            </Select>
          )}
        />

        <div>
          <label className="text-xs font-medium text-inkSecondary">Company (auto-filled)</label>
          <div className="mt-1 rounded-md border border-dashed border-border bg-canvas px-3 py-2 text-sm text-inkSecondary">
            {company}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Amount"
            type="number"
            step="0.01"
            min="0"
            {...register('amount')}
            error={errors.amount?.message}
          />
          <div>
            <label className="text-xs font-medium text-inkSecondary">Tax rate</label>
            <Controller
              control={control}
              name="taxRate"
              render={({ field }) => (
                <Select
                  value={String(field.value ?? '')}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                  error={errors.taxRate?.message}
                >
                  {TAX_RATES.map((r) => (
                    <option key={r} value={r}>
                      {r}%
                    </option>
                  ))}
                </Select>
              )}
            />
            {errors.taxRate?.message && (
              <span className="text-xs text-statusOverdue">{errors.taxRate.message}</span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Issue date"
            type="date"
            {...register('issueDate')}
            error={errors.issueDate?.message}
          />
          <Input
            label="Due date"
            type="date"
            {...register('dueDate')}
            error={errors.dueDate?.message}
          />
        </div>

        <div>
          <label className="text-xs font-medium text-inkSecondary">Status</label>
          <Controller
            control={control}
            name="status"
            render={({ field }) => (
              <Select value={field.value} onChange={field.onChange} error={errors.status?.message}>
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </Select>
            )}
          />
          {errors.status?.message && (
            <span className="text-xs text-statusOverdue">{errors.status.message}</span>
          )}
        </div>

        <InvoiceFormPreview amount={amount} taxRate={taxRate} />

        <button type="submit" hidden />
      </form>
    </Modal>
  );
}
