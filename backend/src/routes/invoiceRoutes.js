const express = require('express');
const validate = require('../middleware/validate');
const { listInvoicesQuerySchema, createInvoiceSchema, updateInvoiceSchema } = require('../schemas/invoiceSchema');
const c = require('../controllers/invoiceController');

const router = express.Router();

router.get('/', validate(listInvoicesQuerySchema, 'query'), c.listInvoices);
router.get('/:id', c.getInvoice);
router.post('/', validate(createInvoiceSchema), c.createInvoice);
router.put('/:id', validate(updateInvoiceSchema), c.updateInvoice);
router.delete('/:id', c.deleteInvoice);

module.exports = router;
