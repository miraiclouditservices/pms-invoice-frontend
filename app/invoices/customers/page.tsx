'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { taxInvoiceApi, TaxCustomer } from '../../../lib/taxInvoiceApi';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<TaxCustomer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<TaxCustomer | null>(null);

  const [form, setForm] = useState({
    customerName: '',
    companyName: '',
    email: '',
    phone: '',
    billingAddress: '',
    city: '',
    state: '',
    stateCode: '27',
    postalCode: '',
    country: 'India',
    gstin: '',
    pan: '',
    notes: ''
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await taxInvoiceApi.listCustomers(search);
      if (res.data.success) {
        setCustomers(res.data.data);
      }
    } catch (err: any) {
      console.error('Error fetching customers:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleOpenAdd = () => {
    setEditingCustomer(null);
    setForm({
      customerName: '',
      companyName: '',
      email: '',
      phone: '',
      billingAddress: '',
      city: '',
      state: '',
      stateCode: '27',
      postalCode: '',
      country: 'India',
      gstin: '',
      pan: '',
      notes: ''
    });
    setShowModal(true);
  };

  const handleOpenEdit = (customer: TaxCustomer) => {
    setEditingCustomer(customer);
    setForm({
      customerName: customer.customerName || '',
      companyName: customer.companyName || '',
      email: customer.email || '',
      phone: customer.phone || '',
      billingAddress: customer.billingAddress || '',
      city: customer.city || '',
      state: customer.state || '',
      stateCode: customer.stateCode || '27',
      postalCode: customer.postalCode || '',
      country: customer.country || 'India',
      gstin: customer.gstin || '',
      pan: customer.pan || '',
      notes: customer.notes || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCustomer) {
        await taxInvoiceApi.updateCustomer(editingCustomer._id, form);
      } else {
        await taxInvoiceApi.createCustomer(form);
      }
      setShowModal(false);
      fetchCustomers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error saving customer profile');
    }
  };

  return (
    <div className="container-fluid p-0">
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1">Invoice Buyer & Customer Directory</h2>
          <p className="text-secondary mb-0 small">
            Manage customer GSTIN, PAN, and Indian state billing profiles for tax invoice snapshots
          </p>
        </div>
        <div className="d-flex align-items-center gap-2 mt-3 mt-md-0">
          <Link href="/invoices" className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-arrow-left me-1"></i> Invoices
          </Link>
          <button className="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm" onClick={handleOpenAdd}>
            <i className="bi bi-person-plus"></i> Add Customer
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="card border-0 shadow-sm rounded-3 p-3 mb-4 bg-white">
        <form onSubmit={(e) => { e.preventDefault(); fetchCustomers(); }} className="row g-2">
          <div className="col-12 col-md-5">
            <div className="input-group input-group-sm">
              <input
                type="text"
                className="form-control"
                placeholder="Search by name, company, email or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <button type="submit" className="btn btn-primary">Search</button>
            </div>
          </div>
        </form>
      </div>

      {/* Customers Table */}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <div className="text-muted small mt-2">Loading customer directory...</div>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light text-secondary small text-uppercase">
                <tr>
                  <th>Customer Name</th>
                  <th>Company</th>
                  <th>Contact Details</th>
                  <th>Billing Address</th>
                  <th>GSTIN & PAN</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-5 text-muted">
                      No customers found. Click "Add Customer" to save your first buyer.
                    </td>
                  </tr>
                ) : (
                  customers.map((c) => (
                    <tr key={c._id}>
                      <td className="fw-semibold text-dark">{c.customerName}</td>
                      <td>{c.companyName || '-'}</td>
                      <td className="small">
                        <div>{c.email}</div>
                        <div className="text-muted">{c.phone}</div>
                      </td>
                      <td className="small text-truncate" style={{ maxWidth: 220 }}>
                        {c.billingAddress}, {c.city}, {c.state} - {c.postalCode}
                      </td>
                      <td className="small font-monospace">
                        <div>GST: {c.gstin || 'None'}</div>
                        <div>PAN: {c.pan || '-'}</div>
                      </td>
                      <td className="text-end">
                        <button
                          type="button"
                          className="btn btn-sm btn-light border py-1 px-2"
                          onClick={() => handleOpenEdit(c)}
                          title="Edit Customer"
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Customer Modal */}
      {showModal && (
        <div className="modal show d-block" tabIndex={-1} style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content border-0 shadow-lg rounded-3">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-bold">
                  {editingCustomer ? 'Edit Customer Profile' : 'Add New Customer Profile'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Customer Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={form.customerName}
                        onChange={(e) => setForm({ ...form, customerName: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Company Name</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={form.companyName}
                        onChange={(e) => setForm({ ...form, companyName: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Email *</label>
                      <input
                        type="email"
                        className="form-control form-control-sm"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Phone *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Billing Address *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={form.billingAddress}
                        onChange={(e) => setForm({ ...form, billingAddress: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">City *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={form.city}
                        onChange={(e) => setForm({ ...form, city: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">State *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={form.state}
                        onChange={(e) => setForm({ ...form, state: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Postal Code *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={form.postalCode}
                        onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                        required
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">GSTIN (Optional)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm text-uppercase font-monospace"
                        placeholder="27ABCDE1234F1Z5"
                        value={form.gstin}
                        onChange={(e) => setForm({ ...form, gstin: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">PAN (Optional)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm text-uppercase font-monospace"
                        placeholder="ABCDE1234F"
                        value={form.pan}
                        onChange={(e) => setForm({ ...form, pan: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer bg-light">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>
                    Cancel
                  </button>
                  <button type="submit" className="btn btn-primary btn-sm">
                    {editingCustomer ? 'Update Customer' : 'Save Customer'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
