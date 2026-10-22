'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { apiClient } from '../../lib/apiClient';
import { Visitor, Delivery, VisitorAnalyticsSummary, PropertyType } from '../../lib/models/visitor.types';

export default function VisitorsMasterPage() {
  const [activeTab, setActiveTab] = useState<'analytics' | 'directory' | 'security' | 'approvals' | 'deliveries' | 'overstay'>('directory');
  const [visitors, setVisitors] = useState<Visitor[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [analytics, setAnalytics] = useState<VisitorAnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(true);

  // Filters
  const [propertyTypeFilter, setPropertyTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals & Active actions
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showWalkInModal, setShowWalkInModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showQRModal, setShowQRModal] = useState(false);

  // Security gate scan state
  const [scanCodeInput, setScanCodeInput] = useState('');
  const [scanResult, setScanResult] = useState<any>(null);
  const [scanLoading, setScanLoading] = useState(false);
  const [selectedGate, setSelectedGate] = useState('Main Gate 1');

  // Walk-in form state
  const [walkInData, setWalkInData] = useState({
    visitorName: '',
    mobile: '',
    propertyType: 'RESIDENTIAL' as PropertyType,
    visitorType: 'GUEST',
    hostName: '',
    unitNumber: '',
    purpose: 'Walk-in Visit',
    vehicleNumber: '',
    idProofType: 'AADHAAR',
    idProofNumber: '',
    autoCheckIn: true
  });

  // Delivery creation form state
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryData, setDeliveryData] = useState({
    deliveryPersonName: '',
    mobile: '',
    deliveryCompany: 'Swiggy',
    deliveryType: 'FOOD_DELIVERY',
    hostName: '',
    unitNumber: '',
    packageCount: 1,
    packageDescription: ''
  });

  const loadData = async () => {
    setLoading(true);
    try {
      // Build query params
      const params: any = {};
      if (propertyTypeFilter !== 'ALL') params.propertyType = propertyTypeFilter;
      if (statusFilter !== 'ALL') params.status = statusFilter;
      if (searchQuery.trim()) params.search = searchQuery.trim();

      const [visRes, anaRes, delRes] = await Promise.all([
        apiClient.get('/visitors', { params }),
        apiClient.get('/visitors/analytics'),
        apiClient.get('/visitors/deliveries')
      ]);

      if (visRes.data.success) setVisitors(visRes.data.data);
      if (anaRes.data.success) setAnalytics(anaRes.data.data);
      if (delRes.data.success) setDeliveries(delRes.data.data);
    } catch (err) {
      console.error('Error fetching visitor records:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [propertyTypeFilter, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  // Actions
  const handleApprove = async (id: string) => {
    try {
      const res = await apiClient.put(`/visitors/${id}/approve`);
      if (res.data.success) {
        alert('Visitor entry request approved successfully!');
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleRejectSubmit = async () => {
    if (!selectedVisitor) return;
    try {
      const res = await apiClient.put(`/visitors/${selectedVisitor._id}/reject`, { reason: rejectionReason });
      if (res.data.success) {
        alert('Visitor request rejected.');
        setShowRejectModal(false);
        setRejectionReason('');
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Rejection failed');
    }
  };

  const handleCheckIn = async (id: string) => {
    try {
      const res = await apiClient.put(`/visitors/${id}/checkin`, { gate: selectedGate });
      if (res.data.success) {
        alert('Visitor checked in and marked INSIDE property!');
        if (scanResult) setScanResult(null);
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Check-in failed');
    }
  };

  const handleCheckOut = async (id: string) => {
    try {
      const res = await apiClient.put(`/visitors/${id}/checkout`, { gate: selectedGate });
      if (res.data.success) {
        alert('Visitor checked out successfully. Pass closed.');
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Check-out failed');
    }
  };

  // QR Pass Scanner
  const handleVerifyPass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!scanCodeInput.trim()) return;
    setScanLoading(true);
    try {
      const res = await apiClient.get(`/visitors/verify-pass/${scanCodeInput.trim().toUpperCase()}`);
      if (res.data.success) {
        setScanResult(res.data.data);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Invalid or unrecognized Pass Code');
      setScanResult(null);
    } finally {
      setScanLoading(false);
    }
  };

  // Walk-in Registration
  const handleWalkInSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/visitors/walkin', walkInData);
      if (res.data.success) {
        alert('Walk-in visitor successfully registered & checked in!');
        setShowWalkInModal(false);
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error registering walk-in visitor');
    }
  };

  // Delivery Submission
  const handleDeliverySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await apiClient.post('/visitors/deliveries', deliveryData);
      if (res.data.success) {
        alert('Delivery logged at gate! Resident notified with OTP.');
        setShowDeliveryModal(false);
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error logging delivery');
    }
  };

  const handleDeliveryHandover = async (delId: string) => {
    const inputOtp = prompt('Enter 4-Digit OTP provided by host/recipient to verify handover:');
    if (!inputOtp) return;
    try {
      const res = await apiClient.put(`/visitors/deliveries/${delId}/status`, {
        deliveryStatus: 'HANDED_OVER',
        isOtpVerified: true,
        recipientConfirmation: true
      });
      if (res.data.success) {
        alert('Delivery marked as Handed Over successfully!');
        loadData();
      }
    } catch (err: any) {
      alert('Failed to update delivery');
    }
  };

  // Status badge helper
  const renderStatusBadge = (status: string, isOverstay?: boolean) => {
    if (isOverstay || status === 'OVERSTAY') {
      return <span className="badge bg-danger text-white"><i className="bi bi-exclamation-triangle-fill me-1"></i>OVERSTAY</span>;
    }
    switch (status) {
      case 'CHECKED_IN':
        return <span className="badge bg-success"><i className="bi bi-check-circle-fill me-1"></i>Inside Property</span>;
      case 'EXPECTED':
        return <span className="badge bg-primary"><i className="bi bi-clock-history me-1"></i>Expected</span>;
      case 'CHECKED_OUT':
        return <span className="badge bg-secondary"><i className="bi bi-door-closed me-1"></i>Checked Out</span>;
      case 'DENIED':
        return <span className="badge bg-dark"><i className="bi bi-shield-x me-1"></i>Denied Entry</span>;
      default:
        return <span className="badge bg-light text-dark">{status}</span>;
    }
  };

  return (
    <div className="container-fluid py-3 px-4">
      {/* Header Banner */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 pb-2 border-bottom gap-3">
        <div>
          <div className="d-flex align-items-center gap-2">
            <h2 className="fw-bold mb-0">Visitor Management & Gate Pass Access Control</h2>
            <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2 py-1">
              Multi-Tenant Live API
            </span>
          </div>
          <p className="text-secondary mb-0 small mt-1">
            Real-time security gate verification, QR gate passes, walk-ins, deliveries, overstay tracking across Residential, Commercial & Co-working
          </p>
        </div>
        <div className="d-flex align-items-center gap-2">
          <button onClick={() => setShowWalkInModal(true)} className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1 shadow-sm">
            <i className="bi bi-person-walking"></i> Register Walk-In
          </button>
          <button onClick={() => setShowDeliveryModal(true)} className="btn btn-outline-info btn-sm d-flex align-items-center gap-1 shadow-sm">
            <i className="bi bi-box-seam"></i> Log Delivery
          </button>
          <Link href="/visitors/create" className="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm">
            <i className="bi bi-qr-code"></i> Pre-Register Visitor
          </Link>
        </div>
      </div>

      {/* Analytics KPI Widgets */}
      {analytics && (
        <div className="row g-3 mb-4">
          <div className="col-6 col-md-4 col-lg-2">
            <div className="pms-card p-3 h-100 border-start border-4 border-primary shadow-sm">
              <span className="text-muted small fw-semibold">Expected Today</span>
              <div className="fs-3 fw-bold text-primary mt-1">{analytics.expectedToday}</div>
              <div className="small text-secondary">Pre-approved visitors</div>
            </div>
          </div>
          <div className="col-6 col-md-4 col-lg-2">
            <div className="pms-card p-3 h-100 border-start border-4 border-success shadow-sm">
              <span className="text-muted small fw-semibold">Currently Inside</span>
              <div className="fs-3 fw-bold text-success mt-1">{analytics.currentlyInside}</div>
              <div className="small text-secondary">Active on premises</div>
            </div>
          </div>
          <div className="col-6 col-md-4 col-lg-2">
            <div className="pms-card p-3 h-100 border-start border-4 border-warning shadow-sm">
              <span className="text-muted small fw-semibold">Pending Approvals</span>
              <div className="fs-3 fw-bold text-warning mt-1">{analytics.pendingApprovals}</div>
              <div className="small text-secondary">Awaiting host action</div>
            </div>
          </div>
          <div className="col-6 col-md-4 col-lg-2">
            <div className="pms-card p-3 h-100 border-start border-4 border-danger shadow-sm">
              <span className="text-muted small fw-semibold">Overstay Alerts</span>
              <div className="fs-3 fw-bold text-danger mt-1">{analytics.overstayCount}</div>
              <div className="small text-danger fw-semibold">Time limit exceeded</div>
            </div>
          </div>
          <div className="col-6 col-md-4 col-lg-2">
            <div className="pms-card p-3 h-100 border-start border-4 border-info shadow-sm">
              <span className="text-muted small fw-semibold">Deliveries</span>
              <div className="fs-3 fw-bold text-info mt-1">{analytics.deliveriesCount}</div>
              <div className="small text-secondary">Parcels & Food</div>
            </div>
          </div>
          <div className="col-6 col-md-4 col-lg-2">
            <div className="pms-card p-3 h-100 border-start border-4 border-secondary shadow-sm">
              <span className="text-muted small fw-semibold">Checked Out</span>
              <div className="fs-3 fw-bold text-secondary mt-1">{analytics.checkedOutToday}</div>
              <div className="small text-secondary">Departed today</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="pms-card mb-4">
        <div className="d-flex flex-wrap border-bottom px-3 pt-2 gap-2 bg-light rounded-top">
          <button
            className={`btn btn-sm ${activeTab === 'directory' ? 'btn-primary active' : 'btn-light'} fw-semibold`}
            onClick={() => setActiveTab('directory')}
          >
            <i className="bi bi-list-check me-1"></i> Visitor Directory ({visitors.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'security' ? 'btn-primary active' : 'btn-light'} fw-semibold`}
            onClick={() => setActiveTab('security')}
          >
            <i className="bi bi-shield-lock me-1"></i> Security Gate Station (QR Verify & Check-in)
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'approvals' ? 'btn-primary active' : 'btn-light'} fw-semibold`}
            onClick={() => setActiveTab('approvals')}
          >
            <i className="bi bi-clock-history me-1"></i> Approvals Queue ({analytics?.pendingApprovals || 0})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'deliveries' ? 'btn-primary active' : 'btn-light'} fw-semibold`}
            onClick={() => setActiveTab('deliveries')}
          >
            <i className="bi bi-box-seam me-1"></i> Deliveries ({deliveries.length})
          </button>
          <button
            className={`btn btn-sm ${activeTab === 'overstay' ? 'btn-primary active' : 'btn-light'} fw-semibold`}
            onClick={() => setActiveTab('overstay')}
          >
            <i className="bi bi-exclamation-octagon me-1"></i> Overstay & Risk Monitoring ({analytics?.overstayCount || 0})
          </button>
        </div>

        {/* TAB 1: VISITOR DIRECTORY */}
        {activeTab === 'directory' && (
          <div className="p-3">
            {/* Filter Bar */}
            <div className="row g-2 mb-3 align-items-center">
              <div className="col-12 col-md-3">
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Search name, phone, pass code..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && loadData()}
                  />
                  <button className="btn btn-outline-secondary" onClick={loadData}>Search</button>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <select
                  className="form-select form-select-sm"
                  value={propertyTypeFilter}
                  onChange={(e) => setPropertyTypeFilter(e.target.value)}
                >
                  <option value="ALL">All Portfolios</option>
                  <option value="RESIDENTIAL">🏢 Residential (Apartments)</option>
                  <option value="COMMERCIAL">💼 Commercial (Tech Parks)</option>
                  <option value="COWORKING">☕ Co-working (Workspaces)</option>
                </select>
              </div>
              <div className="col-6 col-md-3">
                <select
                  className="form-select form-select-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">All Statuses</option>
                  <option value="EXPECTED">Expected</option>
                  <option value="CHECKED_IN">Inside Property</option>
                  <option value="CHECKED_OUT">Checked Out</option>
                  <option value="DENIED">Denied</option>
                </select>
              </div>
              <div className="col-12 col-md-3 text-end">
                <button onClick={loadData} className="btn btn-light btn-sm text-secondary border">
                  <i className="bi bi-arrow-clockwise me-1"></i> Refresh
                </button>
              </div>
            </div>

            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"></div>
                <div className="text-secondary small mt-2">Loading live MongoDB visitor logs...</div>
              </div>
            ) : visitors.length === 0 ? (
              <div className="text-center py-5 text-secondary">
                <i className="bi bi-person-badge fs-1 d-block mb-2"></i>
                <h6>No visitors found matching current criteria</h6>
                <p className="small">Pre-register a visitor or register a walk-in at the gate to get started.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small text-uppercase">
                    <tr>
                      <th>Pass Code</th>
                      <th>Visitor & Mobile</th>
                      <th>Portfolio & Location</th>
                      <th>Host / Target</th>
                      <th>Schedule / Times</th>
                      <th>Vehicle</th>
                      <th>Status</th>
                      <th className="text-end">Gate Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitors.map((v) => (
                      <tr key={v._id}>
                        <td>
                          <button
                            onClick={() => { setSelectedVisitor(v); setShowQRModal(true); }}
                            className="btn btn-link p-0 text-decoration-none fw-bold d-flex align-items-center gap-1"
                          >
                            <i className="bi bi-qr-code-scan text-primary"></i>
                            <span>{v.passCode}</span>
                          </button>
                          <span className="badge bg-light text-dark border extra-small mt-1">{v.gatePassType}</span>
                        </td>
                        <td>
                          <div className="fw-bold">{v.visitorName}</div>
                          <div className="text-secondary small">{v.mobile}</div>
                          <span className="badge bg-secondary-subtle text-secondary extra-small">{v.visitorType}</span>
                        </td>
                        <td>
                          <div className="small fw-semibold">{v.propertyName || 'Property'}</div>
                          <div className="text-secondary extra-small">
                            {v.buildingName ? `${v.buildingName} • ` : ''}Unit {v.unitNumber || 'N/A'}
                          </div>
                          <span className={`badge extra-small ${v.propertyType === 'RESIDENTIAL' ? 'bg-primary-subtle text-primary' : v.propertyType === 'COMMERCIAL' ? 'bg-info-subtle text-info' : 'bg-warning-subtle text-warning'}`}>
                            {v.propertyType}
                          </span>
                        </td>
                        <td>
                          <div className="small fw-semibold">{v.hostName || 'Front Desk'}</div>
                          {v.companyName && <div className="text-secondary extra-small">{v.companyName}</div>}
                          <span className={`badge extra-small ${v.hostApprovalStatus === 'APPROVED' ? 'bg-success-subtle text-success' : v.hostApprovalStatus === 'PENDING' ? 'bg-warning-subtle text-warning' : 'bg-danger-subtle text-danger'}`}>
                            {v.hostApprovalStatus}
                          </span>
                        </td>
                        <td>
                          <div className="small">Arr: {v.expectedTime}</div>
                          <div className="text-secondary extra-small">Exit: {v.expectedExitTime || 'N/A'}</div>
                          {v.checkInTime && (
                            <div className="text-success extra-small">In: {new Date(v.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          )}
                          {v.checkOutTime && (
                            <div className="text-secondary extra-small">Out: {new Date(v.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                          )}
                        </td>
                        <td>
                          {v.vehicleNumber ? (
                            <div>
                              <div className="small fw-semibold">{v.vehicleNumber}</div>
                              <span className="badge bg-light text-secondary border extra-small">{v.vehicleType}</span>
                              {v.parkingSlot && <div className="text-info extra-small fw-semibold">Bay: {v.parkingSlot}</div>}
                            </div>
                          ) : (
                            <span className="text-muted small">No Vehicle</span>
                          )}
                        </td>
                        <td>
                          {renderStatusBadge(v.status, v.isOverstay)}
                        </td>
                        <td className="text-end">
                          <div className="btn-group btn-group-sm">
                            <button
                              onClick={() => { setSelectedVisitor(v); setShowDetailsModal(true); }}
                              className="btn btn-outline-secondary"
                              title="View Details"
                            >
                              <i className="bi bi-eye"></i>
                            </button>
                            <Link
                              href={`/visitors/pass/${v._id}`}
                              className="btn btn-outline-primary"
                              title="Print / Share Digital Pass"
                            >
                              <i className="bi bi-printer"></i>
                            </Link>

                            {/* Gate Check-in Action */}
                            {v.status === 'EXPECTED' && v.hostApprovalStatus === 'APPROVED' && (
                              <button
                                onClick={() => handleCheckIn(v._id)}
                                className="btn btn-success"
                                title="Check In to Property"
                              >
                                <i className="bi bi-door-open-fill me-1"></i> Check In
                              </button>
                            )}

                            {/* Gate Check-out Action */}
                            {v.status === 'CHECKED_IN' && (
                              <button
                                onClick={() => handleCheckOut(v._id)}
                                className="btn btn-warning"
                                title="Check Out from Property"
                              >
                                <i className="bi bi-door-closed-fill me-1"></i> Check Out
                              </button>
                            )}

                            {/* Approval Action */}
                            {v.hostApprovalStatus === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleApprove(v._id)}
                                  className="btn btn-outline-success"
                                  title="Approve Visitor"
                                >
                                  <i className="bi bi-check-lg"></i>
                                </button>
                                <button
                                  onClick={() => { setSelectedVisitor(v); setShowRejectModal(true); }}
                                  className="btn btn-outline-danger"
                                  title="Reject Visitor"
                                >
                                  <i className="bi bi-x-lg"></i>
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: SECURITY GATE STATION */}
        {activeTab === 'security' && (
          <div className="p-4">
            <div className="row g-4">
              {/* Left Scanner & Fast Lookup Panel */}
              <div className="col-12 col-md-5">
                <div className="card shadow-sm border-0 bg-light p-4 h-100">
                  <h5 className="fw-bold mb-3 d-flex align-items-center gap-2">
                    <i className="bi bi-qr-code-scan text-primary"></i> Security Gate Scanner
                  </h5>
                  <p className="text-secondary small mb-3">
                    Type or scan the Pass Code / QR Code on visitor device for instant verification and automated check-in.
                  </p>

                  <form onSubmit={handleVerifyPass}>
                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Current Gate Station</label>
                      <select
                        className="form-select form-select-sm"
                        value={selectedGate}
                        onChange={(e) => setSelectedGate(e.target.value)}
                      >
                        <option value="Main Gate 1">Main Gate 1 (North Entrance)</option>
                        <option value="Visitor Gate 2">Visitor Gate 2 (East Turnstile)</option>
                        <option value="Service Gate 3">Service Gate 3 (Goods / Delivery)</option>
                        <option value="Emergency Gate">Emergency Gate (Bypass)</option>
                      </select>
                    </div>

                    <div className="mb-3">
                      <label className="form-label small fw-semibold">Pass Code / Barcode Value</label>
                      <div className="input-group">
                        <input
                          type="text"
                          className="form-control text-uppercase fw-bold"
                          placeholder="e.g. VP-RPR01 or VP-AHCP1"
                          value={scanCodeInput}
                          onChange={(e) => setScanCodeInput(e.target.value)}
                        />
                        <button type="submit" className="btn btn-primary" disabled={scanLoading}>
                          {scanLoading ? <span className="spinner-border spinner-border-sm"></span> : 'Verify Code'}
                        </button>
                      </div>
                    </div>
                  </form>

                  {/* Quick Code shortcuts */}
                  <div className="mt-3">
                    <span className="text-muted extra-small fw-semibold d-block mb-1">Quick Sample Codes:</span>
                    <div className="d-flex flex-wrap gap-1">
                      {visitors.slice(0, 4).map((v) => (
                        <button
                          key={v._id}
                          className="btn btn-outline-secondary btn-sm extra-small py-0"
                          onClick={() => {
                            setScanCodeInput(v.passCode);
                          }}
                        >
                          {v.passCode} ({v.visitorName.split(' ')[0]})
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Verification Result Panel */}
              <div className="col-12 col-md-7">
                {scanResult ? (
                  <div className={`card p-4 shadow-sm border-2 ${scanResult.validationResult === 'VALID' ? 'border-success' : 'border-warning'}`}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                      <span className={`badge fs-6 ${scanResult.validationResult === 'VALID' ? 'bg-success' : 'bg-warning text-dark'}`}>
                        <i className={`bi ${scanResult.validationResult === 'VALID' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-1`}></i>
                        Status: {scanResult.validationResult}
                      </span>
                      <span className="text-secondary small fw-semibold">Pass: {scanResult.visitor.passCode}</span>
                    </div>

                    {scanResult.warning && (
                      <div className="alert alert-warning py-2 px-3 small mb-3">
                        <i className="bi bi-info-circle me-1"></i> {scanResult.warning}
                      </div>
                    )}

                    <div className="row g-3 mb-3">
                      <div className="col-6">
                        <div className="text-muted extra-small">Visitor Name</div>
                        <div className="fw-bold fs-5">{scanResult.visitor.visitorName}</div>
                        <div className="text-secondary small">{scanResult.visitor.mobile}</div>
                      </div>
                      <div className="col-6">
                        <div className="text-muted extra-small">Host & Destination</div>
                        <div className="fw-bold">{scanResult.visitor.hostName}</div>
                        <div className="text-secondary small">Unit {scanResult.visitor.unitNumber} ({scanResult.visitor.propertyName})</div>
                      </div>
                      <div className="col-6">
                        <div className="text-muted extra-small">Visit Purpose & Type</div>
                        <div className="small fw-semibold">{scanResult.visitor.purpose}</div>
                        <span className="badge bg-light text-dark border extra-small">{scanResult.visitor.visitorType}</span>
                      </div>
                      <div className="col-6">
                        <div className="text-muted extra-small">Vehicle Details</div>
                        <div className="small fw-semibold">{scanResult.visitor.vehicleNumber || 'Pedestrian / No Vehicle'}</div>
                        {scanResult.visitor.parkingSlot && (
                          <div className="text-success extra-small">Parking: {scanResult.visitor.parkingSlot}</div>
                        )}
                      </div>
                    </div>

                    {/* Gate Action Buttons */}
                    <div className="d-flex gap-2 pt-2 border-top">
                      {scanResult.visitor.status === 'EXPECTED' && (
                        <button
                          onClick={() => handleCheckIn(scanResult.visitor._id)}
                          className="btn btn-success fw-semibold flex-fill py-2"
                        >
                          <i className="bi bi-check-circle me-1"></i> Confirm & Admit Visitor
                        </button>
                      )}
                      {scanResult.visitor.status === 'CHECKED_IN' && (
                        <button
                          onClick={() => handleCheckOut(scanResult.visitor._id)}
                          className="btn btn-warning fw-semibold flex-fill py-2"
                        >
                          <i className="bi bi-door-closed me-1"></i> Check Out & Close Pass
                        </button>
                      )}
                      <button
                        onClick={() => {
                          const reason = prompt('State denial reason for gate log:');
                          if (reason) {
                            apiClient.put(`/visitors/${scanResult.visitor._id}/deny`, { reason }).then(() => {
                              alert('Visitor denied and recorded.');
                              loadData();
                              setScanResult(null);
                            });
                          }
                        }}
                        className="btn btn-outline-danger"
                      >
                        <i className="bi bi-shield-x me-1"></i> Deny Entry
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="card border-dashed p-5 text-center text-secondary h-100 d-flex justify-content-center align-items-center">
                    <i className="bi bi-upc-scan fs-1 mb-2 text-primary opacity-50"></i>
                    <h6 className="fw-semibold">No Pass Code Scanned Yet</h6>
                    <p className="small mb-0">Enter a Pass Code on the left or click a sample code to verify gate authorization.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: APPROVALS QUEUE */}
        {activeTab === 'approvals' && (
          <div className="p-3">
            <h6 className="fw-bold mb-3">Pending Host & Administration Approvals</h6>
            {visitors.filter((v) => v.hostApprovalStatus === 'PENDING').length === 0 ? (
              <div className="text-center py-5 text-secondary">
                <i className="bi bi-check2-circle fs-1 text-success d-block mb-2"></i>
                <h6>All visitor requests are approved!</h6>
                <p className="small">No pending authorization items in the queue.</p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light small">
                    <tr>
                      <th>Pass Code</th>
                      <th>Visitor Details</th>
                      <th>Host & Target</th>
                      <th>Visit Date & Time</th>
                      <th>Purpose</th>
                      <th className="text-end">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {visitors
                      .filter((v) => v.hostApprovalStatus === 'PENDING')
                      .map((v) => (
                        <tr key={v._id}>
                          <td className="fw-bold">{v.passCode}</td>
                          <td>
                            <div className="fw-semibold">{v.visitorName}</div>
                            <div className="text-secondary small">{v.mobile}</div>
                          </td>
                          <td>
                            <div className="fw-semibold">{v.hostName}</div>
                            <div className="text-secondary extra-small">Unit {v.unitNumber} ({v.propertyName})</div>
                          </td>
                          <td>
                            <div className="small">{new Date(v.expectedDate).toLocaleDateString()}</div>
                            <div className="text-secondary extra-small">{v.expectedTime}</div>
                          </td>
                          <td className="small">{v.purpose}</td>
                          <td className="text-end">
                            <button
                              onClick={() => handleApprove(v._id)}
                              className="btn btn-success btn-sm me-2"
                            >
                              <i className="bi bi-check-lg me-1"></i> Approve
                            </button>
                            <button
                              onClick={() => { setSelectedVisitor(v); setShowRejectModal(true); }}
                              className="btn btn-outline-danger btn-sm"
                            >
                              <i className="bi bi-x-lg me-1"></i> Reject
                            </button>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: DELIVERIES */}
        {activeTab === 'deliveries' && (
          <div className="p-3">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h6 className="fw-bold mb-0">Parcels, Food & Courier Deliveries</h6>
              <button onClick={() => setShowDeliveryModal(true)} className="btn btn-primary btn-sm">
                <i className="bi bi-plus-circle me-1"></i> Record New Delivery
              </button>
            </div>

            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-light small">
                  <tr>
                    <th>Delivery #</th>
                    <th>Courier / App</th>
                    <th>Delivery Person</th>
                    <th>Destination Unit</th>
                    <th>Host Name</th>
                    <th>OTP Verified?</th>
                    <th>Status</th>
                    <th className="text-end">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {deliveries.map((del) => (
                    <tr key={del._id}>
                      <td className="fw-bold">{del.deliveryNumber}</td>
                      <td>
                        <span className="badge bg-info-subtle text-info fw-semibold">{del.deliveryCompany}</span>
                        <div className="text-secondary extra-small">{del.deliveryType}</div>
                      </td>
                      <td>
                        <div className="fw-semibold">{del.deliveryPersonName}</div>
                        <div className="text-secondary small">{del.mobile}</div>
                      </td>
                      <td>
                        <span className="fw-bold text-primary">Unit {del.unitNumber}</span>
                        {del.buildingName && <div className="text-secondary extra-small">{del.buildingName}</div>}
                      </td>
                      <td className="small fw-semibold">{del.hostName}</td>
                      <td>
                        {del.isOtpVerified ? (
                          <span className="badge bg-success"><i className="bi bi-shield-check me-1"></i>Verified</span>
                        ) : (
                          <span className="badge bg-warning text-dark"><i className="bi bi-key me-1"></i>OTP: {del.otpCode}</span>
                        )}
                      </td>
                      <td>
                        <span className={`badge ${del.deliveryStatus === 'HANDED_OVER' ? 'bg-success' : del.deliveryStatus === 'ARRIVED' ? 'bg-primary' : 'bg-secondary'}`}>
                          {del.deliveryStatus}
                        </span>
                      </td>
                      <td className="text-end">
                        {del.deliveryStatus === 'ARRIVED' && (
                          <button
                            onClick={() => handleDeliveryHandover(del._id)}
                            className="btn btn-outline-success btn-sm"
                          >
                            <i className="bi bi-box-arrow-right me-1"></i> Verify OTP & Handover
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: OVERSTAY & RISK MONITORING */}
        {activeTab === 'overstay' && (
          <div className="p-3">
            <h6 className="fw-bold text-danger mb-3 d-flex align-items-center gap-2">
              <i className="bi bi-exclamation-octagon-fill"></i> Active Overstaying Visitors
            </h6>
            <div className="table-responsive">
              <table className="table table-hover align-middle mb-0">
                <thead className="table-danger small">
                  <tr>
                    <th>Pass Code</th>
                    <th>Visitor Name</th>
                    <th>Host & Unit</th>
                    <th>Expected Exit</th>
                    <th>Overstay Duration</th>
                    <th>Vehicle</th>
                    <th className="text-end">Security Action</th>
                  </tr>
                </thead>
                <tbody>
                  {visitors
                    .filter((v) => v.isOverstay || v.status === 'OVERSTAY')
                    .map((v) => (
                      <tr key={v._id}>
                        <td className="fw-bold">{v.passCode}</td>
                        <td>
                          <div className="fw-bold">{v.visitorName}</div>
                          <div className="text-secondary small">{v.mobile}</div>
                        </td>
                        <td>
                          <div className="fw-semibold">{v.hostName}</div>
                          <div className="text-secondary extra-small">Unit {v.unitNumber}</div>
                        </td>
                        <td className="text-danger fw-semibold">{v.expectedExitTime || 'Overdue'}</td>
                        <td>
                          <span className="badge bg-danger fs-6">{v.overstayDuration || 'Overstayed'}</span>
                        </td>
                        <td>{v.vehicleNumber || 'None'}</td>
                        <td className="text-end">
                          <button
                            onClick={() => handleCheckOut(v._id)}
                            className="btn btn-warning btn-sm me-2"
                          >
                            <i className="bi bi-box-arrow-right me-1"></i> Force Check-out
                          </button>
                        </td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* MODAL: VISITOR DETAILS */}
      {showDetailsModal && selectedVisitor && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-bold">Visitor Pass #{selectedVisitor.passCode}</h5>
                <button type="button" className="btn-close" onClick={() => setShowDetailsModal(false)}></button>
              </div>
              <div className="modal-body p-4">
                <div className="row g-3">
                  <div className="col-12 col-md-6">
                    <div className="text-muted extra-small">Visitor Information</div>
                    <div className="fw-bold fs-5">{selectedVisitor.visitorName}</div>
                    <div className="text-secondary small">Mobile: {selectedVisitor.mobile}</div>
                    {selectedVisitor.email && <div className="text-secondary small">Email: {selectedVisitor.email}</div>}
                    <div className="mt-2">
                      <span className="badge bg-secondary-subtle text-secondary me-1">{selectedVisitor.visitorType}</span>
                      <span className="badge bg-light text-dark border">{selectedVisitor.idProofType}: {selectedVisitor.idProofNumber || 'N/A'}</span>
                    </div>
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="text-muted extra-small">Destination & Host</div>
                    <div className="fw-bold fs-5">{selectedVisitor.hostName}</div>
                    <div className="text-secondary small">Unit: {selectedVisitor.unitNumber} ({selectedVisitor.propertyName})</div>
                    {selectedVisitor.companyName && <div className="text-secondary small">Company: {selectedVisitor.companyName}</div>}
                    <div className="mt-2">
                      <span className="badge bg-primary-subtle text-primary">{selectedVisitor.propertyType}</span>
                    </div>
                  </div>
                  <div className="col-12"><hr className="my-1" /></div>
                  <div className="col-6 col-md-4">
                    <div className="text-muted extra-small">Scheduled Arrival</div>
                    <div className="fw-semibold">{selectedVisitor.expectedTime}</div>
                  </div>
                  <div className="col-6 col-md-4">
                    <div className="text-muted extra-small">Scheduled Exit</div>
                    <div className="fw-semibold">{selectedVisitor.expectedExitTime || 'N/A'}</div>
                  </div>
                  <div className="col-6 col-md-4">
                    <div className="text-muted extra-small">Vehicle & Parking</div>
                    <div className="fw-semibold">{selectedVisitor.vehicleNumber || 'No vehicle'}</div>
                    {selectedVisitor.parkingSlot && <span className="badge bg-success-subtle text-success extra-small">Bay: {selectedVisitor.parkingSlot}</span>}
                  </div>
                  <div className="col-12">
                    <div className="text-muted extra-small">Purpose of Visit</div>
                    <p className="mb-0 small bg-light p-2 rounded">{selectedVisitor.purpose}</p>
                  </div>
                  {selectedVisitor.securityRemarks && (
                    <div className="col-12">
                      <div className="text-muted extra-small">Security Staff Remarks</div>
                      <p className="mb-0 small text-secondary">{selectedVisitor.securityRemarks}</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowDetailsModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: QR PASS PREVIEW */}
      {showQRModal && selectedVisitor && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '420px' }}>
            <div className="modal-content text-center p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">Digital Gate Pass</h6>
                <button type="button" className="btn-close" onClick={() => setShowQRModal(false)}></button>
              </div>

              <div className="p-3 border rounded bg-light mb-3">
                <img
                  src={selectedVisitor.qrCodeUrl || `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${selectedVisitor.passCode}`}
                  alt="QR Code"
                  className="img-fluid rounded shadow-sm mb-2"
                  style={{ maxHeight: '180px' }}
                />
                <h4 className="fw-bold text-primary letter-spacing-1 mb-0">{selectedVisitor.passCode}</h4>
                <div className="text-secondary extra-small">Show at entry gate for QR scanning</div>
              </div>

              <div className="text-start small mb-3">
                <div><strong>Visitor:</strong> {selectedVisitor.visitorName}</div>
                <div><strong>Host:</strong> {selectedVisitor.hostName} (Unit {selectedVisitor.unitNumber})</div>
                <div><strong>Valid:</strong> {new Date(selectedVisitor.expectedDate).toLocaleDateString()} ({selectedVisitor.expectedTime})</div>
                {selectedVisitor.vehicleNumber && <div><strong>Vehicle:</strong> {selectedVisitor.vehicleNumber}</div>}
              </div>

              <div className="d-flex gap-2">
                <Link href={`/visitors/pass/${selectedVisitor._id}`} className="btn btn-primary btn-sm flex-fill">
                  <i className="bi bi-printer me-1"></i> Open Printable Pass
                </Link>
                <button onClick={() => setShowQRModal(false)} className="btn btn-outline-secondary btn-sm">Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: WALK-IN REGISTRATION */}
      {showWalkInModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold"><i className="bi bi-person-walking me-1"></i> Register Walk-in Visitor</h5>
                <button type="button" className="btn-close" onClick={() => setShowWalkInModal(false)}></button>
              </div>
              <form onSubmit={handleWalkInSubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Visitor Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        required
                        value={walkInData.visitorName}
                        onChange={(e) => setWalkInData({ ...walkInData, visitorName: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Mobile Number *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        required
                        value={walkInData.mobile}
                        onChange={(e) => setWalkInData({ ...walkInData, mobile: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Property Portfolio</label>
                      <select
                        className="form-select form-select-sm"
                        value={walkInData.propertyType}
                        onChange={(e) => setWalkInData({ ...walkInData, propertyType: e.target.value as PropertyType })}
                      >
                        <option value="RESIDENTIAL">Residential (Apartment)</option>
                        <option value="COMMERCIAL">Commercial (Tech Park)</option>
                        <option value="COWORKING">Co-working (Flexible Space)</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Visitor Type</label>
                      <select
                        className="form-select form-select-sm"
                        value={walkInData.visitorType}
                        onChange={(e) => setWalkInData({ ...walkInData, visitorType: e.target.value })}
                      >
                        <option value="GUEST">Guest</option>
                        <option value="CLIENT">Client</option>
                        <option value="SERVICE_TECHNICIAN">Technician</option>
                        <option value="CAB_DRIVER">Cab Driver</option>
                        <option value="INTERVIEW_CANDIDATE">Interviewee</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Host Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        required
                        placeholder="Resident / Employee / Member"
                        value={walkInData.hostName}
                        onChange={(e) => setWalkInData({ ...walkInData, hostName: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Unit / Flat / Office Number *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        required
                        placeholder="e.g. A-101 or Suite 301"
                        value={walkInData.unitNumber}
                        onChange={(e) => setWalkInData({ ...walkInData, unitNumber: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Vehicle Plate (Optional)</label>
                      <input
                        type="text"
                        className="form-control form-control-sm text-uppercase"
                        placeholder="e.g. MH 02 AB 1234"
                        value={walkInData.vehicleNumber}
                        onChange={(e) => setWalkInData({ ...walkInData, vehicleNumber: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Purpose of Visit</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        value={walkInData.purpose}
                        onChange={(e) => setWalkInData({ ...walkInData, purpose: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowWalkInModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary btn-sm">Register & Admit</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: DELIVERY LOG */}
      {showDeliveryModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title fw-bold"><i className="bi bi-box-seam me-1"></i> Log Delivery at Gate</h5>
                <button type="button" className="btn-close" onClick={() => setShowDeliveryModal(false)}></button>
              </div>
              <form onSubmit={handleDeliverySubmit}>
                <div className="modal-body p-4">
                  <div className="row g-3">
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Delivery Service / App *</label>
                      <select
                        className="form-select form-select-sm"
                        value={deliveryData.deliveryCompany}
                        onChange={(e) => setDeliveryData({ ...deliveryData, deliveryCompany: e.target.value })}
                      >
                        <option value="Swiggy">Swiggy Food / Instamart</option>
                        <option value="Zomato">Zomato / Blinkit</option>
                        <option value="Amazon">Amazon Prime</option>
                        <option value="Flipkart">Flipkart</option>
                        <option value="BlueDart">BlueDart Express</option>
                        <option value="Other Courier">Other Courier / Parcel</option>
                      </select>
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Delivery Person Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        required
                        value={deliveryData.deliveryPersonName}
                        onChange={(e) => setDeliveryData({ ...deliveryData, deliveryPersonName: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Mobile Number *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        required
                        value={deliveryData.mobile}
                        onChange={(e) => setDeliveryData({ ...deliveryData, mobile: e.target.value })}
                      />
                    </div>
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Unit Number *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        required
                        placeholder="e.g. A-101"
                        value={deliveryData.unitNumber}
                        onChange={(e) => setDeliveryData({ ...deliveryData, unitNumber: e.target.value })}
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label small fw-semibold">Recipient / Host Name *</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        required
                        value={deliveryData.hostName}
                        onChange={(e) => setDeliveryData({ ...deliveryData, hostName: e.target.value })}
                      />
                    </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowDeliveryModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-info btn-sm text-white">Log & Send OTP</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: REJECT CONFIRMATION */}
      {showRejectModal && selectedVisitor && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered" style={{ maxWidth: '400px' }}>
            <div className="modal-content">
              <div className="modal-header">
                <h6 className="modal-title fw-bold">Reject Entry Request</h6>
                <button type="button" className="btn-close" onClick={() => setShowRejectModal(false)}></button>
              </div>
              <div className="modal-body p-3">
                <p className="small mb-2">Please state the reason for rejecting visitor <strong>{selectedVisitor.visitorName}</strong>:</p>
                <textarea
                  className="form-control form-control-sm"
                  rows={3}
                  placeholder="e.g. Host unavailable, unrecognized guest..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowRejectModal(false)}>Cancel</button>
                <button type="button" className="btn btn-danger btn-sm" onClick={handleRejectSubmit}>Confirm Rejection</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
