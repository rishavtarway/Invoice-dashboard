const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');
const { HttpError } = require('../middleware/errorHandler');

async function listCustomers(req, res) {
  const customers = await Customer.find({}, 'name company').sort({ name: 1 }).lean();
  res.json(customers);
}

async function top5Customers(req, res) {
  const pipeline = [
    { $match: { status: { $ne: 'Void' } } },
    {
      $group: {
        _id: '$customerId',
        totalBilled: { $sum: '$total' },
        invoiceCount: { $sum: 1 },
      },
    },
    { $sort: { totalBilled: -1 } },
    { $limit: 5 },
    {
      $lookup: {
        from: 'customers',
        localField: '_id',
        foreignField: '_id',
        as: 'customer',
      },
    },
    { $unwind: '$customer' },
    {
      $project: {
        _id: 0,
        customer: {
          _id: '$customer._id',
          name: '$customer.name',
          company: '$customer.company',
        },
        totalBilled: { $round: ['$totalBilled', 2] },
        invoiceCount: 1,
      },
    },
  ];

  const top = await Invoice.aggregate(pipeline);
  res.json(top);
}

async function customerProfile(req, res) {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new HttpError(404, 'Customer not found');
  }

  const customer = await Customer.findById(id, 'name company').lean();
  if (!customer) throw new HttpError(404, 'Customer not found');

  const matchStage = { customerId: new mongoose.Types.ObjectId(id) };

  const [metricsAgg] = await Invoice.aggregate([
    { $match: matchStage },
    {
      $facet: {
        totals: [
          {
            $group: {
              _id: null,
              totalBilled: {
                $sum: {
                  $cond: [{ $ne: ['$status', 'Void'] }, '$total', 0],
                },
              },
              totalTax: {
                $sum: {
                  $cond: [{ $ne: ['$status', 'Void'] }, '$tax', 0],
                },
              },
              outstanding: {
                $sum: {
                  $cond: [
                    { $in: ['$status', ['Unpaid', 'Overdue']] },
                    '$total',
                    0,
                  ],
                },
              },
              invoiceCount: { $sum: 1 },
            },
          },
        ],
        breakdown: [
          { $group: { _id: '$status', count: { $sum: 1 } } },
        ],
      },
    },
  ]);

  const totals = metricsAgg.totals[0] || {
    totalBilled: 0,
    totalTax: 0,
    outstanding: 0,
    invoiceCount: 0,
  };

  const statusBreakdown = {
    Draft: 0,
    Sent: 0,
    Paid: 0,
    Unpaid: 0,
    Overdue: 0,
    Void: 0,
  };
  for (const row of metricsAgg.breakdown) {
    statusBreakdown[row._id] = row.count;
  }

  const invoices = await Invoice.find(matchStage)
    .sort({ dueDate: -1 })
    .populate('customerId', 'name company')
    .lean();

  res.json({
    customer,
    metrics: {
      totalBilled: round2(totals.totalBilled),
      totalTax: round2(totals.totalTax),
      outstanding: round2(totals.outstanding),
      invoiceCount: totals.invoiceCount,
    },
    statusBreakdown,
    invoices,
  });
}

function round2(n) {
  return Math.round((n || 0) * 100) / 100;
}

module.exports = {
  listCustomers,
  top5Customers,
  customerProfile,
};
