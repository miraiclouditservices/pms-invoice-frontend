'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function OccupanciesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialPropParam = searchParams.get('propertyId') || '';

  const { activeProperty, organisation } = useAuth();
  const [occupancies, setOccupancies] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [propertyFilter, setPropertyFilter] = useState<string>(initialPropParam);
  const [propTypeFilter, setPropTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [allocationFilter, setAllocationFilter] = useState<string>('ALL');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [occRes, metricRes, propRes] = await Promise.all([
        apiClient.get('/occupancies', {
          params: {
            propertyId: propertyFilter || undefined,
            propertyType: propTypeFilter !== 'ALL' ? propTypeFilter : undefined,
            status: statusFilter !== 'ALL' ? statusFilter : undefined,
            allocationStatus: allocationFilter !== 'ALL' ? allocationFilter : undefined,
            search: search.trim() || undefined
          }
        }),
        apiClient.get('/occupancies/metrics', {
          params: { propertyId: propertyFilter || undefined }
        }),
        apiClient.get('/properties')
      ]);

      if (occRes.data.success) setOccupancies(occRes.data.data);
      if (metricRes.data.success) setMetrics(metricRes.data.data);
      if (propRes.data.success) setProperties(propRes.data.data);
    } catch (err: any) {
      setError(err.message || 'Failed to load occupancies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [propertyFilter, propTypeFilter, statusFilter, allocationFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    if (!confirm(`Are you sure you want to mark this occupancy as ${newStatus}?`)) return;
    try {
      const res = await apiClient.put(`/occupancies/${id}/status`, { status: newStatus });
      if (res.data.success) {
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleReleaseAllocation = async (id: string, unitName: string) => {
    if (!confirm(`Release space allocation for "${unitName}"? The unit will be marked VACANT.`)) return;
    try {
      const res = await apiClient.post(`/occupancies/${id}/release-allocation`, { remarks: 'Released via directory action' });
      if (res.data.success) {
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error releasing allocation');
    }
  };

  const handleSendInvite = async (id: string) => {
    try {
      const res = await apiClient.post(`/occupancies/${id}/invite-account`);
      if (res.data.success) {
        alert('Account invitation sent successfully');
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error sending invite');
    }
  };

  return (
    <div className="container-fluid py-2">
      {/* Page Header */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-1 small">
              <li className="breadcrumb-item"><Link href="/dashboard" className="text-decoration-none">Dashboard</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Occupancy Management</li>
            </ol>
          </nav>
          <div className="d-flex align-items-center gap-2">
            <h2 className="fw-bold mb-0">Occupancy & Contracts Directory</h2>
          </div>
          <p className="text-secondary small mb-0 mt-1">
            End-to-end lifecycle management across Residential flats, Commercial leases, and Coworking memberships.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          <Link href="/allocations" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
            <i className="bi bi-grid-3x3-gap"></i> Spatial Allocations
          </Link>
          <Link href="/occupancies/new" className="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm px-3">
            <i className="bi bi-plus-lg"></i> New Occupancy Wizard
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-medium">Total Spaces</span>
                <h4 className="fw-bold mb-0 mt-1">{metrics?.totalUnits || 0}</h4>
              </div>
              <div className="p-3 bg-primary-subtle text-primary rounded-3">
                <i className="bi bi-door-open fs-5"></i>
              </div>
            </div>
            <div className="mt-2 text-muted small">
              {metrics?.occupiedUnits || 0} Occupied • {metrics?.vacantUnits || 0} Vacant
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-medium">Active Occupancies</span>
                <h4 className="fw-bold mb-0 mt-1 text-success">{metrics?.activeOccupancies || 0}</h4>
              </div>
              <div className="p-3 bg-success-subtle text-success rounded-3">
                <i className="bi bi-person-check-fill fs-5"></i>
              </div>
            </div>
            <div className="mt-2 text-success small fw-semibold">
              {metrics?.occupancyRate || 0}% Occupancy Rate
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-medium">Monthly Revenue</span>
                <h4 className="fw-bold mb-0 mt-1 text-primary">
                  ₹{Number(metrics?.totalMonthlyRevenue || 0).toLocaleString()}
                </h4>
              </div>
              <div className="p-3 bg-info-subtle text-info rounded-3">
                <i className="bi bi-cash-stack fs-5"></i>
              </div>
            </div>
            <div className="mt-2 text-muted small">
              Rent, CAM & maintenance
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-medium">Pending Approvals</span>
                <h4 className="fw-bold mb-0 mt-1 text-warning">{metrics?.pendingOccupancies || 0}</h4>
              </div>
              <div className="p-3 bg-warning-subtle text-warning rounded-3">
                <i className="bi bi-hourglass-split fs-5"></i>
              </div>
            </div>
            <div className="mt-2 text-muted small">
              ₹{Number(metrics?.totalDepositsHeld || 0).toLocaleString()} Deposits Held
            </div>
          </div>
        </div>
      </div>

      {/* Property Type Selector Tabs */}
      <div className="card border-0 shadow-sm rounded-3 mb-3">
        <div className="card-header bg-white border-bottom p-0">
          <ul className="nav nav-tabs border-bottom-0 px-3 pt-2">
            <li className="nav-item">
              <button
                className={`nav-link py-2 px-3 fw-medium ${propTypeFilter === 'ALL' ? 'active text-primary fw-bold' : 'text-secondary'}`}
                onClick={() => setPropTypeFilter('ALL')}
              >
                All Portfolios
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link py-2 px-3 fw-medium ${propTypeFilter === 'RESIDENTIAL' ? 'active text-primary fw-bold' : 'text-secondary'}`}
                onClick={() => setPropTypeFilter('RESIDENTIAL')}
              >
                <i className="bi bi-houses me-1"></i> Apartment / Residential
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link py-2 px-3 fw-medium ${propTypeFilter === 'COMMERCIAL' ? 'active text-primary fw-bold' : 'text-secondary'}`}
                onClick={() => setPropTypeFilter('COMMERCIAL')}
              >
                <i className="bi bi-building me-1"></i> Commercial Leases
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link py-2 px-3 fw-medium ${propTypeFilter === 'COWORKING' ? 'active text-primary fw-bold' : 'text-secondary'}`}
                onClick={() => setPropTypeFilter('COWORKING')}
              >
                <i className="bi bi-grid me-1"></i> Co-working Memberships
              </button>
            </li>
          </ul>
        </div>

        {/* Filter Toolbar */}
        <div className="card-body p-3">
          <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
            <div className="col-12 col-md-3">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-light border-end-0">
                  <i className="bi bi-search text-muted"></i>
                </span>
                <input
                  type="text"
                  className="form-control border-start-0"
                  placeholder="Search code, occupant, company..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
                {search && (
                  <button type="button" className="btn btn-outline-secondary" onClick={() => { setSearch(''); loadData(); }}>
                    <i className="bi bi-x"></i>
                  </button>
                )}
              </div>
            </div>

            <div className="col-6 col-md-3">
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

            <div className="col-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="AGREEMENT_PENDING">Agreement Pending</option>
                <option value="ALLOCATION_PENDING">Allocation Pending</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="TERMINATED">Terminated</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>

            <div className="col-6 col-md-2">
              <select
                className="form-select form-select-sm"
                value={allocationFilter}
                onChange={e => setAllocationFilter(e.target.value)}
              >
                <option value="ALL">Allocation Status</option>
                <option value="ALLOCATED">Allocated</option>
                <option value="PENDING">Pending Allocation</option>
                <option value="RELEASED">Released</option>
              </select>
            </div>

            <div className="col-6 col-md-2 text-md-end">
              <button type="submit" className="btn btn-secondary btn-sm w-100">
                <i className="bi bi-funnel me-1"></i> Apply Filter
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Directory Table */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="text-muted small mt-2">Loading occupancy records...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger shadow-sm rounded-3">
          <i className="bi bi-exclamation-triangle me-2"></i>{error}
          <button className="btn btn-sm btn-outline-danger ms-3" onClick={loadData}>Retry</button>
        </div>
      ) : occupancies.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-3 text-center py-5 px-3">
          <div className="display-6 text-muted mb-3">
            <i className="bi bi-person-x"></i>
          </div>
          <h5 className="fw-bold">No Occupancy Records Found</h5>
          <p className="text-muted small mx-auto" style={{ maxWidth: '400px' }}>
            No occupancy matches the selected filters. Use the wizard to register a new tenant, resident, or member.
          </p>
          <Link href="/occupancies/new" className="btn btn-primary btn-sm mx-auto d-inline-flex align-items-center gap-1">
            <i className="bi bi-plus-lg"></i> Launch Creation Wizard
          </Link>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small">
                <tr>
                  <th className="ps-3">Occupancy ID</th>
                  <th>Unit / Space</th>
                  <th>Occupant / Company</th>
                  <th>Type & Contract</th>
                  <th>Period</th>
                  <th>Charges & Deposit</th>
                  <th>Allocation</th>
                  <th>Account</th>
                  <th>Status</th>
                  <th className="text-end pe-3">Actions</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {occupancies.map(o => {
                  const pType = o.propertyType || 'RESIDENTIAL';
                  return (
                    <tr key={o._id}>
                      <td className="ps-3">
                        <Link href={`/occupancies/${o._id}`} className="fw-bold text-primary text-decoration-none">
                          {o.occupancyCode}
                        </Link>
                        <div className="text-muted small">{o.propertyId?.name}</div>
                      </td>

                      <td>
                        <div className="fw-semibold">
                          {o.unitId?.wing ? `${o.unitId.wing}-` : ''}{o.unitId?.unitNumber || 'Unassigned'}
                        </div>
                        <div className="text-muted small">
                          {o.buildingId?.name} • {o.floorId?.floorName || (o.floorId?.floorNumber !== undefined ? `Floor ${o.floorId.floorNumber}` : '')}
                        </div>
                      </td>

                      <td>
                        <div className="fw-bold text-dark">{o.occupantName}</div>
                        {o.companyName && o.companyName !== o.occupantName && (
                          <div className="text-muted small"><i className="bi bi-building me-1"></i>{o.companyName}</div>
                        )}
                        <div className="text-muted small">{o.email || o.mobile || '-'}</div>
                      </td>

                      <td>
                        <span className="badge bg-light text-dark border small">
                          {o.occupantType?.replace('_', ' ')}
                        </span>
                        {o.contractAgreementId && (
                          <div className="text-primary small mt-1">
                            <i className="bi bi-file-earmark-text me-1"></i>
                            {o.contractAgreementId.contractNumber}
                          </div>
                        )}
                      </td>

                      <td>
                        <div className="small fw-semibold">
                          {new Date(o.startDate).toLocaleDateString()}
                        </div>
                        <div className="text-muted small">
                          to {o.endDate ? new Date(o.endDate).toLocaleDateString() : 'Ongoing'}
                        </div>
                      </td>

                      <td>
                        <div className="small fw-bold text-dark">
                          ₹{Number(o.monthlyAmount || 0).toLocaleString()}
                          <span className="text-muted fw-normal">/{o.billingCycle?.toLowerCase() || 'mo'}</span>
                        </div>
                        {o.securityDeposit > 0 && (
                          <div className="text-muted small">
                            Dep: ₹{Number(o.securityDeposit).toLocaleString()}
                          </div>
                        )}
                      </td>

                      <td>
                        <span className={`badge ${
                          o.allocationStatus === 'ALLOCATED'
                            ? 'bg-success-subtle text-success border border-success-subtle'
                            : o.allocationStatus === 'RELEASED'
                            ? 'bg-secondary-subtle text-secondary border border-secondary-subtle'
                            : 'bg-warning-subtle text-warning border border-warning-subtle'
                        }`}>
                          {o.allocationStatus || 'PENDING'}
                        </span>
                      </td>

                      <td>
                        <span className={`badge ${
                          o.accountStatus === 'ACTIVE'
                            ? 'bg-success-subtle text-success border border-success-subtle'
                            : o.accountStatus === 'INVITED'
                            ? 'bg-info-subtle text-info border border-info-subtle'
                            : 'bg-secondary-subtle text-secondary'
                        }`}>
                          {o.accountStatus?.replace('_', ' ') || 'NONE'}
                        </span>
                      </td>

                      <td>
                        <span className={`badge ${
                          o.status === 'ACTIVE'
                            ? 'bg-success text-white'
                            : o.status === 'TERMINATED'
                            ? 'bg-danger text-white'
                            : o.status === 'SUSPENDED'
                            ? 'bg-warning text-dark'
                            : 'bg-secondary text-white'
                        }`}>
                          {o.status}
                        </span>
                      </td>

                      <td className="text-end pe-3">
                        <div className="dropdown">
                          <button className="btn btn-light btn-sm dropdown-toggle py-0 px-2" data-bs-toggle="dropdown">
                            Actions
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end shadow-sm small">
                            <li>
                              <Link href={`/occupancies/${o._id}`} className="dropdown-item">
                                <i className="bi bi-eye me-2 text-primary"></i> View Detail
                              </Link>
                            </li>
                            {o.accountStatus === 'PENDING_INVITATION' && (
                              <li>
                                <button className="dropdown-item text-info" onClick={() => handleSendInvite(o._id)}>
                                  <i className="bi bi-send me-2"></i> Send Account Invite
                                </button>
                              </li>
                            )}
                            <li><hr className="dropdown-divider" /></li>
                            {o.status === 'ACTIVE' && (
                              <>
                                <li>
                                  <button className="dropdown-item text-warning" onClick={() => handleStatusChange(o._id, 'SUSPENDED')}>
                                    <i className="bi bi-pause-circle me-2"></i> Suspend Occupancy
                                  </button>
                                </li>
                                <li>
                                  <button className="dropdown-item text-danger" onClick={() => handleReleaseAllocation(o._id, o.unitId?.unitNumber || '')}>
                                    <i className="bi bi-door-open me-2"></i> Release Allocation
                                  </button>
                                </li>
                              </>
                            )}
                            {o.status === 'SUSPENDED' && (
                              <li>
                                <button className="dropdown-item text-success" onClick={() => handleStatusChange(o._id, 'ACTIVE')}>
                                  <i className="bi bi-play-circle me-2"></i> Reactivate Occupancy
                                </button>
                              </li>
                            )}
                          </ul>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
