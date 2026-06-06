require('./setup');
const request = require('supertest');
const app = require('../src/app');
const Customer = require('../src/models/Customer');

let customer;

beforeEach(async () => {
  customer = await Customer.create({ name: 'Test User', company: 'Test Co' });
});

describe('GET /api/customers', () => {
  it('returns all customers sorted by name', async () => {
    await Customer.create({ name: 'Aaron X', company: 'Aaron Co' });
    await Customer.create({ name: 'Zara Y', company: 'Zara Co' });

    const res = await request(app).get('/api/customers');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(3);
    expect(res.body[0].name).toBe('Aaron X');
    expect(res.body[2].name).toBe('Zara Y');
  });
});

describe('GET /api/customers/top5', () => {
  it('excludes Void invoices and returns top 5 by totalBilled', async () => {
    const c2 = await Customer.create({ name: 'Other', company: 'Other Co' });
    const Invoice = require('../src/models/Invoice');
    await Invoice.insertMany([
      { invoiceId: 'INV-1000001', customerId: customer._id, amount: 1000, taxRate: 18, tax: 180, total: 1180, status: 'Paid', issueDate: new Date(), dueDate: new Date() },
      { invoiceId: 'INV-1000002', customerId: customer._id, amount: 500, taxRate: 18, tax: 90, total: 590, status: 'Void', issueDate: new Date(), dueDate: new Date() },
      { invoiceId: 'INV-1000003', customerId: c2._id, amount: 9999, taxRate: 0, tax: 0, total: 9999, status: 'Sent', issueDate: new Date(), dueDate: new Date() },
    ]);

    const res = await request(app).get('/api/customers/top5');
    expect(res.status).toBe(200);
    expect(res.body).toHaveLength(2);
    const top = res.body[0];
    expect(top.customer.name).toBe('Other');
    expect(top.totalBilled).toBe(9999);
  });
});

describe('GET /api/customers/:id', () => {
  it('returns 404 for unknown id', async () => {
    const res = await request(app).get('/api/customers/507f1f77bcf86cd799439011');
    expect(res.status).toBe(404);
  });

  it('returns full profile for a known customer', async () => {
    const Invoice = require('../src/models/Invoice');
    await Invoice.insertMany([
      { invoiceId: 'INV-2000001', customerId: customer._id, amount: 1000, taxRate: 18, tax: 180, total: 1180, status: 'Paid', issueDate: new Date(), dueDate: new Date() },
      { invoiceId: 'INV-2000002', customerId: customer._id, amount: 2000, taxRate: 0, tax: 0, total: 2000, status: 'Unpaid', issueDate: new Date(), dueDate: new Date() },
      { invoiceId: 'INV-2000003', customerId: customer._id, amount: 500, taxRate: 0, tax: 0, total: 500, status: 'Void', issueDate: new Date(), dueDate: new Date() },
    ]);

    const res = await request(app).get(`/api/customers/${customer._id}`);
    expect(res.status).toBe(200);
    expect(res.body.customer.name).toBe('Test User');
    expect(res.body.metrics.invoiceCount).toBe(3);
    expect(res.body.metrics.totalBilled).toBe(3180);
    expect(res.body.metrics.outstanding).toBe(2000);
    expect(res.body.statusBreakdown.Paid).toBe(1);
    expect(res.body.statusBreakdown.Void).toBe(1);
    expect(res.body.invoices).toHaveLength(3);
  });
});
