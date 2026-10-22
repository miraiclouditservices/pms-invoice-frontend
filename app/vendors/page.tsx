'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '../../lib/apiClient';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    category: 'ELECTRICAL',
    contactPerson: '',
    phone: '',
    email: '',
    rating: 4.8,
    status: 'ACTIVE'
  });

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get('/operations/vendors');
      if (res.data.success) setVendors(res.data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/operations/vendors', formData);
      if (res.data.success) {
        setShowModal(false);
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating vendor');
    }
  };

  const filteredVendors = vendors.filter(v => {
    const q = search.toLowerCase();
    const matchesSearch =
      (v.name && v.name.toLowerCase().includes(q)) ||
      (v.contactPerson && v.contactPerson.toLowerCase().includes(q)) ||
      (v.phone && v.phone.includes(q));
    const matchesCategory = !categoryFilter || v.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1">Vendor Directory</h2>
          <p className="text-secondary mb-0 small">Manage certified facility vendors, suppliers, contractors, and service partners</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm d-flex align-items-center gap-1">
          <i className="bi bi-person-plus-fill"></i> Add Vendor
        </button>
      </div>

      <div className="pms-card p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-md-5">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light"><i className="bi bi-search"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search vendor name, contact person, phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select form-select-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="ELEVATOR">Elevator & Lifts</option>
              <option value="HVAC">HVAC & Air Conditioning</option>
              <option value="ELECTRICAL">Electrical & DG Sets</option>
              <option value="PLUMBING">Plumbing & STP</option>
              <option value="SECURITY">Security & Guarding</option>
              <option value="HOUSEKEEPING">Housekeeping & Cleaning</option>
              <option value="FIRE_SAFETY">Fire Safety</option>
            </select>
          </div>
          <div className="col-md-4 text-md-end text-muted small">
            Vendors: <strong>{filteredVendors.length}</strong>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : filteredVendors.length === 0 ? (
        <EmptyState
          title="No Vendors Found"
          message="No service partners match your search criteria. Register a vendor to dispatch work orders."
          actionText="Register Vendor"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="pms-card table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Vendor / Agency</th>
                <th>Category</th>
                <th>Contact Person</th>
                <th>Phone</th>
                <th>Email</th>
                <th>Performance Rating</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredVendors.map((v) => (
                <tr key={v._id}>
                  <td>
                    <div className="fw-bold">{v.name}</div>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border">{v.category}</span>
                  </td>
                  <td>{v.contactPerson || '-'}</td>
                  <td>{v.phone || '-'}</td>
                  <td>{v.email || '-'}</td>
                  <td>
                    <span className="text-warning fw-semibold">
                      <i className="bi bi-star-fill me-1"></i>
                      {v.rating ? v.rating.toFixed(1) : '5.0'} / 5.0
                    </span>
                  </td>
                  <td>
                    <span className="badge bg-success-subtle text-success border border-success-subtle">ACTIVE</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Vendor Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Register Vendor Partner</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Company / Agency Name *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      required
                      placeholder="e.g. Otis Elevator Co, Voltas HVAC Solutions"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Category *</label>
                    <select
                      className="form-select form-select-sm"
                      value={formData.category}
                      onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    >
                      <option value="ELEVATOR">Elevator & Lifts</option>
                      <option value="HVAC">HVAC & Air Conditioning</option>
                      <option value="ELECTRICAL">Electrical & DG Sets</option>
                      <option value="PLUMBING">Plumbing & STP</option>
                      <option value="SECURITY">Security & Guarding</option>
                      <option value="HOUSEKEEPING">Housekeeping & Cleaning</option>
                      <option value="FIRE_SAFETY">Fire Safety</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Primary Contact Person *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      required
                      value={formData.contactPerson}
                      onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                    />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Phone Number *</label>
                      <input
                        type="tel"
                        className="form-control form-control-sm"
                        required
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Email Address</label>
                      <input
                        type="email"
                        className="form-control form-control-sm"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm">Save Vendor</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
