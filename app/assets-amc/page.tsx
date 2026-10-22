'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '../../lib/apiClient';

export default function AssetsAMCPage() {
  const [assets, setAssets] = useState<any[]>([]);
  const [amcContracts, setAmcContracts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'assets' | 'amc'>('assets');

  const loadData = async () => {
    setLoading(true);
    try {
      const [assetRes, amcRes] = await Promise.all([
        apiClient.get('/operations/assets'),
        apiClient.get('/operations/amc')
      ]);
      if (assetRes.data.success) setAssets(assetRes.data.data);
      if (amcRes.data.success) setAmcContracts(amcRes.data.data);
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
          <h2 className="fw-bold mb-1">Asset Inventory & Annual Maintenance (AMC)</h2>
          <p className="text-secondary mb-0 small">Track physical equipment (HVAC, Elevators, Generators), AMC contract renewals, and vendor SLAs</p>
        </div>
      </div>

      <div className="d-flex gap-2 mb-3">
        <button className={`btn btn-sm ${activeTab === 'assets' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setActiveTab('assets')}>
          Equipment & Assets ({assets.length})
        </button>
        <button className={`btn btn-sm ${activeTab === 'amc' ? 'btn-primary' : 'btn-outline-secondary'}`} onClick={() => setActiveTab('amc')}>
          AMC Contracts ({amcContracts.length})
        </button>
      </div>

      <div className="pms-card p-3">
        {loading ? (
          <div className="text-center py-5"><div className="spinner-border text-primary" role="status"></div></div>
        ) : activeTab === 'assets' ? (
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead>
                <tr>
                  <th>Asset Code & Name</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>AMC Vendor</th>
                  <th>Condition</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((a) => (
                  <tr key={a._id}>
                    <td>
                      <span className="fw-bold text-dark">{a.assetCode}</span>
                      <div className="text-secondary small">{a.assetName}</div>
                    </td>
                    <td><span className="badge bg-light text-dark border">{a.category}</span></td>
                    <td>{a.location || 'Central Facility'}</td>
                    <td>
                      <div className="fw-semibold">{a.vendorId?.name || 'In-House'}</div>
                      <small className="text-muted">{a.vendorId?.contactPerson}</small>
                    </td>
                    <td>
                      <span className={`badge ${a.condition === 'EXCELLENT' ? 'badge-active' : a.condition === 'GOOD' ? 'badge-primary-soft' : 'badge-danger-soft'}`}>
                        {a.condition}
                      </span>
                    </td>
                    <td><span className="badge badge-active">{a.status}</span></td>
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
                  <th>AMC Contract #</th>
                  <th>Contract Title</th>
                  <th>Vendor</th>
                  <th>Duration</th>
                  <th>Annual Cost</th>
                  <th>Frequency</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {amcContracts.map((c) => (
                  <tr key={c._id}>
                    <td>
                      <span className="fw-bold text-primary">{c.amcNumber}</span>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{c.title}</div>
                      <small className="text-muted">{c.assetIds?.length || 0} Equipment Linked</small>
                    </td>
                    <td>
                      <div className="fw-medium">{c.vendorId?.name}</div>
                      <small className="text-muted">{c.vendorId?.phone}</small>
                    </td>
                    <td>
                      <div>From: {new Date(c.contractStartDate).toLocaleDateString()}</div>
                      <small className="text-danger fw-semibold">To: {new Date(c.contractEndDate).toLocaleDateString()}</small>
                    </td>
                    <td>₹{(c.contractAmount || 0).toLocaleString()}</td>
                    <td><span className="badge bg-light text-dark border">{c.serviceFrequency}</span></td>
                    <td><span className="badge badge-active">{c.status}</span></td>
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
