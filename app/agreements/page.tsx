'use client';

import React, { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { apiClient } from '../../lib/apiClient';
import { LoadingSkeleton } from '../../components/common/LoadingSkeleton';
import { EmptyState } from '../../components/common/EmptyState';
import { ErrorState } from '../../components/common/ErrorState';

export default function AgreementsPage() {
  const [agreements, setAgreements] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Document Management Modal State
  const [activeAgreementForDocs, setActiveAgreementForDocs] = useState<any | null>(null);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDocStatus, setUploadDocStatus] = useState('ACTIVE');
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');

  // Quick Edit Modal State
  const [editingAgreement, setEditingAgreement] = useState<any | null>(null);
  const [editForm, setEditForm] = useState<any>({
    baseRentOrFee: 0,
    maintenanceAmount: 0,
    securityDeposit: 0,
    status: 'ACTIVE',
    billingCycle: 'MONTHLY',
    paymentDueDate: 5,
    startDate: '',
    endDate: '',
    notes: ''
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [agrRes, propRes] = await Promise.all([
        apiClient.get('/occupancies/agreements', {
          params: {
            propertyId: selectedPropertyId || undefined,
            status: selectedStatus !== 'ALL' ? selectedStatus : undefined,
            search: search.trim() || undefined
          }
        }),
        apiClient.get('/properties')
      ]);

      if (agrRes.data.success) {
        setAgreements(agrRes.data.data);
      }
      if (propRes.data.success) {
        setProperties(propRes.data.data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Failed to load agreements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedPropertyId, selectedStatus]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const filteredAgreements = useMemo(() => {
    return agreements.filter(a => {
      if (selectedType !== 'ALL') {
        const pType = a.propertyId?.propertyType || '';
        if (pType !== selectedType) return false;
      }
      return true;
    });
  }, [agreements, selectedType]);

  // Open Document Modal & Fetch Fresh Agreement Details
  const handleOpenDocsModal = async (agr: any) => {
    setActiveAgreementForDocs(agr);
    setUploadFile(null);
    setUploadProgress(null);
    setUploadError('');
    try {
      const res = await apiClient.get(`/occupancies/agreements/${agr._id}`);
      if (res.data.success) {
        setActiveAgreementForDocs(res.data.data);
      }
    } catch (err) {
      console.error('Failed to refresh agreement details', err);
    }
  };

  // Upload Document with Progress
  const handleUploadDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile || !activeAgreementForDocs) {
      setUploadError('Please select a file to upload');
      return;
    }

    setUploading(true);
    setUploadProgress(0);
    setUploadError('');

    const formData = new FormData();
    formData.append('file', uploadFile);
    formData.append('status', uploadDocStatus);

    try {
      const res = await apiClient.post(
        `/occupancies/agreements/${activeAgreementForDocs._id}/documents`,
        formData,
        {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
              const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
              setUploadProgress(percentCompleted);
            }
          }
        }
      );

      if (res.data.success) {
        setUploadFile(null);
        setUploadProgress(100);
        // Refresh agreement details
        const refreshed = await apiClient.get(`/occupancies/agreements/${activeAgreementForDocs._id}`);
        if (refreshed.data.success) {
          setActiveAgreementForDocs(refreshed.data.data);
        }
        loadData();
      }
    } catch (err: any) {
      setUploadError(err.response?.data?.message || err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  // Delete Document
  const handleDeleteDoc = async (docId: string) => {
    if (!confirm('Are you sure you want to remove this document?')) return;
    try {
      const res = await apiClient.delete(
        `/occupancies/agreements/${activeAgreementForDocs._id}/documents/${docId}`
      );
      if (res.data.success) {
        const refreshed = await apiClient.get(`/occupancies/agreements/${activeAgreementForDocs._id}`);
        if (refreshed.data.success) {
          setActiveAgreementForDocs(refreshed.data.data);
        }
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete document');
    }
  };

  // Open Edit Modal
  const handleOpenEdit = (agr: any) => {
    setEditingAgreement(agr);
    setEditForm({
      baseRentOrFee: agr.baseRentOrFee || 0,
      maintenanceAmount: agr.maintenanceAmount || 0,
      securityDeposit: agr.securityDeposit || 0,
      status: agr.status || 'ACTIVE',
      billingCycle: agr.billingCycle || 'MONTHLY',
      paymentDueDate: agr.paymentDueDate || 5,
      startDate: agr.startDate ? new Date(agr.startDate).toISOString().split('T')[0] : '',
      endDate: agr.endDate ? new Date(agr.endDate).toISOString().split('T')[0] : '',
      notes: agr.notes || ''
    });
  };

  // Submit Edit Form
  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAgreement) return;

    setSavingEdit(true);
    try {
      const res = await apiClient.put(`/occupancies/agreements/${editingAgreement._id}`, editForm);
      if (res.data.success) {
        setEditingAgreement(null);
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || err.message || 'Failed to update agreement');
    } finally {
      setSavingEdit(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <span className="badge bg-success-subtle text-success border border-success-subtle px-2 py-1">Active</span>;
      case 'PENDING_APPROVAL':
        return <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-1">Pending Approval</span>;
      case 'DRAFT':
        return <span className="badge bg-secondary-subtle text-secondary border border-secondary-subtle px-2 py-1">Draft</span>;
      case 'TERMINATED':
        return <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-1">Terminated</span>;
      case 'EXPIRED':
        return <span className="badge bg-dark-subtle text-dark border border-dark-subtle px-2 py-1">Expired</span>;
      default:
        return <span className="badge bg-light text-muted border px-2 py-1">{status}</span>;
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(val || 0);
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="container-fluid p-0">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <h2 className="fw-bold mb-1">Contract Agreements & Documents</h2>
          <p className="text-secondary mb-0 small">
            End-to-end management of Residential Agreements, Commercial Leases, Coworking Memberships & Document Uploads
          </p>
        </div>
        <div className="d-flex gap-2">
          <Link href="/occupancies/new" className="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm">
            <i className="bi bi-plus-circle"></i> New Occupancy & Agreement
          </Link>
        </div>
      </div>

      {/* Filter Ribbon */}
      <div className="card shadow-sm border-0 mb-4">
        <div className="card-body p-3">
          {/* Portfolio Type Tabs */}
          <ul className="nav nav-pills mb-3 gap-2">
            {[
              { id: 'ALL', label: 'All Portfolios', icon: 'bi-grid' },
              { id: 'RESIDENTIAL', label: 'Residential', icon: 'bi-house-door' },
              { id: 'COMMERCIAL', label: 'Commercial Leases', icon: 'bi-building' },
              { id: 'COWORKING', label: 'Co-working Memberships', icon: 'bi-laptop' }
            ].map(tab => (
              <li className="nav-item" key={tab.id}>
                <button
                  onClick={() => setSelectedType(tab.id)}
                  className={`nav-link py-1 px-3 small d-flex align-items-center gap-2 ${selectedType === tab.id ? 'active' : 'bg-light text-dark'}`}
                  style={{ borderRadius: '20px' }}
                >
                  <i className={`bi ${tab.icon}`}></i>
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>

          {/* Search and Dropdowns */}
          <form onSubmit={handleSearchSubmit} className="row g-2 align-items-center">
            <div className="col-md-4">
              <div className="input-group input-group-sm">
                <span className="input-group-text bg-white"><i className="bi bi-search"></i></span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search contract #, owner, occupant..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="col-md-3">
              <select
                className="form-select form-select-sm"
                value={selectedPropertyId}
                onChange={(e) => setSelectedPropertyId(e.target.value)}
              >
                <option value="">All Properties</option>
                {properties.map(p => (
                  <option key={p._id} value={p._id}>{p.name} ({p.propertyType})</option>
                ))}
              </select>
            </div>

            <div className="col-md-3">
              <select
                className="form-select form-select-sm"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="DRAFT">Draft</option>
                <option value="EXPIRING_SOON">Expiring Soon</option>
                <option value="TERMINATED">Terminated</option>
                <option value="EXPIRED">Expired</option>
              </select>
            </div>

            <div className="col-md-2 d-flex gap-2">
              <button type="submit" className="btn btn-sm btn-outline-primary flex-grow-1">
                Filter
              </button>
              <button
                type="button"
                onClick={() => { setSearch(''); setSelectedPropertyId(''); setSelectedStatus('ALL'); setSelectedType('ALL'); }}
                className="btn btn-sm btn-light border"
              >
                Reset
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Content */}
      {loading ? (
        <LoadingSkeleton />
      ) : error ? (
        <ErrorState message={error} onRetry={loadData} />
      ) : filteredAgreements.length === 0 ? (
        <EmptyState
          title="No Agreements Found"
          description="There are no contract agreements matching the selected filter criteria."
          actionText="Create New Occupancy"
          onAction={() => window.location.href = '/occupancies/new'}
        />
      ) : (
        <div className="card shadow-sm border-0">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr className="small text-muted text-uppercase">
                  <th>Contract Details</th>
                  <th>Hierarchy (Property / Unit)</th>
                  <th>Linked Party</th>
                  <th>Financials</th>
                  <th>Documents</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAgreements.map(agr => {
                  const docCount = agr.documents?.length || 0;
                  const partyName =
                    agr.residentId?.name ||
                    agr.tenantCompanyId?.companyName ||
                    agr.coworkingMemberId?.memberName ||
                    agr.ownerName ||
                    'Unassigned';

                  return (
                    <tr key={agr._id}>
                      <td>
                        <div className="fw-bold text-primary font-monospace">{agr.contractNumber}</div>
                        <div className="small text-muted">
                          {agr.contractType?.replace(/_/g, ' ')}
                        </div>
                        <div className="text-muted" style={{ fontSize: '11px' }}>
                          {new Date(agr.startDate).toLocaleDateString()} {agr.endDate ? `→ ${new Date(agr.endDate).toLocaleDateString()}` : '(Ongoing)'}
                        </div>
                      </td>

                      <td>
                        <div className="fw-semibold">{agr.propertyId?.name || 'Property'}</div>
                        <div className="small text-muted">
                          {agr.buildingId?.name ? `${agr.buildingId.name} • ` : ''}
                          {agr.floorId?.floorName ? `${agr.floorId.floorName} • ` : ''}
                          <span className="badge bg-light text-dark border">
                            {agr.unitId?.unitNumber || 'Unit'}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="fw-semibold">{partyName}</div>
                        <div className="small text-muted">{agr.partyType?.replace(/_/g, ' ')}</div>
                      </td>

                      <td>
                        <div className="fw-bold text-dark">
                          {formatCurrency(agr.baseRentOrFee)} <span className="small text-muted fw-normal">/{agr.billingCycle?.toLowerCase() || 'mo'}</span>
                        </div>
                        {agr.securityDeposit > 0 && (
                          <div className="small text-muted" style={{ fontSize: '11px' }}>
                            Dep: {formatCurrency(agr.securityDeposit)}
                          </div>
                        )}
                      </td>

                      <td>
                        {docCount > 0 ? (
                          <button
                            onClick={() => handleOpenDocsModal(agr)}
                            className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1 py-0 px-2"
                            style={{ fontSize: '12px' }}
                          >
                            <i className="bi bi-file-earmark-pdf text-danger"></i>
                            {docCount} {docCount === 1 ? 'Doc' : 'Docs'}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleOpenDocsModal(agr)}
                            className="btn btn-sm btn-light border text-muted py-0 px-2"
                            style={{ fontSize: '12px' }}
                          >
                            <i className="bi bi-upload"></i> Upload
                          </button>
                        )}
                      </td>

                      <td>{getStatusBadge(agr.status)}</td>

                      <td className="text-end">
                        <div className="btn-group btn-group-sm">
                          <button
                            onClick={() => handleOpenDocsModal(agr)}
                            className="btn btn-light border text-primary"
                            title="Manage Documents"
                          >
                            <i className="bi bi-paperclip"></i>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(agr)}
                            className="btn btn-light border text-secondary"
                            title="Edit Terms"
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          {agr.occupancyId?._id && (
                            <Link
                              href={`/occupancies/${agr.occupancyId._id}`}
                              className="btn btn-light border text-success"
                              title="View Full Occupancy"
                            >
                              <i className="bi bi-box-arrow-up-right"></i>
                            </Link>
                          )}
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

      {/* Document Upload & Management Modal */}
      {activeAgreementForDocs && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light">
                <div>
                  <h5 className="modal-title fw-bold mb-0">
                    Agreement Documents: {activeAgreementForDocs.contractNumber}
                  </h5>
                  <small className="text-muted">
                    {activeAgreementForDocs.propertyId?.name} • Unit {activeAgreementForDocs.unitId?.unitNumber}
                  </small>
                </div>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setActiveAgreementForDocs(null)}
                ></button>
              </div>

              <div className="modal-body p-4">
                {/* Upload Form */}
                <div className="card border-dashed p-3 mb-4 bg-light">
                  <h6 className="fw-bold mb-2 small text-uppercase text-muted">Upload Document (PDF / DOC / Images)</h6>
                  <form onSubmit={handleUploadDocument}>
                    <div className="row g-2 align-items-center">
                      <div className="col-md-7">
                        <input
                          type="file"
                          className="form-control form-control-sm"
                          accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
                          disabled={uploading}
                          onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
                        />
                      </div>
                      <div className="col-md-3">
                        <select
                          className="form-select form-select-sm"
                          value={uploadDocStatus}
                          disabled={uploading}
                          onChange={(e) => setUploadDocStatus(e.target.value)}
                        >
                          <option value="ACTIVE">Active</option>
                          <option value="PENDING_SIGNATURE">Pending Signature</option>
                          <option value="SUPERSEDED">Superseded</option>
                          <option value="EXPIRED">Expired</option>
                        </select>
                      </div>
                      <div className="col-md-2">
                        <button
                          type="submit"
                          className="btn btn-primary btn-sm w-100 d-flex align-items-center justify-content-center gap-1"
                          disabled={uploading || !uploadFile}
                        >
                          {uploading ? (
                            <span className="spinner-border spinner-border-sm"></span>
                          ) : (
                            <>
                              <i className="bi bi-upload"></i> Upload
                            </>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Live Progress Bar */}
                    {uploadProgress !== null && (
                      <div className="mt-3">
                        <div className="d-flex justify-content-between small text-muted mb-1">
                          <span>Uploading...</span>
                          <span>{uploadProgress}%</span>
                        </div>
                        <div className="progress" style={{ height: '6px' }}>
                          <div
                            className="progress-bar bg-primary"
                            role="progressbar"
                            style={{ width: `${uploadProgress}%` }}
                            aria-valuenow={uploadProgress}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          ></div>
                        </div>
                      </div>
                    )}

                    {uploadError && (
                      <div className="alert alert-danger py-1 px-2 mt-2 mb-0 small">
                        {uploadError}
                      </div>
                    )}
                  </form>
                </div>

                {/* Document List */}
                <h6 className="fw-bold mb-3 small text-uppercase text-muted">Uploaded Documents</h6>
                {(!activeAgreementForDocs.documents || activeAgreementForDocs.documents.length === 0) ? (
                  <div className="text-center py-4 text-muted bg-white border rounded">
                    <i className="bi bi-file-earmark-x fs-1 text-secondary mb-2 d-block"></i>
                    No documents uploaded yet for this contract.
                  </div>
                ) : (
                  <div className="table-responsive">
                    <table className="table table-sm table-bordered align-middle">
                      <thead className="table-light small text-muted">
                        <tr>
                          <th>File Name</th>
                          <th>Size</th>
                          <th>Uploaded By</th>
                          <th>Date</th>
                          <th>Status</th>
                          <th className="text-end">Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {activeAgreementForDocs.documents.map((doc: any) => (
                          <tr key={doc._id}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <i className="bi bi-file-earmark-pdf text-danger fs-5"></i>
                                <span className="fw-semibold text-truncate" style={{ maxWidth: '200px' }}>
                                  {doc.fileName}
                                </span>
                              </div>
                            </td>
                            <td className="small text-muted">{formatFileSize(doc.fileSize)}</td>
                            <td className="small text-muted">
                              {doc.uploadedBy?.firstName ? `${doc.uploadedBy.firstName} ${doc.uploadedBy.lastName || ''}` : 'Admin'}
                            </td>
                            <td className="small text-muted">
                              {new Date(doc.uploadedAt || doc.createdAt).toLocaleDateString()}
                            </td>
                            <td>
                              <span className="badge bg-secondary-subtle text-secondary small">
                                {doc.status || 'ACTIVE'}
                              </span>
                            </td>
                            <td className="text-end">
                              <div className="btn-group btn-group-sm">
                                <a
                                  href={`http://localhost:5000${doc.fileUrl}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="btn btn-outline-primary btn-sm py-0 px-2"
                                  title="View / Download"
                                >
                                  <i className="bi bi-box-arrow-up-right"></i>
                                </a>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteDoc(doc._id)}
                                  className="btn btn-outline-danger btn-sm py-0 px-2"
                                  title="Delete Document"
                                >
                                  <i className="bi bi-trash"></i>
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div className="modal-footer bg-light py-2">
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveAgreementForDocs(null)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Agreement Modal */}
      {editingAgreement && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content border-0 shadow">
              <div className="modal-header bg-light">
                <h5 className="modal-title fw-bold">Edit Agreement: {editingAgreement.contractNumber}</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setEditingAgreement(null)}
                ></button>
              </div>
              <form onSubmit={handleSaveEdit}>
                <div className="modal-body p-4">
                  <div className="alert alert-info py-2 px-3 small mb-3">
                    <i className="bi bi-info-circle me-1"></i> Changes to rent, deposit, or status will instantly synchronize with the linked Occupancy and Unit records.
                  </div>

                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Monthly Base Rent / Fee (₹)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={editForm.baseRentOrFee}
                        onChange={(e) => setEditForm({ ...editForm, baseRentOrFee: Number(e.target.value) })}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Maintenance Amount (₹)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={editForm.maintenanceAmount}
                        onChange={(e) => setEditForm({ ...editForm, maintenanceAmount: Number(e.target.value) })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Security Deposit (₹)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={editForm.securityDeposit}
                        onChange={(e) => setEditForm({ ...editForm, securityDeposit: Number(e.target.value) })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Agreement Status</label>
                      <select
                        className="form-select form-select-sm"
                        value={editForm.status}
                        onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="PENDING_APPROVAL">Pending Approval</option>
                        <option value="DRAFT">Draft</option>
                        <option value="TERMINATED">Terminated</option>
                        <option value="EXPIRED">Expired</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Start Date</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={editForm.startDate}
                        onChange={(e) => setEditForm({ ...editForm, startDate: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">End Date</label>
                      <input
                        type="date"
                        className="form-control form-control-sm"
                        value={editForm.endDate}
                        onChange={(e) => setEditForm({ ...editForm, endDate: e.target.value })}
                      />
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Notes / Terms Remark</label>
                      <textarea
                        className="form-control form-control-sm"
                        rows={2}
                        value={editForm.notes}
                        onChange={(e) => setEditForm({ ...editForm, notes: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                </div>

                <div className="modal-footer bg-light py-2">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setEditingAgreement(null)}
                    disabled={savingEdit}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm d-flex align-items-center gap-1"
                    disabled={savingEdit}
                  >
                    {savingEdit && <span className="spinner-border spinner-border-sm"></span>}
                    Save & Sync Occupancy
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
