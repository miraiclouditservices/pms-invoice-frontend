'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '../../lib/apiClient';

export default function BillingPage() {
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [payMode, setPayMode] = useState('ONLINE');
  const [txnRef, setTxnRef] = useState('');

  const loadInvoices = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/operations/invoices');
      if (res.data.success) {
        setInvoices(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const openPaymentModal = (inv: any) => {
    setSelectedInvoice(inv);
    setPayAmount(inv.balanceAmount || inv.totalAmount);
    setTxnRef(`TXN-${Date.now().toString().slice(-6)}`);
  };

  const handleRecordPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    try {
      const res = await apiClient.post('/operations/payments', {
        invoiceId: selectedInvoice._id,
        amount: payAmount,
        paymentMode: payMode,
        transactionReference: txnRef
      });
      if (res.data.success) {
        setSelectedInvoice(null);
        loadInvoices();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error recording payment');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1">Billing, Invoices & Collections</h2>
          <p className="text-secondary mb-0 small">Society maintenance dues, commercial lease rent, CAM invoices & real-time transaction ledger</p>
        </div>
      </div>

      <div className="pms-card p-3">
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Invoice Number</th>
                  <th>Category</th>
                  <th>Billed To / Target</th>
                  <th>Billing Period</th>
                  <th>Total Amount</th>
                  <th>Paid / Balance</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {invoices.map((inv) => (
                  <tr key={inv._id}>
                    <td>
                      <span className="fw-bold text-dark">{inv.invoiceNumber}</span>
                    </td>
                    <td><span className="badge bg-light text-dark border">{inv.invoiceType}</span></td>
                    <td>
                      <div className="fw-semibold">
                        {inv.residentId?.name || inv.tenantCompanyId?.companyName || inv.memberId?.memberName || 'Unit Occupant'}
                      </div>
                      <small className="text-muted">Unit: {inv.unitId?.unitNumber || 'Allocated'}</small>
                    </td>
                    <td>{inv.billingPeriod}</td>
                    <td>
                      <div className="fw-bold">₹{inv.totalAmount.toLocaleString()}</div>
                      <small className="text-muted">Subtotal: ₹{inv.subtotal.toLocaleString()}</small>
                    </td>
                    <td>
                      <div className="text-success">Paid: ₹{(inv.paidAmount || 0).toLocaleString()}</div>
                      <div className="text-danger small">Due: ₹{(inv.balanceAmount || 0).toLocaleString()}</div>
                    </td>
                    <td>
                      <small>{new Date(inv.dueDate).toLocaleDateString()}</small>
                    </td>
                    <td>
                      <span className={`badge ${inv.paymentStatus === 'PAID' ? 'badge-active' : 'badge-pending'}`}>
                        {inv.paymentStatus}
                      </span>
                    </td>
                    <td>
                      {inv.paymentStatus !== 'PAID' && (
                        <button onClick={() => openPaymentModal(inv)} className="btn btn-primary btn-sm py-1 px-2">
                          Collect / Pay
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedInvoice && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Record Payment</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedInvoice(null)}></button>
              </div>
              <form onSubmit={handleRecordPayment}>
                <div className="modal-body">
                  <p className="small text-muted mb-3">
                    Recording collection for <strong>{selectedInvoice.invoiceNumber}</strong> ({selectedInvoice.billingPeriod})
                  </p>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Payment Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control"
                      required
                      max={selectedInvoice.balanceAmount}
                      value={payAmount}
                      onChange={(e) => setPayAmount(Number(e.target.value))}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Payment Mode</label>
                    <select className="form-select" value={payMode} onChange={(e) => setPayMode(e.target.value)}>
                      <option value="ONLINE">Online (Card / NetBanking)</option>
                      <option value="UPI">UPI Transfer</option>
                      <option value="BANK_TRANSFER">NEFT / RTGS</option>
                      <option value="CHEQUE">Cheque</option>
                      <option value="CASH">Cash</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Transaction Reference ID</label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      value={txnRef}
                      onChange={(e) => setTxnRef(e.target.value)}
                    />
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setSelectedInvoice(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Confirm & Update Ledger</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
