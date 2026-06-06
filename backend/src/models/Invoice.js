const mongoose = require('mongoose');

const STATUSES = ['Draft', 'Sent', 'Paid', 'Unpaid', 'Overdue', 'Void'];
const TAX_RATES = [0, 3, 5, 18, 28];

const invoiceSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: String,
      required: true,
      unique: true,
      index: true,
      match: /^INV-\d{7}$/,
    },
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    taxRate: {
      type: Number,
      required: true,
      enum: TAX_RATES,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      required: true,
      enum: STATUSES,
      index: true,
    },
    issueDate: {
      type: Date,
      required: true,
      index: true,
    },
    dueDate: {
      type: Date,
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

invoiceSchema.index({ status: 1, dueDate: 1 });
invoiceSchema.index({ customerId: 1, dueDate: -1 });
invoiceSchema.index({ issueDate: 1, dueDate: 1 });
invoiceSchema.index({ amount: 1 });
invoiceSchema.index({ total: 1 });

invoiceSchema.statics.STATUSES = STATUSES;
invoiceSchema.statics.TAX_RATES = TAX_RATES;

module.exports = mongoose.model('Invoice', invoiceSchema);
module.exports.STATUSES = STATUSES;
module.exports.TAX_RATES = TAX_RATES;
