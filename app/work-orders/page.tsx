'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '../../lib/apiClient';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';

export default function WorkOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [vendors, setVendors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    vendorId: '',
    estimatedCost: 15000,
    priority: 'MEDIUM',
    scheduledStartDate: new Date().toISOString().split('T')[0]
  });

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [ordersRes, vendorsRes] = await Promise.all([
        apiClient.get('/operations/work-orders'),
        apiClient.get('/operations/vendors')
      ]);

      if (ordersRes.data.success) setOrders(ordersRes.data.data);
      if (vendorsRes.data.success) {
        setVendors(vendorsRes.data.data);
        if (vendorsRes.data.data.length > 0) {
          setFormData(prev => ({ ...prev, vendorId: vendorsRes.data.data[0]._id }));
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load work orders');
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
      const res = await apiClient.post('/operations/work-orders', formData);
      if (res.data.success) {
        setShowModal(false);
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error generating work order');
    }
  };

  const handleStatusUpdate = async (orderId: string, status: string) => {
    try {
      const res = await apiClient.put(`/operations/work-orders/${orderId}/status`, { status });
      if (res.data.success) {
        setOrders(prev => prev.map(o => o._id === orderId ? { ...o, status } : o));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const filteredOrders = orders.filter(o => {
    const q = search.toLowerCase();
    const matchesSearch =
      (o.workOrderNumber && o.workOrderNumber.toLowerCase().includes(q)) ||
      (o.title && o.title.toLowerCase().includes(q)) ||
      (o.vendorId?.name && o.vendorId.name.toLowerCase().includes(q));
    const matchesStatus = !statusFilter || o.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1">Work Orders & Maintenance Dispatch</h2>
          <p className="text-secondary mb-0 small">Dispatch maintenance contracts, track vendor tasks, cost approvals, and sign-offs</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm d-flex align-items-center gap-1">
          <i className="bi bi-file-earmark-plus-fill"></i> Create Work Order
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
                placeholder="Search work order #, title, vendor..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="COMPLETED">Completed</option>
              <option value="CANCELLED">Cancelled</option>
            </select>
          </div>
          <div className="col-md-4 text-md-end text-muted small">
            Work Orders: <strong>{filteredOrders.length}</strong>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : filteredOrders.length === 0 ? (
        <EmptyState
          title="No Work Orders Found"
          message="No active or past work orders match your search."
          actionText="Dispatch Work Order"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="pms-card table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Order #</th>
                <th>Title / Scope</th>
                <th>Assigned Vendor</th>
                <th>Estimated Cost</th>
                <th>Priority</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((o) => (
                <tr key={o._id}>
                  <td>
                    <span className="fw-bold text-primary">{o.workOrderNumber}</span>
                  </td>
                  <td>
                    <div className="fw-semibold">{o.title}</div>
                    <div className="text-muted small text-truncate" style={{ maxWidth: 280 }}>
                      {o.description}
                    </div>
                  </td>
                  <td>
                    <div className="fw-semibold">{o.vendorId?.name || 'Vendor'}</div>
                    <div className="text-muted small">{o.vendorId?.phone || '-'}</div>
                  </td>
                  <td className="fw-semibold">
                    {o.estimatedCost ? `₹${o.estimatedCost.toLocaleString()}` : 'N/A'}
                  </td>
                  <td>
                    <span className={`badge ${
                      o.priority === 'CRITICAL' || o.priority === 'HIGH' ? 'bg-danger' : 'bg-secondary'
                    }`}>
                      {o.priority || 'MEDIUM'}
                    </span>
                  </td>
                  <td>
                    <span className={`badge ${
                      o.status === 'COMPLETED'
                        ? 'bg-success-subtle text-success border border-success-subtle'
                        : o.status === 'IN_PROGRESS'
                        ? 'bg-primary-subtle text-primary border border-primary-subtle'
                        : 'bg-warning-subtle text-warning border border-warning-subtle'
                    }`}>
                      {o.status}
                    </span>
                  </td>
                  <td>
                    <div className="dropdown">
                      <button className="btn btn-light btn-sm dropdown-toggle py-0 px-2" data-bs-toggle="dropdown">
                        Update
                      </button>
                      <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                        <li>
                          <button
                            className="dropdown-item small text-primary"
                            onClick={() => handleStatusUpdate(o._id, 'IN_PROGRESS')}
                          >
                            Mark In Progress
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item small text-success"
                            onClick={() => handleStatusUpdate(o._id, 'COMPLETED')}
                          >
                            Sign Off / Complete
                          </button>
                        </li>
                        <li>
                          <button
                            className="dropdown-item small text-danger"
                            onClick={() => handleStatusUpdate(o._id, 'CANCELLED')}
                          >
                            Cancel Order
                          </button>
                        </li>
                      </ul>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Work Order Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Dispatch Work Order</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Task Title *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      required
                      placeholder="e.g. DG Set Preventive Servicing, Lift B Motor Overhaul"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Description / Scope of Work</label>
                    <textarea
                      className="form-control form-control-sm"
                      rows={3}
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    ></textarea>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Assign Vendor *</label>
                      <select
                        className="form-select form-select-sm"
                        required
                        value={formData.vendorId}
                        onChange={(e) => setFormData({ ...formData, vendorId: e.target.value })}
                      >
                        <option value="">Select Vendor</option>
                        {vendors.map(v => (
                          <option key={v._id} value={v._id}>{v.name} ({v.category})</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Estimated Cost (₹)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={formData.estimatedCost}
                        onChange={(e) => setFormData({ ...formData, estimatedCost: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Priority</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.priority}
                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                      >
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                        <option value="CRITICAL">Critical</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Scheduled Date</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={formData.scheduledStartDate}
                        onChange={(e) => setFormData({ ...formData, scheduledStartDate: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm">Dispatch Order</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
