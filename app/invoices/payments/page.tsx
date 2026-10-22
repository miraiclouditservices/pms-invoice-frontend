'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { taxInvoiceApi, formatINR, formatDate } from '../../../lib/taxInvoiceApi';

export default function PaymentTransactionsPage() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await taxInvoiceApi.listAllPayments();
      if (res.data.success) {
        setPayments(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const filtered = statusFilter
    ? payments.filter(p => p.paymentStatus === statusFilter)
    : payments;

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-success-subtle text-success">Cashfree Gateway</span>
            <span className="badge bg-secondary-subtle text-secondary">Ledger</span>
          </div>
          <h2 className="fw-bold mb-1">Payment Transactions & Gateway Receipts</h2>
          <p className="text-secondary mb-0 small">
            Authoritative Cashfree gateway payment attempts, settled transactions, receipts, and order IDs
          </p>
        </div>
        <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
          <Link href="/invoices" className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-arrow-left me-1"></i> Invoices
          </Link>
          <button className="btn btn-outline-primary btn-sm" onClick={fetchPayments}>
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card border-0 shadow-sm rounded-3 p-3 mb-4 bg-white">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-3">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Gateway Statuses</option>
              <option value="SUCCESS">SUCCESS</option>
              <option value="PENDING">PENDING</option>
              <option value="FAILED">FAILED</option>
              <option value="USER_DROPPED">USER DROPPED</option>
            </select>
          </div>
          <div className="col-12 col-md-9 text-md-end text-muted small">
            Showing {filtered.length} of {payments.length} transactions
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <div className="text-muted small mt-2">Loading transactions ledger...</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-secondary small text-uppercase">
                <tr>
                  <th>Receipt / Txn ID</th>
                  <th>Invoice Reference</th>
                  <th>Customer</th>
                  <th>Amount</th>
                  <th>Method</th>
                  <th>Gateway Status</th>
                  <th className="text-end">Paid Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      No payment transactions found.
                    </td>
                  </tr>
                ) : (
                  filtered.map((p) => (
                    <tr key={p._id}>
                      <td>
                        <div className="fw-semibold text-dark font-monospace">
                          {p.receiptNumber || p.cashfreePaymentId || 'Online Txn'}
                        </div>
                        <small className="text-muted font-monospace" style={{ fontSize: '0.72rem' }}>
                          Ref: {p.gatewayReference || p.cashfreeOrderId || '-'}
                        </small>
                      </td>
                      <td>
                        {p.invoiceId ? (
                          <Link href={`/invoices/${p.invoiceId._id || p.invoiceId}`} className="text-decoration-none fw-semibold">
                            {p.invoiceId.invoiceNumber || 'View Invoice'}
                          </Link>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td>
                        <div className="fw-medium">
                          {p.invoiceId?.customerSnapshot?.customerName || '-'}
                        </div>
                        <small className="text-muted">
                          {p.invoiceId?.customerSnapshot?.companyName || ''}
                        </small>
                      </td>
                      <td className="fw-bold text-success fs-6">
                        {formatINR(p.amount)}
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {p.paymentMethod || 'ONLINE'}
                        </span>
                      </td>
                      <td>
                        <span className={`badge ${
                          p.paymentStatus === 'SUCCESS' ? 'bg-success' :
                          p.paymentStatus === 'PENDING' ? 'bg-warning text-dark' : 'bg-danger'
                        }`}>
                          {p.paymentStatus}
                        </span>
                      </td>
                      <td className="text-end small text-muted">
                        {formatDate(p.paidAt || p.createdAt)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
