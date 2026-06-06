/* eslint-disable no-console */
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
const { connectDB, disconnectDB } = require('../config/db');
const Customer = require('../models/Customer');
const Invoice = require('../models/Invoice');

function round2(n) {
  return Math.round(n * 100) / 100;
}

function resolveSeedFile() {
  const argFile = process.argv.find((a) => a.startsWith('--file='));
  const explicit = argFile ? argFile.split('=')[1] : null;

  const candidates = explicit
    ? [path.resolve(explicit)]
    : [
        path.resolve(__dirname, '../../../seed-data.json'),
        path.resolve(process.cwd(), 'seed-data.json'),
        path.resolve(process.cwd(), '../seed-data.json'),
        path.resolve(process.cwd(), '../../seed-data.json'),
      ];

  for (const p of candidates) {
    if (fs.existsSync(p)) return p;
  }
  return null;
}

async function run() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error('[seed] MONGO_URI is not set. Did you copy .env.example to .env?');
    process.exit(1);
  }

  const seedPath = resolveSeedFile();
  if (!seedPath) {
    console.error('[seed] Could not find seed-data.json. Pass --file=/abs/path/to/seed-data.json');
    process.exit(1);
  }

  console.log(`[seed] Reading ${seedPath}`);
  const raw = fs.readFileSync(seedPath, 'utf-8');
  let records;
  try {
    records = JSON.parse(raw);
  } catch (err) {
    console.error('[seed] Invalid JSON in seed file:', err.message);
    process.exit(1);
  }
  if (!Array.isArray(records)) {
    console.error('[seed] Seed file must be an array of invoice records');
    process.exit(1);
  }

  await connectDB(uri);

  console.log('[seed] Dropping existing collections…');
  await Promise.all([
    Customer.collection.drop().catch(() => {}),
    Invoice.collection.drop().catch(() => {}),
  ]);

  const customerMap = new Map();
  for (const r of records) {
    const key = `${r.customer}::${r.company}`;
    if (!customerMap.has(key)) {
      customerMap.set(key, { name: r.customer, company: r.company });
    }
  }
  const customerDocs = Array.from(customerMap.values());
  console.log(`[seed] Inserting ${customerDocs.length} unique customers…`);
  const insertedCustomers = await Customer.insertMany(customerDocs, { ordered: false });
  const idByName = new Map();
  for (const c of insertedCustomers) {
    idByName.set(c.name, c._id);
  }

  const invoicesToInsert = records.map((r) => {
    const customerId = idByName.get(r.customer);
    if (!customerId) throw new Error(`Missing customerId for ${r.customer}`);
    const amount = Number(r.amount);
    const taxRate = Number(r.taxRate);
    const tax = round2((amount * taxRate) / 100);
    const total = round2(amount + tax);
    return {
      invoiceId: r.invoiceId,
      customerId,
      amount,
      taxRate,
      tax,
      total,
      status: r.status,
      issueDate: new Date(r.issueDate),
      dueDate: new Date(r.dueDate),
    };
  });

  console.log(`[seed] Inserting ${invoicesToInsert.length} invoices…`);
  await Invoice.insertMany(invoicesToInsert, { ordered: false });

  const finalCustomerCount = await Customer.countDocuments();
  const finalInvoiceCount = await Invoice.countDocuments();
  console.log(`✅ Seeded ${finalCustomerCount} customers and ${finalInvoiceCount} invoices`);

  await disconnectDB();
  process.exit(0);
}

run().catch(async (err) => {
  console.error('[seed] Failed:', err);
  try {
    await disconnectDB();
  } catch (_) {}
  process.exit(1);
});
