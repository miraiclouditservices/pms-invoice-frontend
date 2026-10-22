'use client';

import React, { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { taxInvoiceApi, TaxInvoice, formatINR, formatDate } from '../../lib/taxInvoiceApi';

export default function AllInvoicesPage() {
  const [invoices, setInvoices] = useState<TaxInvoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('');
  const [overdueOnly, setOverdueOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [copySuccessId, setCopySuccessId] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type?: 'success' | 'danger' | 'info' } | null>(null);

  // 3-Dots Action Menu State
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  // Close 3-dots dropdown on clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const fetchInvoices = async () => {
    setLoading(true);
    try {
      const params: any = { page, limit: 15 };
      if (search) params.search = search;
      if (statusFilter) params.invoiceStatus = statusFilter;
      if (paymentStatusFilter) params.paymentStatus = paymentStatusFilter;
      if (overdueOnly) params.isOverdue = 'true';

      const res = await taxInvoiceApi.listInvoices(params);
      if (res.data.success) {
        setInvoices(res.data.data);
        if (res.data.meta) {
          setTotalPages(res.data.meta.totalPages || 1);
          setTotalCount(res.data.meta.total || 0);
        }
      }
    } catch (err: any) {
      console.error('Error fetching invoices:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvoices();
  }, [page, statusFilter, paymentStatusFilter, overdueOnly]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchInvoices();
  };

  const clearFilters = () => {
    setSearch('');
    setStatusFilter('');
    setPaymentStatusFilter('');
    setOverdueOnly(false);
    setPage(1);
  };

  const handleCopyPaymentLink = (invoice: TaxInvoice) => {
    setActiveMenuId(null);
    if (!invoice.cashfreePaymentLink) {
      setToastMessage({ text: 'No Cashfree link yet. Click "Send Email" or "View" to generate one.', type: 'info' });
      setTimeout(() => setToastMessage(null), 3500);
      return;
    }
    navigator.clipboard.writeText(invoice.cashfreePaymentLink);
    setCopySuccessId(invoice._id);
    setToastMessage({ text: 'Cashfree Payment Link copied to clipboard!', type: 'success' });
    setTimeout(() => {
      setCopySuccessId(null);
      setToastMessage(null);
    }, 3000);
  };

  const handleSendReminder = async (invoiceId: string) => {
    setActiveMenuId(null);
    try {
      setActionLoadingId(invoiceId);
      const res = await taxInvoiceApi.sendReminder(invoiceId);
      if (res.data.success) {
        setToastMessage({ text: 'Payment reminder email dispatched successfully!', type: 'success' });
        fetchInvoices();
      }
    } catch (err: any) {
      setToastMessage({ text: err.response?.data?.message || 'Error sending reminder', type: 'danger' });
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleSendEmail = async (invoiceId: string) => {
    setActiveMenuId(null);
    try {
      setActionLoadingId(invoiceId);
      const res = await taxInvoiceApi.sendEmailOnly(invoiceId);
      if (res.data.success) {
        setToastMessage({ text: 'Tax invoice PDF & payment link emailed successfully!', type: 'success' });
        fetchInvoices();
      }
    } catch (err: any) {
      setToastMessage({ text: err.response?.data?.message || 'Error sending invoice email', type: 'danger' });
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  const handleCancelInvoice = async (invoiceId: string) => {
    setActiveMenuId(null);
    const reason = prompt('Please enter cancellation reason for the audit trail:');
    if (!reason) return;
    try {
      setActionLoadingId(invoiceId);
      await taxInvoiceApi.cancelInvoice(invoiceId, reason);
      setToastMessage({ text: 'Invoice cancelled successfully', type: 'info' });
      fetchInvoices();
    } catch (err: any) {
      setToastMessage({ text: err.response?.data?.message || 'Error cancelling invoice', type: 'danger' });
    } finally {
      setActionLoadingId(null);
      setTimeout(() => setToastMessage(null), 3500);
    }
  };

  // Quick summary calculations from visible invoices
  const totalInvoiced = invoices.reduce((sum, inv) => sum + (inv.grandTotal || 0), 0);
  const totalPaid = invoices.reduce((sum, inv) => sum + (inv.amountPaid || 0), 0);
  const totalBalance = invoices.reduce((sum, inv) => sum + (inv.balanceDue || 0), 0);
  const overdueCount = invoices.filter(
    (inv) => new Date(inv.dueDate) < new Date() && inv.balanceDue > 0
  ).length;

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

      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row align-items-md-center justify-content-between gap-3 mb-4 pb-3 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2">
            <div
              className="rounded-3 bg-primary text-white d-flex align-items-center justify-content-center shadow-sm"
              style={{ width: 38, height: 38 }}
            >
              <i className="bi bi-receipt-cutoff fs-5"></i>
            </div>
            <div>
              <h3 className="fw-bold mb-0 text-dark" style={{ letterSpacing: '-0.02em' }}>
                Tax Invoices Management
              </h3>
              <p className="text-muted small mb-0">
                GST Compliant Invoicing, Cashfree Online Payment Links & Email Automation
              </p>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 flex-wrap">
          <Link
            href="/invoices/dashboard"
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5 px-3 py-1.5 rounded-2 fw-medium shadow-none"
          >
            <i className="bi bi-speedometer2"></i>
            <span>Dashboard</span>
          </Link>
          <Link
            href="/invoices/customers"
            className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1.5 px-3 py-1.5 rounded-2 fw-medium shadow-none"
          >
            <i className="bi bi-people"></i>
            <span>Customers</span>
          </Link>
          <Link
            href="/invoices/create"
            className="btn btn-primary btn-sm d-flex align-items-center gap-1.5 px-3.5 py-1.5 rounded-2 fw-semibold shadow-sm text-decoration-none"
          >
            <i className="bi bi-plus-circle-fill"></i>
            <span>Create Tax Invoice</span>
          </Link>
        </div>
      </div>

      {/* KPI Stats Bar */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between">
              <span className="text-secondary small fw-medium">Total Invoices</span>
              <span className="badge bg-primary-subtle text-primary rounded-pill px-2">
                <i className="bi bi-file-earmark-text"></i>
              </span>
            </div>
            <div className="fs-4 fw-bold text-dark mt-2">{totalCount}</div>
            <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
              In current organization
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between">
              <span className="text-secondary small fw-medium">Total Invoiced</span>
              <span className="badge bg-info-subtle text-info rounded-pill px-2">
                <i className="bi bi-currency-rupee"></i>
              </span>
            </div>
            <div className="fs-4 fw-bold text-dark mt-2">{formatINR(totalInvoiced)}</div>
            <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
              Sum of visible invoices
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between">
              <span className="text-secondary small fw-medium">Collected (Paid)</span>
              <span className="badge bg-success-subtle text-success rounded-pill px-2">
                <i className="bi bi-check2-circle"></i>
              </span>
            </div>
            <div className="fs-4 fw-bold text-success mt-2">{formatINR(totalPaid)}</div>
            <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
              Verified cash & online
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white h-100">
            <div className="d-flex align-items-center justify-content-between">
              <span className="text-secondary small fw-medium">Balance Due</span>
              <span className={`badge ${totalBalance > 0 ? 'bg-danger-subtle text-danger' : 'bg-success-subtle text-success'} rounded-pill px-2`}>
                <i className="bi bi-clock-history"></i>
              </span>
            </div>
            <div className={`fs-4 fw-bold mt-2 ${totalBalance > 0 ? 'text-danger' : 'text-success'}`}>
              {formatINR(totalBalance)}
            </div>
            <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
              {overdueCount > 0 ? `${overdueCount} overdue` : '0 overdue'}
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="card border-0 shadow-sm rounded-3 p-3 mb-4 bg-white">
        <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
          <div className="col-12 col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0 text-muted">
                <i className="bi bi-search"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search invoice #, customer name, email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  type="button"
                  className="btn btn-light border-start-0 border-top border-bottom border-end text-muted"
                  onClick={() => {
                    setSearch('');
                    setPage(1);
                  }}
                  title="Clear search"
                >
                  <i className="bi bi-x"></i>
                </button>
              )}
              <button type="submit" className="btn btn-primary px-3 fw-medium">
                Search
              </button>
            </div>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Doc Status</option>
              <option value="ISSUED">ISSUED</option>
              <option value="DRAFT">DRAFT</option>
              <option value="CANCELLED">CANCELLED</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={paymentStatusFilter}
              onChange={(e) => {
                setPaymentStatusFilter(e.target.value);
                setPage(1);
              }}
            >
              <option value="">All Payment Status</option>
              <option value="PENDING">PENDING</option>
              <option value="PARTIALLY_PAID">PARTIALLY PAID</option>
              <option value="PAID">PAID</option>
            </select>
          </div>

          <div className="col-6 col-md-2">
            <div className="form-check form-switch small d-flex align-items-center gap-2 mb-0">
              <input
                className="form-check-input"
                type="checkbox"
                role="switch"
                id="overdueSwitch"
                checked={overdueOnly}
                onChange={(e) => {
                  setOverdueOnly(e.target.checked);
                  setPage(1);
                }}
              />
              <label className="form-check-label text-danger fw-semibold" htmlFor="overdueSwitch" style={{ cursor: 'pointer' }}>
                Overdue Only
              </label>
            </div>
          </div>

          <div className="col-6 col-md-2 text-end">
            {(search || statusFilter || paymentStatusFilter || overdueOnly) && (
              <button
                type="button"
                onClick={clearFilters}
                className="btn btn-link btn-sm text-secondary p-0 text-decoration-none me-2"
                style={{ fontSize: '0.78rem' }}
              >
                <i className="bi bi-arrow-counterclockwise me-1"></i>Reset
              </button>
            )}
            <span className="badge bg-light text-dark border px-2 py-1.5" style={{ fontSize: '0.75rem' }}>
              Total: {totalCount}
            </span>
          </div>
        </form>
      </div>

      {/* Invoices Table Card */}
      <div className="card border-0 shadow-sm rounded-3 overflow-visible bg-white">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <div className="text-muted small mt-2">Loading live tax invoices...</div>
          </div>
        ) : (
          <div className="table-responsive" style={{ minHeight: invoices.length > 0 ? '300px' : 'auto' }}>
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-secondary small text-uppercase" style={{ letterSpacing: '0.04em' }}>
                <tr>
                  <th style={{ width: 140, paddingLeft: '1.25rem' }}>Invoice #</th>
                  <th style={{ minWidth: 200 }}>Customer</th>
                  <th style={{ minWidth: 150 }}>Dates</th>
                  <th className="text-end" style={{ minWidth: 120 }}>Grand Total</th>
                  <th className="text-end" style={{ minWidth: 120 }}>Balance Due</th>
                  <th style={{ minWidth: 110 }}>Doc Status</th>
                  <th style={{ minWidth: 120 }}>Payment</th>
                  <th style={{ minWidth: 110 }}>Email</th>
                  <th className="text-center" style={{ width: 80, paddingRight: '1.25rem' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center py-5 text-muted">
                      <div className="py-4">
                        <i className="bi bi-receipt fs-1 d-block mb-2 text-secondary opacity-50"></i>
                        <h6 className="fw-semibold text-dark">No Invoices Found</h6>
                        <p className="small text-muted mb-3">No tax invoices matched the applied filters.</p>
                        <Link href="/invoices/create" className="btn btn-primary btn-sm rounded-2 px-3">
                          <i className="bi bi-plus-circle me-1"></i> Create First Invoice
                        </Link>
                      </div>
                    </td>
                  </tr>
                ) : (
                  invoices.map((inv) => {
                    const isOverdue = new Date(inv.dueDate) < new Date() && inv.balanceDue > 0;
                    const custName = inv.customerSnapshot?.customerName || inv.customerId?.customerName || 'Customer';
                    const custCompany = inv.customerSnapshot?.companyName || '';
                    const isMenuOpen = activeMenuId === inv._id;

                    return (
                      <tr key={inv._id}>
                        {/* Invoice # */}
                        <td style={{ paddingLeft: '1.25rem' }}>
                          <Link
                            href={`/invoices/${inv._id}`}
                            className="fw-bold text-decoration-none text-primary d-inline-flex align-items-center gap-1"
                            title="Click to view full invoice document"
                          >
                            <span>{inv.invoiceNumber}</span>
                            <i className="bi bi-arrow-up-right small" style={{ fontSize: '0.7rem' }}></i>
                          </Link>
                          <div className="text-muted small" style={{ fontSize: '0.72rem' }}>
                            FY: {inv.financialYear || '2026-27'}
                          </div>
                        </td>

                        {/* Customer */}
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div
                              className="rounded-circle bg-light text-primary border fw-bold d-flex align-items-center justify-content-center flex-shrink-0"
                              style={{ width: 32, height: 32, fontSize: '0.8rem' }}
                            >
                              {custName.charAt(0).toUpperCase()}
                            </div>
                            <div className="overflow-hidden">
                              <div className="fw-semibold text-dark text-truncate" style={{ maxWidth: 180 }}>
                                {custName}
                              </div>
                              {custCompany ? (
                                <div className="text-muted text-truncate small" style={{ fontSize: '0.72rem', maxWidth: 180 }}>
                                  {custCompany}
                                </div>
                              ) : (
                                <div className="text-muted text-truncate small" style={{ fontSize: '0.72rem', maxWidth: 180 }}>
                                  {inv.customerSnapshot?.email || 'Individual'}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Dates */}
                        <td className="small">
                          <div className="d-flex align-items-center gap-1 text-secondary">
                            <i className="bi bi-calendar3" style={{ fontSize: '0.7rem' }}></i>
                            <span>Date: {formatDate(inv.invoiceDate)}</span>
                          </div>
                          <div className="d-flex align-items-center gap-1 mt-0.5">
                            <i className={`bi bi-hourglass-split ${isOverdue ? 'text-danger' : 'text-muted'}`} style={{ fontSize: '0.7rem' }}></i>
                            <span className={isOverdue ? 'text-danger fw-semibold' : 'text-muted'}>
                              Due: {formatDate(inv.dueDate)}
                            </span>
                            {isOverdue && (
                              <span className="badge bg-danger-subtle text-danger p-1" style={{ fontSize: '0.6rem' }}>
                                Overdue
                              </span>
                            )}
                          </div>
                        </td>

                        {/* Grand Total */}
                        <td className="text-end">
                          <div className="fw-bold text-dark">{formatINR(inv.grandTotal)}</div>
                          {inv.amountPaid > 0 && (
                            <div className="text-success small fw-medium" style={{ fontSize: '0.72rem' }}>
                              Paid: {formatINR(inv.amountPaid)}
                            </div>
                          )}
                        </td>

                        {/* Balance Due */}
                        <td className="text-end">
                          <span
                            className={`fw-bold px-2 py-0.5 rounded-1 ${
                              inv.balanceDue > 0
                                ? 'text-danger bg-danger-subtle'
                                : 'text-success bg-success-subtle'
                            }`}
                            style={{ fontSize: '0.85rem' }}
                          >
                            {formatINR(inv.balanceDue)}
                          </span>
                        </td>

                        {/* Doc Status */}
                        <td>
                          <span
                            className={`badge px-2 py-1 rounded-pill ${
                              inv.invoiceStatus === 'ISSUED'
                                ? 'bg-primary text-white'
                                : inv.invoiceStatus === 'DRAFT'
                                ? 'bg-secondary text-white'
                                : 'bg-dark text-white'
                            }`}
                            style={{ fontSize: '0.7rem', fontWeight: 600 }}
                          >
                            {inv.invoiceStatus}
                          </span>
                        </td>

                        {/* Payment Status */}
                        <td>
                          <span
                            className={`badge px-2 py-1 rounded-pill ${
                              inv.paymentStatus === 'PAID'
                                ? 'bg-success text-white'
                                : inv.paymentStatus === 'PARTIALLY_PAID'
                                ? 'bg-warning text-dark'
                                : 'bg-danger-subtle text-danger border border-danger-subtle'
                            }`}
                            style={{ fontSize: '0.7rem', fontWeight: 600 }}
                          >
                            {inv.paymentStatus === 'PAID' && <i className="bi bi-check-circle me-1"></i>}
                            {inv.paymentStatus === 'PENDING' && <i className="bi bi-clock me-1"></i>}
                            {inv.paymentStatus}
                          </span>
                        </td>

                        {/* Email Status */}
                        <td>
                          <span
                            className={`badge px-2 py-1 rounded-pill ${
                              inv.emailStatus === 'SENT'
                                ? 'bg-success-subtle text-success border border-success-subtle'
                                : inv.emailStatus === 'FAILED'
                                ? 'bg-danger-subtle text-danger border border-danger-subtle'
                                : 'bg-light text-secondary border'
                            }`}
                            style={{ fontSize: '0.7rem', fontWeight: 600 }}
                          >
                            <i className={`bi ${inv.emailStatus === 'SENT' ? 'bi-check-all' : 'bi-envelope'} me-1`}></i>
                            {inv.emailStatus}
                          </span>
                        </td>

                        {/* 3-DOTS ACTION MENU (User-Friendly Dropdown) */}
                        <td className="text-center position-relative" style={{ paddingRight: '1.25rem' }}>
                          <div className="d-inline-block position-relative">
                            <button
                              type="button"
                              className={`btn btn-sm btn-light border rounded-2 d-flex align-items-center justify-content-center ${
                                isMenuOpen ? 'bg-primary text-white border-primary' : 'text-dark'
                              }`}
                              style={{ width: 32, height: 32, transition: 'all 0.15s ease' }}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveMenuId(isMenuOpen ? null : inv._id);
                              }}
                              disabled={actionLoadingId === inv._id}
                              title="Actions Menu"
                            >
                              {actionLoadingId === inv._id ? (
                                <span className="spinner-border spinner-border-sm" role="status"></span>
                              ) : (
                                <i className="bi bi-three-dots-vertical fs-6"></i>
                              )}
                            </button>

                            {/* Floating 3-Dots Dropdown Menu */}
                            {isMenuOpen && (
                              <div
                                ref={menuRef}
                                className="dropdown-menu show shadow-lg border-0 rounded-3 p-1 position-absolute end-0"
                                style={{
                                  top: '100%',
                                  marginTop: '4px',
                                  minWidth: '220px',
                                  zIndex: 1060,
                                  boxShadow: '0 10px 25px -5px rgba(0,0,0,0.15), 0 8px 10px -6px rgba(0,0,0,0.1)'
                                }}
                              >
                                <div className="px-3 py-1.5 border-bottom mb-1">
                                  <div className="fw-bold text-dark small text-truncate">{inv.invoiceNumber}</div>
                                  <div className="text-muted small" style={{ fontSize: '0.7rem' }}>
                                    Balance: {formatINR(inv.balanceDue)}
                                  </div>
                                </div>

                                {/* 1. View / Preview Details */}
                                <Link
                                  href={`/invoices/${inv._id}`}
                                  className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded-2 text-dark"
                                  onClick={() => setActiveMenuId(null)}
                                >
                                  <i className="bi bi-eye text-primary"></i>
                                  <span>View Invoice Details</span>
                                </Link>

                                {/* 2. Download PDF */}
                                <a
                                  href={taxInvoiceApi.getPdfDownloadUrl(inv._id)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded-2 text-dark"
                                  onClick={() => setActiveMenuId(null)}
                                >
                                  <i className="bi bi-file-earmark-pdf text-danger"></i>
                                  <span>Download Official PDF</span>
                                </a>

                                {/* 3. Copy Cashfree Link */}
                                <button
                                  type="button"
                                  className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded-2 text-dark"
                                  onClick={() => handleCopyPaymentLink(inv)}
                                >
                                  <i className="bi bi-link-45deg text-success"></i>
                                  <span>Copy Payment Link</span>
                                  {copySuccessId === inv._id && (
                                    <span className="badge bg-success ms-auto small">Copied!</span>
                                  )}
                                </button>

                                {/* 4. Open Cashfree Pay Portal */}
                                {inv.cashfreePaymentLink && (
                                  <a
                                    href={inv.cashfreePaymentLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded-2 text-dark"
                                    onClick={() => setActiveMenuId(null)}
                                  >
                                    <i className="bi bi-box-arrow-up-right text-info"></i>
                                    <span>Open Payment Page</span>
                                  </a>
                                )}

                                {/* 5. Send / Resend Email */}
                                <button
                                  type="button"
                                  className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded-2 text-dark"
                                  onClick={() => handleSendEmail(inv._id)}
                                >
                                  <i className="bi bi-send text-primary"></i>
                                  <span>Email PDF & Payment Link</span>
                                </button>

                                {/* 6. Send Payment Reminder */}
                                {inv.balanceDue > 0 && inv.invoiceStatus === 'ISSUED' && (
                                  <button
                                    type="button"
                                    className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded-2 text-dark"
                                    onClick={() => handleSendReminder(inv._id)}
                                  >
                                    <i className="bi bi-bell text-warning"></i>
                                    <span>Send Payment Reminder</span>
                                  </button>
                                )}

                                {/* Divider & Cancel Invoice */}
                                {inv.amountPaid === 0 && inv.invoiceStatus !== 'CANCELLED' && (
                                  <>
                                    <div className="dropdown-divider my-1"></div>
                                    <button
                                      type="button"
                                      className="dropdown-item d-flex align-items-center gap-2 py-2 px-3 rounded-2 text-danger"
                                      onClick={() => handleCancelInvoice(inv._id)}
                                    >
                                      <i className="bi bi-x-circle text-danger"></i>
                                      <span>Cancel / Void Invoice</span>
                                    </button>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="card-footer bg-white border-top d-flex flex-column flex-sm-row justify-content-between align-items-center py-3 px-3 gap-2">
            <span className="small text-muted">
              Showing page <span className="fw-semibold text-dark">{page}</span> of <span className="fw-semibold text-dark">{totalPages}</span> ({totalCount} total records)
            </span>
            <div className="btn-group btn-group-sm">
              <button
                className="btn btn-outline-secondary"
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <i className="bi bi-chevron-left me-1"></i>Previous
              </button>
              <button
                className="btn btn-outline-secondary"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next<i className="bi bi-chevron-right ms-1"></i>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
