'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '../../lib/apiClient';

export default function LeasesPage() {
  const [leases, setLeases] = useState<any[]>([]);
  const [companies, setCompanies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [leaseRes, compRes] = await Promise.all([
        apiClient.get('/commercial/leases'),
        apiClient.get('/commercial/companies')
      ]);
      if (leaseRes.data.success) setLeases(leaseRes.data.data);
      if (compRes.data.success) setCompanies(compRes.data.data);
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
          <h2 className="fw-bold mb-1">Commercial Aggregate Leases</h2>
          <p className="text-secondary mb-0 small">
            Manage multi-unit commercial corporate agreements, CAM billing, rent escalations, and tenant companies
          </p>
        </div>
      </div>

      {/* Tenant Companies Quick Pill Cards */}
      <div className="mb-4">
        <h6 className="fw-bold text-dark mb-2">Active Corporate Tenant Companies ({companies.length})</h6>
        <div className="row g-2">
          {companies.map((c) => (
            <div key={c._id} className="col-md-6 col-xl-4">
              <div className="p-3 bg-white border rounded-3 shadow-sm d-flex justify-content-between align-items-center">
                <div>
                  <div className="fw-bold text-dark">{c.companyName}</div>
                  <small className="text-muted">GST: {c.gstNumber || 'N/A'} • {c.employeesCount} Employees</small>
                </div>
                <span className="badge badge-active">{c.status}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Aggregate Leases Table */}
      <div className="pms-card p-3">
        <h5 className="fw-bold mb-3">Master Aggregate Leases Directory</h5>
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Master Lease #</th>
                  <th>Tenant Company</th>
                  <th>Occupied Units / Floors</th>
                  <th>Lease Duration</th>
                  <th>Monthly Rent & CAM</th>
                  <th>Total Monthly</th>
                  <th>Escalation</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {leases.map((l) => (
                  <tr key={l._id}>
                    <td>
                      <span className="fw-bold text-primary">{l.masterLeaseNumber}</span>
                      <small className="text-muted d-block">{l.propertyId?.name}</small>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{l.tenantCompanyId?.companyName}</div>
                      <small className="text-muted">Contact: {l.tenantCompanyId?.contactPerson}</small>
                    </td>
                    <td>
                      <div className="d-flex flex-wrap gap-1">
                        {(l.unitIds || []).map((u: any) => (
                          <span key={u._id} className="badge bg-light text-dark border">
                            {u.unitNumber} ({u.carpetArea} sq.ft)
                          </span>
                        ))}
                      </div>
                      <small className="text-muted d-block mt-1">
                        Floors: {(l.floorIds || []).map((f: any) => f.floorName).join(', ')}
                      </small>
                    </td>
                    <td>
                      <small className="d-block">From: {new Date(l.leaseStartDate).toLocaleDateString()}</small>
                      <small className="d-block">To: {new Date(l.leaseEndDate).toLocaleDateString()}</small>
                      <span className="badge bg-light text-muted border mt-1">{l.lockInPeriodMonths}m Lock-in</span>
                    </td>
                    <td>
                      <div>Rent: ₹{(l.monthlyBaseRent || 0).toLocaleString()}</div>
                      <small className="text-muted">CAM: ₹{(l.camCharges || 0).toLocaleString()}</small>
                    </td>
                    <td>
                      <div className="fw-bold text-dark">₹{(l.totalMonthlyPayable || 0).toLocaleString()}</div>
                      <small className="text-muted">Incl. 18% GST</small>
                    </td>
                    <td>
                      <span className="badge bg-warning-soft">{l.rentEscalationPercent}% Annual</span>
                    </td>
                    <td>
                      <span className="badge badge-active">{l.status}</span>
                    </td>
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
