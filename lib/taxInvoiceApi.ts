import { apiClient } from './apiClient';

export interface BusinessProfile {
  _id?: string;
  legalName: string;
  displayName: string;
  address: string;
  addressLine2?: string;
  city: string;
  state: string;
  stateCode: string;
  postalCode: string;
  country: string;
  email: string;
  phone: string;
  gstin?: string;
  pan?: string;
  logoUrl?: string;
  bankDetails?: {
    bankName: string;
    branch: string;
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
    showOnInvoice: boolean;
  };
  defaultPaymentTerms?: string;
  defaultDueDays?: number;
  invoiceNumberPrefix?: string;
  financialYearConfiguration?: string;
  defaultTerms?: string;
  authorizedSignatory?: {
    name: string;
    designation: string;
    signatureUrl?: string;
  };
  currency?: string;
  taxConfiguration?: {
    defaultTaxRate: number;
    enableRoundOff: boolean;
  };
}

export interface TaxCustomer {
  _id: string;
  customerName: string;
  companyName?: string;
  email: string;
  phone: string;
  billingAddress: string;
  city: string;
  state: string;
  stateCode: string;
  postalCode: string;
  country?: string;
  gstin?: string;
  pan?: string;
  notes?: string;
}

export interface LineItem {
  _id?: string;
  description: string;
  hsnSac?: string;
  quantity: number;
  unit?: string;
  rate: number;
  discount?: number;
  taxRate: number;
  taxableAmount?: number;
  cgstRate?: number;
  cgstAmount?: number;
  sgstRate?: number;
  sgstAmount?: number;
  igstRate?: number;
  igstAmount?: number;
  totalAmount?: number;
}

export interface TaxInvoice {
  _id: string;
  invoiceNumber: string;
  financialYear: string;
  invoiceDate: string;
  dueDate: string;
  businessSnapshot: BusinessProfile;
  customerId?: TaxCustomer;
  customerSnapshot: TaxCustomer;
  lineItems: LineItem[];
  subtotal: number;
  discountTotal: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  otherCharges: number;
  roundOff: number;
  grandTotal: number;
  amountPaid: number;
  balanceDue: number;
  amountInWords: string;
  currency: string;
  taxTreatment: 'INTRA_STATE' | 'INTER_STATE' | 'NON_GST';
  placeOfSupply?: string;
  customerRefNumber?: string;
  poNumber?: string;
  notes?: string;
  termsAndConditions?: string;
  invoiceStatus: 'DRAFT' | 'ISSUED' | 'CANCELLED';
  paymentStatus: 'PENDING' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';
  emailStatus: 'NOT_SENT' | 'SENT' | 'FAILED' | 'DELIVERED';
  cashfreeLinkId?: string;
  cashfreePaymentLink?: string;
  paymentLinkExpiry?: string;
  issuedAt?: string;
  lastReminderSentAt?: string;
  reminderCount?: number;
  auditHistory?: Array<{
    action: string;
    performedByName: string;
    timestamp: string;
    details?: any;
  }>;
  createdAt: string;
}

export interface DashboardStats {
  totalInvoices: number;
  totalInvoicedAmount: number;
  amountCollected: number;
  outstandingAmount: number;
  overdueAmount: number;
  partiallyPaidAmount: number;
  successfulPayments: number;
  failedPayments: number;
  failedEmailCount: number;
  recentInvoices: TaxInvoice[];
  recentPayments: any[];
}

/**
 * Currency formatter for Indian Rupees
 */
export const formatINR = (val: number | undefined | null) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(val || 0);
};

export const formatDate = (dateStr: string | undefined | null) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
};

export const taxInvoiceApi = {
  // Business Profile
  getBusinessProfile: () => apiClient.get('/tax-invoices/business-profile'),
  updateBusinessProfile: (data: Partial<BusinessProfile>) => apiClient.put('/tax-invoices/business-profile', data),

  // Customers
  listCustomers: (search = '') => apiClient.get(`/tax-invoices/customers?search=${encodeURIComponent(search)}`),
  createCustomer: (data: Partial<TaxCustomer>) => apiClient.post('/tax-invoices/customers', data),
  getCustomer: (id: string) => apiClient.get(`/tax-invoices/customers/${id}`),
  updateCustomer: (id: string, data: Partial<TaxCustomer>) => apiClient.patch(`/tax-invoices/customers/${id}`, data),

  // Invoices
  getStats: () => apiClient.get('/tax-invoices/invoices/stats'),
  listInvoices: (params: Record<string, any> = {}) => {
    const query = new URLSearchParams(params).toString();
    return apiClient.get(`/tax-invoices/invoices?${query}`);
  },
  getInvoice: (id: string) => apiClient.get(`/tax-invoices/invoices/${id}`),
  createInvoice: (data: any) => apiClient.post('/tax-invoices/invoices', data),
  updateInvoice: (id: string, data: any) => apiClient.patch(`/tax-invoices/invoices/${id}`, data),
  issueInvoice: (id: string) => apiClient.post(`/tax-invoices/invoices/${id}/issue`),
  issueAndSendInvoice: (id: string) => apiClient.post(`/tax-invoices/invoices/${id}/send`),
  sendEmailOnly: (id: string) => apiClient.post(`/tax-invoices/invoices/${id}/email`),
  sendReminder: (id: string) => apiClient.post(`/tax-invoices/invoices/${id}/remind`),
  cancelInvoice: (id: string, reason?: string) => apiClient.post(`/tax-invoices/invoices/${id}/cancel`, { reason }),
  generatePaymentLink: (id: string) => apiClient.post(`/tax-invoices/invoices/${id}/payment-link`),

  // Payments & Emails
  listInvoicePayments: (id: string) => apiClient.get(`/tax-invoices/invoices/${id}/payments`),
  listAllPayments: () => apiClient.get('/tax-invoices/payments'),
  listInvoiceEmails: (id: string) => apiClient.get(`/tax-invoices/invoices/${id}/emails`),
  listAllEmailLogs: () => apiClient.get('/tax-invoices/emails'),

  // Public checkout data
  getPublicInvoice: (id: string) => apiClient.get(`/tax-invoices/public/${id}`),

  // PDF Download URL
  getPdfDownloadUrl: (id: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
    return `${baseUrl}/tax-invoices/invoices/${id}/pdf`;
  }
};
