import { z } from 'zod';

export const STATUSES = ['Draft', 'Sent', 'Paid', 'Unpaid', 'Overdue', 'Void'];
export const TAX_RATES = [0, 3, 5, 18, 28];

const isoDate = z
  .string()
  .min(1, 'Required')
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD');

export const invoiceFormSchema = z
  .object({
    customerId: z.string().min(1, 'Customer is required'),
    amount: z.coerce
      .number({ invalid_type_error: 'Amount must be a number' })
      .positive('Amount must be greater than 0')
      .max(10_000_000, 'Amount is too large'),
    taxRate: z.coerce
      .number({ invalid_type_error: 'Tax rate is required' })
      .refine((v) => TAX_RATES.includes(Number(v)), {
        message: 'Pick a valid tax rate',
      }),
    issueDate: isoDate,
    dueDate: isoDate,
    status: z.enum(STATUSES, { errorMap: () => ({ message: 'Status is required' }) }),
  })
  .refine((d) => new Date(d.dueDate) >= new Date(d.issueDate), {
    message: 'Due date must be on or after issue date',
    path: ['dueDate'],
  });
