'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/apiClient';
import Link from 'next/link';

export default function UnitDetailPage() {
  const params = useParams();
  const router = useRouter();
  const unitId = params?.id as string;

  const [unit, setUnit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'occupant' | 'financials' | 'amenities'>('profile');

  const loadUnitData = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await apiClient.get(`/structure/units/${unitId}`);
      if (res.data.success) {
        setUnit(res.data.data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load unit details');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (unitId) loadUnitData();
  }, [unitId]);

  const handleStatusChange = async (newOccupancy: string) => {
    try {
      const res = await apiClient.put(`/structure/units/${unitId}/status`, { occupancyStatus: newOccupancy });
      if (res.data.success) {
        setUnit((prev: any) => ({ ...prev, occupancyStatus: newOccupancy }));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const propType = (unit?.propertyId?.propertyType || 'RESIDENTIAL').toUpperCase();

  const unitCategoryLabel = useMemo(() => {
    if (propType === 'COMMERCIAL') return 'Commercial Office / Space';
    if (propType === 'COWORKING') return 'Coworking Station / Cabin';
    return 'Residential Flat / Apartment';
  }, [propType]);

  if (loading) {
    return (
      <div className="container-fluid py-5 text-center">
        <div className="spinner-border text-primary" role="status"></div>
        <p className="text-muted small mt-2">Loading space profile...</p>
      </div>
    );
  }

  if (error || !unit) {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-danger shadow-sm rounded-3">
          <i className="bi bi-exclamation-triangle me-2"></i>{error || 'Unit / Space not found'}
          <div className="mt-3">
            <button className="btn btn-sm btn-outline-danger me-2" onClick={loadUnitData}>Retry</button>
            <Link href="/units" className="btn btn-sm btn-secondary">Back to Inventory</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-2">
      {/* Breadcrumb Navigation */}
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb mb-2 small">
          <li className="breadcrumb-item"><Link href="/dashboard" className="text-decoration-none">Dashboard</Link></li>
          <li className="breadcrumb-item"><Link href="/properties" className="text-decoration-none">Properties</Link></li>
          <li className="breadcrumb-item">
            <Link href={`/properties/${unit.propertyId?._id || unit.propertyId}`} className="text-decoration-none">
              {unit.propertyId?.name || 'Property'}
            </Link>
          </li>
          <li className="breadcrumb-item">
            <Link href={`/buildings/${unit.buildingId?._id || unit.buildingId}`} className="text-decoration-none">
              {unit.buildingId?.name || 'Building'}
            </Link>
          </li>
          <li className="breadcrumb-item"><Link href="/units" className="text-decoration-none">Units & Spaces</Link></li>
          <li className="breadcrumb-item active" aria-current="page">{unit.wing ? `${unit.wing}-` : ''}{unit.unitNumber}</li>
        </ol>
      </nav>

      {/* Header Banner */}
      <div className="card border-0 shadow-sm rounded-3 p-4 mb-4 bg-white">
        <div className="d-flex flex-wrap justify-content-between align-items-center gap-3">
          <div>
            <div className="d-flex align-items-center gap-2">
              <h2 className="fw-bold mb-0 text-dark">
                {unit.wing ? `${unit.wing}-` : ''}{unit.unitNumber}
              </h2>
              {unit.unitCode && (
                <span className="badge bg-light text-dark border">
                  Code: {unit.unitCode}
                </span>
              )}
              <span className={`badge ${
                unit.occupancyStatus === 'OCCUPIED' ? 'bg-success-subtle text-success border border-success-subtle' :
                unit.occupancyStatus === 'VACANT' ? 'bg-info-subtle text-info border border-info-subtle' :
                'bg-warning-subtle text-warning border border-warning-subtle'
              }`}>
                {unit.occupancyStatus || 'VACANT'}
              </span>
              <span className="badge bg-secondary-subtle text-secondary">
                {unit.furnishingType?.replace('_', ' ') || 'STANDARD'}
              </span>
            </div>
            <div className="text-muted small mt-1">
              <i className="bi bi-geo-alt me-1"></i>
              {unit.propertyId?.name} • {unit.buildingId?.name} • {unit.floorId?.floorName || `Floor ${unit.floorId?.floorNumber || 0}`}
              {unit.bhkType && ` • ${unit.bhkType}`}
              {unit.facing && ` • Facing ${unit.facing}`}
            </div>
          </div>

          <div className="d-flex align-items-center gap-2">
            <div className="dropdown">
              <button className="btn btn-outline-secondary btn-sm dropdown-toggle" data-bs-toggle="dropdown">
                Change Status
              </button>
              <ul className="dropdown-menu dropdown-menu-end shadow-sm small">
                <li><button className="dropdown-item text-success" onClick={() => handleStatusChange('OCCUPIED')}>Mark Occupied</button></li>
                <li><button className="dropdown-item text-info" onClick={() => handleStatusChange('VACANT')}>Mark Vacant</button></li>
                <li><button className="dropdown-item text-warning" onClick={() => handleStatusChange('MAINTENANCE')}>Mark Maintenance</button></li>
              </ul>
            </div>
            <Link href={`/units`} className="btn btn-primary btn-sm">
              <i className="bi bi-arrow-left me-1"></i> Back to Directory
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Row */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
            <span className="text-muted small">Carpet Area</span>
            <h4 className="fw-bold mb-0 mt-1">{unit.carpetArea ? `${unit.carpetArea} sq.ft` : 'N/A'}</h4>
            <div className="small text-muted mt-1">Super Built-up: {unit.superBuiltUpArea || 'N/A'} sq.ft</div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
            <span className="text-muted small">
              {propType === 'RESIDENTIAL' ? 'Monthly Maintenance' : propType === 'COMMERCIAL' ? 'Monthly Rent' : 'Desk Membership'}
            </span>
            <h4 className="fw-bold mb-0 mt-1 text-primary">
              {propType === 'RESIDENTIAL'
                ? (unit.monthlyMaintenanceAmount ? `₹${Number(unit.monthlyMaintenanceAmount).toLocaleString()}` : '-')
                : propType === 'COMMERCIAL'
                ? (unit.monthlyRent ? `₹${Number(unit.monthlyRent).toLocaleString()}` : '-')
                : (unit.monthlyPrice ? `₹${Number(unit.monthlyPrice).toLocaleString()}` : '-')}
            </h4>
            <div className="small text-muted mt-1">
              {propType === 'COMMERCIAL' && unit.camCharges ? `CAM: ₹${unit.camCharges}/sq.ft` : 'Standard billing cycle'}
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
            <span className="text-muted small">Current Occupant</span>
            <h5 className="fw-bold mb-0 mt-1 text-dark text-truncate">
              {unit.currentResidentId?.name || unit.residentName || unit.currentTenantCompanyId?.companyName || unit.tenantCompany || unit.assignedMemberName || unit.assignedCompanyName || 'Vacant'}
            </h5>
            <div className="small text-muted mt-1">
              {unit.currentResidentId?.mobile || unit.tenantContactPerson || unit.ownershipType || 'Available for allocation'}
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-white">
            <span className="text-muted small">Seating / Capacity</span>
            <h4 className="fw-bold mb-0 mt-1">{unit.seatingCapacity || unit.capacity || 1} Persons</h4>
            <div className="small text-muted mt-1">{unit.workstationsCount ? `${unit.workstationsCount} Workstations` : 'Standard configuration'}</div>
          </div>
        </div>
      </div>

      {/* Detail Tabs */}
      <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
        <div className="card-header bg-white border-bottom p-0">
          <ul className="nav nav-tabs border-bottom-0 px-3 pt-2">
            <li className="nav-item">
              <button
                className={`nav-link py-2 px-3 fw-medium ${activeTab === 'profile' ? 'active text-primary' : 'text-secondary'}`}
                onClick={() => setActiveTab('profile')}
              >
                <i className="bi bi-building me-1"></i> Specifications & Dimensions
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link py-2 px-3 fw-medium ${activeTab === 'occupant' ? 'active text-primary' : 'text-secondary'}`}
                onClick={() => setActiveTab('occupant')}
              >
                <i className="bi bi-people me-1"></i>
                {propType === 'RESIDENTIAL' ? 'Resident & Ownership' : propType === 'COMMERCIAL' ? 'Tenant & Lease Agreement' : 'Member & Station'}
              </button>
            </li>
            <li className="nav-item">
              <button
                className={`nav-link py-2 px-3 fw-medium ${activeTab === 'financials' ? 'active text-primary' : 'text-secondary'}`}
                onClick={() => setActiveTab('financials')}
              >
                <i className="bi bi-cash-stack me-1"></i> Financials & Tariffs
              </button>
            </li>
            {propType === 'COWORKING' && (
              <li className="nav-item">
                <button
                  className={`nav-link py-2 px-3 fw-medium ${activeTab === 'amenities' ? 'active text-primary' : 'text-secondary'}`}
                  onClick={() => setActiveTab('amenities')}
                >
                  <i className="bi bi-lightning-charge me-1"></i> Facilities & Access
                </button>
              </li>
            )}
          </ul>
        </div>

        <div className="card-body p-4">
          {/* TAB 1: SPECIFICATIONS */}
          {activeTab === 'profile' && (
            <div className="row g-4">
              <div className="col-md-6">
                <h6 className="fw-bold border-bottom pb-2 mb-3">Dimensional Measurements</h6>
                <table className="table table-sm table-borderless small mb-0">
                  <tbody>
                    <tr>
                      <td className="text-muted ps-0">Carpet Area:</td>
                      <td className="fw-semibold text-end">{unit.carpetArea ? `${unit.carpetArea} sq.ft` : 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="text-muted ps-0">Built-Up Area:</td>
                      <td className="fw-semibold text-end">{unit.builtUpArea ? `${unit.builtUpArea} sq.ft` : 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="text-muted ps-0">Super Built-Up Area:</td>
                      <td className="fw-semibold text-end">{unit.superBuiltUpArea ? `${unit.superBuiltUpArea} sq.ft` : 'N/A'}</td>
                    </tr>
                    <tr>
                      <td className="text-muted ps-0">Max Capacity:</td>
                      <td className="fw-semibold text-end">{unit.capacity || 1} people</td>
                    </tr>
                    <tr>
                      <td className="text-muted ps-0">Workstations Available:</td>
                      <td className="fw-semibold text-end">{unit.workstationsCount || 0}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="col-md-6">
                <h6 className="fw-bold border-bottom pb-2 mb-3">Classification & Configuration</h6>
                <table className="table table-sm table-borderless small mb-0">
                  <tbody>
                    <tr>
                      <td className="text-muted ps-0">Unit Type:</td>
                      <td className="fw-semibold text-end">{unit.unitType?.replace('_', ' ')}</td>
                    </tr>
                    <tr>
                      <td className="text-muted ps-0">Furnishing State:</td>
                      <td className="fw-semibold text-end">{unit.furnishingType?.replace('_', ' ') || 'Unfurnished'}</td>
                    </tr>
                    {unit.bhkType && (
                      <tr>
                        <td className="text-muted ps-0">BHK Model:</td>
                        <td className="fw-semibold text-end">{unit.bhkType}</td>
                      </tr>
                    )}
                    {unit.facing && (
                      <tr>
                        <td className="text-muted ps-0">Direction Facing:</td>
                        <td className="fw-semibold text-end">{unit.facing}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="text-muted ps-0">Operating Status:</td>
                      <td className="fw-semibold text-end">{unit.status || 'AVAILABLE'}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {unit.description && (
                <div className="col-12 mt-3">
                  <h6 className="fw-bold border-bottom pb-2 mb-2">Notes & Remarks</h6>
                  <p className="text-secondary small mb-0">{unit.description}</p>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: OCCUPANT */}
          {activeTab === 'occupant' && (
            <div>
              {propType === 'RESIDENTIAL' ? (
                <div className="row g-4 small">
                  <div className="col-md-6">
                    <h6 className="fw-bold border-bottom pb-2 mb-3">Ownership Details</h6>
                    <div className="mb-2">
                      <span className="text-muted d-block">Ownership Mode:</span>
                      <span className="fw-semibold">{unit.ownershipType?.replace('_', ' ') || 'Not specified'}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted d-block">Registered Owner:</span>
                      <span className="fw-semibold">{unit.ownerName || 'Not recorded'}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted d-block">Current Resident:</span>
                      <span className="fw-semibold">{unit.currentResidentId?.name || unit.residentName || 'Unassigned'}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted d-block">Family Members Count:</span>
                      <span className="fw-semibold">{unit.familyMembersCount || 0} Members</span>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <h6 className="fw-bold border-bottom pb-2 mb-3">Utility Connections</h6>
                    <div className="p-3 bg-light rounded-3">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Electricity Meter #:</span>
                        <span className="fw-semibold">{unit.utilityMeters?.electricity || 'N/A'}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Water Meter #:</span>
                        <span className="fw-semibold">{unit.utilityMeters?.water || 'N/A'}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Piped Gas Meter #:</span>
                        <span className="fw-semibold">{unit.utilityMeters?.gas || 'N/A'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : propType === 'COMMERCIAL' ? (
                <div className="row g-4 small">
                  <div className="col-md-6">
                    <h6 className="fw-bold border-bottom pb-2 mb-3">Corporate Tenant Information</h6>
                    <div className="mb-2">
                      <span className="text-muted d-block">Company Name:</span>
                      <span className="fw-semibold">{unit.currentTenantCompanyId?.companyName || unit.tenantCompany || 'Vacant'}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted d-block">Contact Person:</span>
                      <span className="fw-semibold">{unit.tenantContactPerson || 'N/A'}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted d-block">Email & Phone:</span>
                      <span className="fw-semibold">{unit.tenantEmail || '-'} • {unit.tenantPhone || '-'}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted d-block">GSTIN & PAN:</span>
                      <span className="fw-semibold">{unit.gstNumber || '-'} • {unit.panNumber || '-'}</span>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <h6 className="fw-bold border-bottom pb-2 mb-3">Lease Terms & Timeline</h6>
                    <div className="p-3 bg-light rounded-3">
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Lease Period:</span>
                        <span className="fw-semibold">
                          {unit.leaseStartDate ? new Date(unit.leaseStartDate).toLocaleDateString() : 'N/A'} to{' '}
                          {unit.leaseEndDate ? new Date(unit.leaseEndDate).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Lock-In Period:</span>
                        <span className="fw-semibold">{unit.lockInPeriodMonths ? `${unit.lockInPeriodMonths} Months` : 'None'}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Notice Period:</span>
                        <span className="fw-semibold">{unit.noticePeriodMonths ? `${unit.noticePeriodMonths} Months` : 'None'}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Rent Escalation Rate:</span>
                        <span className="fw-semibold">{unit.escalationPercentage ? `${unit.escalationPercentage}% per annum` : '0%'}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="row g-4 small">
                  <div className="col-md-6">
                    <h6 className="fw-bold border-bottom pb-2 mb-3">Coworking Member Details</h6>
                    <div className="mb-2">
                      <span className="text-muted d-block">Assigned Member:</span>
                      <span className="fw-semibold">{unit.currentMemberId?.memberName || unit.assignedMemberName || 'Unassigned'}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted d-block">Company / Team:</span>
                      <span className="fw-semibold">{unit.assignedCompanyName || 'Independent / Freelancer'}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted d-block">Membership Plan:</span>
                      <span className="badge bg-primary-subtle text-primary">{unit.membershipPlan || 'MONTHLY_DEDICATED'}</span>
                    </div>
                    <div className="mb-2">
                      <span className="text-muted d-block">Access Schedule:</span>
                      <span className="fw-semibold">{unit.accessTiming || '24/7 Access'}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: FINANCIALS */}
          {activeTab === 'financials' && (
            <div className="row g-4 small">
              <div className="col-md-6">
                <h6 className="fw-bold border-bottom pb-2 mb-3">Commercial Rate Structure</h6>
                <div className="p-3 bg-light rounded-3">
                  {propType === 'RESIDENTIAL' ? (
                    <div className="d-flex justify-content-between">
                      <span className="text-muted">Monthly Maintenance:</span>
                      <span className="fw-bold text-primary">₹{unit.monthlyMaintenanceAmount ? Number(unit.monthlyMaintenanceAmount).toLocaleString() : '0'}</span>
                    </div>
                  ) : propType === 'COMMERCIAL' ? (
                    <>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Base Monthly Rent:</span>
                        <span className="fw-bold text-primary">₹{unit.monthlyRent ? Number(unit.monthlyRent).toLocaleString() : '0'}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">CAM Rate (sq.ft):</span>
                        <span className="fw-semibold">₹{unit.camCharges || 0}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Security Deposit:</span>
                        <span className="fw-semibold">₹{unit.securityDeposit ? Number(unit.securityDeposit).toLocaleString() : '0'}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Rent Due Day:</span>
                        <span className="fw-semibold">{unit.rentDueDate || 5}th of every month</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Monthly Membership:</span>
                        <span className="fw-bold text-primary">₹{unit.monthlyPrice ? Number(unit.monthlyPrice).toLocaleString() : '0'}</span>
                      </div>
                      <div className="d-flex justify-content-between mb-2">
                        <span className="text-muted">Daily Rate:</span>
                        <span className="fw-semibold">₹{unit.dailyPrice || 0}</span>
                      </div>
                      <div className="d-flex justify-content-between">
                        <span className="text-muted">Hourly Rate:</span>
                        <span className="fw-semibold">₹{unit.hourlyPrice || 0}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AMENITIES (COWORKING) */}
          {activeTab === 'amenities' && propType === 'COWORKING' && (
            <div className="row g-3 small">
              <div className="col-12">
                <h6 className="fw-bold border-bottom pb-2 mb-3">Assigned Amenities & Privileges</h6>
              </div>
              <div className="col-6 col-md-4">
                <div className="p-3 border rounded-3 bg-light">
                  <i className="bi bi-wifi text-primary me-2 fs-5"></i>
                  <span className="fw-semibold">High-Speed WiFi</span>
                  <div className="text-muted small mt-1">{unit.internetAvailability ? 'Enabled' : 'Disabled'}</div>
                </div>
              </div>
              <div className="col-6 col-md-4">
                <div className="p-3 border rounded-3 bg-light">
                  <i className="bi bi-lightning text-warning me-2 fs-5"></i>
                  <span className="fw-semibold">Power Backup</span>
                  <div className="text-muted small mt-1">{unit.powerBackupAvailable ? '24/7 Uninterrupted' : 'Standard'}</div>
                </div>
              </div>
              <div className="col-6 col-md-4">
                <div className="p-3 border rounded-3 bg-light">
                  <i className="bi bi-camera-video text-info me-2 fs-5"></i>
                  <span className="fw-semibold">Meeting Room Access</span>
                  <div className="text-muted small mt-1">{unit.meetingRoomAccess ? 'Credits Available' : 'On Request'}</div>
                </div>
              </div>
              <div className="col-6 col-md-4">
                <div className="p-3 border rounded-3 bg-light">
                  <i className="bi bi-printer text-secondary me-2 fs-5"></i>
                  <span className="fw-semibold">Printing / Scanning</span>
                  <div className="text-muted small mt-1">{unit.printingAccess ? 'Included' : 'Paid'}</div>
                </div>
              </div>
              <div className="col-6 col-md-4">
                <div className="p-3 border rounded-3 bg-light">
                  <i className="bi bi-shield-lock text-dark me-2 fs-5"></i>
                  <span className="fw-semibold">Dedicated Locker</span>
                  <div className="text-muted small mt-1">{unit.lockerAvailable ? 'Assigned' : 'None'}</div>
                </div>
              </div>
              <div className="col-6 col-md-4">
                <div className="p-3 border rounded-3 bg-light">
                  <i className="bi bi-p-square text-success me-2 fs-5"></i>
                  <span className="fw-semibold">Parking Slot</span>
                  <div className="text-muted small mt-1">{unit.parkingAvailable ? 'Reserved' : 'Visitor Only'}</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
