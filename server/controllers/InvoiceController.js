// controllers/InvoiceController.js
const InvoiceService = require('../services/InvoiceService');
const { getDatabaseConnection } = require('../database/database');

class InvoiceController {
  constructor() {
    this.db = getDatabaseConnection();
    this.invoiceService = new InvoiceService(this.db);
  }

  // GET /api/invoices
  async getInvoices(req, res) {
    try {
      const userId = req.user.id;
      const { status, start_date, end_date } = req.query;

      const filters = {
        status,
        start_date,
        end_date
      };

      const invoices = await this.invoiceService.getUserInvoices(userId, filters);

      res.json({
        success: true,
        data: invoices
      });
    } catch (error) {
      console.error('Error fetching invoices:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch invoices'
      });
    }
  }

  // GET /api/invoices/:id
  async getInvoice(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const invoice = await this.invoiceService.getInvoiceDetails(parseInt(id));

      if (!invoice) {
        return res.status(404).json({
          success: false,
          error: 'Invoice not found'
        });
      }

      // Verify invoice belongs to user
      if (invoice.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
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
        error: error.message || 'Failed to fetch invoice'
      });
    }
  }

  // GET /api/invoices/:id/download
  async downloadInvoice(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const invoice = await this.invoiceService.getInvoiceDetails(parseInt(id));

      if (!invoice) {
        return res.status(404).json({
          success: false,
          error: 'Invoice not found'
        });
      }

      // Verify invoice belongs to user
      if (invoice.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
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
        error: error.message || 'Failed to generate invoice PDF'
      });
    }
  }

  // GET /api/invoices/:id/view
  async viewInvoice(req, res) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const invoice = await this.invoiceService.getInvoiceDetails(parseInt(id));

      if (!invoice) {
        return res.status(404).json({
          success: false,
          error: 'Invoice not found'
        });
      }

      // Verify invoice belongs to user
      if (invoice.user_id !== userId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      // Generate PDF
      const pdfBuffer = await this.invoiceService.generatePDF(parseInt(id));

      // Set response headers for viewing
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `inline; filename="invoice-${invoice.invoice_number}.pdf"`);
      res.setHeader('Content-Length', pdfBuffer.length);

      res.send(pdfBuffer);
    } catch (error) {
      console.error('Error generating invoice PDF:', error);
      res.status(500).json({
        success: false,
        error: error.message || 'Failed to generate invoice PDF'
      });
    }
  }
}

module.exports = InvoiceController;

