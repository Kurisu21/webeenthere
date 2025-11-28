// lib/invoiceApi.ts
import { API_ENDPOINTS, apiGet, apiCall } from './apiConfig';

export interface Invoice {
  id: number;
  invoice_number: string;
  user_id: number;
  transaction_id: number;
  plan_id: number;
  plan_name: string;
  plan_type: string;
  amount: number;
  tax_amount: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'cancelled';
  issue_date: string;
  due_date: string | null;
  paid_date: string | null;
  billing_address: string | null;
  notes: string | null;
  transaction_reference: string;
  transaction_status: string;
  username: string;
  email: string;
  created_at: string;
  updated_at: string;
}

export interface InvoicesResponse {
  success: boolean;
  data: Invoice[];
  error?: string;
}

export interface InvoiceResponse {
  success: boolean;
  data: Invoice;
  error?: string;
}

export const invoiceApi = {
  // Get user's invoices
  async getInvoices(filters?: {
    status?: string;
    start_date?: string;
    end_date?: string;
  }): Promise<InvoicesResponse> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.start_date) params.append('start_date', filters.start_date);
    if (filters?.end_date) params.append('end_date', filters.end_date);
    
    const queryString = params.toString();
    const url = `${API_ENDPOINTS.INVOICES}${queryString ? `?${queryString}` : ''}`;
    return await apiGet(url);
  },

  // Get specific invoice
  async getInvoice(id: number): Promise<InvoiceResponse> {
    return await apiGet(`${API_ENDPOINTS.INVOICES}/${id}`);
  },

  // Download invoice as PDF
  async downloadInvoice(id: number): Promise<Blob> {
    const response = await apiCall(`${API_ENDPOINTS.INVOICES}/${id}/download`, {
      method: 'GET',
    });

    return await response.blob();
  },

  // View invoice as PDF (inline)
  async viewInvoice(id: number): Promise<string> {
    const response = await apiCall(`${API_ENDPOINTS.INVOICES}/${id}/view`, {
      method: 'GET',
    });

    const blob = await response.blob();
    return URL.createObjectURL(blob);
  },
};

