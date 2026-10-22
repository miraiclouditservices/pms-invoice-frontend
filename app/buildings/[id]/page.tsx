'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/apiClient';
import Link from 'next/link';

export default function BuildingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const buildingId = params?.id as string;

  const [building, setBuilding] = useState<any>(null);
  const [floors, setFloors] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'floors' | 'units' | 'specs'>('overview');

  const loadBuildingData = async () => {
    setLoading(true);
    setError('');
    try {
      const [bldgRes, floorsRes, unitsRes] = await Promise.all([
        apiClient.get(`/structure/buildings/${buildingId}`),
        apiClient.get(`/structure/floors?buildingId=${buildingId}`),
        apiClient.get(`/structure/units?buildingId=${buildingId}`)
      ]);

      if (bldgRes.data.success) {
        setBuilding(bldgRes.data.data);
      }
      if (floorsRes.data.success) {
        setFloors(floorsRes.data.data);
      }
      if (unitsRes.data.success) {
        setUnits(unitsRes.data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load building details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (buildingId) {
      loadBuildingData();
    }
  }, [buildingId]);

  const propertyType = (building?.propertyId?.propertyType || 'RESIDENTIAL').toUpperCase();

  const buildingTerm = useMemo(() => {
    if (propertyType === 'COMMERCIAL') return 'Building / Wing';
    if (propertyType === 'COWORKING') return 'Workspace Hub';
    return 'Residential Tower / Block';
  }, [propertyType]);

  const unitTerm = useMemo(() => {
    if (propertyType === 'COMMERCIAL') return 'Offices & Suites';
    if (propertyType === 'COWORKING') return 'Desks & Cabins';
    return 'Flats & Apartments';
  }, [propertyType]);

  const totalUnits = units.length;
  const occupiedUnits = units.filter(u => u.occupancyStatus === 'OCCUPIED' || u.status === 'OCCUPIED' || u.status === 'RENTED').length;
  const vacantUnits = units.filter(u => u.occupancyStatus === 'VACANT' || u.status === 'AVAILABLE' || u.status === 'VACANT').length;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  if (loading) {
    return (
      <div className="container-fluid py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="text-muted small mt-2">Loading building hierarchy...</p>
      </div>
    );
  }

  if (error || !building) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger shadow-sm rounded-3">
          <i className="bi bi-exclamation-triangle me-2"></i>{error || 'Building not found'}
          <div className="mt-3">
            <button className="btn btn-sm btn-outline-danger me-2" onClick={loadBuildingData}>Retry</button>
            <Link href="/buildings" className="btn btn-sm btn-secondary">Back to Buildings</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-2">
      {/* Breadcrumbs */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb mb-2 small">
          <li className="breadcrumb-item"><Link href="/dashboard" className="text-decoration-none">Dashboard</Link></li>
          <li className="breadcrumb-item"><Link href="/properties" className="text-decoration-none">Properties</Link></li>
          <li className="breadcrumb-item">
            <Link href={`/properties/${building.propertyId?._id || building.propertyId}`} className="text-decoration-none">
              {building.propertyId?.name || 'Property'}
            </Link>
          </li>
          <li className="breadcrumb-item"><Link href="/buildings" className="text-decoration-none">Buildings</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{building.name}</li>
        </ol>
      </nav>

      {/* Header Banner */}
      <div className="card border-0 shadow-sm rounded-3 p-4 mb-4 bg-white">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2">
              <h2 className="fw-bold mb-0 text-dark">{building.name}</h2>
              <span className="badge bg-primary-subtle text-primary border border-primary-subtle">
                {building.code}
              </span>
              <span className={`badge ${
                building.status === 'ACTIVE' ? 'bg-success-subtle text-success border border-success-subtle' :
                'bg-secondary-subtle text-secondary'
              }`}>
                {building.status}
              </span>
            </div>
            <div className="text-muted small mt-1">
              <i className="bi bi-geo-alt me-1"></i> Part of <strong>{building.propertyId?.name}</strong> • {buildingTerm} • Type: {building.buildingType}
            </div>
          </div>

          <div className="d-flex gap-2">
            <Link
              href={`/floors?propertyId=${building.propertyId?._id || building.propertyId}&buildingId=${building._id}`}
              className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1"
            >
              <i className="bi bi-layers"></i> Manage Floors
            </Link>
            <Link
              href={`/units?propertyId=${building.propertyId?._id || building.propertyId}&buildingId=${building._id}`}
              className="btn btn-primary btn-sm d-flex align-items-center gap-1"
            >
              <i className="bi bi-door-open"></i> Manage {unitTerm}
            </Link>
          </div>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
            <span className="text-muted small">Total Floors</span>
            <h4 className="fw-bold mb-0 mt-1">{building.totalFloors || floors.length}</h4>
            <div className="small text-muted mt-1">{building.basementFloors ? `${building.basementFloors} Basements` : 'No Basements'}</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
            <span className="text-muted small">Total Units</span>
            <h4 className="fw-bold mb-0 mt-1">{totalUnits}</h4>
            <div className="small text-success mt-1">{occupiedUnits} Occupied</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
            <span className="text-muted small">Vacant / Available</span>
            <h4 className="fw-bold mb-0 mt-1 text-primary">{vacantUnits}</h4>
            <div className="small text-muted mt-1">{occupancyRate}% Occupancy Rate</div>
          </div>
        </div>
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
            <span className="text-muted small">Built-Up Area</span>
            <h4 className="fw-bold mb-0 mt-1">{building.totalBuiltUpArea ? `${building.totalBuiltUpArea} sq.ft` : 'N/A'}</h4>
            <div className="small text-muted mt-1">{building.constructionYear ? `Built in ${building.constructionYear}` : 'Year N/A'}</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="card-header bg-white border-bottom p-0">
          <ul className="nav nav-tabs border-bottom-0 px-3 pt-2">
            <li className="nav-item">
              <button
                className={`nav-link py-2 px-3 fw-medium ${activeTab === 'overview' ? 'active text-primary' : 'text-secondary'}`}
                onClick={() => setActiveTab('overview')}
              >
                <i className="bi bi-info-circle me-1"></i> Overview & Personnel
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link py-2 px-3 fw-medium ${activeTab === 'floors' ? 'active text-primary' : 'text-secondary'}`}
                onClick={() => setActiveTab('floors')}
              >
                <i className="bi bi-layers me-1"></i> Floors ({floors.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link py-2 px-3 fw-medium ${activeTab === 'units' ? 'active text-primary' : 'text-secondary'}`}
                onClick={() => setActiveTab('units')}
              >
                <i className="bi bi-door-open me-1"></i> {unitTerm} ({units.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link py-2 px-3 fw-medium ${activeTab === 'specs' ? 'active text-primary' : 'text-secondary'}`}
                onClick={() => setActiveTab('specs')}
              >
                <i className="bi bi-shield-check me-1"></i> Utilities & Safety
              </button>
            </li>
          </ul>
        </div>

        <div className="card-body p-4">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="row g-4">
              <div className="col-md-7">
                <h6 className="fw-bold border-bottom pb-2 mb-3">Building Profile</h6>
                <div className="row g-3 small">
                  <div className="col-sm-6">
                    <span className="text-muted d-block">Building Name</span>
                    <span className="fw-semibold">{building.name}</span>
                  </div>
                  <div className="col-sm-6">
                    <span className="text-muted d-block">Short Code</span>
                    <span className="fw-semibold">{building.code}</span>
                  </div>
                  <div className="col-sm-6">
                    <span className="text-muted d-block">Building Classification</span>
                    <span className="fw-semibold">{building.buildingType?.replace('_', ' ')}</span>
                  </div>
                  <div className="col-sm-6">
                    <span className="text-muted d-block">Operating Status</span>
                    <span className="badge bg-success-subtle text-success">{building.status}</span>
                  </div>
                  <div className="col-12">
                    <span className="text-muted d-block">Description / Purpose</span>
                    <p className="mb-0 text-secondary">{building.description || 'No specific description documented.'}</p>
                  </div>
                </div>
              </div>

              <div className="col-md-5">
                <div className="p-3 bg-light rounded-3">
                  <h6 className="fw-bold border-bottom pb-2 mb-3">Management & Supervision</h6>
                  <div className="small mb-3">
                    <span className="text-muted d-block">Building Manager</span>
                    <span className="fw-semibold">{building.managerName || building.buildingManager || 'Not Assigned'}</span>
                  </div>
                  <div className="small mb-3">
                    <span className="text-muted d-block">Security Supervisor</span>
                    <span className="fw-semibold">{building.securitySupervisor || 'Not Assigned'}</span>
                  </div>
                  <div className="small">
                    <span className="text-muted d-block">Parking Capacity</span>
                    <span className="fw-semibold">{building.parkingCapacity ? `${building.parkingCapacity} slots` : 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: FLOORS */}
          {activeTab === 'floors' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">Registered Floor Levels</h6>
                <Link
                  href={`/floors?propertyId=${building.propertyId?._id || building.propertyId}&buildingId=${building._id}`}
                  className="btn btn-outline-primary btn-sm"
                >
                  <i className="bi bi-plus-lg me-1"></i> Add Floor
                </Link>
              </div>

              {floors.length === 0 ? (
                <p className="text-muted small fst-italic py-3">No floors registered yet for this building.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle small mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Floor Level</th>
                        <th>Type</th>
                        <th>Usable Area</th>
                        <th>Washrooms</th>
                        <th>Lift Access</th>
                        <th>Fire Exit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {floors.map(f => (
                        <tr key={f._id}>
                          <td className="fw-bold text-primary">
                            {f.floorName || `Floor ${f.floorNumber}`}
                          </td>
                          <td><span className="badge bg-light text-dark border">{f.floorType}</span></td>
                          <td>{f.usableArea ? `${f.usableArea} sq.ft` : '-'}</td>
                          <td>{f.washroomsAvailable ? <span className="text-success"><i className="bi bi-check-circle-fill"></i> Available</span> : '-'}</td>
                          <td>{f.liftAccess ? <span className="text-success"><i className="bi bi-check-circle-fill"></i> Yes</span> : '-'}</td>
                          <td>{f.fireExitAvailable ? <span className="text-success"><i className="bi bi-check-circle-fill"></i> Ready</span> : '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: UNITS */}
          {activeTab === 'units' && (
            <div>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="fw-bold mb-0">{unitTerm} Directory</h6>
                <Link
                  href={`/units?propertyId=${building.propertyId?._id || building.propertyId}&buildingId=${building._id}`}
                  className="btn btn-outline-primary btn-sm"
                >
                  <i className="bi bi-plus-lg me-1"></i> Add Unit
                </Link>
              </div>

              {units.length === 0 ? (
                <p className="text-muted small fst-italic py-3">No units or spaces registered under this building yet.</p>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover align-middle small mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Unit Number</th>
                        <th>Type</th>
                        <th>Floor</th>
                        <th>Area</th>
                        <th>Occupant</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {units.map(u => (
                        <tr key={u._id}>
                          <td className="fw-bold text-primary">
                            {u.wing ? `${u.wing}-` : ''}{u.unitNumber}
                          </td>
                          <td><span className="badge bg-light text-dark border">{u.unitType}</span></td>
                          <td>{u.floorId?.floorName || (u.floorId?.floorNumber !== undefined ? `Floor ${u.floorId.floorNumber}` : '-')}</td>
                          <td>{u.carpetArea ? `${u.carpetArea} sq.ft` : '-'}</td>
                          <td>
                            {u.currentResidentId?.name || u.residentName || u.currentTenantCompanyId?.companyName || u.tenantCompany || u.assignedMemberName || (
                              <span className="text-muted fst-italic">Vacant</span>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${
                              u.occupancyStatus === 'OCCUPIED' ? 'bg-success-subtle text-success' : 'bg-info-subtle text-info'
                            }`}>
                              {u.occupancyStatus || 'VACANT'}
                            </span>
                          </td>
                          <td>
                            <Link href={`/units/${u._id}`} className="btn btn-light btn-sm py-0 px-2">
                              View
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SPECS & SAFETY */}
          {activeTab === 'specs' && (
            <div className="row g-4 small">
              <div className="col-md-6">
                <h6 className="fw-bold border-bottom pb-2 mb-3">Vertical Transportation & Access</h6>
                <ul className="list-group list-group-flush">
                  <li className="list-group-item px-0 d-flex justify-content-between">
                    <span className="text-muted">Elevators / Lifts</span>
                    <span className="fw-semibold">{building.liftCount || 0} Lifts installed</span>
                  </li>
                  <li className="list-group-item px-0 d-flex justify-content-between">
                    <span className="text-muted">Emergency Staircases</span>
                    <span className="fw-semibold">{building.staircaseCount || 0} Staircases</span>
                  </li>
                  <li className="list-group-item px-0 d-flex justify-content-between">
                    <span className="text-muted">Ground Floor Lobby</span>
                    <span className="fw-semibold">{building.groundFloorAvailable ? 'Yes' : 'No'}</span>
                  </li>
                </ul>
              </div>

              <div className="col-md-6">
                <h6 className="fw-bold border-bottom pb-2 mb-3">Safety & Redundancy Infrastructure</h6>
                <div className="d-flex flex-column gap-2">
                  <div className="d-flex align-items-center justify-content-between p-2 rounded bg-light">
                    <span>Fire Safety & Hydrant System</span>
                    {building.fireSafetyAvailable ? (
                      <span className="text-success fw-semibold"><i className="bi bi-shield-fill-check me-1"></i> Certified</span>
                    ) : (
                      <span className="text-danger fw-semibold"><i className="bi bi-x-circle me-1"></i> Missing</span>
                    )}
                  </div>
                  <div className="d-flex align-items-center justify-content-between p-2 rounded bg-light">
                    <span>Electricity Backup & Generators</span>
                    {building.generatorAvailable || building.electricityBackupAvailable ? (
                      <span className="text-success fw-semibold"><i className="bi bi-lightning-charge-fill me-1"></i> Available</span>
                    ) : (
                      <span className="text-muted">None</span>
                    )}
                  </div>
                  <div className="d-flex align-items-center justify-content-between p-2 rounded bg-light">
                    <span>Continuous Water Supply</span>
                    {building.waterSupplyAvailable ? (
                      <span className="text-success fw-semibold"><i className="bi bi-droplet-fill me-1"></i> Connected</span>
                    ) : (
                      <span className="text-muted">Standard</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
