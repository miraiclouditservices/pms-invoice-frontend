'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '../../lib/apiClient';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';

export default function ParkingPage() {
  const [slots, setSlots] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const [formData, setFormData] = useState({
    slotNumber: '',
    slotType: 'FOUR_WHEELER',
    floorArea: 'Basement 1',
    propertyId: '',
    vehicleNumber: '',
    vehicleType: 'Car',
    status: 'AVAILABLE'
  });

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [parkingRes, propRes] = await Promise.all([
        apiClient.get('/operations/parking'),
        apiClient.get('/properties')
      ]);

      if (parkingRes.data.success) setSlots(parkingRes.data.data);
      if (propRes.data.success) {
        setProperties(propRes.data.data);
        if (propRes.data.data.length > 0) {
          setFormData(prev => ({ ...prev, propertyId: propRes.data.data[0]._id }));
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load parking slots');
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
      const res = await apiClient.post('/operations/parking', formData);
      if (res.data.success) {
        setShowModal(false);
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error adding parking slot');
    }
  };

  const filteredSlots = slots.filter(s => {
    const q = search.toLowerCase();
    const matchesSearch =
      (s.slotNumber && s.slotNumber.toLowerCase().includes(q)) ||
      (s.vehicleNumber && s.vehicleNumber.toLowerCase().includes(q)) ||
      (s.floorArea && s.floorArea.toLowerCase().includes(q));
    const matchesType = !typeFilter || s.slotType === typeFilter;
    const matchesStatus = !statusFilter || s.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1">Parking Bay Management</h2>
          <p className="text-secondary mb-0 small">Manage parking slots, vehicle stickers, EV charging bays, and unit allocations</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm d-flex align-items-center gap-1">
          <i className="bi bi-plus-circle"></i> Add Parking Slot
        </button>
      </div>

      <div className="pms-card p-3 mb-4">
        <div className="row g-2 align-items-center">
          <div className="col-md-4">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light"><i className="bi bi-search"></i></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search slot #, vehicle #, zone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-3">
            <select
              className="form-select form-select-sm"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="">All Slot Types</option>
              <option value="FOUR_WHEELER">4 Wheeler (Car)</option>
              <option value="TWO_WHEELER">2 Wheeler (Bike)</option>
              <option value="EV_CHARGING">EV Charging</option>
              <option value="VISITOR">Visitor Bay</option>
            </select>
          </div>
          <div className="col-md-3">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="ALLOCATED">Allocated</option>
              <option value="RESERVED">Reserved</option>
            </select>
          </div>
          <div className="col-md-2 text-md-end text-muted small">
            Slots: <strong>{filteredSlots.length}</strong>
          </div>
        </div>
      </div>

      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : filteredSlots.length === 0 ? (
        <EmptyState
          title="No Parking Slots Found"
          message="No parking slots registered matching criteria. Add bays to manage vehicles."
          actionText="Add Slot"
          onAction={() => setShowModal(true)}
        />
      ) : (
        <div className="pms-card table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead className="table-light">
              <tr>
                <th>Slot Number</th>
                <th>Type</th>
                <th>Zone / Level</th>
                <th>Registered Vehicle</th>
                <th>Vehicle Type</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredSlots.map((s) => (
                <tr key={s._id}>
                  <td>
                    <span className="fw-bold text-primary">{s.slotNumber}</span>
                  </td>
                  <td>
                    <span className="badge bg-light text-dark border">{s.slotType}</span>
                  </td>
                  <td>{s.floorArea || 'Ground'}</td>
                  <td className="fw-semibold">{s.vehicleNumber || '-'}</td>
                  <td>{s.vehicleType || '-'}</td>
                  <td>
                    <span className={`badge ${
                      s.status === 'AVAILABLE'
                        ? 'bg-success-subtle text-success border border-success-subtle'
                        : s.status === 'ALLOCATED'
                        ? 'bg-primary-subtle text-primary border border-primary-subtle'
                        : 'bg-warning-subtle text-warning border border-warning-subtle'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Parking Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Register Parking Bay</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Slot Number *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        required
                        placeholder="e.g. B1-042, P-10"
                        value={formData.slotNumber}
                        onChange={(e) => setFormData({ ...formData, slotNumber: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Zone / Level</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Basement 1, Podium"
                        value={formData.floorArea}
                        onChange={(e) => setFormData({ ...formData, floorArea: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Slot Type *</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.slotType}
                        onChange={(e) => setFormData({ ...formData, slotType: e.target.value })}
                      >
                        <option value="FOUR_WHEELER">4 Wheeler (Car)</option>
                        <option value="TWO_WHEELER">2 Wheeler (Bike)</option>
                        <option value="EV_CHARGING">EV Charging Bay</option>
                        <option value="VISITOR">Visitor Bay</option>
                      </select>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Property</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.propertyId}
                        onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                      >
                        {properties.map(p => (
                          <option key={p._id} value={p._id}>{p.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Assigned Vehicle #</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. DL 01 AB 1234"
                        value={formData.vehicleNumber}
                        onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Vehicle Type</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. Sedan, SUV, EV"
                        value={formData.vehicleType}
                        onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm">Save Parking Slot</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
