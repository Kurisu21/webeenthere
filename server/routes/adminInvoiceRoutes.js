// routes/adminInvoiceRoutes.js
const express = require('express');
const router = express.Router();
const AdminInvoiceController = require('../controllers/AdminInvoiceController');
const { adminAuthMiddleware } = require('../middleware/auth');

const adminInvoiceController = new AdminInvoiceController();

// All routes require admin authentication
router.use(adminAuthMiddleware);

// Get all invoices
router.get('/', adminInvoiceController.getAllInvoices.bind(adminInvoiceController));

// Get specific invoice
router.get('/:id', adminInvoiceController.getInvoice.bind(adminInvoiceController));

// Download invoice as PDF
router.get('/:id/download', adminInvoiceController.downloadInvoice.bind(adminInvoiceController));

// Create invoice from transaction
router.post('/create-from-transaction/:transactionId', adminInvoiceController.createInvoiceFromTransaction.bind(adminInvoiceController));

module.exports = router;

