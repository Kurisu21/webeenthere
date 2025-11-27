// routes/invoiceRoutes.js
const express = require('express');
const router = express.Router();
const InvoiceController = require('../controllers/InvoiceController');
const { authMiddleware } = require('../middleware/auth');

const invoiceController = new InvoiceController();

// All routes require authentication
router.use(authMiddleware);

// Get user's invoices
router.get('/', invoiceController.getInvoices.bind(invoiceController));

// Get specific invoice
router.get('/:id', invoiceController.getInvoice.bind(invoiceController));

// Download invoice as PDF
router.get('/:id/download', invoiceController.downloadInvoice.bind(invoiceController));

// View invoice as PDF (inline)
router.get('/:id/view', invoiceController.viewInvoice.bind(invoiceController));

module.exports = router;

