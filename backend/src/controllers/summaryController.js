const mongoose = require('mongoose');
const Invoice = require('../models/Invoice');
const Customer = require('../models/Customer');

async function getSummary(req, res) {
  const [invoiceAgg, customerCount] = await Promise.all([
    Invoice.aggregate([
      {
        $group: {
          _id: null,
          totalBilled: { $sum: { $cond: [{ $ne: ['$status', 'Void'] }, '$total', 0] } },
          totalTax: { $sum: { $cond: [{ $ne: ['$status', 'Void'] }, '$tax', 0] } },
          invoiceCount: { $sum: 1 },
        },
      },
    ]),
    Customer.countDocuments(),
  ]);

  const totals = invoiceAgg[0] || { totalBilled: 0, totalTax: 0, invoiceCount: 0 };

  res.json({
    totalBilled: round2(totals.totalBilled),
    totalTax: round2(totals.totalTax),
    invoiceCount: totals.invoiceCount,
    customerCount,
  });
}

function round2(n) {
  return Math.round((n || 0) * 100) / 100;
}

module.exports = { getSummary };
