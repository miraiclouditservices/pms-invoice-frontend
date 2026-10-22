'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function BuildingsPage() {
  const searchParams = useSearchParams();
  const initialPropertyParam = searchParams.get('propertyId') || '';

  const { organisation, user, activeProperty } = useAuth();
  const [buildings, setBuildings] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(initialPropertyParam);
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [submitting, setSubmitting] = useState(false);

  // Active property object for dynamic scoping
  const currentSelectedProperty = useMemo(() => {
    return properties.find(p => p._id === selectedPropertyId) || activeProperty || properties[0] || null;
  }, [properties, selectedPropertyId, activeProperty]);

  const currentPropType = currentSelectedProperty?.propertyType?.toUpperCase() || 'RESIDENTIAL';

  // Dynamic Building Types based on Property Type
  const allowedBuildingTypes = useMemo(() => {
    if (currentPropType === 'COMMERCIAL') {
      return [
        { value: 'MAIN_BUILDING', label: 'Main Commercial Building' },
        { value: 'WING', label: 'Building Wing' },
        { value: 'ANNEX', label: 'Annex Block' },
        { value: 'RETAIL_BLOCK', label: 'Retail & Commercial Arcade' }
      ];
    }
    if (currentPropType === 'COWORKING') {
      return [
        { value: 'WORKSPACE_CENTRE', label: 'Workspace Centre' },
        { value: 'BUILDING', label: 'Hub Building' },
        { value: 'CENTRE_WING', label: 'Centre Wing' },
        { value: 'DEDICATED_ZONE', label: 'Dedicated Zone' }
      ];
    }
    // Apartment / Residential default
    return [
      { value: 'TOWER', label: 'Residential Tower' },
      { value: 'BLOCK', label: 'Apartment Block' },
      { value: 'VILLA_BLOCK', label: 'Row House / Villa Block' }
    ];
  }, [currentPropType]);

  const getInitialForm = () => ({
    propertyId: selectedPropertyId || currentSelectedProperty?._id || '',
    name: '',
    code: '',
    buildingType: allowedBuildingTypes[0]?.value || 'BLOCK',
    description: '',
    totalFloors: 1,
    basementFloors: 0,
    groundFloorAvailable: true,
    totalUnits: 0,
    totalBuiltUpArea: '',
    constructionYear: '',
    liftCount: 1,
    staircaseCount: 1,
    parkingCapacity: '',
    fireSafetyAvailable: true,
    generatorAvailable: true,
    waterSupplyAvailable: true,
    electricityBackupAvailable: true,
    managerName: '',
    buildingManager: '',
    securitySupervisor: '',
    status: 'ACTIVE'
  });

  const [formData, setFormData] = useState(getInitialForm);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [bldgRes, propRes] = await Promise.all([
        apiClient.get('/structure/buildings'),
        apiClient.get('/properties')
      ]);
      if (bldgRes.data.success) setBuildings(bldgRes.data.data);
      if (propRes.data.success) {
        const props = propRes.data.data;
        setProperties(props);
        if (!selectedPropertyId && props.length > 0) {
          setSelectedPropertyId(props[0]._id);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load buildings directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setFormData({
      ...getInitialForm(),
      propertyId: selectedPropertyId || currentSelectedProperty?._id || '',
      buildingType: allowedBuildingTypes[0]?.value || 'BLOCK'
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (bldg: any) => {
    setModalMode('edit');
    setEditingId(bldg._id);
    setFormData({
      propertyId: bldg.propertyId?._id || bldg.propertyId || '',
      name: bldg.name || '',
      code: bldg.code || '',
      buildingType: bldg.buildingType || allowedBuildingTypes[0]?.value || 'BLOCK',
      description: bldg.description || '',
      totalFloors: bldg.totalFloors || 1,
      basementFloors: bldg.basementFloors || 0,
      groundFloorAvailable: bldg.groundFloorAvailable !== false,
      totalUnits: bldg.totalUnits || 0,
      totalBuiltUpArea: bldg.totalBuiltUpArea != null ? String(bldg.totalBuiltUpArea) : '',
      constructionYear: bldg.constructionYear != null ? String(bldg.constructionYear) : '',
      liftCount: bldg.liftCount != null ? bldg.liftCount : 1,
      staircaseCount: bldg.staircaseCount != null ? bldg.staircaseCount : 1,
      parkingCapacity: bldg.parkingCapacity != null ? String(bldg.parkingCapacity) : '',
      fireSafetyAvailable: bldg.fireSafetyAvailable !== false,
      generatorAvailable: bldg.generatorAvailable !== false,
      waterSupplyAvailable: bldg.waterSupplyAvailable !== false,
      electricityBackupAvailable: bldg.electricityBackupAvailable !== false,
      managerName: bldg.managerName || '',
      buildingManager: bldg.buildingManager || '',
      securitySupervisor: bldg.securitySupervisor || '',
      status: bldg.status || 'ACTIVE'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      ...formData,
      code: formData.code.trim().toUpperCase(),
      totalFloors: Number(formData.totalFloors) || 1,
      basementFloors: Number(formData.basementFloors) || 0,
      totalUnits: Number(formData.totalUnits) || 0,
      totalBuiltUpArea: formData.totalBuiltUpArea ? Number(formData.totalBuiltUpArea) : 0,
      constructionYear: formData.constructionYear ? Number(formData.constructionYear) : null,
      liftCount: Number(formData.liftCount) || 1,
      staircaseCount: Number(formData.staircaseCount) || 1,
      parkingCapacity: formData.parkingCapacity ? Number(formData.parkingCapacity) : 0
    };

    try {
      if (modalMode === 'create') {
        const res = await apiClient.post('/structure/buildings', payload);
        if (res.data.success) {
          setShowModal(false);
          loadData();
        }
      } else if (modalMode === 'edit' && editingId) {
        const res = await apiClient.put(`/structure/buildings/${editingId}`, payload);
        if (res.data.success) {
          setShowModal(false);
          loadData();
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save building');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to archive ${name}?`)) return;
    try {
      const res = await apiClient.delete(`/structure/buildings/${id}`);
      if (res.data.success) {
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to archive building');
    }
  };

  const filteredBuildings = useMemo(() => {
    return buildings.filter((b) => {
      const propId = b.propertyId?._id || b.propertyId;
      if (selectedPropertyId && selectedPropertyId !== 'ALL' && propId !== selectedPropertyId) return false;
      if (typeFilter !== 'ALL' && b.buildingType !== typeFilter) return false;
      if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = b.name?.toLowerCase().includes(q);
        const matchesCode = b.code?.toLowerCase().includes(q);
        const matchesMgr = b.managerName?.toLowerCase().includes(q) || b.buildingManager?.toLowerCase().includes(q);
        if (!matchesName && !matchesCode && !matchesMgr) return false;
      }
      return true;
    });
  }, [buildings, selectedPropertyId, typeFilter, statusFilter, search]);

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom flex-wrap gap-2">
        <div>
          <div className="d-flex align-items-center gap-2 mb-1">
            <h2 className="fw-bold mb-0">Buildings & Structural Assets</h2>
            {currentSelectedProperty && (
              <span className="badge bg-light text-primary border fw-semibold">
                {currentSelectedProperty.name} ({currentPropType})
              </span>
            )}
          </div>
          <p className="text-secondary mb-0 small">
            Manage towers, blocks, wings, and workspace centres configured for your properties
          </p>
        </div>

        <button onClick={handleOpenCreateModal} className="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm">
          <i className="bi bi-plus-lg"></i> Add Building
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="card border-0 shadow-sm mb-4 bg-white p-3 rounded-3">
        <div className="row g-2 align-items-center">
          <div className="col-md-4">
            <label className="form-label small text-muted mb-1 fw-semibold">Scoped Property:</label>
            <select
              className="form-select form-select-sm"
              value={selectedPropertyId}
              onChange={(e) => setSelectedPropertyId(e.target.value)}
            >
              <option value="ALL">All Properties</option>
              {properties.map((p) => (
                <option key={p._id} value={p._id}>
                  {p.name} ({p.propertyType})
                </option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label small text-muted mb-1 fw-semibold">Building Type:</label>
            <select
              className="form-select form-select-sm"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
            >
              <option value="ALL">All Building Types</option>
              {allowedBuildingTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="col-md-2">
            <label className="form-label small text-muted mb-1 fw-semibold">Status:</label>
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="ALL">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="UNDER_CONSTRUCTION">Under Construction</option>
              <option value="MAINTENANCE">Maintenance</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label small text-muted mb-1 fw-semibold">Search:</label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search name, code..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Grid List */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted small">Loading structural assets...</p>
        </div>
      ) : filteredBuildings.length === 0 ? (
        <div className="col-12 text-center py-5 bg-white rounded border">
          <i className="bi bi-houses fs-1 text-muted d-block mb-2"></i>
          <h6 className="fw-bold">No Buildings Found</h6>
          <p className="text-muted small mb-3">No structural blocks match the selected property or filter.</p>
          <button onClick={handleOpenCreateModal} className="btn btn-outline-primary btn-sm">
            <i className="bi bi-plus-lg me-1"></i> Add Building
          </button>
        </div>
      ) : (
        <div className="row g-3">
          {filteredBuildings.map((bldg) => (
            <div key={bldg._id} className="col-md-6 col-xl-4">
              <div className="pms-card p-4 h-100 d-flex flex-column justify-content-between shadow-sm">
                <div>
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className="badge bg-light text-dark border fw-bold">CODE: {bldg.code}</span>
                    <span className={`badge ${
                      bldg.status === 'ACTIVE'
                        ? 'badge-active'
                        : bldg.status === 'UNDER_CONSTRUCTION'
                        ? 'badge-warning-soft'
                        : 'badge-danger-soft'
                    }`}>
                      {bldg.status}
                    </span>
                  </div>

                  <h4 className="fw-bold text-dark mb-1">{bldg.name}</h4>
                  <div className="d-flex align-items-center gap-2 mb-3">
                    <span className="badge bg-secondary-subtle text-secondary border small">
                      {bldg.buildingType || 'BLOCK'}
                    </span>
                    <span className="small text-muted">
                      Property: <strong>{bldg.propertyId?.name || '—'}</strong>
                    </span>
                  </div>

                  {/* Specs & Infrastructure */}
                  <div className="row g-2 small text-secondary mb-3">
                    <div className="col-6">
                      <i className="bi bi-layers text-primary me-1"></i>
                      Floors: <strong>{bldg.totalFloors || 1}</strong>
                    </div>
                    <div className="col-6">
                      <i className="bi bi-door-open text-primary me-1"></i>
                      Units/Spaces: <strong>{bldg.totalUnits || 0}</strong>
                    </div>
                    <div className="col-6">
                      <i className="bi bi-arrow-up-circle text-primary me-1"></i>
                      Lifts: <strong>{bldg.liftCount || 1}</strong>
                    </div>
                    <div className="col-6">
                      <i className="bi bi-p-square text-primary me-1"></i>
                      Parking: <strong>{bldg.parkingCapacity || 0} bays</strong>
                    </div>
                    <div className="col-12">
                      <i className="bi bi-person-badge text-primary me-1"></i>
                      Manager: <strong>{bldg.managerName || bldg.buildingManager || 'Not assigned'}</strong>
                    </div>
                  </div>

                  {/* Safety & Backup badges */}
                  <div className="d-flex gap-1 flex-wrap mb-2">
                    {bldg.fireSafetyAvailable && (
                      <span className="badge bg-light text-muted border" style={{ fontSize: '0.65rem' }}>
                        <i className="bi bi-shield-check text-success me-1"></i>Fire Safety
                      </span>
                    )}
                    {bldg.generatorAvailable && (
                      <span className="badge bg-light text-muted border" style={{ fontSize: '0.65rem' }}>
                        <i className="bi bi-lightning-charge text-warning me-1"></i>Power Backup
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-3 border-top d-flex justify-content-between align-items-center">
                  <div className="btn-group btn-group-sm">
                    <button onClick={() => handleOpenEditModal(bldg)} className="btn btn-outline-secondary" title="Edit Building">
                      <i className="bi bi-pencil"></i>
                    </button>
                    <button onClick={() => handleArchive(bldg._id, bldg.name)} className="btn btn-outline-danger" title="Archive Building">
                      <i className="bi bi-archive"></i>
                    </button>
                  </div>

                  <Link href={`/floors?buildingId=${bldg._id}`} className="btn btn-outline-primary btn-sm d-flex align-items-center gap-1">
                    <span>View Floors</span>
                    <i className="bi bi-chevron-right"></i>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Building Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060, overflowY: 'auto' }} tabIndex={-1}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable my-3">
            <form onSubmit={handleSubmit} className="modal-content shadow-lg border-0" style={{ maxHeight: '88vh' }}>
              <div className="modal-header bg-light flex-shrink-0">
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded p-2 bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
                    <i className="bi bi-building"></i>
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold mb-0">
                      {modalMode === 'create' ? 'Add New Building' : `Edit Building: ${formData.name}`}
                    </h5>
                    <small className="text-muted">Configure towers, wings, structural specs, and safety equipment</small>
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <div className="modal-body p-4 overflow-y-auto" style={{ maxHeight: 'calc(88vh - 135px)', scrollbarWidth: 'thin' }}>
                <div className="row g-3">
                  {/* Property Selector */}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Target Property <span className="text-danger">*</span></label>
                    <select
                      className="form-select"
                      required
                      value={formData.propertyId}
                      onChange={(e) => setFormData({ ...formData, propertyId: e.target.value })}
                    >
                      {properties.map((p) => (
                        <option key={p._id} value={p._id}>{p.name} ({p.propertyType})</option>
                      ))}
                    </select>
                  </div>

                  {/* Building Type */}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Building Type <span className="text-danger">*</span></label>
                    <select
                      className="form-select"
                      value={formData.buildingType}
                      onChange={(e) => setFormData({ ...formData, buildingType: e.target.value })}
                    >
                      {allowedBuildingTypes.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Name & Code */}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Building / Tower Name <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. Tower A, North Wing, Hub Centre"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Building Code <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control text-uppercase"
                      required
                      placeholder="e.g. TWR-A"
                      value={formData.code}
                      onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                    />
                  </div>

                  {/* Floor and Unit counts */}
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Total Floors</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={formData.totalFloors}
                      onChange={(e) => setFormData({ ...formData, totalFloors: Number(e.target.value) })}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Basement Floors</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={formData.basementFloors}
                      onChange={(e) => setFormData({ ...formData, basementFloors: Number(e.target.value) })}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Total Expected Units</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={formData.totalUnits}
                      onChange={(e) => setFormData({ ...formData, totalUnits: Number(e.target.value) })}
                    />
                  </div>

                  {/* Area, Parking & Construction Year */}
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Total Built-up Area (sq. ft.)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      placeholder="Built-up sq.ft."
                      value={formData.totalBuiltUpArea}
                      onChange={(e) => setFormData({ ...formData, totalBuiltUpArea: e.target.value })}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Parking Bays Capacity</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      placeholder="Total slots"
                      value={formData.parkingCapacity}
                      onChange={(e) => setFormData({ ...formData, parkingCapacity: e.target.value })}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Construction Year</label>
                    <input
                      type="number"
                      className="form-control"
                      placeholder="e.g. 2024"
                      value={formData.constructionYear}
                      onChange={(e) => setFormData({ ...formData, constructionYear: e.target.value })}
                    />
                  </div>

                  {/* Lifts & Staircases */}
                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Number of Elevators / Lifts</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={formData.liftCount}
                      onChange={(e) => setFormData({ ...formData, liftCount: Number(e.target.value) })}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Staircases Count</label>
                    <input
                      type="number"
                      min="1"
                      className="form-control"
                      value={formData.staircaseCount}
                      onChange={(e) => setFormData({ ...formData, staircaseCount: Number(e.target.value) })}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Status</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="UNDER_CONSTRUCTION">UNDER CONSTRUCTION</option>
                      <option value="MAINTENANCE">MAINTENANCE</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>

                  {/* Personnel */}
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Building Manager Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Assigned Manager"
                      value={formData.managerName}
                      onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Security Supervisor</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Security in-charge"
                      value={formData.securitySupervisor}
                      onChange={(e) => setFormData({ ...formData, securitySupervisor: e.target.value })}
                    />
                  </div>

                  {/* Safety & Infrastructure Toggles */}
                  <div className="col-12 mt-3">
                    <label className="form-label small fw-semibold d-block">Infrastructure & Safety Features</label>
                    <div className="row g-2">
                      <div className="col-md-3">
                        <div className="form-check form-switch p-2 border rounded bg-light">
                          <input
                            className="form-check-input ms-0 me-2"
                            type="checkbox"
                            checked={formData.fireSafetyAvailable}
                            onChange={(e) => setFormData({ ...formData, fireSafetyAvailable: e.target.checked })}
                          />
                          <label className="form-check-label small fw-semibold">Fire Safety Certified</label>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-check form-switch p-2 border rounded bg-light">
                          <input
                            className="form-check-input ms-0 me-2"
                            type="checkbox"
                            checked={formData.generatorAvailable}
                            onChange={(e) => setFormData({ ...formData, generatorAvailable: e.target.checked })}
                          />
                          <label className="form-check-label small fw-semibold">Generator Backup</label>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-check form-switch p-2 border rounded bg-light">
                          <input
                            className="form-check-input ms-0 me-2"
                            type="checkbox"
                            checked={formData.waterSupplyAvailable}
                            onChange={(e) => setFormData({ ...formData, waterSupplyAvailable: e.target.checked })}
                          />
                          <label className="form-check-label small fw-semibold">24/7 Water Supply</label>
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-check form-switch p-2 border rounded bg-light">
                          <input
                            className="form-check-input ms-0 me-2"
                            type="checkbox"
                            checked={formData.electricityBackupAvailable}
                            onChange={(e) => setFormData({ ...formData, electricityBackupAvailable: e.target.checked })}
                          />
                          <label className="form-check-label small fw-semibold">Power Grid Inverter</label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer bg-light flex-shrink-0">
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => setShowModal(false)} disabled={submitting}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-sm px-3" disabled={submitting}>
                  {submitting ? 'Saving...' : modalMode === 'create' ? 'Create Building' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
