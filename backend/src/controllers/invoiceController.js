const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const { HttpError } = require('../middleware/errorHandler');

function round2(n) {
  return Math.round(n * 100) / 100;
}

// Random INV-xxxxxxx
function generateInvoiceId() {
  const n = Math.floor(10_000_00 + Math.random() * 89_999_99);
  return `INV-${String(n).padStart(7, '0')}`;
}

// Retry on collision
async function generateUniqueInvoiceId(retries = 8) {
  for (let i = 0; i < retries; i += 1) {
    const id = generateInvoiceId();
    const exists = await Invoice.exists({ invoiceId: id });
    if (!exists) return id;
  }
  throw new HttpError(500, 'Could not generate a unique invoiceId');
}

// Build mongo filter from query string
function buildListFilter(query) {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.customerId) filter.customerId = query.customerId;

  if (query.issueDateFrom || query.issueDateTo) {
    filter.issueDate = {};
    if (query.issueDateFrom) filter.issueDate.$gte = new Date(query.issueDateFrom);
    if (query.issueDateTo) {
      const d = new Date(query.issueDateTo);
      d.setUTCHours(23, 59, 59, 999);
      filter.issueDate.$lte = d;
    }
  }
  if (query.dueDateFrom || query.dueDateTo) {
    filter.dueDate = {};
    if (query.dueDateFrom) filter.dueDate.$gte = new Date(query.dueDateFrom);
    if (query.dueDateTo) {
      const d = new Date(query.dueDateTo);
      d.setUTCHours(23, 59, 59, 999);
      filter.dueDate.$lte = d;
    }
  }
  return filter;
}

async function listInvoices(req, res) {
  const q = req.query;
  const filter = buildListFilter(q);

  if (q.search) {
    // Match invoiceId or any customer whose name matches
    const safe = q.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const invoiceIdRegex = new RegExp(safe, 'i');
    const matchingCustomers = await Customer.find({ name: invoiceIdRegex }, '_id').lean();
    const customerIds = matchingCustomers.map((c) => c._id);
    filter.$or = [{ invoiceId: invoiceIdRegex }];
    if (customerIds.length > 0) {
      filter.$or.push({ customerId: { $in: customerIds } });
    }
  }

  const sort = { [q.sortBy]: q.sortOrder === 'desc' ? -1 : 1 };
  const skip = (q.page - 1) * q.limit;

  const [total, data] = await Promise.all([
    Invoice.countDocuments(filter),
    Invoice.find(filter)
      .sort(sort)
      .skip(skip)
      .limit(q.limit)
      .populate('customerId', 'name company')
      .lean({ virtuals: true }),
  ]);

  res.json({
    data,
    pagination: {
      total,
      page: q.page,
      limit: q.limit,
      totalPages: Math.max(1, Math.ceil(total / q.limit)),
    },
  });
}

async function getInvoice(req, res) {
  const invoice = await Invoice.findById(req.params.id)
    .populate('customerId', 'name company')
    .lean();
  if (!invoice) throw new HttpError(404, 'Invoice not found');
  res.json(invoice);
}

async function createInvoice(req, res) {
  const { customerId, amount, taxRate, issueDate, dueDate, status } = req.body;

  const customer = await Customer.findById(customerId).lean();
  if (!customer) throw new HttpError(400, 'customerId does not refer to an existing customer');

  if (new Date(dueDate) < new Date(issueDate)) {
    throw new HttpError(400, 'dueDate must be on or after issueDate');
  }

  // Server-computed tax and total — never trust client
  const tax = round2((amount * Number(taxRate)) / 100);
  const total = round2(amount + tax);
  const invoiceId = await generateUniqueInvoiceId();

  const created = await Invoice.create({
    invoiceId,
    customerId,
    amount: round2(amount),
    taxRate: Number(taxRate),
    tax,
    total,
    status,
    issueDate,
    dueDate,
  });

  const populated = await Invoice.findById(created._id)
    .populate('customerId', 'name company')
    .lean();
  res.status(201).json(populated);
}

async function updateInvoice(req, res) {
  const existing = await Invoice.findById(req.params.id);
  if (!existing) throw new HttpError(404, 'Invoice not found');

  const patch = { ...req.body };

  if (patch.customerId) {
    const customer = await Customer.findById(patch.customerId).lean();
    if (!customer) throw new HttpError(400, 'customerId does not refer to an existing customer');
    existing.customerId = patch.customerId;
  }

  if (patch.amount !== undefined) existing.amount = round2(patch.amount);
  if (patch.taxRate !== undefined) existing.taxRate = Number(patch.taxRate);
  if (patch.status !== undefined) existing.status = patch.status;
  if (patch.issueDate !== undefined) existing.issueDate = patch.issueDate;
  if (patch.dueDate !== undefined) existing.dueDate = patch.dueDate;

  if (patch.amount !== undefined || patch.taxRate !== undefined) {
    // Recompute derived fields if either input changed
    existing.tax = round2((existing.amount * existing.taxRate) / 100);
    existing.total = round2(existing.amount + existing.tax);
  }

  if (existing.dueDate < existing.issueDate) {
    throw new HttpError(400, 'dueDate must be on or after issueDate');
  }

  await existing.save();
  const populated = await Invoice.findById(existing._id)
    .populate('customerId', 'name company')
    .lean();
  res.json(populated);
}

async function deleteInvoice(req, res) {
  const result = await Invoice.findByIdAndDelete(req.params.id);
  if (!result) throw new HttpError(404, 'Invoice not found');
  res.json({ message: 'Invoice deleted', id: req.params.id });
}

module.exports = {
  listInvoices,
  getInvoice,
  createInvoice,
  updateInvoice,
  deleteInvoice,
};
