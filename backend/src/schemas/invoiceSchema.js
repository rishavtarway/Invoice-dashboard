const { z } = require('zod');
const mongoose = require('mongoose');
const { STATUSES, TAX_RATES } = require('../models/Invoice');

const objectId = z
  .string()
  .refine((v) => mongoose.Types.ObjectId.isValid(v), {
    message: 'Invalid customerId',
  });

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, 'Date must be YYYY-MM-DD')
  .transform((v) => new Date(v));

const baseFields = {
  customerId: objectId,
  amount: z.coerce.number().min(0).max(10_000_000),
  taxRate: z.coerce.number().refine((v) => TAX_RATES.includes(Number(v)), {
    message: `taxRate must be one of ${TAX_RATES.join(', ')}`,
  }),
  issueDate: isoDate,
  dueDate: isoDate,
  status: z.enum(STATUSES),
};

const createInvoiceSchema = z
  .object(baseFields)
  .strict()
  .refine((d) => d.dueDate >= d.issueDate, {
    message: 'dueDate must be on or after issueDate',
    path: ['dueDate'],
  });

const updateInvoiceSchema = z
  .object({
    customerId: objectId.optional(),
    amount: z.coerce.number().min(0).max(10_000_000).optional(),
    taxRate: z.coerce
      .number()
      .refine((v) => TAX_RATES.includes(Number(v)), {
        message: `taxRate must be one of ${TAX_RATES.join(', ')}`,
      })
      .optional(),
    issueDate: isoDate.optional(),
    dueDate: isoDate.optional(),
    status: z.enum(STATUSES).optional(),
  })
  .strict()
  .refine((d) => Object.keys(d).length > 0, {
    message: 'At least one field is required',
  });

const listInvoicesQuerySchema = z
  .object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(100).default(20),
    sortBy: z.enum(['amount', 'total', 'dueDate']).default('dueDate'),
    sortOrder: z.enum(['asc', 'desc']).default('asc'),
    status: z.enum(STATUSES).optional(),
    customerId: objectId.optional(),
    issueDateFrom: isoDate.optional(),
    issueDateTo: isoDate.optional(),
    dueDateFrom: isoDate.optional(),
    dueDateTo: isoDate.optional(),
    search: z.string().trim().min(1).optional(),
  })
  .passthrough();

module.exports = {
  createInvoiceSchema,
  updateInvoiceSchema,
  listInvoicesQuerySchema,
};
