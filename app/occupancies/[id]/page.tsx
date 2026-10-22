'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/apiClient';
import Link from 'next/link';

export default function OccupancyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const occupancyId = params?.id as string;

  const [occupancy, setOccupancy] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'occupant' | 'agreement' | 'allocation' | 'billing' | 'audit'>('overview');

  // Document Upload States
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get(`/occupancies/${occupancyId}`);
      if (res.data.success) {
        setOccupancy(res.data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load occupancy detail');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (occupancyId) loadData();
  }, [occupancyId]);

  const handleStatusChange = async (newStatus: string) => {
    if (!confirm(`Are you sure you want to change status to ${newStatus}?`)) return;
    try {
      const res = await apiClient.put(`/occupancies/${occupancyId}/status`, { status: newStatus });
      if (res.data.success) loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  const handleReleaseAllocation = async () => {
    if (!confirm('Release space allocation? The unit will be freed and marked VACANT.')) return;
    try {
      const res = await apiClient.post(`/occupancies/${occupancyId}/release-allocation`);
      if (res.data.success) loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error releasing space');
    }
  };

  const handleSendInvite = async () => {
    try {
      const res = await apiClient.post(`/occupancies/${occupancyId}/invite-account`);
      if (res.data.success) {
        alert('Invitation sent successfully');
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error sending invite');
    }
  };

  const handleUploadDoc = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !occupancy?.contractAgreementId?._id) return;
    setUploading(true);
    setUploadProgress(0);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('status', 'ACTIVE');

    try {
      const res = await apiClient.post(
        `/occupancies/agreements/${occupancy.contractAgreementId._id}/documents`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              setUploadProgress(Math.round((progressEvent.loaded * 100) / progressEvent.total));
            }
          }
        }
      );
      if (res.data.success) {
        setUploadFile(null);
        setUploadProgress(100);
        loadData();
      }
    } catch (err: any) {
      setUploadError(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!confirm('Are you sure you want to remove this agreement document?')) return;
    try {
      const res = await apiClient.delete(
        `/occupancies/agreements/${occupancy.contractAgreementId._id}/documents/${docId}`
      );
      if (res.data.success) loadData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error deleting document');
    }
  };

  if (loading) {
    return (
      <div className="container-fluid py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="text-muted small mt-2">Loading occupancy record...</p>
      </div>
    );
  }

  if (error || !occupancy) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger shadow-sm rounded-3">
          <i className="bi bi-exclamation-triangle me-2"></i>{error || 'Occupancy not found'}
          <div className="mt-3">
            <button className="btn btn-sm btn-outline-danger me-2" onClick={loadData}>Retry</button>
            <Link href="/occupancies" className="btn btn-sm btn-secondary">Back to Directory</Link>
          </div>
        </div>
      </div>
    );
  }

  const pType = occupancy.propertyType || 'RESIDENTIAL';

  return (
    <div className="container-fluid py-2">
      {/* Breadcrumb */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb mb-2 small">
          <li className="breadcrumb-item"><Link href="/dashboard" className="text-decoration-none">Dashboard</Link></li>
          <li className="breadcrumb-item"><Link href="/occupancies" className="text-decoration-none">Occupancies</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{occupancy.occupancyCode}</li>
        </ol>
      </nav>

      {/* Header Banner */}
      <div className="card border-0 shadow-sm rounded-3 p-4 mb-4 bg-white">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2">
              <h2 className="fw-bold mb-0 text-dark">{occupancy.occupancyCode}</h2>
              <span className={`badge ${
                occupancy.status === 'ACTIVE' ? 'bg-success text-white' :
                occupancy.status === 'SUSPENDED' ? 'bg-warning text-dark' :
                'bg-danger text-white'
              }`}>
                {occupancy.status}
              </span>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                {pType}
              </span>
            </div>
            <div className="text-muted small mt-1">
              <i className="bi bi-geo-alt me-1"></i>
              {occupancy.propertyId?.name} • Unit {occupancy.unitId?.wing ? `${occupancy.unitId.wing}-` : ''}{occupancy.unitId?.unitNumber} • {occupancy.occupantType?.replace('_', ' ')}
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="d-flex align-items-center gap-2">
            {occupancy.status === 'ACTIVE' && (
              <>
                <button className="btn btn-outline-warning btn-sm" onClick={() => handleStatusChange('SUSPENDED')}>
                  <i className="bi bi-pause-circle me-1"></i> Suspend
                </button>
                <button className="btn btn-outline-danger btn-sm" onClick={handleReleaseAllocation}>
                  <i className="bi bi-door-open me-1"></i> Release & Terminate
                </button>
              </>
            )}
            {occupancy.status === 'SUSPENDED' && (
              <button className="btn btn-outline-success btn-sm" onClick={() => handleStatusChange('ACTIVE')}>
                <i className="bi bi-play-circle me-1"></i> Reactivate
              </button>
            )}
            {occupancy.accountStatus === 'PENDING_INVITATION' && (
              <button className="btn btn-primary btn-sm" onClick={handleSendInvite}>
                <i className="bi bi-send me-1"></i> Send Invite
              </button>
            )}
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
            <span className="text-muted small">Occupant / Tenant</span>
            <h5 className="fw-bold mb-0 mt-1 text-dark text-truncate">{occupancy.occupantName}</h5>
            <div className="small text-muted mt-1">{occupancy.email || occupancy.mobile || 'Contact details logged'}</div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
            <span className="text-muted small">Space Allocation</span>
            <h5 className="fw-bold mb-0 mt-1 text-dark">
              Unit {occupancy.unitId?.wing ? `${occupancy.unitId.wing}-` : ''}{occupancy.unitId?.unitNumber}
            </h5>
            <div className="small text-muted mt-1">{occupancy.allocationStatus || 'ALLOCATED'}</div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
            <span className="text-muted small">Monthly Billing</span>
            <h4 className="fw-bold mb-0 mt-1 text-primary">₹{Number(occupancy.monthlyAmount || 0).toLocaleString()}</h4>
            <div className="small text-muted mt-1">{occupancy.billingCycle || 'MONTHLY'} billing</div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
            <span className="text-muted small">Security Deposit</span>
            <h4 className="fw-bold mb-0 mt-1 text-dark">₹{Number(occupancy.securityDeposit || 0).toLocaleString()}</h4>
            <div className="small text-muted mt-1">Due Date: {occupancy.paymentDueDate || 5}th</div>
          </div>
        </div>
      </div>

      {/* Detail Tabs */}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="card-header bg-white border-bottom p-0">
          <ul className="nav nav-tabs border-bottom-0 px-3 pt-2">
            <li className="nav-item">
              <button
                className={`nav-link py-2 px-3 fw-medium ${activeTab === 'overview' ? 'active text-primary fw-bold' : 'text-secondary'}`}
                onClick={() => setActiveTab('overview')}
              >
                <i className="bi bi-info-circle me-1"></i> Overview & Dates
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link py-2 px-3 fw-medium ${activeTab === 'occupant' ? 'active text-primary fw-bold' : 'text-secondary'}`}
                onClick={() => setActiveTab('occupant')}
              >
                <i className="bi bi-person-badge me-1"></i>
                {pType === 'RESIDENTIAL' ? 'Resident Profile' : pType === 'COMMERCIAL' ? 'Tenant Company' : 'Member Details'}
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link py-2 px-3 fw-medium ${activeTab === 'agreement' ? 'active text-primary fw-bold' : 'text-secondary'}`}
                onClick={() => setActiveTab('agreement')}
              >
                <i className="bi bi-file-earmark-text me-1"></i> Agreement / Lease
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link py-2 px-3 fw-medium ${activeTab === 'allocation' ? 'active text-primary fw-bold' : 'text-secondary'}`}
                onClick={() => setActiveTab('allocation')}
              >
                <i className="bi bi-grid-3x3-gap me-1"></i> Space & Parking Allocation
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link py-2 px-3 fw-medium ${activeTab === 'audit' ? 'active text-primary fw-bold' : 'text-secondary'}`}
                onClick={() => setActiveTab('audit')}
              >
                <i className="bi bi-clock-history me-1"></i> Lifecycle Audit History
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body p-4">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="row g-4 small">
              <div className="col-md-6">
                <h6 className="fw-bold border-bottom pb-2 mb-3">Occupancy Timeline</h6>
                <div className="mb-2">
                  <span className="text-muted d-block">Start Date:</span>
                  <span className="fw-semibold">{new Date(occupancy.startDate).toLocaleDateString()}</span>
                </div>
                <div className="mb-2">
                  <span className="text-muted d-block">End Date:</span>
                  <span className="fw-semibold">{occupancy.endDate ? new Date(occupancy.endDate).toLocaleDateString() : 'Ongoing / Auto-renewal'}</span>
                </div>
                {occupancy.moveInDate && (
                  <div className="mb-2">
                    <span className="text-muted d-block">Move-In Date:</span>
                    <span className="fw-semibold">{new Date(occupancy.moveInDate).toLocaleDateString()}</span>
                  </div>
                )}
                {occupancy.moveOutDate && (
                  <div className="mb-2">
                    <span className="text-muted d-block">Move-Out / Release Date:</span>
                    <span className="fw-semibold text-danger">{new Date(occupancy.moveOutDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div className="col-md-6">
                <h6 className="fw-bold border-bottom pb-2 mb-3">Portal Account Status</h6>
                <div className="p-3 bg-light rounded-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Account Status:</span>
                    <span className="badge bg-info-subtle text-info">{occupancy.accountStatus}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Linked User Email:</span>
                    <span className="fw-semibold">{occupancy.userId?.email || occupancy.email || 'None'}</span>
                  </div>
                  <div className="d-flex justify-content-between">
                    <span className="text-muted">Role:</span>
                    <span className="fw-semibold">{occupancy.userId?.primaryRole || occupancy.occupantType}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: OCCUPANT DETAILS */}
          {activeTab === 'occupant' && (
            <div className="row g-4 small">
              <div className="col-md-6">
                <h6 className="fw-bold border-bottom pb-2 mb-3">Profile Data</h6>
                <div className="mb-2">
                  <span className="text-muted d-block">Primary Contact:</span>
                  <span className="fw-semibold">{occupancy.occupantName}</span>
                </div>
                {occupancy.companyName && (
                  <div className="mb-2">
                    <span className="text-muted d-block">Company Name:</span>
                    <span className="fw-semibold">{occupancy.companyName}</span>
                  </div>
                )}
                <div className="mb-2">
                  <span className="text-muted d-block">Email:</span>
                  <span className="fw-semibold">{occupancy.email || 'Not provided'}</span>
                </div>
                <div className="mb-2">
                  <span className="text-muted d-block">Mobile:</span>
                  <span className="fw-semibold">{occupancy.mobile || 'Not provided'}</span>
                </div>
              </div>

              <div className="col-md-6">
                <h6 className="fw-bold border-bottom pb-2 mb-3">Emergency & Verification</h6>
                <div className="p-3 bg-light rounded-3">
                  <div className="mb-2">
                    <span className="text-muted d-block">Emergency Contact:</span>
                    <span className="fw-semibold">{occupancy.residentId?.emergencyContact?.name || 'Logged in profile'}</span>
                  </div>
                  <div className="mb-2">
                    <span className="text-muted d-block">Family / Team Members:</span>
                    <span className="fw-semibold">{occupancy.residentId?.familyMembers?.length || 0} Members</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: AGREEMENT / LEASE */}
          {activeTab === 'agreement' && (
            <div className="row g-4 small">
              <div className="col-md-6">
                <h6 className="fw-bold border-bottom pb-2 mb-3">Agreement Profile</h6>
                <div className="mb-2">
                  <span className="text-muted d-block">Contract Identifier:</span>
                  <span className="fw-bold text-primary">{occupancy.contractAgreementId?.contractNumber || 'Not Linked'}</span>
                </div>
                <div className="mb-2">
                  <span className="text-muted d-block">Contract Type:</span>
                  <span className="fw-semibold">{occupancy.contractAgreementId?.contractType?.replace(/_/g, ' ')}</span>
                </div>
                <div className="mb-2">
                  <span className="text-muted d-block">Lock-In Period:</span>
                  <span className="fw-semibold">{occupancy.contractAgreementId?.lockInPeriodMonths || 0} Months</span>
                </div>
                <div className="mb-2">
                  <span className="text-muted d-block">Notice Period:</span>
                  <span className="fw-semibold">{occupancy.contractAgreementId?.noticePeriodMonths || 1} Month</span>
                </div>
              </div>

              <div className="col-md-6">
                <h6 className="fw-bold border-bottom pb-2 mb-3">Rate Breakdown</h6>
                <div className="p-3 bg-light rounded-3">
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Base Rent / Fee:</span>
                    <span className="fw-semibold">₹{Number(occupancy.contractAgreementId?.baseRentOrFee || 0).toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">Maintenance Fee:</span>
                    <span className="fw-semibold">₹{Number(occupancy.contractAgreementId?.maintenanceAmount || 0).toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between mb-2">
                    <span className="text-muted">CAM Charges:</span>
                    <span className="fw-semibold">₹{Number(occupancy.contractAgreementId?.camCharges || 0).toLocaleString()}</span>
                  </div>
                  <div className="d-flex justify-content-between border-top pt-2">
                    <span className="fw-bold text-dark">Total Recurring Monthly:</span>
                    <span className="fw-bold text-primary">₹{Number(occupancy.monthlyAmount || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Document Management Section */}
              <div className="col-12 border-top pt-3">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h6 className="fw-bold mb-0">Attached Agreement Documents</h6>
                  <span className="badge bg-light text-muted border">
                    {occupancy.contractAgreementId?.documents?.length || 0} Document(s)
                  </span>
                </div>

                {/* Upload Document Box */}
                <form onSubmit={handleUploadDoc} className="card p-3 mb-3 bg-light border-dashed">
                  <div className="row g-2 align-items-center">
                    <div className="col-md-9">
                      <input
                        type="file"
                        className="form-control form-control-sm"
                        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                        disabled={uploading}
                        onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                      />
                    </div>
                    <div className="col-md-3">
                      <button
                        type="submit"
                        className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
                        disabled={uploading || !uploadFile}
                      >
                        {uploading ? (
                          <span className="spinner-border spinner-border-sm"></span>
                        ) : (
                          <>
                            <i className="bi bi-upload"></i> Upload PDF/Doc
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {uploadProgress !== null && (
                    <div className="mt-2">
                      <div className="d-flex justify-content-between small text-muted mb-1">
                        <span>Uploading...</span>
                        <span>{uploadProgress}%</span>
                      </div>
                      <div className="progress" style={{ height: '5px' }}>
                        <div
                          className="progress-bar bg-primary"
                          role="progressbar"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {uploadError && (
                    <div className="alert alert-danger py-1 px-2 mt-2 mb-0 small">{uploadError}</div>
                  )}
                </form>

                {/* Document List */}
                {(!occupancy.contractAgreementId?.documents || occupancy.contractAgreementId.documents.length === 0) ? (
                  <p className="text-muted small mb-0">No documents uploaded for this agreement yet.</p>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm table-bordered align-middle mb-0 bg-white">
                      <thead className="table-light small text-muted">
                        <tr>
                          <th>File Name</th>
                          <th>Size</th>
                          <th>Upload Date</th>
                          <th>Status</th>
                          <th className="text-end">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {occupancy.contractAgreementId.documents.map((doc: any) => (
                          <tr key={doc._id}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-file-earmark-pdf text-danger fs-5"></i>
                                <span className="fw-semibold">{doc.fileName}</span>
                              </div>
                            </td>
                            <td className="small text-muted">{doc.fileSize ? `${Math.round(doc.fileSize / 1024)} KB` : '—'}</td>
                            <td className="small text-muted">{new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString()}</td>
                            <td>
                              <span className="badge bg-secondary-subtle text-secondary small">{doc.status || 'ACTIVE'}</span>
                            </td>
                            <td className="text-end">
                              <a
                                href={`http://localhost:5000${doc.fileUrl}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="btn btn-outline-primary btn-sm py-0 px-2 me-1"
                                title="View / Download"
                              >
                                <i className="bi bi-box-arrow-up-right"></i>
                              </a>
                              <button
                                type="button"
                                onClick={() => handleDeleteDoc(doc._id)}
                                className="btn btn-outline-danger btn-sm py-0 px-2"
                                title="Delete"
                              >
                                <i className="bi bi-trash"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: ALLOCATION */}
          {activeTab === 'allocation' && (
            <div className="row g-4 small">
              <div className="col-md-6">
                <h6 className="fw-bold border-bottom pb-2 mb-3">Space Binding</h6>
                <div className="mb-2">
                  <span className="text-muted d-block">Allocation ID:</span>
                  <span className="fw-semibold">{occupancy.allocationId?.allocationCode || 'ALC-DIRECT'}</span>
                </div>
                <div className="mb-2">
                  <span className="text-muted d-block">Allocation Mode:</span>
                  <span className="badge bg-secondary-subtle text-secondary">{occupancy.allocationId?.allocationType || 'PERMANENT'}</span>
                </div>
                <div className="mb-2">
                  <span className="text-muted d-block">Target Unit:</span>
                  <span className="fw-semibold">Unit {occupancy.unitId?.wing ? `${occupancy.unitId.wing}-` : ''}{occupancy.unitId?.unitNumber}</span>
                </div>
              </div>

              <div className="col-md-6">
                <h6 className="fw-bold border-bottom pb-2 mb-3">Access & Parking Facilities</h6>
                <div className="p-3 bg-light rounded-3">
                  <div className="mb-2">
                    <span className="text-muted d-block">Access Clearance Level:</span>
                    <span className="fw-semibold">{occupancy.allocationId?.accessLevel || 'Standard'}</span>
                  </div>
                  <div>
                    <span className="text-muted d-block">Assigned Parking Bays:</span>
                    <span className="fw-semibold">
                      {occupancy.allocationId?.parkingSlots?.length ? occupancy.allocationId.parkingSlots.join(', ') : 'None allocated'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: AUDIT LOG */}
          {activeTab === 'audit' && (
            <div>
              <h6 className="fw-bold border-bottom pb-2 mb-3">Lifecycle Event Timeline</h6>
              {occupancy.auditLog?.length === 0 ? (
                <p className="text-muted small fst-italic">No audit entries recorded.</p>
              ) : (
                <ul className="list-group list-group-flush small">
                  {occupancy.auditLog.map((log: any, idx: number) => (
                    <li key={idx} className="list-group-item px-0 d-flex justify-content-between align-items-center">
                      <div>
                        <span className="fw-bold text-dark">{log.action?.replace(/_/g, ' ')}</span>
                        {log.remarks && <div className="text-muted">{log.remarks}</div>}
                      </div>
                      <span className="text-muted" style={{ fontSize: 11 }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
