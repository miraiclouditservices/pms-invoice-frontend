'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '../../lib/apiClient';

export default function ResidentsPage() {
  const [residents, setResidents] = useState<any[]>([]);
  const [flats, setFlats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [activeTab, setActiveTab] = useState<'residents' | 'flats'>('residents');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    residentType: 'OWNER',
    unitId: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      const [resRes, flatRes] = await Promise.all([
        apiClient.get('/apartments/residents'),
        apiClient.get('/apartments/flats')
      ]);
      if (resRes.data.success) setResidents(resRes.data.data);
      if (flatRes.data.success) {
        setFlats(flatRes.data.data);
        if (flatRes.data.data.length > 0) {
          setFormData(prev => ({ ...prev, unitId: flatRes.data.data[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
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
      const selectedFlat = flats.find(f => f._id === formData.unitId);
      const payload = {
        ...formData,
        propertyId: selectedFlat?.propertyId,
        buildingId: selectedFlat?.buildingId?._id || selectedFlat?.buildingId,
        floorId: selectedFlat?.floorId?._id || selectedFlat?.floorId
      };

      const res = await apiClient.post('/apartments/residents', payload);
      if (res.data.success) {
        setShowModal(false);
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating resident');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1">Residential Flats & Occupants</h2>
          <p className="text-secondary mb-0 small">Society resident directory, family registrations, flat allocations & KYC</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm d-flex align-items-center gap-1">
          <i className="bi bi-person-plus"></i> Add Resident
        </button>
      </div>

      <div className="d-flex gap-2 mb-3">
        <button className={`btn btn-sm ${activeTab === 'residents' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setActiveTab('residents')}>
          Registered Residents ({residents.length})
        </button>
        <button className={`btn btn-sm ${activeTab === 'flats' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setActiveTab('flats')}>
          Society Flats & Occupancy ({flats.length})
        </button>
      </div>

      <div className="pms-card p-3">
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
        ) : activeTab === 'residents' ? (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Resident Name</th>
                  <th>Flat Number</th>
                  <th>Contact Info</th>
                  <th>Type</th>
                  <th>Family Members</th>
                  <th>Vehicles</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {residents.map((r) => (
                  <tr key={r._id}>
                    <td>
                      <div className="fw-semibold text-dark">{r.name}</div>
                      <small className="text-muted">{r.buildingId?.name || 'Main Tower'}</small>
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border fw-bold">{r.unitId?.unitNumber || 'N/A'}</span>
                    </td>
                    <td>
                      <div>{r.email}</div>
                      <small className="text-muted">{r.mobile}</small>
                    </td>
                    <td>
                      <span className={`badge ${r.residentType === 'OWNER' ? 'badge-primary-soft' : 'badge-warning-soft'}`}>
                        {r.residentType}
                      </span>
                    </td>
                    <td>{r.familyMembers?.length || 0} Registered</td>
                    <td>
                      {(r.vehicles || []).map((v: any, idx: number) => (
                        <span key={idx} className="badge bg-light text-dark border me-1 small">
                          {v.vehicleNumber}
                        </span>
                      ))}
                    </td>
                    <td><span className="badge badge-active">{r.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Flat Number</th>
                  <th>Building / Wing</th>
                  <th>Flat Type</th>
                  <th>Floor</th>
                  <th>Current Occupant</th>
                  <th>Occupancy Status</th>
                </tr>
              </thead>
              <tbody>
                {flats.map((f) => (
                  <tr key={f._id}>
                    <td className="fw-bold text-dark">{f.unitNumber}</td>
                    <td>{f.buildingId?.name || 'Tower'} {f.wing && `(Wing ${f.wing})`}</td>
                    <td><span className="badge bg-light text-dark border">{f.unitType}</span></td>
                    <td>{f.floorId?.floorName || `Floor ${f.floorId?.floorNumber}`}</td>
                    <td>
                      {f.currentResidentId ? (
                        <span className="fw-semibold text-primary">{f.currentResidentId.name}</span>
                      ) : (
                        <span className="text-muted small">Vacant</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${f.occupancyStatus === 'OCCUPIED' ? 'badge-active' : 'badge-pending'}`}>
                        {f.occupancyStatus}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Register Resident</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Resident Full Name</label>
                    <input type="text" className="form-control" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Email</label>
                      <input type="email" className="form-control" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Mobile</label>
                      <input type="text" className="form-control" required value={formData.mobile} onChange={(e) => setFormData({ ...formData, mobile: e.target.value })} />
                    </div>
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Resident Type</label>
                      <select className="form-select" value={formData.residentType} onChange={(e) => setFormData({ ...formData, residentType: e.target.value })}>
                        <option value="OWNER">Owner</option>
                        <option value="TENANT">Tenant</option>
                      </select>
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Select Flat</label>
                      <select className="form-select" value={formData.unitId} onChange={(e) => setFormData({ ...formData, unitId: e.target.value })}>
                        {flats.map(f => (
                          <option key={f._id} value={f._id}>{f.unitNumber} ({f.unitType}) - {f.occupancyStatus}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Resident</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
