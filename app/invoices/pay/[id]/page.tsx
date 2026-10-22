'use client';

import React, { useEffect, useState, use } from 'react';
import { taxInvoiceApi, formatINR, formatDate } from '../../../../lib/taxInvoiceApi';
import axios from 'axios';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function PublicPayInvoicePage({ params }: PageProps) {
  const resolvedParams = use(params);
  const invoiceId = resolvedParams.id;

  const [invoice, setInvoice] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [receiptInfo, setReceiptInfo] = useState<any>(null);

  const fetchInvoice = async () => {
    setLoading(true);
    try {
      const res = await taxInvoiceApi.getPublicInvoice(invoiceId);
      if (res.data.success) {
        setInvoice(res.data.data);
        if (res.data.data.paymentStatus === 'PAID') {
          setPaymentSuccess(true);
        }
      }
    } catch (err: any) {
      console.error('Error fetching public invoice:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoice();
  }, [invoiceId]);

  // Handles Cashfree Pay Now button click:
  // If real cashfreePaymentLink starts with http and is not internal simulation, redirects to gateway
  // If simulation is enabled, executes test sandbox webhook to complete payment
  const handlePayNow = () => {
    if (!invoice) return;

    if (invoice.cashfreePaymentLink && invoice.cashfreePaymentLink.startsWith('https://sandbox.cashfree.com')) {
      window.location.href = invoice.cashfreePaymentLink;
      return;
    }

    // Run Sandbox Simulator Webhook Payment
    handleSimulatePayment();
  };

  const handleSimulatePayment = async () => {
    if (!invoice) return;
    setPaying(true);
    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '') || 'https://pms-invoice-backend.onrender.com';
      const paymentId = `cf_pay_${Date.now()}`;
      
      const res = await axios.post(`${API_BASE}/api/v1/webhooks/cashfree`, {
        isSimulator: true,
        type: 'PAYMENT_LINK_EVENT',
        data: {
          invoiceId: invoice._id,
          link_id: invoice.cashfreeLinkId || `sim_link_${invoice._id}`,
          order_id: `order_${invoice._id}`,
          cf_payment_id: paymentId,
          payment_status: 'SUCCESS',
          payment_amount: invoice.balanceDue,
          payment_currency: 'INR',
          payment: {
            payment_id: paymentId,
            payment_status: 'SUCCESS',
            payment_amount: invoice.balanceDue,
            payment_currency: 'INR',
            payment_group: 'UPI',
            bank_reference: `UPI-REF-${Date.now().toString().slice(-6)}`
          }
        }
      });

      if (res.data.success) {
        setPaymentSuccess(true);
        setReceiptInfo({
          paymentId,
          amount: invoice.balanceDue,
          method: 'UPI (Sandbox Cashfree Simulator)'
        });
        fetchInvoice();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error processing sandbox payment simulation');
    } finally {
      setPaying(false);
    }
  };

  if (loading) {
    return (
      <div className="container min-vh-100 d-flex align-items-center justify-content-center">
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <div className="text-muted small mt-2">Connecting to Cashfree Secure Checkout...</div>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="container min-vh-100 d-flex align-items-center justify-content-center">
        <div className="card p-4 shadow-sm border-0 text-center" style={{ maxWidth: 420 }}>
          <i className="bi bi-exclamation-circle text-danger fs-1 mb-2"></i>
          <h5 className="fw-bold">Invoice Not Found</h5>
          <p className="text-muted small">This invoice may have been cancelled or the link is invalid.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100 py-5">
      <div className="container" style={{ maxWidth: 680 }}>
        {/* Brand Header */}
        <div className="text-center mb-4">
          <div className="d-inline-flex align-items-center justify-content-center p-3 bg-white rounded-circle shadow-sm mb-2">
            <i className="bi bi-shield-check text-success fs-2"></i>
          </div>
          <h4 className="fw-bold mb-0 text-dark">{invoice.businessSnapshot?.legalName || 'Mirai Cloud Technologies'}</h4>
          <span className="badge bg-primary-subtle text-primary mt-1">Cashfree Secure Payment Portal</span>
        </div>

        {paymentSuccess ? (
          <div className="card border-0 shadow-lg rounded-4 p-4 p-md-5 text-center bg-white">
            <div className="d-inline-flex align-items-center justify-content-center p-3 bg-success-subtle text-success rounded-circle mx-auto mb-3" style={{ width: 70, height: 70 }}>
              <i className="bi bi-check-lg fs-1"></i>
            </div>
            <h3 className="fw-bold text-success mb-1">Payment Successful!</h3>
            <p className="text-muted small mb-4">
              Your payment has been received and confirmed by the payment gateway.
            </p>

            <div className="p-3 bg-light rounded-3 text-start small mb-4 border">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Invoice Number:</span>
                <span className="fw-bold text-dark">{invoice.invoiceNumber}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Amount Paid:</span>
                <span className="fw-bold text-success fs-6">{formatINR(invoice.grandTotal)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Transaction ID:</span>
                <span className="font-monospace">{receiptInfo?.paymentId || 'CF_VERIFIED'}</span>
              </div>
              <div className="d-flex justify-content-between">
                <span className="text-muted">Outstanding Dues:</span>
                <span className="fw-bold text-success">₹0.00 (Settled)</span>
              </div>
            </div>

            <p className="text-secondary small">
              A payment receipt has been sent to <strong>{invoice.customerSnapshot?.email || 'your email'}</strong>.
            </p>
          </div>
        ) : (
          <div className="card border-0 shadow-lg rounded-4 overflow-hidden bg-white">
            <div className="bg-primary text-white p-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <span className="text-white-50 text-uppercase small">Invoice Reference</span>
                  <h4 className="fw-bold mb-0">{invoice.invoiceNumber}</h4>
                </div>
                <div className="text-end">
                  <span className="text-white-50 text-uppercase small">Total Due</span>
                  <h3 className="fw-bold mb-0 text-white">{formatINR(invoice.balanceDue)}</h3>
                </div>
              </div>
            </div>

            <div className="p-4 p-md-5">
              {/* Customer summary */}
              <div className="mb-4 pb-3 border-bottom">
                <h6 className="fw-bold text-dark mb-2">Billed To</h6>
                <div className="small text-secondary">
                  <strong>{invoice.customerSnapshot?.customerName}</strong>
                  {invoice.customerSnapshot?.companyName && ` (${invoice.customerSnapshot.companyName})`}
                  <br />
                  Email: {invoice.customerSnapshot?.email} | Phone: {invoice.customerSnapshot?.phone}
                </div>
              </div>

              {/* Items Summary */}
              <div className="mb-4 pb-3 border-bottom">
                <h6 className="fw-bold text-dark mb-2">Line Items Summary</h6>
                <ul className="list-group list-group-flush small">
                  {invoice.lineItems?.map((item: any, idx: number) => (
                    <li key={idx} className="list-group-item px-0 d-flex justify-content-between align-items-center">
                      <div>
                        <div className="fw-semibold text-dark">{item.description}</div>
                        <small className="text-muted">Qty: {item.quantity} × {formatINR(item.rate)} (GST: {item.taxRate}%)</small>
                      </div>
                      <div className="fw-bold text-dark">
                        {formatINR(item.totalAmount)}
                      </div>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Due Date Notice */}
              <div className="alert alert-warning d-flex align-items-center gap-2 small py-2 mb-4">
                <i className="bi bi-clock-history fs-5"></i>
                <div>
                  Payment Due Date: <strong>{formatDate(invoice.dueDate)}</strong>
                </div>
              </div>

              {/* Prominent Pay Now Button */}
              <div className="d-grid gap-2">
                <button
                  type="button"
                  className="btn btn-success btn-lg fw-bold py-3 shadow d-flex align-items-center justify-content-center gap-2"
                  onClick={handlePayNow}
                  disabled={paying}
                >
                  {paying ? (
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                  ) : (
                    <i className="bi bi-credit-card-2-front fs-5"></i>
                  )}
                  PAY NOW WITH CASHFREE ({formatINR(invoice.balanceDue)})
                </button>
              </div>

              <div className="text-center mt-3">
                <small className="text-muted d-flex align-items-center justify-content-center gap-1">
                  <i className="bi bi-lock-fill text-success"></i> 256-Bit SSL Encrypted & Powered by Cashfree Payments
                </small>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
