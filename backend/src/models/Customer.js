const mongoose = require('mongoose');

const customerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    company: {
      type: String,
      required: true,
      trim: true,
    },
  },
  { timestamps: true }
);

customerSchema.index({ name: 1, company: 1 }, { unique: true });

module.exports = mongoose.model('Customer', customerSchema);
