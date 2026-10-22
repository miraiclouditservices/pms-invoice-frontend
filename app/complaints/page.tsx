'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '../../lib/apiClient';

export default function ComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState<any>(null);
  const [newStatus, setNewStatus] = useState('IN_PROGRESS');
  const [resolutionDetails, setResolutionDetails] = useState('');

  const loadComplaints = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/operations/complaints');
      if (res.data.success) {
        setComplaints(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const handleUpdateStatus = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    try {
      const res = await apiClient.put(`/operations/complaints/${selectedTicket._id}/status`, {
        status: newStatus,
        resolutionDetails
      });
      if (res.data.success) {
        setSelectedTicket(null);
        loadComplaints();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1">Complaints, Work Orders & SLA Tracker</h2>
          <p className="text-secondary mb-0 small">Facility maintenance tickets, vendor assignments, SLA timers & resident feedback</p>
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
                  <th>Ticket #</th>
                  <th>Category</th>
                  <th>Subject & Details</th>
                  <th>Raised By</th>
                  <th>Priority</th>
                  <th>Assigned Staff</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <span className="fw-bold text-dark">{c.complaintNumber}</span>
                      <small className="d-block text-muted">{new Date(c.createdAt).toLocaleDateString()}</small>
                    </td>
                    <td><span className="badge bg-light text-dark border">{c.category}</span></td>
                    <td>
                      <div className="fw-semibold text-dark">{c.title}</div>
                      <small className="text-muted text-truncate d-inline-block" style={{ maxWidth: 280 }}>{c.description}</small>
                    </td>
                    <td>
                      <div>{c.raisedByName || 'Resident'}</div>
                      <small className="text-muted">{c.raisedByContact}</small>
                    </td>
                    <td>
                      <span className={`badge ${c.priority === 'HIGH' || c.priority === 'EMERGENCY' ? 'badge-danger-soft' : 'badge-warning-soft'}`}>
                        {c.priority}
                      </span>
                    </td>
                    <td>{c.assignedStaffName || 'Unassigned'}</td>
                    <td>
                      <span className={`badge ${c.status === 'RESOLVED' ? 'badge-active' : c.status === 'IN_PROGRESS' ? 'badge-primary-soft' : 'badge-pending'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <button onClick={() => { setSelectedTicket(c); setNewStatus(c.status); }} className="btn btn-outline-primary btn-sm py-1 px-2">
                        Update
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedTicket && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold">Update Ticket: {selectedTicket.complaintNumber}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedTicket(null)}></button>
              </div>
              <form onSubmit={handleUpdateStatus}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Status</label>
                    <select className="form-select" value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                      <option value="OPEN">Open</option>
                      <option value="ASSIGNED">Assigned</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Resolution Details / Notes</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      placeholder="Describe work done by technician..."
                      value={resolutionDetails}
                      onChange={(e) => setResolutionDetails(e.target.value)}
                    ></textarea>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setSelectedTicket(null)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Save Changes</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
