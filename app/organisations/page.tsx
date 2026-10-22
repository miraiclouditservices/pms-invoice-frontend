'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function OrganisationsPage() {
  const { user } = useAuth();
  const [organisations, setOrganisations] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);

  const isPlatformOwner = user?.isPlatformAdmin || user?.primaryRole === 'PLATFORM_OWNER';

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'RESIDENTIAL',
    primaryContactName: '',
    contactEmail: '',
    contactPhone: '',
    city: '',
    state: '',
    subscriptionPlanId: ''
  });

  const loadData = async () => {
    if (!isPlatformOwner) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [orgRes, planRes] = await Promise.all([
        apiClient.get('/platform/organisations'),
        apiClient.get('/platform/subscriptions')
      ]);
      if (orgRes.data.success) setOrganisations(orgRes.data.data);
      if (planRes.data.success) {
        setPlans(planRes.data.data);
        if (planRes.data.data.length > 0) {
          setFormData(prev => ({ ...prev, subscriptionPlanId: planRes.data.data[0]._id }));
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  if (!isPlatformOwner) {
    return (
      <div className="p-4 text-center">
        <div className="pms-card p-5 mx-auto" style={{ maxWidth: 600 }}>
          <div className="text-warning mb-3" style={{ fontSize: '3rem' }}>
            <i className="bi bi-shield-lock"></i>
          </div>
          <h4 className="fw-bold mb-2">Platform Owner Restricted</h4>
          <p className="text-secondary small mb-4">
            Subscriber Organisation onboarding and SaaS plan subscriptions are managed exclusively by the Platform Owner.
            Your organisation settings and profile can be viewed under <strong>Settings</strong>.
          </p>
          <div className="d-flex justify-content-center gap-2">
            <Link href="/dashboard" className="btn btn-primary btn-sm">
              <i className="bi bi-speedometer2 me-1"></i> Return to Dashboard
            </Link>
            <Link href="/properties" className="btn btn-outline-secondary btn-sm">
              <i className="bi bi-building me-1"></i> Manage Properties
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/platform/organisations', formData);
      if (res.data.success) {
        setShowModal(false);
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating organisation');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1">Subscriber Organisations</h2>
          <p className="text-secondary mb-0 small">Manage multi-tenant subscriber organisations, limits, and plans</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn btn-primary btn-sm d-flex align-items-center gap-1">
          <i className="bi bi-plus-lg"></i> Add Organisation
        </button>
      </div>

      <div className="pms-card p-3">
        {loading ? (
          <div className="text-center py-4"><div className="spinner-border text-primary" role="status"></div></div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Organisation Name</th>
                  <th>Type</th>
                  <th>Primary Contact</th>
                  <th>City / Region</th>
                  <th>Subscription Plan</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {organisations.map((org) => (
                  <tr key={org._id}>
                    <td>
                      <div className="fw-semibold text-dark">{org.name}</div>
                      <small className="text-muted">Code: {org.code}</small>
                    </td>
                    <td><span className="badge bg-light text-dark border">{org.type}</span></td>
                    <td>
                      <div>{org.primaryContactName}</div>
                      <small className="text-muted">{org.contactEmail} • {org.contactPhone}</small>
                    </td>
                    <td>{org.city || 'India'}, {org.state}</td>
                    <td>
                      <span className="badge bg-primary-soft">{org.subscriptionPlanId?.planName || 'Standard'}</span>
                    </td>
                    <td><span className="badge badge-active">{org.status}</span></td>
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
                <h5 className="modal-title fw-bold">Add New Organisation</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Organisation Name</label>
                    <input type="text" className="form-control" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Code</label>
                      <input type="text" className="form-control" required placeholder="e.g. SKYLINE" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Type</label>
                      <select className="form-select" value={formData.type} onChange={(e) => setFormData({ ...formData, type: e.target.value })}>
                        <option value="RESIDENTIAL">Residential</option>
                        <option value="COMMERCIAL">Commercial</option>
                        <option value="COWORKING">Co-working</option>
                      </select>
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Contact Person</label>
                    <input type="text" className="form-control" required value={formData.primaryContactName} onChange={(e) => setFormData({ ...formData, primaryContactName: e.target.value })} />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Email</label>
                      <input type="email" className="form-control" required value={formData.contactEmail} onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small fw-semibold">Phone</label>
                      <input type="text" className="form-control" required value={formData.contactPhone} onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })} />
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label small fw-semibold">Subscription Plan</label>
                    <select className="form-select" value={formData.subscriptionPlanId} onChange={(e) => setFormData({ ...formData, subscriptionPlanId: e.target.value })}>
                      {plans.map(p => (
                        <option key={p._id} value={p._id}>{p.planName} (₹{p.monthlyPrice}/mo)</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-light" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary">Create Organisation</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
