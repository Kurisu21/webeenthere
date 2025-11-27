// controllers/AdminInvoiceController.js
const InvoiceService = require('../services/InvoiceService');
const { getDatabaseConnection } = require('../database/database');

class AdminInvoiceController {
  constructor() {
    this.db = getDatabaseConnection();
    this.invoiceService = new InvoiceService(this.db);
  }

  // GET /api/admin/invoices
  async getAllInvoices(req, res) {
    try {
      const {
        user_id,
        status,
        start_date,
        end_date,
        page = 1,
        limit = 50
      } = req.query;

      const filters = {
        user_id: user_id ? parseInt(user_id) : undefined,
        status,
        start_date,
        end_date,
        limit: parseInt(limit) * parseInt(page) // Get more for pagination
      };

      const invoices = await this.invoiceService.getAllInvoices(filters);

      // Calculate pagination
      const total = invoices.length;
      const startIndex = (parseInt(page) - 1) * parseInt(limit);
      const endIndex = startIndex + parseInt(limit);
      const paginatedInvoices = invoices.slice(startIndex, endIndex);

      res.json({
        success: true,
        data: paginatedInvoices,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(total / parseInt(limit)),
          totalItems: total,
          itemsPerPage: parseInt(limit)
        }
      });
    } catch (error) {
      console.error('Error fetching invoices:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch invoices'
      });
    }
  }

  // GET /api/admin/invoices/:id
  async getInvoice(req, res) {
    try {
      const { id } = req.params;

      const invoice = await this.invoiceService.getInvoiceDetails(parseInt(id));

      if (!invoice) {
        return res.status(404).json({
          success: false,
          error: 'Invoice not found'
        });
      }

      res.json({
        success: true,
        data: invoice
      });
    } catch (error) {
      console.error('Error fetching invoice:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch invoice'
      });
    }
  }

  // GET /api/admin/invoices/:id/download
  async downloadInvoice(req, res) {
    try {
      const { id } = req.params;

      const invoice = await this.invoiceService.getInvoiceDetails(parseInt(id));

      if (!invoice) {
        return res.status(404).json({
          success: false,
          error: 'Invoice not found'
        });
      }

      // Generate PDF
      const pdfBuffer = await this.invoiceService.generatePDF(parseInt(id));

      // Set response headers
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="invoice-${invoice.invoice_number}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to generate invoice PDF'
      });
    }
  }

  // POST /api/admin/invoices/create-from-transaction/:transactionId
  async createInvoiceFromTransaction(req, res) {
    try {
      const { transactionId } = req.params;

      const invoice = await this.invoiceService.createInvoiceFromTransaction(parseInt(transactionId));

      res.json({
        success: true,
        data: invoice,
        message: 'Invoice created successfully'
      });
    } catch (error) {
      console.error('Error creating invoice:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to create invoice'
      });
    }
  }
}

module.exports = AdminInvoiceController;

