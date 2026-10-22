'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function PropertiesPage() {
  const { organisation, user } = useAuth();
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'basic' | 'address' | 'contacts' | 'management' | 'modules'>('basic');
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('grid');

  // Filter states
  const [activeTypeFilter, setActiveTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cityFilter, setCityFilter] = useState<string>('ALL');

  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [selectedPropForArchive, setSelectedPropForArchive] = useState<any>(null);

  const orgType = organisation?.type?.toUpperCase() || '';

  // Allowed property types strictly based on the logged-in Organisation's type
  const allowedPropertyTypes = useMemo(() => {
    if (user?.isPlatformAdmin || !orgType || orgType === 'MIXED' || orgType === 'ENTERPRISE') {
      return [
        { value: 'RESIDENTIAL', label: 'Residential (Apartments & Communities)' },
        { value: 'COMMERCIAL', label: 'Commercial (Tech Park & Corporate Offices)' },
        { value: 'COWORKING', label: 'Co-working (Flexible Desks & Cabins)' }
      ];
    }
    if (orgType === 'COMMERCIAL') {
      return [{ value: 'COMMERCIAL', label: 'Commercial (Tech Park & Corporate Offices)' }];
    }
    if (orgType === 'COWORKING') {
      return [{ value: 'COWORKING', label: 'Co-working (Flexible Desks & Cabins)' }];
    }
    if (orgType === 'RESIDENTIAL') {
      return [{ value: 'RESIDENTIAL', label: 'Residential (Apartments & Communities)' }];
    }
    return [{ value: orgType, label: orgType }];
  }, [orgType, user?.isPlatformAdmin]);

  const getInitialFormState = () => ({
    name: '',
    code: '',
    propertyType: allowedPropertyTypes[0]?.value || orgType || 'RESIDENTIAL',
    description: '',
    logoUrl: '',
    coverImageUrl: '',
    status: 'ACTIVE',
    
    // Address
    address: organisation?.address || '',
    addressLine2: '',
    landmark: '',
    area: '',
    city: organisation?.city || '',
    state: organisation?.state || '',
    country: organisation?.country || 'India',
    pincode: organisation?.pincode || '',
    latitude: '',
    longitude: '',

    // Contacts
    propertyEmail: '',
    propertyPhone: '',
    emergencyContact: '',
    officeContactPerson: '',
    officeWorkingHours: '24/7',

    // Management & Area
    managerName: '',
    managerContact: '',
    financeManager: '',
    maintenanceManager: '',
    securityManager: '',
    startDate: '',
    totalLandArea: '',
    totalBuiltUpArea: '',
    commonArea: '',
    operatingHours: '24/7',

    // Modules
    modules: {
      visitor: true,
      parking: true,
      billing: true,
      complaints: true,
      amc: true,
      bookings: true,
      notifications: true,
      chat: true,
      accessControl: true
    }
  });

  const [formData, setFormData] = useState(getInitialFormState);

  const handleOpenCreateModal = () => {
    setErrorMsg(null);
    setModalMode('create');
    setEditingId(null);
    setActiveTab('basic');
    setFormData(getInitialFormState());
    setShowModal(true);
  };

  const handleOpenEditModal = (prop: any) => {
    setErrorMsg(null);
    setModalMode('edit');
    setEditingId(prop._id);
    setActiveTab('basic');
    setFormData({
      name: prop.name || '',
      code: prop.code || '',
      propertyType: prop.propertyType || allowedPropertyTypes[0]?.value || 'RESIDENTIAL',
      description: prop.description || '',
      logoUrl: prop.logoUrl || '',
      coverImageUrl: prop.coverImageUrl || '',
      status: prop.status || 'ACTIVE',
      address: prop.address || '',
      addressLine2: prop.addressLine2 || '',
      landmark: prop.landmark || '',
      area: prop.area || '',
      city: prop.city || '',
      state: prop.state || '',
      country: prop.country || 'India',
      pincode: prop.pincode || '',
      latitude: prop.latitude != null ? String(prop.latitude) : '',
      longitude: prop.longitude != null ? String(prop.longitude) : '',
      propertyEmail: prop.propertyEmail || '',
      propertyPhone: prop.propertyPhone || '',
      emergencyContact: prop.emergencyContact || '',
      officeContactPerson: prop.officeContactPerson || '',
      officeWorkingHours: prop.officeWorkingHours || '24/7',
      managerName: prop.managerName || '',
      managerContact: prop.managerContact || '',
      financeManager: prop.financeManager || '',
      maintenanceManager: prop.maintenanceManager || '',
      securityManager: prop.securityManager || '',
      startDate: prop.startDate ? prop.startDate.split('T')[0] : '',
      totalLandArea: prop.totalLandArea != null ? String(prop.totalLandArea) : '',
      totalBuiltUpArea: prop.totalBuiltUpArea != null ? String(prop.totalBuiltUpArea) : '',
      commonArea: prop.commonArea != null ? String(prop.commonArea) : '',
      operatingHours: prop.operatingHours || '24/7',
      modules: {
        visitor: prop.modules?.visitor !== false,
        parking: prop.modules?.parking !== false,
        billing: prop.modules?.billing !== false,
        complaints: prop.modules?.complaints !== false,
        amc: prop.modules?.amc !== false,
        bookings: prop.modules?.bookings !== false,
        notifications: prop.modules?.notifications !== false,
        chat: prop.modules?.chat !== false,
        accessControl: prop.modules?.accessControl !== false
      }
    });
    setShowModal(true);
  };

  const loadProperties = async () => {
    setLoading(true);
    try {
      const res = await apiClient.get('/properties');
      if (res.data.success) {
        setProperties(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load properties', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProperties();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setErrorMsg(null);

    const payload: any = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      latitude: formData.latitude ? Number(formData.latitude) : null,
      longitude: formData.longitude ? Number(formData.longitude) : null,
      totalLandArea: formData.totalLandArea ? Number(formData.totalLandArea) : 0,
      totalBuiltUpArea: formData.totalBuiltUpArea ? Number(formData.totalBuiltUpArea) : 0,
      commonArea: formData.commonArea ? Number(formData.commonArea) : 0
    };

    try {
      if (modalMode === 'create') {
        const res = await apiClient.post('/properties', payload);
        if (res.data.success) {
          setShowModal(false);
          loadProperties();
        }
      } else if (modalMode === 'edit' && editingId) {
        const res = await apiClient.put(`/properties/${editingId}`, payload);
        if (res.data.success) {
          setShowModal(false);
          loadProperties();
        }
      }
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Failed to save property');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchiveProperty = async () => {
    if (!selectedPropForArchive) return;
    try {
      const res = await apiClient.delete(`/properties/${selectedPropForArchive._id}`);
      if (res.data.success) {
        setShowArchiveConfirm(false);
        setSelectedPropForArchive(null);
        loadProperties();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to archive property');
    }
  };

  // Available unique cities for filtering
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    properties.forEach(p => { if (p.city) set.add(p.city); });
    return Array.from(set);
  }, [properties]);

  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      // Property type filter
      if (activeTypeFilter !== 'ALL' && p.propertyType !== activeTypeFilter) return false;
      // Status filter
      if (statusFilter !== 'ALL' && p.status !== statusFilter) return false;
      // City filter
      if (cityFilter !== 'ALL' && p.city !== cityFilter) return false;
      // Search query (name, code, manager, address)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = p.name?.toLowerCase().includes(q);
        const matchesCode = p.code?.toLowerCase().includes(q);
        const matchesManager = p.managerName?.toLowerCase().includes(q);
        const matchesCity = p.city?.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesManager && !matchesCity) return false;
      }
      return true;
    });
  }, [properties, activeTypeFilter, statusFilter, cityFilter, searchQuery]);

  return (
    <div>
      {/* Page Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom flex-wrap gap-2">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h2 className="fw-bold mb-0">Properties & Portfolios</h2>
            {organisation?.name && (
              <span className="badge bg-light text-primary border fw-semibold">
                {organisation.name} {orgType ? `• ${orgType}` : ''}
              </span>
            )}
          </div>
          <p className="text-secondary mb-0 small">
            Master real estate management, infrastructure scoping, and dynamic hierarchies
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* View toggle */}
          <div className="btn-group btn-group-sm" role="group">
            <button
              type="button"
              className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <i className="bi bi-grid-fill"></i>
            </button>
            <button
              type="button"
              className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <i className="bi bi-table"></i>
            </button>
          </div>

          <button onClick={handleOpenCreateModal} className="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm">
            <i className="bi bi-plus-lg"></i> Add Property
          </button>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="card border-0 shadow-sm mb-4 bg-white p-3 rounded-3">
        <div className="row g-2 align-items-center">
          {/* Property Type Tabs */}
          <div className="col-12 col-lg-6">
            <div className="d-flex align-items-center gap-1 flex-wrap">
              <button
                onClick={() => setActiveTypeFilter('ALL')}
                className={`btn btn-sm ${activeTypeFilter === 'ALL' ? 'btn-primary' : 'btn-outline-secondary'}`}
              >
                All ({properties.length})
              </button>
              {allowedPropertyTypes.map((t) => {
                const count = properties.filter((p) => p.propertyType === t.value).length;
                return (
                  <button
                    key={t.value}
                    onClick={() => setActiveTypeFilter(t.value)}
                    className={`btn btn-sm ${activeTypeFilter === t.value ? 'btn-primary' : 'btn-outline-secondary'}`}
                  >
                    {t.value} ({count})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Search, Status, and City Dropdowns */}
          <div className="col-12 col-lg-6">
            <div className="row g-2">
              <div className="col-md-5">
                <div className="input-group input-group-sm">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-search text-muted"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0"
                    placeholder="Search name, code, manager..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              <div className="col-md-4">
                <select
                  className="form-select form-select-sm"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">Status: All</option>
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                  <option value="DRAFT">Draft</option>
                  <option value="ARCHIVED">Archived</option>
                </select>
              </div>

              <div className="col-md-3">
                <select
                  className="form-select form-select-sm"
                  value={cityFilter}
                  onChange={(e) => setCityFilter(e.target.value)}
                >
                  <option value="ALL">City: All</option>
                  {availableCities.map((city) => (
                    <option key={city} value={city}>{city}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="col-12 text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="text-muted small mt-2">Loading properties portfolio...</p>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="col-12 text-center py-5 text-muted bg-white rounded border">
          <i className="bi bi-building-slash fs-1 d-block mb-2 text-secondary"></i>
          <h6 className="fw-bold">No properties found</h6>
          <p className="small mb-3">No properties match your active filter settings.</p>
          <button onClick={handleOpenCreateModal} className="btn btn-outline-primary btn-sm">
            <i className="bi bi-plus-lg me-1"></i> Add Property
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* GRID VIEW */
        <div className="row g-3">
          {filteredProperties.map((prop) => (
            <div key={prop._id} className="col-md-6 col-xl-4">
              <div className="pms-card p-4 h-100 d-flex flex-column justify-content-between shadow-sm">
                <div>
                  {/* Top Badge Row */}
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className={`badge ${
                      prop.propertyType === 'RESIDENTIAL'
                        ? 'bg-primary'
                        : prop.propertyType === 'COMMERCIAL'
                        ? 'bg-info text-dark'
                        : 'bg-success'
                    }`}>
                      {prop.propertyType}
                    </span>
                    <div className="d-flex align-items-center gap-1">
                      {prop.operatingHours && (
                        <span className="badge bg-light text-secondary border small" style={{ fontSize: '0.65rem' }}>
                          <i className="bi bi-clock me-1"></i>{prop.operatingHours}
                        </span>
                      )}
                      <span className={`badge ${
                        prop.status === 'ACTIVE'
                          ? 'badge-active'
                          : prop.status === 'UNDER_MAINTENANCE'
                          ? 'badge-warning-soft'
                          : 'badge-danger-soft'
                      }`}>
                        {prop.status?.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <h4 className="fw-bold text-dark mb-1">{prop.name}</h4>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span className="badge bg-light text-dark border fw-bold" style={{ fontSize: '0.72rem' }}>
                      CODE: {prop.code}
                    </span>
                    {prop.totalBuiltUpArea > 0 && (
                      <span className="small text-muted" style={{ fontSize: '0.75rem' }}>
                        <i className="bi bi-aspect-ratio me-1"></i>
                        {Number(prop.totalBuiltUpArea).toLocaleString()} sq.ft
                      </span>
                    )}
                  </div>

                  {/* Location Info */}
                  {(prop.address || prop.city || prop.state || prop.pincode) && (
                    <div className="small text-secondary mb-2 d-flex align-items-start gap-2">
                      <i className="bi bi-geo-alt text-primary mt-1"></i>
                      <div>
                        {[prop.address, prop.city, prop.state].filter(Boolean).join(', ')}
                        {prop.pincode ? ` - ${prop.pincode}` : ''}
                      </div>
                    </div>
                  )}

                  {/* Management Info */}
                  {prop.managerName && (
                    <div className="small text-secondary mb-1">
                      <i className="bi bi-person-badge text-primary me-1"></i>
                      Manager: <strong>{prop.managerName}</strong>
                      {prop.managerContact && ` (${prop.managerContact})`}
                    </div>
                  )}

                  {prop.emergencyContact && (
                    <div className="small text-danger mb-2">
                      <i className="bi bi-telephone-fill me-1"></i>
                      Emergency: <strong>{prop.emergencyContact}</strong>
                    </div>
                  )}
                </div>

                {/* Card Actions Footer */}
                <div className="pt-3 mt-3 border-top d-flex justify-content-between align-items-center">
                  <div className="btn-group btn-group-sm">
                    <button
                      onClick={() => handleOpenEditModal(prop)}
                      className="btn btn-outline-secondary btn-sm"
                      title="Edit Property"
                    >
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedPropForArchive(prop);
                        setShowArchiveConfirm(true);
                      }}
                      className="btn btn-outline-danger btn-sm"
                      title="Archive Property"
                    >
                      <i className="bi bi-archive"></i>
                    </button>
                  </div>

                  <Link href={`/properties/${prop._id}`} className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1">
                    <span>Hierarchy Tree</span>
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* TABLE VIEW */
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Property</th>
                  <th>Type</th>
                  <th>Location</th>
                  <th>Built-up Area</th>
                  <th>Manager</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProperties.map((prop) => (
                  <tr key={prop._id}>
                    <td>
                      <div className="fw-bold text-dark">{prop.name}</div>
                      <small className="text-muted">Code: {prop.code}</small>
                    </td>
                    <td>
                      <span className={`badge ${
                        prop.propertyType === 'RESIDENTIAL'
                          ? 'bg-primary'
                          : prop.propertyType === 'COMMERCIAL'
                          ? 'bg-info text-dark'
                          : 'bg-success'
                      }`}>
                        {prop.propertyType}
                      </span>
                    </td>
                    <td>
                      <div className="small">{prop.city || '—'}</div>
                      <small className="text-muted">{prop.state}</small>
                    </td>
                    <td>
                      <div className="small">
                        {prop.totalBuiltUpArea ? `${Number(prop.totalBuiltUpArea).toLocaleString()} sq.ft` : '—'}
                      </div>
                    </td>
                    <td>
                      <div className="small fw-semibold">{prop.managerName || '—'}</div>
                      <small className="text-muted">{prop.managerContact}</small>
                    </td>
                    <td>
                      <span className={`badge ${
                        prop.status === 'ACTIVE'
                          ? 'badge-active'
                          : prop.status === 'UNDER_MAINTENANCE'
                          ? 'badge-warning-soft'
                          : 'badge-danger-soft'
                      }`}>
                        {prop.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <Link href={`/properties/${prop._id}`} className="btn btn-outline-primary" title="View Hierarchy">
                          <i className="bi bi-diagram-3"></i>
                        </Link>
                        <button onClick={() => handleOpenEditModal(prop)} className="btn btn-outline-secondary" title="Edit">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedPropForArchive(prop);
                            setShowArchiveConfirm(true);
                          }}
                          className="btn btn-outline-danger"
                          title="Archive"
                        >
                          <i className="bi bi-archive"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Comprehensive Add / Edit Property Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060, overflowY: 'auto' }} tabIndex={-1}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable my-3">
            <form onSubmit={handleSubmit} className="modal-content shadow-lg border-0" style={{ maxHeight: '88vh' }}>
              {/* Modal Header */}
              <div className="modal-header bg-light flex-shrink-0">
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded p-2 bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
                    <i className={modalMode === 'create' ? 'bi bi-building-add' : 'bi bi-pencil-square'}></i>
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold mb-0">
                      {modalMode === 'create' ? 'Add New Property' : `Edit Property: ${formData.name}`}
                    </h5>
                    <small className="text-muted">Configure hierarchy domain, address, contacts, and enabled modules</small>
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              {/* Navigation Tabs Inside Modal */}
              <div className="border-bottom bg-light px-3 pt-2 flex-shrink-0">
                <ul className="nav nav-tabs card-header-tabs small fw-semibold">
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link ${activeTab === 'basic' ? 'active text-primary' : 'text-secondary'}`}
                      onClick={() => setActiveTab('basic')}
                    >
                      <i className="bi bi-info-circle me-1"></i> Basic Details
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link ${activeTab === 'address' ? 'active text-primary' : 'text-secondary'}`}
                      onClick={() => setActiveTab('address')}
                    >
                      <i className="bi bi-geo-alt me-1"></i> Address
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link ${activeTab === 'contacts' ? 'active text-primary' : 'text-secondary'}`}
                      onClick={() => setActiveTab('contacts')}
                    >
                      <i className="bi bi-telephone me-1"></i> Contacts
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link ${activeTab === 'management' ? 'active text-primary' : 'text-secondary'}`}
                      onClick={() => setActiveTab('management')}
                    >
                      <i className="bi bi-person-badge me-1"></i> Management & Specs
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link ${activeTab === 'modules' ? 'active text-primary' : 'text-secondary'}`}
                      onClick={() => setActiveTab('modules')}
                    >
                      <i className="bi bi-toggles me-1"></i> Module Settings
                    </button>
                  </li>
                </ul>
              </div>

              {/* Modal Body */}
              <div className="modal-body p-4 overflow-y-auto" style={{ maxHeight: 'calc(88vh - 170px)', scrollbarWidth: 'thin' }}>
                {errorMsg && (
                  <div className="alert alert-danger alert-dismissible fade show small mb-3" role="alert">
                    <i className="bi bi-exclamation-triangle-fill me-2"></i>
                    {errorMsg}
                  </div>
                )}

                {/* TAB 1: BASIC INFORMATION */}
                {activeTab === 'basic' && (
                  <div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">
                          Property Name <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          placeholder="Enter property name"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">
                          Property Code <span className="text-danger">*</span>
                        </label>
                        <input
                          type="text"
                          className="form-control text-uppercase"
                          required
                          placeholder="Unique code (e.g. TOWER-A)"
                          value={formData.code}
                          onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">
                          Property Type <span className="text-danger">*</span>
                        </label>
                        <select
                          className="form-select"
                          value={formData.propertyType}
                          onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                        >
                          {allowedPropertyTypes.map((t) => (
                            <option key={t.value} value={t.value}>{t.label}</option>
                          ))}
                        </select>
                        {allowedPropertyTypes.length === 1 && orgType && (
                          <small className="text-muted d-block mt-1" style={{ fontSize: '0.72rem' }}>
                            Scoped to organisation type: <strong className="text-primary">{orgType}</strong>
                          </small>
                        )}
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Operational Status</label>
                        <select
                          className="form-select"
                          value={formData.status}
                          onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                        >
                          <option value="ACTIVE">ACTIVE</option>
                          <option value="DRAFT">DRAFT</option>
                          <option value="UNDER_MAINTENANCE">UNDER MAINTENANCE</option>
                          <option value="INACTIVE">INACTIVE</option>
                        </select>
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-semibold">Description</label>
                        <textarea
                          rows={2}
                          className="form-control"
                          placeholder="Brief description of the property, campus, or complex"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Logo URL</label>
                        <input
                          type="url"
                          className="form-control"
                          placeholder="https://example.com/logo.png"
                          value={formData.logoUrl}
                          onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Cover Image URL</label>
                        <input
                          type="url"
                          className="form-control"
                          placeholder="https://example.com/cover.jpg"
                          value={formData.coverImageUrl}
                          onChange={(e) => setFormData({ ...formData, coverImageUrl: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 2: ADDRESS & LOCATION */}
                {activeTab === 'address' && (
                  <div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Address Line 1 <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          placeholder="Street, building name, road"
                          value={formData.address}
                          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Address Line 2</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Suite, floor, landmark extension"
                          value={formData.addressLine2}
                          onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Landmark</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Prominent landmark nearby"
                          value={formData.landmark}
                          onChange={(e) => setFormData({ ...formData, landmark: e.target.value })}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Area / Sector</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Neighborhood or sector name"
                          value={formData.area}
                          onChange={(e) => setFormData({ ...formData, area: e.target.value })}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">City <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          placeholder="City"
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">State <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          placeholder="State"
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">PIN / Postal Code <span className="text-danger">*</span></label>
                        <input
                          type="text"
                          className="form-control"
                          required
                          placeholder="PIN Code"
                          value={formData.pincode}
                          onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">Country</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.country}
                          onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">Latitude</label>
                        <input
                          type="number"
                          step="any"
                          className="form-control"
                          placeholder="e.g. 19.0760"
                          value={formData.latitude}
                          onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">Longitude</label>
                        <input
                          type="number"
                          step="any"
                          className="form-control"
                          placeholder="e.g. 72.8777"
                          value={formData.longitude}
                          onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 3: CONTACTS */}
                {activeTab === 'contacts' && (
                  <div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Property Email</label>
                        <input
                          type="email"
                          className="form-control"
                          placeholder="property@example.com"
                          value={formData.propertyEmail}
                          onChange={(e) => setFormData({ ...formData, propertyEmail: e.target.value })}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Property Phone</label>
                        <input
                          type="tel"
                          className="form-control"
                          placeholder="General reception phone"
                          value={formData.propertyPhone}
                          onChange={(e) => setFormData({ ...formData, propertyPhone: e.target.value })}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Emergency Helpline Number</label>
                        <input
                          type="tel"
                          className="form-control text-danger fw-semibold"
                          placeholder="24/7 Gate / Security Helpline"
                          value={formData.emergencyContact}
                          onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Office Contact Person</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Key point of contact"
                          value={formData.officeContactPerson}
                          onChange={(e) => setFormData({ ...formData, officeContactPerson: e.target.value })}
                        />
                      </div>

                      <div className="col-12">
                        <label className="form-label small fw-semibold">Office Working Hours</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. Monday - Saturday, 09:00 AM - 07:00 PM"
                          value={formData.officeWorkingHours}
                          onChange={(e) => setFormData({ ...formData, officeWorkingHours: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 4: MANAGEMENT & AREA SPECS */}
                {activeTab === 'management' && (
                  <div>
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Property Manager Name</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Assigned Manager Name"
                          value={formData.managerName}
                          onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Manager Contact Phone</label>
                        <input
                          type="tel"
                          className="form-control"
                          placeholder="Manager direct phone"
                          value={formData.managerContact}
                          onChange={(e) => setFormData({ ...formData, managerContact: e.target.value })}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">Finance Manager</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Finance / Accounts lead"
                          value={formData.financeManager}
                          onChange={(e) => setFormData({ ...formData, financeManager: e.target.value })}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">Maintenance Manager</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Facility / Engineering lead"
                          value={formData.maintenanceManager}
                          onChange={(e) => setFormData({ ...formData, maintenanceManager: e.target.value })}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">Security Manager</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="Security chief / supervisor"
                          value={formData.securityManager}
                          onChange={(e) => setFormData({ ...formData, securityManager: e.target.value })}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Operational Start Date</label>
                        <input
                          type="date"
                          className="form-control"
                          value={formData.startDate}
                          onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                        />
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Campus Operating Hours</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g. 24/7 or 06:00 - 23:00"
                          value={formData.operatingHours}
                          onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">Total Land Area (sq. ft.)</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          placeholder="Total plot area"
                          value={formData.totalLandArea}
                          onChange={(e) => setFormData({ ...formData, totalLandArea: e.target.value })}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">Total Built-Up Area (sq. ft.)</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          placeholder="Constructed area"
                          value={formData.totalBuiltUpArea}
                          onChange={(e) => setFormData({ ...formData, totalBuiltUpArea: e.target.value })}
                        />
                      </div>

                      <div className="col-md-4">
                        <label className="form-label small fw-semibold">Common Amenity Area (sq. ft.)</label>
                        <input
                          type="number"
                          min="0"
                          className="form-control"
                          placeholder="Lobbies, gardens, clubs"
                          value={formData.commonArea}
                          onChange={(e) => setFormData({ ...formData, commonArea: e.target.value })}
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 5: MODULE SETTINGS */}
                {activeTab === 'modules' && (
                  <div>
                    <p className="small text-muted mb-3">
                      Control which business operational modules are active for this property. Disabled modules will be hidden from property users and dashboards.
                    </p>
                    <div className="row g-3">
                      {[
                        { key: 'visitor', label: 'Visitor & Gate Pass Management', icon: 'bi-person-badge' },
                        { key: 'parking', label: 'Parking & Vehicle Management', icon: 'bi-p-square' },
                        { key: 'billing', label: 'Automated Billing & Invoices', icon: 'bi-receipt' },
                        { key: 'complaints', label: 'Helpdesk & Complaints SLA', icon: 'bi-tools' },
                        { key: 'amc', label: 'AMC & Asset Maintenance', icon: 'bi-cpu' },
                        { key: 'bookings', label: 'Amenity & Meeting Room Bookings', icon: 'bi-calendar2-check' },
                        { key: 'notifications', label: 'Broadcasting & Alerts', icon: 'bi-bell' },
                        { key: 'chat', label: 'Internal Community Chat', icon: 'bi-chat-dots' },
                        { key: 'accessControl', label: 'Smart Access Control & RFID', icon: 'bi-shield-check' }
                      ].map((mod) => (
                        <div key={mod.key} className="col-md-6">
                          <div className="p-3 border rounded-3 d-flex align-items-center justify-content-between bg-light">
                            <div className="d-flex align-items-center gap-2">
                              <i className={`bi ${mod.icon} text-primary fs-5`}></i>
                              <span className="small fw-semibold text-dark">{mod.label}</span>
                            </div>
                            <div className="form-check form-switch mb-0">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={(formData.modules as any)[mod.key]}
                                onChange={(e) =>
                                  setFormData({
                                    ...formData,
                                    modules: {
                                      ...formData.modules,
                                      [mod.key]: e.target.checked
                                    }
                                  })
                                }
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="modal-footer bg-light flex-shrink-0 d-flex justify-content-between">
                <div>
                  {activeTab !== 'basic' && (
                    <button
                      type="button"
                      className="btn btn-outline-secondary btn-sm me-1"
                      onClick={() => {
                        const tabs: Array<'basic' | 'address' | 'contacts' | 'management' | 'modules'> = [
                          'basic', 'address', 'contacts', 'management', 'modules'
                        ];
                        const prevIdx = tabs.indexOf(activeTab) - 1;
                        if (prevIdx >= 0) setActiveTab(tabs[prevIdx]);
                      }}
                    >
                      <i className="bi bi-arrow-left me-1"></i> Previous
                    </button>
                  )}
                  {activeTab !== 'modules' && (
                    <button
                      type="button"
                      className="btn btn-outline-primary btn-sm"
                      onClick={() => {
                        const tabs: Array<'basic' | 'address' | 'contacts' | 'management' | 'modules'> = [
                          'basic', 'address', 'contacts', 'management', 'modules'
                        ];
                        const nextIdx = tabs.indexOf(activeTab) + 1;
                        if (nextIdx < tabs.length) setActiveTab(tabs[nextIdx]);
                      }}
                    >
                      Next <i className="bi bi-arrow-right ms-1"></i>
                    </button>
                  )}
                </div>

                <div className="d-flex gap-2">
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => setShowModal(false)}
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm px-3"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-1" role="status"></span>
                        Saving...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-lg me-1"></i>
                        {modalMode === 'create' ? 'Create Property' : 'Save Changes'}
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Archive / Deactivate Confirmation Modal */}
      {showArchiveConfirm && selectedPropForArchive && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1070 }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow">
              <div className="modal-header bg-danger text-white">
                <h5 className="modal-title fw-bold mb-0">Archive Property</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowArchiveConfirm(false)}></button>
              </div>
              <div className="modal-body p-4">
                <p className="mb-2">
                  Are you sure you want to archive <strong>{selectedPropForArchive.name}</strong> ({selectedPropForArchive.code})?
                </p>
                <div className="alert alert-warning small mb-0">
                  <i className="bi bi-exclamation-triangle-fill me-1"></i>
                  Archiving this property will freeze its buildings, floors, and active units from public booking or billing. You can reactivate it later from the Settings tab.
                </div>
              </div>
              <div className="modal-footer bg-light">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowArchiveConfirm(false)}>
                  Cancel
                </button>
                <button type="button" className="btn btn-danger btn-sm" onClick={handleArchiveProperty}>
                  Yes, Archive Property
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
