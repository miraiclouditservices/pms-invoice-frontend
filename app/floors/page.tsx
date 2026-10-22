'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function FloorsPage() {
  const searchParams = useSearchParams();
  const initialPropertyParam = searchParams.get('propertyId') || '';
  const initialBuildingParam = searchParams.get('buildingId') || '';

  const { organisation, user, activeProperty } = useAuth();
  const [floors, setFloors] = useState<any[]>([]);
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
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(initialBuildingParam);
  const [floorTypeFilter, setFloorTypeFilter] = useState<string>('ALL');
  const [submitting, setSubmitting] = useState(false);

  const floorTypes = [
    { value: 'STANDARD_FLOOR', label: 'Standard Floor' },
    { value: 'GROUND_FLOOR', label: 'Ground Floor' },
    { value: 'BASEMENT', label: 'Basement' },
    { value: 'MEZZANINE', label: 'Mezzanine' },
    { value: 'TERRACE', label: 'Terrace' },
    { value: 'PARKING_FLOOR', label: 'Parking Floor' },
    { value: 'SERVICE_FLOOR', label: 'Service / Plant Floor' },
    { value: 'ZONE', label: 'Special Zone' }
  ];

  const getInitialForm = () => ({
    propertyId: selectedPropertyId || '',
    buildingId: selectedBuildingId || '',
    floorNumber: 1,
    floorName: '',
    floorCode: '',
    floorType: 'STANDARD_FLOOR',
    description: '',
    totalArea: '',
    usableArea: '',
    commonArea: '',
    totalUnits: 0,
    floorManager: '',
    securityAccessLevel: 'Standard',
    fireExitAvailable: true,
    liftAccess: true,
    commonAreaAvailable: true,
    washroomsAvailable: true,
    pantryAvailable: false,
    status: 'ACTIVE'
  });

  const [formData, setFormData] = useState(getInitialForm);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [floorRes, bldgRes, propRes] = await Promise.all([
        apiClient.get('/structure/floors'),
        apiClient.get('/structure/buildings'),
        apiClient.get('/properties')
      ]);

      if (floorRes.data.success) setFloors(floorRes.data.data);
      if (bldgRes.data.success) setBuildings(bldgRes.data.data);
      if (propRes.data.success) {
        const props = propRes.data.data;
        setProperties(props);
        if (!selectedPropertyId && props.length > 0) {
          setSelectedPropertyId(props[0]._id);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load floors directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Filtered buildings belonging to currently selected property
  const buildingsForProperty = useMemo(() => {
    if (!selectedPropertyId || selectedPropertyId === 'ALL') return buildings;
    return buildings.filter(b => (b.propertyId?._id || b.propertyId) === selectedPropertyId);
  }, [buildings, selectedPropertyId]);

  const handleOpenCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    const defaultPropId = selectedPropertyId || (properties.length > 0 ? properties[0]._id : '');
    const bldgsForProp = buildings.filter(b => (b.propertyId?._id || b.propertyId) === defaultPropId);
    const defaultBldgId = selectedBuildingId || (bldgsForProp.length > 0 ? bldgsForProp[0]._id : '');

    setFormData({
      ...getInitialForm(),
      propertyId: defaultPropId,
      buildingId: defaultBldgId
    });
    setShowModal(true);
  };

  const handleOpenEditModal = (floor: any) => {
    setModalMode('edit');
    setEditingId(floor._id);
    setFormData({
      propertyId: floor.propertyId?._id || floor.propertyId || '',
      buildingId: floor.buildingId?._id || floor.buildingId || '',
      floorNumber: floor.floorNumber || 1,
      floorName: floor.floorName || '',
      floorCode: floor.floorCode || '',
      floorType: floor.floorType || 'STANDARD_FLOOR',
      description: floor.description || '',
      totalArea: floor.totalArea != null ? String(floor.totalArea) : '',
      usableArea: floor.usableArea != null ? String(floor.usableArea) : '',
      commonArea: floor.commonArea != null ? String(floor.commonArea) : '',
      totalUnits: floor.totalUnits || 0,
      floorManager: floor.floorManager || '',
      securityAccessLevel: floor.securityAccessLevel || 'Standard',
      fireExitAvailable: floor.fireExitAvailable !== false,
      liftAccess: floor.liftAccess !== false,
      commonAreaAvailable: floor.commonAreaAvailable !== false,
      washroomsAvailable: floor.washroomsAvailable !== false,
      pantryAvailable: floor.pantryAvailable === true,
      status: floor.status || 'ACTIVE'
    });
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const payload = {
      ...formData,
      floorNumber: Number(formData.floorNumber),
      totalArea: formData.totalArea ? Number(formData.totalArea) : 0,
      usableArea: formData.usableArea ? Number(formData.usableArea) : 0,
      commonArea: formData.commonArea ? Number(formData.commonArea) : 0,
      totalUnits: Number(formData.totalUnits) || 0
    };

    try {
      if (modalMode === 'create') {
        const res = await apiClient.post('/structure/floors', payload);
        if (res.data.success) {
          setShowModal(false);
          loadData();
        }
      } else if (modalMode === 'edit' && editingId) {
        const res = await apiClient.put(`/structure/floors/${editingId}`, payload);
        if (res.data.success) {
          setShowModal(false);
          loadData();
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save floor');
    } finally {
      setSubmitting(false);
    }
  };

  const handleArchive = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to archive floor "${name}"?`)) return;
    try {
      const res = await apiClient.delete(`/structure/floors/${id}`);
      if (res.data.success) {
        loadData();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to archive floor');
    }
  };

  const filteredFloors = useMemo(() => {
    return floors.filter((f) => {
      const propId = f.propertyId?._id || f.propertyId;
      const bldgId = f.buildingId?._id || f.buildingId;
      if (selectedPropertyId && selectedPropertyId !== 'ALL' && propId !== selectedPropertyId) return false;
      if (selectedBuildingId && selectedBuildingId !== 'ALL' && bldgId !== selectedBuildingId) return false;
      if (floorTypeFilter !== 'ALL' && f.floorType !== floorTypeFilter) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesName = f.floorName?.toLowerCase().includes(q);
        const matchesNum = String(f.floorNumber).includes(q);
        const matchesMgr = f.floorManager?.toLowerCase().includes(q);
        if (!matchesName && !matchesNum && !matchesMgr) return false;
      }
      return true;
    });
  }, [floors, selectedPropertyId, selectedBuildingId, floorTypeFilter, search]);

  return (
    <div>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom flex-wrap gap-2">
        <div>
          <h2 className="fw-bold mb-0">Floors & Levels</h2>
          <p className="text-secondary mb-0 small">
            Configure vertical floor levels, zones, usable areas, and facility infrastructure
          </p>
        </div>

        <button onClick={handleOpenCreateModal} className="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm">
          <i className="bi bi-plus-lg"></i> Add Floor
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="card border-0 shadow-sm mb-4 bg-white p-3 rounded-3">
        <div className="row g-2 align-items-center">
          <div className="col-md-3">
            <label className="form-label small text-muted mb-1 fw-semibold">Property:</label>
            <select
              className="form-select form-select-sm"
              value={selectedPropertyId}
              onChange={(e) => {
                setSelectedPropertyId(e.target.value);
                setSelectedBuildingId('ALL');
              }}
            >
              <option value="ALL">All Properties</option>
              {properties.map((p) => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label small text-muted mb-1 fw-semibold">Building:</label>
            <select
              className="form-select form-select-sm"
              value={selectedBuildingId}
              onChange={(e) => setSelectedBuildingId(e.target.value)}
            >
              <option value="ALL">All Buildings</option>
              {buildingsForProperty.map((b) => (
                <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label small text-muted mb-1 fw-semibold">Floor Type:</label>
            <select
              className="form-select form-select-sm"
              value={floorTypeFilter}
              onChange={(e) => setFloorTypeFilter(e.target.value)}
            >
              <option value="ALL">All Types</option>
              {floorTypes.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          <div className="col-md-3">
            <label className="form-label small text-muted mb-1 fw-semibold">Search:</label>
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0"><i className="bi bi-search text-muted"></i></span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search floor name, level..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Floor Table */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="mt-2 text-muted small">Loading floor levels...</p>
        </div>
      ) : filteredFloors.length === 0 ? (
        <div className="col-12 text-center py-5 bg-white rounded border">
          <i className="bi bi-layers fs-1 text-muted d-block mb-2"></i>
          <h6 className="fw-bold">No Floors Found</h6>
          <p className="text-muted small mb-3">No floors match your current filter settings.</p>
          <button onClick={handleOpenCreateModal} className="btn btn-outline-primary btn-sm">
            <i className="bi bi-plus-lg me-1"></i> Add Floor
          </button>
        </div>
      ) : (
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Level / Number</th>
                  <th>Floor Name</th>
                  <th>Building & Property</th>
                  <th>Floor Type</th>
                  <th>Usable Area</th>
                  <th>Facilities</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredFloors.map((floor) => (
                  <tr key={floor._id}>
                    <td>
                      <span className="badge bg-light text-dark border fw-bold px-2 py-1">
                        Floor {floor.floorNumber}
                      </span>
                    </td>
                    <td>
                      <div className="fw-semibold text-dark">{floor.floorName}</div>
                      {floor.floorCode && <small className="text-muted">Code: {floor.floorCode}</small>}
                    </td>
                    <td>
                      <div className="small fw-semibold">{floor.buildingId?.name || '—'}</div>
                      <small className="text-muted">{floor.propertyId?.name || '—'}</small>
                    </td>
                    <td>
                      <span className="badge bg-secondary-subtle text-secondary border">
                        {floor.floorType || 'STANDARD_FLOOR'}
                      </span>
                    </td>
                    <td>
                      <div className="small">
                        {floor.usableArea ? `${Number(floor.usableArea).toLocaleString()} sq.ft` : '—'}
                      </div>
                    </td>
                    <td>
                      <div className="d-flex gap-1">
                        {floor.liftAccess && <span className="badge bg-light text-muted border" title="Elevator Access"><i className="bi bi-arrow-up-circle"></i> Lift</span>}
                        {floor.washroomsAvailable && <span className="badge bg-light text-muted border" title="Washrooms Available"><i className="bi bi-badge-wc"></i> WC</span>}
                        {floor.fireExitAvailable && <span className="badge bg-light text-muted border" title="Fire Exit"><i className="bi bi-shield-check"></i> Fire</span>}
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${floor.status === 'ACTIVE' ? 'badge-active' : 'badge-danger-soft'}`}>
                        {floor.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <Link href={`/units?floorId=${floor._id}`} className="btn btn-outline-primary" title="View Units">
                          <i className="bi bi-door-open"></i>
                        </Link>
                        <button onClick={() => handleOpenEditModal(floor)} className="btn btn-outline-secondary" title="Edit Floor">
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button onClick={() => handleArchive(floor._id, floor.floorName)} className="btn btn-outline-danger" title="Archive Floor">
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

      {/* Add / Edit Floor Modal */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1060, overflowY: 'auto' }} tabIndex={-1}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable my-3">
            <form onSubmit={handleSubmit} className="modal-content shadow-lg border-0" style={{ maxHeight: '88vh' }}>
              <div className="modal-header bg-light flex-shrink-0">
                <div className="d-flex align-items-center gap-2">
                  <div className="rounded p-2 bg-primary text-white d-flex align-items-center justify-content-center" style={{ width: 34, height: 34 }}>
                    <i className="bi bi-layers"></i>
                  </div>
                  <div>
                    <h5 className="modal-title fw-bold mb-0">
                      {modalMode === 'create' ? 'Add New Floor' : `Edit Floor: ${formData.floorName}`}
                    </h5>
                    <small className="text-muted">Configure vertical floor levels, usable area, and facility access</small>
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              <div className="modal-body p-4 overflow-y-auto" style={{ maxHeight: 'calc(88vh - 135px)', scrollbarWidth: 'thin' }}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Property <span className="text-danger">*</span></label>
                    <select
                      className="form-select"
                      required
                      value={formData.propertyId}
                      onChange={(e) => {
                        const pId = e.target.value;
                        const bldgs = buildings.filter(b => (b.propertyId?._id || b.propertyId) === pId);
                        setFormData({
                          ...formData,
                          propertyId: pId,
                          buildingId: bldgs.length > 0 ? bldgs[0]._id : ''
                        });
                      }}
                    >
                      {properties.map((p) => (
                        <option key={p._id} value={p._id}>{p.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Target Building / Tower <span className="text-danger">*</span></label>
                    <select
                      className="form-select"
                      required
                      value={formData.buildingId}
                      onChange={(e) => setFormData({ ...formData, buildingId: e.target.value })}
                    >
                      {buildings
                        .filter(b => !formData.propertyId || (b.propertyId?._id || b.propertyId) === formData.propertyId)
                        .map((b) => (
                          <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
                        ))}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Floor Number <span className="text-danger">*</span></label>
                    <input
                      type="number"
                      className="form-control"
                      required
                      placeholder="e.g. 1, 2, -1"
                      value={formData.floorNumber}
                      onChange={(e) => setFormData({ ...formData, floorNumber: Number(e.target.value) })}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Floor Name / Label <span className="text-danger">*</span></label>
                    <input
                      type="text"
                      className="form-control"
                      required
                      placeholder="e.g. First Floor, Executive Level"
                      value={formData.floorName}
                      onChange={(e) => setFormData({ ...formData, floorName: e.target.value })}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Floor Code</label>
                    <input
                      type="text"
                      className="form-control text-uppercase"
                      placeholder="e.g. FL-01"
                      value={formData.floorCode}
                      onChange={(e) => setFormData({ ...formData, floorCode: e.target.value.toUpperCase() })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Floor Type <span className="text-danger">*</span></label>
                    <select
                      className="form-select"
                      value={formData.floorType}
                      onChange={(e) => setFormData({ ...formData, floorType: e.target.value })}
                    >
                      {floorTypes.map((t) => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Status</label>
                    <select
                      className="form-select"
                      value={formData.status}
                      onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    >
                      <option value="ACTIVE">ACTIVE</option>
                      <option value="UNDER_MAINTENANCE">UNDER MAINTENANCE</option>
                      <option value="RESTRICTED">RESTRICTED</option>
                      <option value="INACTIVE">INACTIVE</option>
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Total Area (sq. ft.)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={formData.totalArea}
                      onChange={(e) => setFormData({ ...formData, totalArea: e.target.value })}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Usable Carpet Area (sq. ft.)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={formData.usableArea}
                      onChange={(e) => setFormData({ ...formData, usableArea: e.target.value })}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Common Area (sq. ft.)</label>
                    <input
                      type="number"
                      min="0"
                      className="form-control"
                      value={formData.commonArea}
                      onChange={(e) => setFormData({ ...formData, commonArea: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Floor Manager Name</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Assigned floor supervisor"
                      value={formData.floorManager}
                      onChange={(e) => setFormData({ ...formData, floorManager: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Security Access Level</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="e.g. Standard, Biometric, Keycard"
                      value={formData.securityAccessLevel}
                      onChange={(e) => setFormData({ ...formData, securityAccessLevel: e.target.value })}
                    />
                  </div>

                  {/* Amenities switches */}
                  <div className="col-12 mt-3">
                    <label className="form-label small fw-semibold d-block">Floor Facilities & Access</label>
                    <div className="row g-2">
                      <div className="col-md-4">
                        <div className="form-check form-switch p-2 border rounded bg-light">
                          <input
                            className="form-check-input ms-0 me-2"
                            type="checkbox"
                            checked={formData.liftAccess}
                            onChange={(e) => setFormData({ ...formData, liftAccess: e.target.checked })}
                          />
                          <label className="form-check-label small fw-semibold">Elevator / Lift Access</label>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-check form-switch p-2 border rounded bg-light">
                          <input
                            className="form-check-input ms-0 me-2"
                            type="checkbox"
                            checked={formData.washroomsAvailable}
                            onChange={(e) => setFormData({ ...formData, washroomsAvailable: e.target.checked })}
                          />
                          <label className="form-check-label small fw-semibold">Restrooms / Washrooms</label>
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-check form-switch p-2 border rounded bg-light">
                          <input
                            className="form-check-input ms-0 me-2"
                            type="checkbox"
                            checked={formData.fireExitAvailable}
                            onChange={(e) => setFormData({ ...formData, fireExitAvailable: e.target.checked })}
                          />
                          <label className="form-check-label small fw-semibold">Fire Exit Stairway</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-check form-switch p-2 border rounded bg-light">
                          <input
                            className="form-check-input ms-0 me-2"
                            type="checkbox"
                            checked={formData.commonAreaAvailable}
                            onChange={(e) => setFormData({ ...formData, commonAreaAvailable: e.target.checked })}
                          />
                          <label className="form-check-label small fw-semibold">Common Lounge / Lobby</label>
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-check form-switch p-2 border rounded bg-light">
                          <input
                            className="form-check-input ms-0 me-2"
                            type="checkbox"
                            checked={formData.pantryAvailable}
                            onChange={(e) => setFormData({ ...formData, pantryAvailable: e.target.checked })}
                          />
                          <label className="form-check-label small fw-semibold">Cafeteria / Pantry Area</label>
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
                  {submitting ? 'Saving...' : modalMode === 'create' ? 'Create Floor' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
