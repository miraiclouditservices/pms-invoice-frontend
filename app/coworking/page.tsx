'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '../../lib/apiClient';

export default function CoworkingPage() {
  const [members, setMembers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [memRes, planRes] = await Promise.all([
        apiClient.get('/coworking/members'),
        apiClient.get('/coworking/plans')
      ]);
      if (memRes.data.success) setMembers(memRes.data.data);
      if (planRes.data.success) setPlans(planRes.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1">Co-working Hub & Memberships</h2>
          <p className="text-secondary mb-0 small">Manage flexible desks, private cabins, member directory & meeting credits</p>
        </div>
      </div>

      {/* Membership Plans Cards */}
      <h5 className="fw-bold mb-3">Active Membership Plans ({plans.length})</h5>
      <div className="row g-3 mb-4">
        {plans.map((p) => (
          <div key={p._id} className="col-md-6 col-xl-4">
            <div className="stats-card h-100 d-flex flex-column justify-content-between">
              <div>
                <div className="d-flex justify-content-between align-items-center mb-2">
                  <span className="badge bg-primary-soft">{p.planType}</span>
                  <span className="badge badge-active">{p.status}</span>
                </div>
                <h5 className="fw-bold text-dark mb-1">{p.planName}</h5>
                <h3 className="fw-bold text-primary mb-3">₹{p.monthlyPrice.toLocaleString()}<small className="text-muted fs-6">/month</small></h3>

                <div className="small text-secondary mb-1">
                  <i className="bi bi-clock me-1 text-primary"></i> Meeting Room Credits: <strong>{p.meetingRoomCreditsHours} hrs/mo</strong>
                </div>
                <div className="small text-secondary mb-2">
                  <i className="bi bi-printer me-1 text-primary"></i> Printing Credits: <strong>{p.printingCreditsPages} pages</strong>
                </div>
                <div className="small text-muted">
                  <i className="bi bi-shield-check me-1 text-success"></i> {p.accessTiming || '24/7 Access'}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Members Table */}
      <div className="pms-card p-3">
        <h5 className="fw-bold mb-3">Registered Co-working Members ({members.length})</h5>
        {loading ? (
          <div className="text-center py-4"><div className="spinner-border text-primary" role="status"></div></div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Member Name</th>
                  <th>Company / Startup</th>
                  <th>Membership Plan</th>
                  <th>Allocated Desk / Space</th>
                  <th>Available Credits</th>
                  <th>Expiry Date</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m._id}>
                    <td>
                      <div className="fw-semibold text-dark">{m.memberName}</div>
                      <small className="text-muted">{m.email} • {m.mobile}</small>
                    </td>
                    <td>
                      <div className="fw-medium text-dark">{m.companyName || 'Independent'}</div>
                      {m.isCompanyAdmin && <span className="badge bg-light text-dark border small">Admin</span>}
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">{m.membershipPlanId?.planName || 'Flex'}</span>
                    </td>
                    <td>
                      {m.assignedUnitId ? (
                        <span className="badge bg-success-soft fw-bold">{m.assignedUnitId.unitNumber}</span>
                      ) : (
                        <span className="text-muted small">Flexi / Hot Desk</span>
                      )}
                    </td>
                    <td>
                      <div>{m.availableMeetingCreditsHours} hrs Room Credits</div>
                      <small className="text-muted">{m.availablePrintingCredits} Print pages</small>
                    </td>
                    <td>
                      <small>{new Date(m.expiryDate).toLocaleDateString()}</small>
                    </td>
                    <td><span className="badge badge-active">{m.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
