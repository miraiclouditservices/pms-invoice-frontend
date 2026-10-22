'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { taxInvoiceApi, DashboardStats, formatINR, formatDate } from '../../../lib/taxInvoiceApi';

export default function InvoiceDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchDashboardStats = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await taxInvoiceApi.getStats();
      if (res.data.success) {
        setStats(res.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching dashboard stats:', err);
      setError(err.response?.data?.message || 'Failed to load invoice dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  return (
    <div className="container-fluid p-0">
      {/* Top Header & Breadcrumb */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-primary text-white">GST Tax Invoice Module</span>
            <span className="badge bg-success-subtle text-success">Cashfree Payments</span>
          </div>
          <h2 className="fw-bold mb-1">Invoice Dashboard & Revenue Analytics</h2>
          <p className="text-secondary mb-0 small">
            Authoritative billing metrics, Cashfree gateway reconciliation, real-time GST dues, and audit trail
          </p>
        </div>
        <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
          <button 
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
            onClick={fetchDashboardStats}
            title="Refresh Real-time Metrics"
          >
            <i className="bi bi-arrow-clockwise"></i> Refresh
          </button>
          <Link href="/invoices" className="btn btn-outline-primary btn-sm">
            <i className="bi bi-list-task me-1"></i> All Invoices
          </Link>
          <Link href="/invoices/create" className="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm">
            <i className="bi bi-plus-circle"></i> Create Tax Invoice
          </Link>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger d-flex align-items-center gap-2 py-2" role="alert">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <div>{error}</div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <div className="text-muted small mt-2">Computing real-time GST ledger and gateway stats...</div>
        </div>
      ) : stats ? (
        <>
          {/* Revenue & Collections Metric Cards */}
          <div className="row g-3 mb-4">
            <div className="col-12 col-sm-6 col-xl-3">
              <div className="card border-0 shadow-sm rounded-3 h-100 p-3 bg-white border-start border-4 border-primary">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-secondary small fw-medium text-uppercase">Total Invoiced</span>
                    <h3 className="fw-bold text-dark mt-1 mb-0">{formatINR(stats.totalInvoicedAmount)}</h3>
                    <small className="text-muted">{stats.totalInvoices} Invoices Issued</small>
                  </div>
                  <div className="rounded-circle bg-primary-subtle text-primary p-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                    <i className="bi bi-receipt fs-4"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="card border-0 shadow-sm rounded-3 h-100 p-3 bg-white border-start border-4 border-success">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-secondary small fw-medium text-uppercase">Collected Revenue</span>
                    <h3 className="fw-bold text-success mt-1 mb-0">{formatINR(stats.amountCollected)}</h3>
                    <small className="text-success fw-semibold">
                      <i className="bi bi-check2-circle"></i> {stats.successfulPayments} Successful Txns
                    </small>
                  </div>
                  <div className="rounded-circle bg-success-subtle text-success p-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                    <i className="bi bi-wallet2 fs-4"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="card border-0 shadow-sm rounded-3 h-100 p-3 bg-white border-start border-4 border-warning">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-secondary small fw-medium text-uppercase">Outstanding Balance</span>
                    <h3 className="fw-bold text-dark mt-1 mb-0">{formatINR(stats.outstandingAmount)}</h3>
                    <small className="text-warning-emphasis">
                      Partially Paid: {formatINR(stats.partiallyPaidAmount)}
                    </small>
                  </div>
                  <div className="rounded-circle bg-warning-subtle text-warning-emphasis p-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                    <i className="bi bi-hourglass-split fs-4"></i>
                  </div>
                </div>
              </div>
            </div>

            <div className="col-12 col-sm-6 col-xl-3">
              <div className="card border-0 shadow-sm rounded-3 h-100 p-3 bg-white border-start border-4 border-danger">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-secondary small fw-medium text-uppercase">Overdue Dues</span>
                    <h3 className="fw-bold text-danger mt-1 mb-0">{formatINR(stats.overdueAmount)}</h3>
                    <small className="text-danger">Immediate Reminder Required</small>
                  </div>
                  <div className="rounded-circle bg-danger-subtle text-danger p-3 d-flex align-items-center justify-content-center" style={{ width: 48, height: 48 }}>
                    <i className="bi bi-exclamation-octagon fs-4"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Notice / Status Banner */}
          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-light">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-info-subtle text-info p-2 d-flex align-items-center justify-content-center" style={{ width: 42, height: 42 }}>
                      <i className="bi bi-link-45deg fs-4"></i>
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold">Cashfree Payment Gateway Integration</h6>
                      <small className="text-secondary">Instant Payment Link generation & automated webhook sync</small>
                    </div>
                  </div>
                  <Link href="/invoices/payments" className="btn btn-outline-info btn-sm">
                    View Ledger
                  </Link>
                </div>
              </div>
            </div>

            <div className="col-md-6">
              <div className="card border-0 shadow-sm rounded-3 p-3 bg-light">
                <div className="d-flex align-items-center justify-content-between">
                  <div className="d-flex align-items-center gap-3">
                    <div className="rounded-circle bg-warning-subtle text-warning p-2 d-flex align-items-center justify-content-center" style={{ width: 42, height: 42 }}>
                      <i className="bi bi-envelope-exclamation fs-4"></i>
                    </div>
                    <div>
                      <h6 className="mb-0 fw-bold">Email Notifications & Delivery</h6>
                      <small className="text-secondary">
                        {stats.failedEmailCount > 0 ? (
                          <span className="text-danger fw-semibold">{stats.failedEmailCount} failed deliveries to retry</span>
                        ) : (
                          'All invoice & reminder emails delivered successfully'
                        )}
                      </small>
                    </div>
                  </div>
                  <Link href="/invoices/emails" className="btn btn-outline-secondary btn-sm">
                    Email Logs
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Tables: Recent Invoices & Recent Payment Transactions */}
          <div className="row g-3">
            {/* Recent Invoices */}
            <div className="col-12 col-lg-7">
              <div className="card border-0 shadow-sm rounded-3">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
                  <h6 className="mb-0 fw-bold">
                    <i className="bi bi-clock-history me-1 text-primary"></i> Recent Tax Invoices
                  </h6>
                  <Link href="/invoices" className="btn btn-link btn-sm text-decoration-none p-0">
                    View All <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light text-secondary small">
                      <tr>
                        <th>Invoice No</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th className="text-end">Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentInvoices?.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center py-4 text-muted small">
                            No invoices generated yet. Click "Create Tax Invoice" to get started.
                          </td>
                        </tr>
                      ) : (
                        stats.recentInvoices?.map((inv) => (
                          <tr key={inv._id}>
                            <td>
                              <Link href={`/invoices/${inv._id}`} className="fw-bold text-decoration-none text-dark">
                                {inv.invoiceNumber}
                              </Link>
                              <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                                {formatDate(inv.invoiceDate)}
                              </div>
                            </td>
                            <td>
                              <div className="fw-medium text-truncate" style={{ maxWidth: 160 }}>
                                {inv.customerSnapshot?.customerName || inv.customerId?.customerName || 'Customer'}
                              </div>
                              <small className="text-muted">{inv.customerSnapshot?.city || '-'}</small>
                            </td>
                            <td>
                              <div className="fw-bold">{formatINR(inv.grandTotal)}</div>
                              {inv.balanceDue > 0 && (
                                <small className="text-danger d-block">Due: {formatINR(inv.balanceDue)}</small>
                              )}
                            </td>
                            <td>
                              <span className={`badge ${
                                inv.paymentStatus === 'PAID' ? 'bg-success' :
                                inv.paymentStatus === 'PARTIALLY_PAID' ? 'bg-warning text-dark' :
                                inv.invoiceStatus === 'CANCELLED' ? 'bg-secondary' : 'bg-primary'
                              }`}>
                                {inv.paymentStatus === 'PAID' ? 'PAID' : inv.invoiceStatus}
                              </span>
                            </td>
                            <td className="text-end">
                              <Link href={`/invoices/${inv._id}`} className="btn btn-sm btn-light border py-1 px-2" title="View details">
                                <i className="bi bi-eye"></i>
                              </Link>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Recent Payments */}
            <div className="col-12 col-lg-5">
              <div className="card border-0 shadow-sm rounded-3">
                <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center border-bottom">
                  <h6 className="mb-0 fw-bold">
                    <i className="bi bi-credit-card me-1 text-success"></i> Recent Cashfree Payments
                  </h6>
                  <Link href="/invoices/payments" className="btn btn-link btn-sm text-decoration-none p-0">
                    Full Ledger <i className="bi bi-arrow-right"></i>
                  </Link>
                </div>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light text-secondary small">
                      <tr>
                        <th>Receipt / Txn</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th className="text-end">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentPayments?.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center py-4 text-muted small">
                            No payment transactions recorded yet.
                          </td>
                        </tr>
                      ) : (
                        stats.recentPayments?.map((p: any) => (
                          <tr key={p._id}>
                            <td>
                              <div className="fw-semibold text-truncate" style={{ maxWidth: 120 }}>
                                {p.receiptNumber || p.cashfreePaymentId || 'Cashfree Txn'}
                              </div>
                              <small className="text-muted">{p.paymentMethod || 'Online'}</small>
                            </td>
                            <td className="fw-bold text-success">
                              {formatINR(p.amount)}
                            </td>
                            <td>
                              <span className={`badge ${p.paymentStatus === 'SUCCESS' ? 'bg-success' : 'bg-danger'}`}>
                                {p.paymentStatus}
                              </span>
                            </td>
                            <td className="text-end small text-muted">
                              {formatDate(p.createdAt)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
