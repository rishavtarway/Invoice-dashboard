require('./setup');
const request = require('supertest');
const app = require('../src/app');
const Customer = require('../src/models/Customer');
const Invoice = require('../src/models/Invoice');

let customer;
let invoice;

beforeEach(async () => {
  customer = await Customer.create({ name: 'Ramesh Pillai', company: 'Cipla Pharma' });
  invoice = await Invoice.create({
    invoiceId: 'INV-0000001',
    customerId: customer._id,
    amount: 1000,
    taxRate: 18,
    tax: 180,
    total: 1180,
    status: 'Paid',
    issueDate: new Date('2025-07-12'),
    dueDate: new Date('2026-07-15'),
  });
});

describe('GET /api/invoices', () => {
  it('returns paginated invoices with populated customer', async () => {
    const res = await request(app).get('/api/invoices');
    expect(res.status).toBe(200);
    expect(res.body.pagination.total).toBe(1);
    expect(res.body.data[0].customerId.name).toBe('Ramesh Pillai');
  });

  it('filters by status', async () => {
    await Invoice.create({
      invoiceId: 'INV-0000002', customerId: customer._id, amount: 500, taxRate: 0, tax: 0, total: 500, status: 'Void', issueDate: new Date(), dueDate: new Date(),
    });
    const res = await request(app).get('/api/invoices?status=Void');
    expect(res.body.data).toHaveLength(1);
    expect(res.body.data[0].status).toBe('Void');
  });

  it('searches by invoiceId', async () => {
    const res = await request(app).get('/api/invoices?search=INV-0000001');
    expect(res.body.data).toHaveLength(1);
  });

  it('searches by customer name', async () => {
    const res = await request(app).get('/api/invoices?search=ramesh');
    expect(res.body.data).toHaveLength(1);
  });

  it('validates query params', async () => {
    const res = await request(app).get('/api/invoices?page=0');
    expect(res.status).toBe(400);
  });
});

describe('POST /api/invoices', () => {
  it('creates an invoice, auto-computing tax and total', async () => {
    const res = await request(app)
      .post('/api/invoices')
      .send({
        customerId: customer._id.toString(),
        amount: 1500,
        taxRate: 18,
        issueDate: '2026-01-15',
        dueDate: '2026-02-15',
        status: 'Draft',
      });
    expect(res.status).toBe(201);
    expect(res.body.tax).toBe(270);
    expect(res.body.total).toBe(1770);
    expect(res.body.invoiceId).toMatch(/^INV-\d{7}$/);
  });

  it('rejects dueDate before issueDate', async () => {
    const res = await request(app)
      .post('/api/invoices')
      .send({
        customerId: customer._id.toString(),
        amount: 100,
        taxRate: 0,
        issueDate: '2026-02-15',
        dueDate: '2026-01-15',
        status: 'Draft',
      });
    expect(res.status).toBe(400);
  });

  it('rejects unknown customerId', async () => {
    const res = await request(app)
      .post('/api/invoices')
      .send({
        customerId: '507f1f77bcf86cd799439011',
        amount: 100,
        taxRate: 0,
        issueDate: '2026-01-15',
        dueDate: '2026-02-15',
        status: 'Draft',
      });
    expect(res.status).toBe(400);
  });
});

describe('PUT /api/invoices/:id', () => {
  it('updates amount and recomputes tax/total', async () => {
    const res = await request(app)
      .put(`/api/invoices/${invoice._id}`)
      .send({ amount: 2000, taxRate: 5 });
    expect(res.status).toBe(200);
    expect(res.body.amount).toBe(2000);
    expect(res.body.tax).toBe(100);
    expect(res.body.total).toBe(2100);
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app)
      .put('/api/invoices/507f1f77bcf86cd799439011')
      .send({ amount: 2000 });
    expect(res.status).toBe(404);
  });
});

describe('DELETE /api/invoices/:id', () => {
  it('deletes the invoice', async () => {
    const res = await request(app).delete(`/api/invoices/${invoice._id}`);
    expect(res.status).toBe(200);
    const after = await Invoice.findById(invoice._id);
    expect(after).toBeNull();
  });
});
