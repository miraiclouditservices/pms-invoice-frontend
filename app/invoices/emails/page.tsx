'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { taxInvoiceApi, formatDate } from '../../../lib/taxInvoiceApi';

export default function EmailHistoryPage() {
  const [emails, setEmails] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const fetchEmails = async () => {
    setLoading(true);
    try {
      const res = await taxInvoiceApi.listAllEmailLogs();
      if (res.data.success) {
        setEmails(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching email history:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  const handleRetryEmail = async (invoiceId: string, logId: string) => {
    try {
      setRetryingId(logId);
      await taxInvoiceApi.sendEmailOnly(invoiceId);
      alert('Email retry initiated successfully!');
      fetchEmails();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error retrying email');
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <span className="badge bg-info-subtle text-info">SMTP / Transactional Email</span>
            <span className="badge bg-secondary-subtle text-secondary">Audit</span>
          </div>
          <h2 className="fw-bold mb-1">Email Delivery History</h2>
          <p className="text-secondary mb-0 small">
            Transactional email logs for issued invoices, attached PDFs, payment links, and customer receipts
          </p>
        </div>
        <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
          <Link href="/invoices" className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-arrow-left me-1"></i> Invoices
          </Link>
          <button className="btn btn-outline-primary btn-sm" onClick={fetchEmails}>
            <i className="bi bi-arrow-clockwise me-1"></i> Refresh Logs
          </button>
        </div>
      </div>

      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <div className="text-muted small mt-2">Loading email logs...</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-secondary small text-uppercase">
                <tr>
                  <th>Recipient</th>
                  <th>Invoice</th>
                  <th>Email Type</th>
                  <th>Subject</th>
                  <th>Status</th>
                  <th>Sent At</th>
                  <th className="text-end">Action</th>
                </tr>
              </thead>
              <tbody>
                {emails.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-5 text-muted">
                      No emails sent yet.
                    </td>
                  </tr>
                ) : (
                  emails.map((e) => (
                    <tr key={e._id}>
                      <td className="fw-semibold text-dark">{e.recipient}</td>
                      <td>
                        {e.invoiceId ? (
                          <Link href={`/invoices/${e.invoiceId._id || e.invoiceId}`} className="text-decoration-none">
                            {e.invoiceId.invoiceNumber || 'View Invoice'}
                          </Link>
                        ) : '-'}
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border">
                          {e.emailType}
                        </span>
                      </td>
                      <td className="small text-truncate" style={{ maxWidth: 220 }}>
                        {e.subject}
                      </td>
                      <td>
                        <span className={`badge ${
                          e.status === 'SENT' ? 'bg-success' :
                          e.status === 'FAILED' ? 'bg-danger' : 'bg-secondary'
                        }`}>
                          {e.status}
                        </span>
                        {e.lastError && (
                          <small className="text-danger d-block mt-1 text-truncate" style={{ maxWidth: 180 }}>
                            {e.lastError}
                          </small>
                        )}
                      </td>
                      <td className="small text-muted">{formatDate(e.sentAt)}</td>
                      <td className="text-end">
                        {e.invoiceId && (
                          <button
                            type="button"
                            className="btn btn-sm btn-outline-primary py-0 px-2"
                            onClick={() => handleRetryEmail(e.invoiceId._id || e.invoiceId, e._id)}
                            disabled={retryingId === e._id}
                            title="Resend email with PDF"
                          >
                            <i className="bi bi-arrow-repeat me-1"></i> Resend
                          </button>
                        )}
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
