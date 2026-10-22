'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/apiClient';
import Link from 'next/link';

export default function PropertyDetailPage() {
  const params = useParams();
  const router = useRouter();
  const propertyId = params?.id as string;

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'buildings' | 'floors' | 'units' | 'analytics'>('overview');

  const loadData = async () => {
    setLoading(true);
    try {
      const [hierarchyRes, propRes] = await Promise.all([
        apiClient.get(`/properties/${propertyId}/hierarchy`),
        apiClient.get(`/properties/${propertyId}`)
      ]);
      
      const hierarchy = hierarchyRes.data.success ? hierarchyRes.data.data : {};
      const propDetail = propRes.data.success ? propRes.data.data.property : null;

      setData({
        property: propDetail || hierarchy.property,
        buildings: hierarchy.buildings || [],
        floors: hierarchy.floors || [],
        units: hierarchy.units || []
      });
    } catch (err) {
      console.error('Failed to load property hierarchy', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (propertyId) loadData();
  }, [propertyId]);

  const property = data?.property;
  const buildings: any[] = data?.buildings || [];
  const floors: any[] = data?.floors || [];
  const units: any[] = data?.units || [];

  // Computed Occupancy metrics
  const totalUnits = units.length;
  const occupiedUnits = units.filter((u: any) => u.occupancyStatus === 'OCCUPIED').length;
  const vacantUnits = units.filter((u: any) => u.occupancyStatus === 'VACANT').length;
  const reservedUnits = units.filter((u: any) => u.occupancyStatus === 'RESERVED').length;
  const maintenanceUnits = units.filter((u: any) => u.occupancyStatus === 'MAINTENANCE').length;
  const occupancyRate = totalUnits > 0 ? Math.round((occupiedUnits / totalUnits) * 100) : 0;

  // Building label based on Property Type
  const buildingLabel = useMemo(() => {
    if (property?.propertyType === 'RESIDENTIAL') return { single: 'Tower / Block', plural: 'Towers & Blocks' };
    if (property?.propertyType === 'COMMERCIAL') return { single: 'Building / Wing', plural: 'Buildings & Wings' };
    if (property?.propertyType === 'COWORKING') return { single: 'Centre / Zone', plural: 'Workspace Centres' };
    return { single: 'Building', plural: 'Buildings' };
  }, [property?.propertyType]);

  // Unit label based on Property Type
  const unitLabel = useMemo(() => {
    if (property?.propertyType === 'RESIDENTIAL') return { single: 'Apartment / Flat', plural: 'Flats & Apartments' };
    if (property?.propertyType === 'COMMERCIAL') return { single: 'Office / Unit', plural: 'Commercial Offices' };
    if (property?.propertyType === 'COWORKING') return { single: 'Desk / Space', plural: 'Desks, Cabins & Rooms' };
    return { single: 'Unit / Space', plural: 'Units & Spaces' };
  }, [property?.propertyType]);

  if (loading) {
    return (
      <div className="text-center py-5">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="mt-2 text-muted small">Loading property hierarchy...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="text-center py-5">
        <i className="bi bi-exclamation-circle fs-1 text-muted d-block mb-3"></i>
        <h5 className="fw-bold">Property Not Found</h5>
        <p className="text-muted small">This property might have been archived or removed.</p>
        <Link href="/properties" className="btn btn-primary btn-sm">
          <i className="bi bi-arrow-left me-1"></i> Back to Properties
        </Link>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumbs Navigation */}
      <nav aria-label="breadcrumb" className="mb-3">
        <ol className="breadcrumb small mb-0">
          <li className="breadcrumb-item">
            <Link href="/dashboard" className="text-decoration-none text-muted">Dashboard</Link>
          </li>
          <li className="breadcrumb-item">
            <Link href="/properties" className="text-decoration-none text-muted">Properties</Link>
          </li>
          <li className="breadcrumb-item active text-primary fw-semibold" aria-current="page">
            {property.name}
          </li>
        </ol>
      </nav>

      {/* Property Hero Banner */}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden mb-4 bg-white">
        <div className="p-4 border-bottom d-flex justify-content-between align-items-start flex-wrap gap-3 bg-light">
          <div>
            <div className="d-flex align-items-center gap-2 mb-1 flex-wrap">
              <h2 className="fw-bold mb-0 text-dark">{property.name}</h2>
              <span className={`badge ${
                property.propertyType === 'RESIDENTIAL'
                  ? 'bg-primary'
                  : property.propertyType === 'COMMERCIAL'
                  ? 'bg-info text-dark'
                  : 'bg-success'
              }`}>
                {property.propertyType}
              </span>
              <span className={`badge ${
                property.status === 'ACTIVE'
                  ? 'badge-active'
                  : property.status === 'UNDER_MAINTENANCE'
                  ? 'badge-warning-soft'
                  : 'badge-danger-soft'
              }`}>
                {property.status}
              </span>
            </div>
            <p className="text-secondary small mb-0">
              <strong>Code:</strong> {property.code} • <strong>Location:</strong> {[property.address, property.city, property.state, property.pincode].filter(Boolean).join(', ')}
            </p>
          </div>

          <div className="d-flex align-items-center gap-2">
            <Link href="/properties" className="btn btn-outline-secondary btn-sm d-flex align-items-center gap-1">
              <i className="bi bi-arrow-left"></i> Back
            </Link>
            <Link href={`/buildings?propertyId=${property._id}`} className="btn btn-primary btn-sm d-flex align-items-center gap-1">
              <i className="bi bi-plus-lg"></i> Add {buildingLabel.single}
            </Link>
          </div>
        </div>

        {/* Quick KPI Stats Strip */}
        <div className="row g-0 text-center border-bottom bg-white">
          <div className="col-6 col-md-2 p-3 border-end">
            <small className="text-muted d-block">{buildingLabel.plural}</small>
            <h4 className="fw-bold mb-0 text-primary">{buildings.length}</h4>
          </div>
          <div className="col-6 col-md-2 p-3 border-end">
            <small className="text-muted d-block">Floors / Zones</small>
            <h4 className="fw-bold mb-0 text-dark">{floors.length}</h4>
          </div>
          <div className="col-6 col-md-2 p-3 border-end">
            <small className="text-muted d-block">Total {unitLabel.plural}</small>
            <h4 className="fw-bold mb-0 text-dark">{totalUnits}</h4>
          </div>
          <div className="col-6 col-md-2 p-3 border-end">
            <small className="text-muted d-block">Occupied</small>
            <h4 className="fw-bold mb-0 text-success">{occupiedUnits}</h4>
          </div>
          <div className="col-6 col-md-2 p-3 border-end">
            <small className="text-muted d-block">Vacant</small>
            <h4 className="fw-bold mb-0 text-warning">{vacantUnits}</h4>
          </div>
          <div className="col-6 col-md-2 p-3">
            <small className="text-muted d-block">Occupancy Rate</small>
            <h4 className="fw-bold mb-0 text-info">{occupancyRate}%</h4>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="px-3 pt-2 bg-white">
          <ul className="nav nav-tabs card-header-tabs small fw-semibold">
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'overview' ? 'active text-primary' : 'text-secondary'}`}
                onClick={() => setActiveTab('overview')}
              >
                <i className="bi bi-speedometer2 me-1"></i> Overview & Details
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'buildings' ? 'active text-primary' : 'text-secondary'}`}
                onClick={() => setActiveTab('buildings')}
              >
                <i className="bi bi-houses me-1"></i> {buildingLabel.plural} ({buildings.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'floors' ? 'active text-primary' : 'text-secondary'}`}
                onClick={() => setActiveTab('floors')}
              >
                <i className="bi bi-layers me-1"></i> Floors ({floors.length})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'units' ? 'active text-primary' : 'text-secondary'}`}
                onClick={() => setActiveTab('units')}
              >
                <i className="bi bi-door-open me-1"></i> {unitLabel.plural} ({totalUnits})
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link ${activeTab === 'analytics' ? 'active text-primary' : 'text-secondary'}`}
                onClick={() => setActiveTab('analytics')}
              >
                <i className="bi bi-pie-chart me-1"></i> Analytics & Occupancy
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="row g-3">
          {/* Specifications Card */}
          <div className="col-lg-6">
            <div className="pms-card p-4 h-100 shadow-sm">
              <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-building text-primary"></i> Property Specifications
              </h5>
              <div className="row g-3 small">
                <div className="col-6">
                  <div className="text-muted">Total Built-Up Area</div>
                  <div className="fw-bold">{property.totalBuiltUpArea ? `${Number(property.totalBuiltUpArea).toLocaleString()} sq.ft` : '—'}</div>
                </div>
                <div className="col-6">
                  <div className="text-muted">Common Amenity Area</div>
                  <div className="fw-bold">{property.commonArea ? `${Number(property.commonArea).toLocaleString()} sq.ft` : '—'}</div>
                </div>
                <div className="col-6">
                  <div className="text-muted">Land Area</div>
                  <div className="fw-bold">{property.totalLandArea ? `${Number(property.totalLandArea).toLocaleString()} sq.ft` : '—'}</div>
                </div>
                <div className="col-6">
                  <div className="text-muted">Operating Hours</div>
                  <div className="fw-bold">{property.operatingHours || '24/7'}</div>
                </div>
                <div className="col-12">
                  <div className="text-muted">Description</div>
                  <div className="text-secondary">{property.description || 'No description provided.'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Key Management & Contacts */}
          <div className="col-lg-6">
            <div className="pms-card p-4 h-100 shadow-sm">
              <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-person-lines-fill text-primary"></i> Management & Helplines
              </h5>
              <div className="row g-3 small">
                <div className="col-6">
                  <div className="text-muted">Property Manager</div>
                  <div className="fw-bold text-primary">{property.managerName || '—'}</div>
                  <div className="text-secondary">{property.managerContact}</div>
                </div>
                <div className="col-6">
                  <div className="text-muted">Emergency / Security Helpline</div>
                  <div className="fw-bold text-danger">{property.emergencyContact || '—'}</div>
                </div>
                <div className="col-6">
                  <div className="text-muted">Finance / Accounts Manager</div>
                  <div className="fw-bold">{property.financeManager || '—'}</div>
                </div>
                <div className="col-6">
                  <div className="text-muted">Maintenance Manager</div>
                  <div className="fw-bold">{property.maintenanceManager || '—'}</div>
                </div>
                <div className="col-6">
                  <div className="text-muted">Property Email</div>
                  <div className="fw-semibold">{property.propertyEmail || '—'}</div>
                </div>
                <div className="col-6">
                  <div className="text-muted">Office Hours</div>
                  <div>{property.officeWorkingHours || '—'}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Active Operational Modules */}
          <div className="col-12">
            <div className="pms-card p-4 shadow-sm">
              <h5 className="fw-bold text-dark mb-3 d-flex align-items-center gap-2">
                <i className="bi bi-toggles text-primary"></i> Enabled Operations Modules
              </h5>
              <div className="row g-2">
                {[
                  { key: 'visitor', label: 'Visitor Management', icon: 'bi-person-badge' },
                  { key: 'parking', label: 'Parking Bays', icon: 'bi-p-square' },
                  { key: 'billing', label: 'Billing & Invoices', icon: 'bi-receipt' },
                  { key: 'complaints', label: 'Complaints SLA', icon: 'bi-tools' },
                  { key: 'amc', label: 'AMC & Assets', icon: 'bi-cpu' },
                  { key: 'bookings', label: 'Amenity Bookings', icon: 'bi-calendar2-check' },
                  { key: 'notifications', label: 'Notifications', icon: 'bi-bell' },
                  { key: 'chat', label: 'Community Chat', icon: 'bi-chat-dots' },
                  { key: 'accessControl', label: 'Access Control', icon: 'bi-shield-check' }
                ].map((mod) => {
                  const isEnabled = property.modules?.[mod.key] !== false;
                  return (
                    <div key={mod.key} className="col-6 col-md-4 col-lg-3">
                      <div className={`p-2 rounded border d-flex align-items-center gap-2 ${isEnabled ? 'bg-light' : 'bg-white opacity-50'}`}>
                        <i className={`bi ${mod.icon} ${isEnabled ? 'text-primary' : 'text-muted'}`}></i>
                        <span className="small fw-semibold text-dark">{mod.label}</span>
                        {isEnabled ? (
                          <span className="badge bg-success-soft text-success ms-auto" style={{ fontSize: '0.65rem' }}>Active</span>
                        ) : (
                          <span className="badge bg-light text-muted ms-auto" style={{ fontSize: '0.65rem' }}>Off</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: BUILDINGS */}
      {activeTab === 'buildings' && (
        <div className="row g-3">
          <div className="col-12 d-flex justify-content-between align-items-center mb-1">
            <h5 className="fw-bold mb-0">{buildingLabel.plural} ({buildings.length})</h5>
            <Link href={`/buildings?propertyId=${property._id}`} className="btn btn-primary btn-sm">
              <i className="bi bi-plus-lg me-1"></i> Add {buildingLabel.single}
            </Link>
          </div>

          {buildings.length === 0 ? (
            <div className="col-12 text-center py-5 bg-white rounded border">
              <i className="bi bi-houses fs-1 text-muted d-block mb-2"></i>
              <h6 className="fw-bold">No {buildingLabel.plural} Added Yet</h6>
              <p className="text-muted small">Begin structuring this property by adding its first {buildingLabel.single}.</p>
              <Link href={`/buildings?propertyId=${property._id}`} className="btn btn-outline-primary btn-sm">
                <i className="bi bi-plus-lg me-1"></i> Add {buildingLabel.single}
              </Link>
            </div>
          ) : (
            buildings.map((bldg) => {
              const bldgFloors = floors.filter((f) => f.buildingId?._id === bldg._id || f.buildingId === bldg._id);
              const bldgUnits = units.filter((u) => u.buildingId?._id === bldg._id || u.buildingId === bldg._id);
              return (
                <div key={bldg._id} className="col-md-6 col-xl-4">
                  <div className="pms-card p-4 h-100 d-flex flex-column justify-content-between shadow-sm">
                    <div>
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <span className="badge bg-light text-dark border fw-bold">CODE: {bldg.code}</span>
                        <span className="badge badge-active">{bldg.status}</span>
                      </div>
                      <h4 className="fw-bold text-dark mb-1">{bldg.name}</h4>
                      <div className="small text-muted mb-3">Type: <strong>{bldg.buildingType || 'Block'}</strong></div>

                      <div className="row g-2 small text-secondary mb-3">
                        <div className="col-6">
                          <i className="bi bi-layers me-1 text-primary"></i>
                          Floors: <strong>{bldgFloors.length || bldg.totalFloors || 0}</strong>
                        </div>
                        <div className="col-6">
                          <i className="bi bi-door-open me-1 text-primary"></i>
                          Units: <strong>{bldgUnits.length || bldg.totalUnits || 0}</strong>
                        </div>
                        <div className="col-6">
                          <i className="bi bi-person me-1 text-primary"></i>
                          Manager: <strong>{bldg.managerName || '—'}</strong>
                        </div>
                        <div className="col-6">
                          <i className="bi bi-arrow-up-circle me-1 text-primary"></i>
                          Lifts: <strong>{bldg.liftCount || 1}</strong>
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-top d-flex justify-content-between align-items-center">
                      <span className="small text-muted">
                        Occupied: <strong>{bldgUnits.filter((u) => u.occupancyStatus === 'OCCUPIED').length}</strong>
                      </span>
                      <Link href={`/floors?buildingId=${bldg._id}`} className="btn btn-outline-primary btn-sm">
                        View Floors <i className="bi bi-chevron-right"></i>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* TAB 3: FLOORS */}
      {activeTab === 'floors' && (
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white">
          <div className="p-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h6 className="fw-bold mb-0">Configured Floors ({floors.length})</h6>
            <Link href={`/floors?propertyId=${property._id}`} className="btn btn-primary btn-sm">
              <i className="bi bi-plus-lg me-1"></i> Add Floor
            </Link>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Floor Number</th>
                  <th>Floor Name</th>
                  <th>Building</th>
                  <th>Floor Type</th>
                  <th>Units Count</th>
                  <th>Floor Manager</th>
                  <th>Status</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {floors.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-muted">No floors configured yet.</td>
                  </tr>
                ) : (
                  floors.map((floor) => {
                    const floorUnits = units.filter((u) => u.floorId?._id === floor._id || u.floorId === floor._id);
                    return (
                      <tr key={floor._id}>
                        <td>
                          <span className="badge bg-light text-dark border fw-bold px-2 py-1">
                            Level {floor.floorNumber}
                          </span>
                        </td>
                        <td className="fw-semibold text-dark">{floor.floorName}</td>
                        <td>{floor.buildingId?.name || '—'}</td>
                        <td>
                          <span className="badge bg-secondary-subtle text-secondary border">
                            {floor.floorType || 'STANDARD_FLOOR'}
                          </span>
                        </td>
                        <td>
                          <strong>{floorUnits.length}</strong> {unitLabel.plural}
                        </td>
                        <td>{floor.floorManager || '—'}</td>
                        <td>
                          <span className={`badge ${floor.status === 'ACTIVE' ? 'badge-active' : 'badge-danger-soft'}`}>
                            {floor.status}
                          </span>
                        </td>
                        <td className="text-end">
                          <Link href={`/units?floorId=${floor._id}`} className="btn btn-outline-primary btn-sm">
                            View Units <i className="bi bi-chevron-right"></i>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: UNITS & SPACES */}
      {activeTab === 'units' && (
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden bg-white">
          <div className="p-3 border-bottom d-flex justify-content-between align-items-center flex-wrap gap-2">
            <h6 className="fw-bold mb-0">All {unitLabel.plural} ({units.length})</h6>
            <Link href={`/units?propertyId=${property._id}`} className="btn btn-primary btn-sm">
              <i className="bi bi-plus-lg me-1"></i> Add {unitLabel.single}
            </Link>
          </div>
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Unit/Space No</th>
                  <th>Type</th>
                  <th>Building & Floor</th>
                  <th>Area</th>
                  <th>Current Occupant</th>
                  <th>Status</th>
                  <th>Rent / Fee</th>
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {units.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-4 text-muted">No units or spaces configured yet.</td>
                  </tr>
                ) : (
                  units.map((unit) => {
                    const occupantName = unit.currentResidentId?.name 
                      || unit.currentTenantCompanyId?.companyName 
                      || unit.currentMemberId?.memberName 
                      || unit.residentName 
                      || unit.tenantCompany 
                      || unit.assignedMemberName 
                      || '—';

                    return (
                      <tr key={unit._id}>
                        <td>
                          <div className="fw-bold text-dark">{unit.unitNumber || unit.flatNumber || unit.spaceNumber}</div>
                          {unit.unitName && <small className="text-muted">{unit.unitName}</small>}
                        </td>
                        <td>
                          <span className="badge bg-light text-primary border">
                            {unit.unitType || unit.bhkType || unit.commercialUnitType || unit.spaceType || 'STANDARD'}
                          </span>
                        </td>
                        <td>
                          <div className="small">{unit.buildingId?.name || '—'}</div>
                          <small className="text-muted">Floor {unit.floorId?.floorNumber || '—'}</small>
                        </td>
                        <td>
                          {unit.carpetArea || unit.builtUpArea ? `${unit.carpetArea || unit.builtUpArea} sq.ft` : '—'}
                        </td>
                        <td>
                          <div className="small fw-semibold">{occupantName}</div>
                        </td>
                        <td>
                          <span className={`badge ${
                            unit.occupancyStatus === 'OCCUPIED'
                              ? 'badge-active'
                              : unit.occupancyStatus === 'VACANT'
                              ? 'bg-light text-dark border'
                              : 'badge-warning-soft'
                          }`}>
                            {unit.occupancyStatus}
                          </span>
                        </td>
                        <td>
                          <div className="small fw-semibold">
                            {unit.monthlyRent || unit.monthlyMaintenanceAmount || unit.monthlyPrice 
                              ? `₹${(unit.monthlyRent || unit.monthlyMaintenanceAmount || unit.monthlyPrice).toLocaleString()}` 
                              : '—'}
                          </div>
                        </td>
                        <td className="text-end">
                          <Link href={`/units/${unit._id}`} className="btn btn-outline-secondary btn-sm">
                            Details <i className="bi bi-chevron-right"></i>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 5: ANALYTICS & OCCUPANCY */}
      {activeTab === 'analytics' && (
        <div className="row g-3">
          <div className="col-md-4">
            <div className="pms-card p-4 text-center h-100 shadow-sm">
              <h6 className="fw-bold text-muted text-uppercase mb-3">Overall Occupancy</h6>
              <div className="position-relative d-inline-block mb-3" style={{ width: 140, height: 140 }}>
                <div
                  className="rounded-circle border border-5 border-primary d-flex align-items-center justify-content-center h-100"
                  style={{ fontSize: '1.8rem', fontWeight: 700 }}
                >
                  {occupancyRate}%
                </div>
              </div>
              <div className="d-flex justify-content-around small">
                <div>
                  <span className="badge bg-success mb-1 d-block">{occupiedUnits}</span>
                  <span className="text-muted">Occupied</span>
                </div>
                <div>
                  <span className="badge bg-warning mb-1 d-block">{vacantUnits}</span>
                  <span className="text-muted">Vacant</span>
                </div>
                <div>
                  <span className="badge bg-info mb-1 d-block">{reservedUnits + maintenanceUnits}</span>
                  <span className="text-muted">Other</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-8">
            <div className="pms-card p-4 h-100 shadow-sm">
              <h6 className="fw-bold text-dark mb-3">Building-Wise Capacity Breakdown</h6>
              {buildings.length === 0 ? (
                <p className="text-muted small">No building capacity data available.</p>
              ) : (
                <div className="d-flex flex-column gap-3">
                  {buildings.map((bldg) => {
                    const bldgUnits = units.filter((u) => u.buildingId?._id === bldg._id || u.buildingId === bldg._id);
                    const bldgOccupied = bldgUnits.filter((u) => u.occupancyStatus === 'OCCUPIED').length;
                    const pct = bldgUnits.length > 0 ? Math.round((bldgOccupied / bldgUnits.length) * 100) : 0;
                    return (
                      <div key={bldg._id}>
                        <div className="d-flex justify-content-between small fw-semibold mb-1">
                          <span>{bldg.name} ({bldg.code})</span>
                          <span>{bldgOccupied} / {bldgUnits.length} units ({pct}%)</span>
                        </div>
                        <div className="progress" style={{ height: 8 }}>
                          <div
                            className="progress-bar bg-primary"
                            role="progressbar"
                            style={{ width: `${pct}%` }}
                            aria-valuenow={pct}
                            aria-valuemin={0}
                            aria-valuemax={100}
                          ></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
