const express = require('express');
const c = require('../controllers/customerController');

const router = express.Router();

router.get('/', c.listCustomers);
router.get('/top5', c.top5Customers);
router.get('/:id', c.customerProfile);

module.exports = router;
