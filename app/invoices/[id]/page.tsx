'use client';

import React, { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { 
  taxInvoiceApi, 
  TaxInvoice, 
  formatINR, 
  formatDate 
} from '../../../lib/taxInvoiceApi';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function InvoiceDetailsPage({ params }: PageProps) {
  const resolvedParams = use(params);
  const invoiceId = resolvedParams.id;

  const [invoice, setInvoice] = useState<TaxInvoice | null>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [copySuccess, setCopySuccess] = useState(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type?: 'success' | 'danger' | 'info' } | null>(null);

  const fetchInvoiceData = async () => {
    setLoading(true);
    try {
      const [invRes, payRes, emailRes] = await Promise.all([
        taxInvoiceApi.getInvoice(invoiceId),
        taxInvoiceApi.listInvoicePayments(invoiceId),
        taxInvoiceApi.listInvoiceEmails(invoiceId)
      ]);

      if (invRes.data.success) {
        setInvoice(invRes.data.data);
      }
      if (payRes.data.success) {
        setPayments(payRes.data.data);
      }
      if (emailRes.data.success) {
        setEmails(emailRes.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching invoice details:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoiceData();
  }, [invoiceId]);

  const handleCopyPaymentLink = () => {
    if (!invoice?.cashfreePaymentLink) {
      setToastMessage({ text: 'No active payment link for this invoice.', type: 'info' });
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    navigator.clipboard.writeText(invoice.cashfreePaymentLink);
    setCopySuccess(true);
    setToastMessage({ text: 'Cashfree payment link copied to clipboard!', type: 'success' });
    setTimeout(() => {
      setCopySuccess(false);
      setToastMessage(null);
    }, 3000);
  };

  const handleIssueInvoice = async () => {
    if (!confirm('Issue this invoice now? An official sequence number and Cashfree payment link will be locked.')) return;
    try {
      setActionLoading(true);
      const res = await taxInvoiceApi.issueInvoice(invoiceId);
      if (res.data.success) {
        setToastMessage({ text: 'Invoice issued and Cashfree link generated!', type: 'success' });
        fetchInvoiceData();
      }
    } catch (err: any) {
      setToastMessage({ text: err.response?.data?.message || 'Error issuing invoice', type: 'danger' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleSendEmail = async () => {
    try {
      setActionLoading(true);
      const res = await taxInvoiceApi.sendEmailOnly(invoiceId);
      if (res.data.success) {
        setToastMessage({ text: 'Tax invoice PDF & Cashfree link emailed to customer!', type: 'success' });
        fetchInvoiceData();
      }
    } catch (err: any) {
      setToastMessage({ text: err.response?.data?.message || 'Error sending email', type: 'danger' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleSendReminder = async () => {
    try {
      setActionLoading(true);
      const res = await taxInvoiceApi.sendReminder(invoiceId);
      if (res.data.success) {
        setToastMessage({ text: 'Payment reminder email dispatched successfully!', type: 'success' });
        fetchInvoiceData();
      }
    } catch (err: any) {
      setToastMessage({ text: err.response?.data?.message || 'Error sending reminder', type: 'danger' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleGeneratePaymentLink = async () => {
    try {
      setActionLoading(true);
      const res = await taxInvoiceApi.generatePaymentLink(invoiceId);
      if (res.data.success) {
        setToastMessage({ text: 'Cashfree payment link generated successfully!', type: 'success' });
        fetchInvoiceData();
      }
    } catch (err: any) {
      setToastMessage({ text: err.response?.data?.message || 'Error creating payment link', type: 'danger' });
    } finally {
      setActionLoading(false);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <div className="text-muted small mt-2">Loading official tax invoice document...</div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-file-earmark-x fs-1 text-danger d-block mb-2"></i>
        <h5 className="text-dark fw-bold">Invoice Not Found</h5>
        <p className="text-muted small">The requested invoice ID does not exist in your organization.</p>
        <Link href="/invoices" className="btn btn-outline-primary btn-sm mt-2 rounded-2">
          <i className="bi bi-arrow-left me-1"></i> Back to Invoices
        </Link>
      </div>
    );
  }

  const biz = invoice.businessSnapshot || {};
  const cust = invoice.customerSnapshot || {};
  const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.balanceDue > 0;

  return (
    <div className="container-fluid px-2 px-md-3 py-3" style={{ maxWidth: '1440px', margin: '0 auto' }}>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="position-fixed top-0 end-0 p-3" style={{ zIndex: 2000 }}>
          <div
            className={`toast show border-0 shadow-lg text-white p-2.5 rounded-3 d-flex align-items-center gap-2 ${
              toastMessage.type === 'danger'
                ? 'bg-danger'
                : toastMessage.type === 'info'
                ? 'bg-primary'
                : 'bg-success'
            }`}
          >
            <i
              className={`bi ${
                toastMessage.type === 'danger'
                  ? 'bi-exclamation-triangle-fill'
                  : toastMessage.type === 'info'
                  ? 'bi-info-circle-fill'
                  : 'bi-check-circle-fill'
              } fs-5`}
            ></i>
            <div className="toast-body p-0 small fw-medium">{toastMessage.text}</div>
            <button
              type="button"
              className="btn-close btn-close-white ms-auto small"
              onClick={() => setToastMessage(null)}
            ></button>
          </div>
        </div>
      )}

      {/* Top Header & Breadcrumb Bar */}
      <div className="d-flex flex-column flex-lg-row align-items-lg-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1.5 flex-wrap">
            <Link href="/invoices" className="btn btn-sm btn-link text-decoration-none p-0 text-secondary" style={{ fontSize: '0.82rem' }}>
              <i className="bi bi-arrow-left me-1"></i>All Invoices
            </Link>
            <span className="text-muted">•</span>
            <span
              className={`badge px-2.5 py-1 rounded-pill ${
                invoice.invoiceStatus === 'ISSUED'
                  ? 'bg-primary text-white'
                  : invoice.invoiceStatus === 'DRAFT'
                  ? 'bg-secondary text-white'
                  : 'bg-dark text-white'
              }`}
              style={{ fontSize: '0.72rem', fontWeight: 600 }}
            >
              {invoice.invoiceStatus}
            </span>
            <span
              className={`badge px-2.5 py-1 rounded-pill ${
                invoice.paymentStatus === 'PAID'
                  ? 'bg-success text-white'
                  : invoice.paymentStatus === 'PARTIALLY_PAID'
                  ? 'bg-warning text-dark'
                  : 'bg-danger-subtle text-danger border border-danger-subtle'
              }`}
              style={{ fontSize: '0.72rem', fontWeight: 600 }}
            >
              {invoice.paymentStatus === 'PAID' ? 'PAID' : `PAYMENT: ${invoice.paymentStatus}`}
            </span>
            {isOverdue && (
              <span className="badge bg-danger text-white rounded-pill px-2.5 py-1" style={{ fontSize: '0.72rem' }}>
                OVERDUE
              </span>
            )}
          </div>

          <div className="d-flex align-items-center gap-2">
            <h3 className="fw-bold mb-0 text-dark" style={{ letterSpacing: '-0.02em' }}>
              Tax Invoice: {invoice.invoiceNumber}
            </h3>
            <span className="badge bg-light text-secondary border font-monospace small">
              FY: {invoice.financialYear}
            </span>
          </div>
        </div>

        {/* Top Action Toolbar */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          {/* Download Official PDF */}
          <a
            href={taxInvoiceApi.getPdfDownloadUrl(invoice._id)}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline-danger btn-sm d-flex align-items-center gap-1.5 px-3 py-1.5 rounded-2 shadow-none"
            title="Download GST Compliant PDF"
          >
            <i className="bi bi-file-earmark-pdf-fill"></i>
            <span>Download PDF</span>
          </a>

          {/* Copy Payment Link */}
          {invoice.cashfreePaymentLink && (
            <button
              type="button"
              className={`btn btn-sm d-flex align-items-center gap-1.5 px-3 py-1.5 rounded-2 ${
                copySuccess ? 'btn-success text-white' : 'btn-outline-primary'
              }`}
              onClick={handleCopyPaymentLink}
              title="Copy Customer Checkout Link"
            >
              <i className={`bi ${copySuccess ? 'bi-check2' : 'bi-link-45deg'}`}></i>
              <span>{copySuccess ? 'Link Copied!' : 'Copy Pay Link'}</span>
            </button>
          )}

          {/* Direct Pay Link Portal */}
          {invoice.cashfreePaymentLink && invoice.balanceDue > 0 && (
            <a
              href={invoice.cashfreePaymentLink}
              target="_blank"
              rel="noreferrer"
              className="btn btn-success btn-sm d-flex align-items-center gap-1.5 px-3.5 py-1.5 rounded-2 fw-semibold shadow-sm text-decoration-none"
            >
              <i className="bi bi-credit-card-2-front"></i>
              <span>Pay Now Portal</span>
            </a>
          )}

          {/* Send Email */}
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5 px-3 py-1.5 rounded-2"
            onClick={handleSendEmail}
            disabled={actionLoading}
            title="Email PDF and Payment link to recipient"
          >
            <i className="bi bi-send"></i>
            <span>Email Invoice</span>
          </button>

          {/* Send Reminder */}
          {invoice.balanceDue > 0 && invoice.invoiceStatus === 'ISSUED' && (
            <button
              type="button"
              className="btn btn-outline-warning text-dark btn-sm d-flex align-items-center gap-1.5 px-3 py-1.5 rounded-2"
              onClick={handleSendReminder}
              disabled={actionLoading}
            >
              <i className="bi bi-bell"></i>
              <span>Send Reminder</span>
            </button>
          )}

          {/* Issue if Draft */}
          {invoice.invoiceStatus === 'DRAFT' && (
            <button
              type="button"
              className="btn btn-primary btn-sm d-flex align-items-center gap-1.5 px-3.5 py-1.5 rounded-2 fw-semibold"
              onClick={handleIssueInvoice}
              disabled={actionLoading}
            >
              <i className="bi bi-check2-circle"></i>
              <span>Issue Invoice</span>
            </button>
          )}
        </div>
      </div>

      <div className="row g-4">
        {/* Main Decent Invoice Paper Sheet View */}
        <div className="col-12 col-xl-8">
          <div
            className="card border-0 bg-white rounded-4 p-4 p-md-5 position-relative"
            style={{
              boxShadow: '0 10px 30px -5px rgba(15, 23, 42, 0.08), 0 0 0 1px rgba(226, 232, 240, 0.8)',
              minHeight: '850px'
            }}
          >
            {/* Decent Header: Logo & Title Row */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-sm-start pb-4 border-bottom gap-3">
              <div>
                <div className="d-flex align-items-center gap-2 mb-1.5">
                  <div
                    className="rounded-3 bg-primary text-white d-flex align-items-center justify-content-center shadow-sm"
                    style={{ width: 36, height: 36 }}
                  >
                    <i className="bi bi-building fs-5"></i>
                  </div>
                  <div>
                    <h5 className="fw-bold text-dark mb-0">{biz.displayName || biz.legalName || 'Business Organization'}</h5>
                    <div className="text-muted small" style={{ fontSize: '0.78rem' }}>{biz.legalName}</div>
                  </div>
                </div>

                <div className="text-secondary small mt-2" style={{ lineHeight: 1.5, fontSize: '0.8rem' }}>
                  <div>{biz.address}{biz.addressLine2 ? `, ${biz.addressLine2}` : ''}</div>
                  <div>{biz.city}, {biz.state} - {biz.postalCode}, {biz.country || 'India'}</div>
                  <div className="mt-1">
                    <span className="me-3"><i className="bi bi-telephone me-1 text-muted"></i>{biz.phone || '-'}</span>
                    <span><i className="bi bi-envelope me-1 text-muted"></i>{biz.email || '-'}</span>
                  </div>
                  <div className="mt-1.5 d-flex align-items-center gap-2 flex-wrap">
                    <span className="badge bg-light text-dark border font-monospace">
                      GSTIN: <strong>{biz.gstin || '-'}</strong>
                    </span>
                    <span className="badge bg-light text-secondary border font-monospace">
                      PAN: {biz.pan || '-'}
                    </span>
                    <span className="badge bg-light text-secondary border">
                      State Code: {biz.stateCode || '27'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Invoice Metadata Box (Clean & Minimal) */}
              <div className="text-sm-end mt-2 mt-sm-0">
                <div className="d-inline-block text-start text-sm-end">
                  <span className="badge bg-primary bg-opacity-10 text-primary border border-primary border-opacity-25 px-3 py-1.5 rounded-pill mb-2 fw-bold text-uppercase" style={{ letterSpacing: '0.05em' }}>
                    TAX INVOICE
                  </span>
                  <div className="fs-5 fw-bold text-dark font-monospace">{invoice.invoiceNumber}</div>
                  <div className="text-muted small mt-1" style={{ fontSize: '0.78rem' }}>
                    <div><strong>Date:</strong> {formatDate(invoice.invoiceDate)}</div>
                    <div>
                      <strong>Due Date:</strong>{' '}
                      <span className={isOverdue ? 'text-danger fw-bold' : 'text-dark'}>
                        {formatDate(invoice.dueDate)}
                      </span>
                    </div>
                    <div><strong>Place of Supply:</strong> {invoice.placeOfSupply || biz.state || '-'}</div>
                    <div><strong>Tax Treatment:</strong> {invoice.taxTreatment || 'INTRA_STATE'}</div>
                    {invoice.poNumber && <div><strong>PO #:</strong> {invoice.poNumber}</div>}
                    {invoice.customerRefNumber && <div><strong>Ref #:</strong> {invoice.customerRefNumber}</div>}
                  </div>
                </div>
              </div>
            </div>

            {/* Billed To / Buyer Information Section */}
            <div className="my-4 p-3.5 rounded-3 bg-light border">
              <div className="d-flex align-items-center justify-content-between mb-2">
                <span className="text-secondary small fw-bold text-uppercase" style={{ letterSpacing: '0.05em', fontSize: '0.72rem' }}>
                  <i className="bi bi-person-fill me-1 text-primary"></i> Billed To (Buyer / Customer)
                </span>
                {cust.gstin ? (
                  <span className="badge bg-success-subtle text-success border border-success-subtle font-monospace" style={{ fontSize: '0.68rem' }}>
                    GSTIN: {cust.gstin}
                  </span>
                ) : (
                  <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '0.68rem' }}>
                    Consumer / Unregistered
                  </span>
                )}
              </div>

              <div className="row g-2 small">
                <div className="col-12 col-md-6">
                  <h6 className="fw-bold text-dark mb-1">{cust.customerName}</h6>
                  {cust.companyName && <div className="text-secondary fw-medium mb-1">{cust.companyName}</div>}
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                    {cust.billingAddress}<br />
                    {cust.city}, {cust.state} - {cust.postalCode}
                  </div>
                </div>
                <div className="col-12 col-md-6 text-md-end">
                  <div className="text-muted" style={{ fontSize: '0.8rem' }}>
                    <div><strong>Email:</strong> {cust.email}</div>
                    <div><strong>Phone:</strong> {cust.phone}</div>
                    {cust.pan && <div><strong>PAN:</strong> <span className="font-monospace">{cust.pan}</span></div>}
                    <div><strong>State:</strong> {cust.state} ({cust.stateCode || '-'})</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Table (Decent, Modern, Crisp) */}
            <div className="table-responsive my-4">
              <table className="table table-hover align-middle mb-0" style={{ borderTop: '1px solid #E2E8F0' }}>
                <thead className="table-light small text-secondary text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: '0.04em' }}>
                  <tr>
                    <th style={{ width: 40 }} className="text-center">#</th>
                    <th style={{ minWidth: 220 }}>Description</th>
                    <th className="text-center" style={{ width: 90 }}>HSN/SAC</th>
                    <th className="text-center" style={{ width: 80 }}>Qty</th>
                    <th className="text-end" style={{ width: 100 }}>Rate</th>
                    <th className="text-end" style={{ width: 105 }}>Taxable</th>
                    <th className="text-end" style={{ width: 105 }}>GST</th>
                    <th className="text-end" style={{ width: 115 }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {invoice.lineItems.map((item, index) => {
                    const gstAmount = (item.cgstAmount || 0) + (item.sgstAmount || 0) + (item.igstAmount || 0);
                    return (
                      <tr key={index} className="small">
                        <td className="text-center text-muted fw-semibold">{index + 1}</td>
                        <td>
                          <span className="fw-semibold text-dark d-block">{item.description}</span>
                          {(item.discount || 0) > 0 && (
                            <span className="text-danger small" style={{ fontSize: '0.7rem' }}>
                              Discount: -{formatINR(item.discount || 0)}
                            </span>
                          )}
                        </td>
                        <td className="text-center font-monospace text-muted small">{item.hsnSac || '-'}</td>
                        <td className="text-center">{item.quantity} <span className="text-muted small">{item.unit || ''}</span></td>
                        <td className="text-end font-monospace">{formatINR(item.rate)}</td>
                        <td className="text-end font-monospace">{formatINR(item.taxableAmount)}</td>
                        <td className="text-end font-monospace">
                          {gstAmount > 0 ? (
                            <div>
                              <div>{formatINR(gstAmount)}</div>
                              <span className="text-muted" style={{ fontSize: '0.68rem' }}>({item.taxRate}%)</span>
                            </div>
                          ) : (
                            <span className="text-muted">0%</span>
                          )}
                        </td>
                        <td className="text-end fw-bold text-dark font-monospace">{formatINR(item.totalAmount)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Financial Summary & Amount in Words */}
            <div className="row g-4 my-2 pt-2 border-top">
              {/* Left Column: Amount in Words, Bank Details, Terms */}
              <div className="col-12 col-md-6">
                {/* Amount Chargeable (in words) */}
                <div className="p-3 rounded-3 bg-light border mb-3">
                  <span className="text-secondary small fw-bold text-uppercase d-block mb-1" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>
                    Amount Chargeable (in words)
                  </span>
                  <div className="fw-bold text-primary fst-italic" style={{ fontSize: '0.85rem' }}>
                    {invoice.amountInWords || 'Zero Rupees Only'}
                  </div>
                </div>

                {/* Bank Account Transfer Details */}
                {biz.bankDetails?.showOnInvoice && (
                  <div className="p-3 rounded-3 bg-light border mb-3 small">
                    <span className="text-secondary small fw-bold text-uppercase d-flex align-items-center justify-content-between mb-1.5" style={{ fontSize: '0.7rem', letterSpacing: '0.04em' }}>
                      <span><i className="bi bi-bank me-1 text-primary"></i> Bank Transfer Details</span>
                      <span className="badge bg-white text-secondary border">Direct Wire</span>
                    </span>
                    <div className="text-muted" style={{ fontSize: '0.78rem' }}>
                      <div>Bank Name: <strong className="text-dark">{biz.bankDetails.bankName}</strong> ({biz.bankDetails.branch})</div>
                      <div>A/C Name: <strong className="text-dark">{biz.bankDetails.accountHolderName || biz.legalName}</strong></div>
                      <div>A/C Number: <span className="font-monospace fw-bold text-dark">{biz.bankDetails.accountNumber}</span></div>
                      <div>IFSC Code: <span className="font-monospace fw-bold text-dark">{biz.bankDetails.ifscCode}</span></div>
                    </div>
                  </div>
                )}

                {/* Terms and Conditions */}
                <div className="p-3 rounded-3 bg-white border small text-muted" style={{ fontSize: '0.75rem', lineHeight: 1.5 }}>
                  <strong className="text-dark d-block mb-1">Terms & Conditions:</strong>
                  {invoice.termsAndConditions || biz.defaultTerms || 'Subject to business jurisdiction.'}
                </div>
              </div>

              {/* Right Column: Clean Receipt Summary Table */}
              <div className="col-12 col-md-6">
                <div className="p-3 rounded-3 bg-light border">
                  <table className="table table-sm table-borderless mb-0 small">
                    <tbody>
                      <tr>
                        <td className="text-secondary">Gross Subtotal:</td>
                        <td className="text-end fw-semibold text-dark font-monospace">{formatINR(invoice.subtotal)}</td>
                      </tr>
                      {invoice.discountTotal > 0 && (
                        <tr className="text-danger">
                          <td>Total Discount:</td>
                          <td className="text-end font-monospace">-{formatINR(invoice.discountTotal)}</td>
                        </tr>
                      )}
                      <tr>
                        <td className="text-secondary">Taxable Value:</td>
                        <td className="text-end fw-bold text-dark font-monospace">{formatINR(invoice.taxableAmount)}</td>
                      </tr>

                      {invoice.cgstAmount > 0 && (
                        <tr>
                          <td className="text-secondary">CGST:</td>
                          <td className="text-end font-monospace text-dark">{formatINR(invoice.cgstAmount)}</td>
                        </tr>
                      )}
                      {invoice.sgstAmount > 0 && (
                        <tr>
                          <td className="text-secondary">SGST:</td>
                          <td className="text-end font-monospace text-dark">{formatINR(invoice.sgstAmount)}</td>
                        </tr>
                      )}
                      {invoice.igstAmount > 0 && (
                        <tr>
                          <td className="text-secondary">IGST (Integrated Tax):</td>
                          <td className="text-end font-monospace text-dark">{formatINR(invoice.igstAmount)}</td>
                        </tr>
                      )}
                      {invoice.otherCharges > 0 && (
                        <tr>
                          <td className="text-secondary">Other Charges:</td>
                          <td className="text-end font-monospace text-dark">{formatINR(invoice.otherCharges)}</td>
                        </tr>
                      )}
                      {invoice.roundOff !== 0 && (
                        <tr>
                          <td className="text-secondary">Round Off:</td>
                          <td className="text-end font-monospace text-muted">
                            {invoice.roundOff > 0 ? `+${formatINR(invoice.roundOff)}` : formatINR(invoice.roundOff)}
                          </td>
                        </tr>
                      )}

                      <tr className="border-top border-secondary border-opacity-25">
                        <td className="fw-bold fs-6 text-dark pt-2">Grand Total:</td>
                        <td className="text-end fw-bold fs-5 text-primary font-monospace pt-2">
                          {formatINR(invoice.grandTotal)}
                        </td>
                      </tr>

                      <tr className="text-success">
                        <td className="pt-1">Amount Paid:</td>
                        <td className="text-end fw-semibold font-monospace pt-1">{formatINR(invoice.amountPaid)}</td>
                      </tr>

                      <tr className="border-top">
                        <td className="fw-bold text-danger pt-2">Balance Due:</td>
                        <td className="text-end fw-bold fs-6 text-danger font-monospace pt-2">
                          {formatINR(invoice.balanceDue)}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Authorized Signatory Box */}
                <div className="mt-3 p-3 rounded-3 bg-white border text-center">
                  <div className="small fw-bold text-dark">For {biz.legalName || 'Authorized Organization'}</div>
                  <div className="my-2 py-1 px-3 d-inline-block rounded-pill bg-light border text-muted small fst-italic" style={{ fontSize: '0.72rem' }}>
                    <i className="bi bi-shield-check text-success me-1"></i> Digitally Signed & Authenticated
                  </div>
                  <div className="small fw-semibold text-dark">{biz.authorizedSignatory?.name || 'Authorized Signatory'}</div>
                  <div className="text-muted small" style={{ fontSize: '0.7rem' }}>
                    {biz.authorizedSignatory?.designation || 'Finance & Accounts'}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Cashfree Link Status, Payment History & Audit Logs */}
        <div className="col-12 col-xl-4">
          {/* Cashfree Online Payment Link Card */}
          <div className="card border-0 shadow-sm rounded-3 mb-4 bg-white">
            <div className="card-header bg-white py-3 px-3.5 border-bottom d-flex justify-content-between align-items-center">
              <h6 className="mb-0 fw-bold d-flex align-items-center gap-1.5 text-dark">
                <i className="bi bi-credit-card-2-front text-primary"></i>
                <span>Cashfree Payment Link</span>
              </h6>
              {invoice.cashfreePaymentLink ? (
                <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">
                  Active
                </span>
              ) : (
                <span className="badge bg-secondary-subtle text-secondary px-2 py-1">
                  None
                </span>
              )}
            </div>
            <div className="card-body p-3.5">
              {invoice.cashfreePaymentLink ? (
                <>
                  <div className="small text-muted mb-1.5 fw-medium">Customer Checkout URL:</div>
                  <div className="p-2.5 bg-light rounded-3 text-break font-monospace small mb-3 border">
                    <a href={invoice.cashfreePaymentLink} target="_blank" rel="noreferrer" className="text-decoration-none text-primary">
                      {invoice.cashfreePaymentLink}
                    </a>
                  </div>

                  <div className="d-grid gap-2">
                    <button
                      type="button"
                      className={`btn btn-sm d-flex align-items-center justify-content-center gap-1.5 py-2 rounded-2 ${
                        copySuccess ? 'btn-success text-white' : 'btn-outline-primary'
                      }`}
                      onClick={handleCopyPaymentLink}
                    >
                      <i className={`bi ${copySuccess ? 'bi-check2' : 'bi-clipboard'}`}></i>
                      <span>{copySuccess ? 'Copied to Clipboard' : 'Copy Payment Link'}</span>
                    </button>
                    <a
                      href={invoice.cashfreePaymentLink}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-primary btn-sm d-flex align-items-center justify-content-center gap-1.5 py-2 rounded-2 fw-semibold"
                    >
                      <i className="bi bi-box-arrow-up-right"></i>
                      <span>Open Customer Checkout</span>
                    </a>
                  </div>
                </>
              ) : (
                <div className="text-center py-3">
                  <i className="bi bi-link-45deg fs-2 text-muted mb-1 d-block opacity-50"></i>
                  <p className="text-muted small mb-3">No active payment link generated for this invoice.</p>
                  <button
                    type="button"
                    className="btn btn-primary btn-sm px-3 rounded-2"
                    onClick={handleGeneratePaymentLink}
                    disabled={actionLoading || invoice.balanceDue <= 0}
                  >
                    <i className="bi bi-lightning-charge me-1"></i> Generate Cashfree Link
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Payment Transactions Ledger */}
          <div className="card border-0 shadow-sm rounded-3 mb-4 bg-white">
            <div className="card-header bg-white py-3 px-3.5 border-bottom d-flex align-items-center justify-content-between">
              <h6 className="mb-0 fw-bold d-flex align-items-center gap-1.5 text-dark">
                <i className="bi bi-wallet2 text-success"></i>
                <span>Payment Transactions</span>
              </h6>
              <span className="badge bg-light text-dark border">{payments.length}</span>
            </div>
            <div className="card-body p-0">
              {payments.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  No payment attempts recorded yet.
                </div>
              ) : (
                <ul className="list-group list-group-flush small">
                  {payments.map((p) => (
                    <li key={p._id} className="list-group-item p-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-bold text-dark fs-6">{formatINR(p.amount)}</span>
                        <span className={`badge ${p.paymentStatus === 'SUCCESS' ? 'bg-success' : 'bg-danger'}`}>
                          {p.paymentStatus}
                        </span>
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                        <div>Ref: <span className="font-monospace text-dark">{p.cashfreePaymentId || p.gatewayReference || '-'}</span></div>
                        <div>Method: {p.paymentMethod || 'ONLINE'} • {formatDate(p.createdAt)}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Email Delivery History */}
          <div className="card border-0 shadow-sm rounded-3 mb-4 bg-white">
            <div className="card-header bg-white py-3 px-3.5 border-bottom d-flex align-items-center justify-content-between">
              <h6 className="mb-0 fw-bold d-flex align-items-center gap-1.5 text-dark">
                <i className="bi bi-envelope text-info"></i>
                <span>Email History</span>
              </h6>
              <span className="badge bg-light text-dark border">{emails.length}</span>
            </div>
            <div className="card-body p-0">
              {emails.length === 0 ? (
                <div className="text-center py-4 text-muted small">
                  No emails logged for this invoice.
                </div>
              ) : (
                <ul className="list-group list-group-flush small">
                  {emails.map((e) => (
                    <li key={e._id} className="list-group-item p-3">
                      <div className="d-flex justify-content-between align-items-center mb-1">
                        <span className="fw-semibold text-truncate text-dark" style={{ maxWidth: 170 }}>{e.recipient}</span>
                        <span className={`badge ${e.status === 'SENT' ? 'bg-success-subtle text-success' : 'bg-danger-subtle text-danger'}`}>
                          {e.status}
                        </span>
                      </div>
                      <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                        <div>Type: {e.emailType} • {formatDate(e.sentAt)}</div>
                        {e.lastError && <div className="text-danger mt-1">Error: {e.lastError}</div>}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Audit Trail */}
          <div className="card border-0 shadow-sm rounded-3 bg-white">
            <div className="card-header bg-white py-3 px-3.5 border-bottom">
              <h6 className="mb-0 fw-bold d-flex align-items-center gap-1.5 text-dark">
                <i className="bi bi-clock-history text-secondary"></i>
                <span>Audit Trail</span>
              </h6>
            </div>
            <div className="card-body p-3">
              <div className="timeline small" style={{ maxHeight: 240, overflowY: 'auto' }}>
                {invoice.auditHistory?.map((audit, idx) => (
                  <div key={idx} className="mb-2 pb-2 border-bottom">
                    <div className="fw-bold text-dark">{audit.action}</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                      By: {audit.performedByName} • {new Date(audit.timestamp).toLocaleString('en-IN')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
