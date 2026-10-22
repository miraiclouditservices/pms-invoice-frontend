'use client';

import React, { useEffect, useState } from 'react';
import { apiClient } from '../../lib/apiClient';
import Link from 'next/link';

export default function AllocationsPage() {
  const [allocations, setAllocations] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [propertyFilter, setPropertyFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [allocRes, propRes] = await Promise.all([
        apiClient.get('/occupancies/allocations', {
          params: {
            propertyId: propertyFilter || undefined,
            status: statusFilter !== 'ALL' ? statusFilter : undefined
          }
        }),
        apiClient.get('/properties')
      ]);

      if (allocRes.data.success) setAllocations(allocRes.data.data);
      if (propRes.data.success) setProperties(propRes.data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load allocations');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [propertyFilter, statusFilter]);

  return (
    <div className="container-fluid py-2">
      {/* Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-1 small">
              <li className="breadcrumb-item"><Link href="/dashboard" className="text-decoration-none">Dashboard</Link></li>
              <li className="breadcrumb-item"><Link href="/occupancies" className="text-decoration-none">Occupancies</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Space Allocations</li>
            </ol>
          </nav>
          <h2 className="fw-bold mb-0">Spatial Allocations Directory</h2>
          <p className="text-secondary small mb-0 mt-1">
            Track unit and space occupancy bindings, allocated parking bays, and clearance levels.
          </p>
        </div>

        <Link href="/occupancies/new" className="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm px-3">
          <i className="bi bi-plus-lg"></i> Allocate Space
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="card border-0 shadow-sm rounded-3 p-3 mb-4 bg-white">
        <div className="row g-2 align-items-center">
          <div className="col-12 col-md-4">
            <select
              className="form-select form-select-sm"
              value={propertyFilter}
              onChange={e => setPropertyFilter(e.target.value)}
            >
              <option value="">All Properties</option>
              {properties.map(p => (
                <option key={p._id} value={p._id}>{p.name} ({p.propertyType})</option>
              ))}
            </select>
          </div>

          <div className="col-12 col-md-4">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Allocation Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="RELEASED">Released</option>
              <option value="EXPIRED">Expired</option>
            </select>
          </div>

          <div className="col-12 col-md-4 text-md-end">
            <button className="btn btn-outline-secondary btn-sm" onClick={loadData}>
              <i className="bi bi-arrow-clockwise me-1"></i> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Allocations Table */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="text-muted small mt-2">Loading allocations...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger shadow-sm rounded-3">
          <i className="bi bi-exclamation-triangle me-2"></i>{error}
          <button className="btn btn-sm btn-outline-danger ms-3" onClick={loadData}>Retry</button>
        </div>
      ) : allocations.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-3 text-center py-5 px-3">
          <div className="display-6 text-muted mb-3">
            <i className="bi bi-grid-3x3-gap"></i>
          </div>
          <h5 className="fw-bold">No Allocations Recorded</h5>
          <p className="text-muted small mx-auto" style={{ maxWidth: '400px' }}>
            There are currently no active spatial allocations matching the query filters.
          </p>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small">
                <tr>
                  <th className="ps-3">Allocation ID</th>
                  <th>Property & Unit</th>
                  <th>Occupant Target</th>
                  <th>Allocation Type</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Parking Slots</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {allocations.map(a => (
                  <tr key={a._id}>
                    <td className="ps-3 fw-bold text-primary">{a.allocationCode}</td>
                    <td>
                      <div className="fw-semibold">
                        Unit {a.unitId?.wing ? `${a.unitId.wing}-` : ''}{a.unitId?.unitNumber || 'N/A'}
                      </div>
                      <div className="text-muted small">
                        {a.propertyId?.name} • {a.buildingId?.name} • Floor {a.floorId?.floorNumber || 0}
                      </div>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{a.occupantName}</div>
                      {a.companyName && <div className="text-muted small">{a.companyName}</div>}
                    </td>
                    <td>
                      <span className="badge bg-light text-dark border">{a.allocationType}</span>
                    </td>
                    <td className="small">{new Date(a.startDate).toLocaleDateString()}</td>
                    <td className="small">{a.endDate ? new Date(a.endDate).toLocaleDateString() : 'Ongoing'}</td>
                    <td className="small">
                      {a.parkingSlots?.length ? (
                        <span className="badge bg-secondary-subtle text-secondary">{a.parkingSlots.join(', ')}</span>
                      ) : (
                        <span className="text-muted">-</span>
                      )}
                    </td>
                    <td>
                      <span className={`badge ${
                        a.status === 'ACTIVE' ? 'bg-success text-white' :
                        a.status === 'RELEASED' ? 'bg-secondary text-white' :
                        'bg-warning text-dark'
                      }`}>
                        {a.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
