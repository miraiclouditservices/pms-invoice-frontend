'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/apiClient';
import { PropertyType } from '../../../lib/models/visitor.types';

export default function CreateVisitorPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);

  // Hierarchy selections
  const [properties, setProperties] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);

  // Form State
  const [formData, setFormData] = useState({
    // Step 1: Visitor details
    visitorName: '',
    mobile: '',
    email: '',
    visitorType: 'GUEST',
    numberOfVisitors: 1,
    accompanyingVisitors: '',
    idProofType: 'AADHAAR',
    idProofNumber: '',
    purpose: '',
    emergencyContact: '',

    // Step 2: Host & Location
    propertyType: 'RESIDENTIAL' as PropertyType,
    propertyId: '',
    propertyName: '',
    buildingId: '',
    buildingName: '',
    floorId: '',
    floorName: '',
    unitId: '',
    unitNumber: '',
    hostType: 'RESIDENT',
    hostName: '',
    hostMobile: '',
    companyName: '',

    // Step 3: Visit Schedule
    expectedDate: new Date().toISOString().split('T')[0],
    expectedTime: '14:00',
    expectedExitTime: '18:00',
    gatePassType: 'ONE_TIME',

    // Step 4: Vehicle Details
    visitingByVehicle: false,
    vehicleType: 'CAR',
    vehicleNumber: '',
    parkingRequired: false,
    parkingSlot: '',
    driverName: '',

    // Step 5: Additional Access
    allowedGates: ['Main Gate 1'],
    allowedAreas: 'Lobby, Elevators, Host Unit',
    securityRemarks: ''
  });

  // Load properties on mount
  useEffect(() => {
    apiClient.get('/properties').then((res) => {
      if (res.data.success && res.data.data.length > 0) {
        setProperties(res.data.data);
        const first = res.data.data[0];
        setFormData((prev) => ({
          ...prev,
          propertyId: first._id,
          propertyName: first.name,
          propertyType: first.propertyType || 'RESIDENTIAL'
        }));
      }
    }).catch(console.error);
  }, []);

  // Load buildings when property changes
  useEffect(() => {
    if (!formData.propertyId) return;
    apiClient.get('/structure/buildings', { params: { propertyId: formData.propertyId } }).then((res) => {
      if (res.data.success) {
        setBuildings(res.data.data);
        if (res.data.data.length > 0) {
          const b = res.data.data[0];
          setFormData((prev) => ({ ...prev, buildingId: b._id, buildingName: b.name }));
        } else {
          setFormData((prev) => ({ ...prev, buildingId: '', buildingName: '' }));
        }
      }
    }).catch(console.error);
  }, [formData.propertyId]);

  // Load floors when building changes
  useEffect(() => {
    if (!formData.buildingId) return;
    apiClient.get('/structure/floors', { params: { buildingId: formData.buildingId } }).then((res) => {
      if (res.data.success) {
        setFloors(res.data.data);
        if (res.data.data.length > 0) {
          const f = res.data.data[0];
          setFormData((prev) => ({ ...prev, floorId: f._id, floorName: f.floorName || `Floor ${f.floorNumber}` }));
        } else {
          setFormData((prev) => ({ ...prev, floorId: '', floorName: '' }));
        }
      }
    }).catch(console.error);
  }, [formData.buildingId]);

  // Load units when floor changes
  useEffect(() => {
    if (!formData.floorId) return;
    apiClient.get('/structure/units', { params: { floorId: formData.floorId } }).then((res) => {
      if (res.data.success) {
        setUnits(res.data.data);
        if (res.data.data.length > 0) {
          const u = res.data.data[0];
          setFormData((prev) => ({ ...prev, unitId: u._id, unitNumber: u.unitNumber }));
        } else {
          setFormData((prev) => ({ ...prev, unitId: '', unitNumber: '' }));
        }
      }
    }).catch(console.error);
  }, [formData.floorId]);

  const handlePropertySelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = properties.find((p) => p._id === e.target.value);
    if (selected) {
      setFormData((prev) => ({
        ...prev,
        propertyId: selected._id,
        propertyName: selected.name,
        propertyType: selected.propertyType || 'RESIDENTIAL',
        hostType: selected.propertyType === 'COMMERCIAL' ? 'TENANT_EMPLOYEE' : selected.propertyType === 'COWORKING' ? 'COWORKING_MEMBER' : 'RESIDENT'
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        accompanyingVisitors: formData.accompanyingVisitors
          ? formData.accompanyingVisitors.split(',').map((s) => s.trim())
          : [],
        vehicleType: formData.visitingByVehicle ? formData.vehicleType : 'NONE',
        vehicleNumber: formData.visitingByVehicle ? formData.vehicleNumber : '',
        allowedAreas: formData.allowedAreas.split(',').map((s) => s.trim())
      };

      const res = await apiClient.post('/visitors', payload);
      if (res.data.success) {
        alert('Visitor pre-registration successful! Gate Pass code generated.');
        router.push(`/visitors/pass/${res.data.data._id}`);
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create visitor pass');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="container py-4" style={{ maxWidth: '820px' }}>
      {/* Breadcrumb Header */}
      <div className="d-flex justify-content-between align-items-center mb-4 pb-2 border-bottom">
        <div>
          <Link href="/visitors" className="text-decoration-none text-secondary small d-flex align-items-center gap-1 mb-1">
            <i className="bi bi-arrow-left"></i> Back to Visitor Management
          </Link>
          <h3 className="fw-bold mb-0">Pre-Register Visitor & Gate Pass</h3>
        </div>
        <span className="badge bg-primary px-3 py-2">Step {currentStep} of 6</span>
      </div>

      {/* Step Indicators */}
      <div className="d-flex justify-content-between mb-4 px-2 position-relative">
        {['Visitor Details', 'Host & Unit', 'Schedule', 'Vehicle', 'Access Gates', 'Review & Issue'].map((label, idx) => (
          <div key={label} className="text-center" style={{ zIndex: 2 }}>
            <div
              className={`rounded-circle d-flex align-items-center justify-content-center mx-auto mb-1 ${currentStep === idx + 1 ? 'bg-primary text-white fw-bold shadow' : currentStep > idx + 1 ? 'bg-success text-white' : 'bg-light text-secondary border'}`}
              style={{ width: '32px', height: '32px', fontSize: '13px' }}
            >
              {currentStep > idx + 1 ? <i className="bi bi-check-lg"></i> : idx + 1}
            </div>
            <span className="extra-small d-none d-md-block text-secondary">{label}</span>
          </div>
        ))}
      </div>

      <div className="pms-card p-4 shadow-sm">
        <form onSubmit={currentStep === 6 ? handleSubmit : (e) => { e.preventDefault(); setCurrentStep(prev => prev + 1); }}>
          {/* STEP 1: VISITOR DETAILS */}
          {currentStep === 1 && (
            <div>
              <h5 className="fw-bold mb-3 text-primary">Step 1 — Visitor Identity & Purpose</h5>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Visitor Full Name *</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    required
                    placeholder="e.g. Ramesh Kulkarni"
                    value={formData.visitorName}
                    onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Mobile Number *</label>
                  <input
                    type="tel"
                    className="form-control form-control-sm"
                    required
                    placeholder="+91 9876543210"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Email Address (Optional)</label>
                  <input
                    type="email"
                    className="form-control form-control-sm"
                    placeholder="visitor@example.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Visitor Type *</label>
                  <select
                    className="form-select form-select-sm"
                    value={formData.visitorType}
                    onChange={(e) => setFormData({ ...formData, visitorType: e.target.value })}
                  >
                    <optgroup label="Apartment / Residential">
                      <option value="GUEST">Guest / Friend</option>
                      <option value="FAMILY_VISITOR">Family Member</option>
                      <option value="SERVICE_TECHNICIAN">Service Technician / AC / Plumbing</option>
                      <option value="CAB_DRIVER">Cab / Taxi Driver</option>
                      <option value="DOMESTIC_HELP">Domestic Help / Maid / Cook</option>
                    </optgroup>
                    <optgroup label="Commercial Property">
                      <option value="CLIENT">Client / Customer</option>
                      <option value="BUSINESS_GUEST">Business Guest</option>
                      <option value="INTERVIEW_CANDIDATE">Job Interview Candidate</option>
                      <option value="CONTRACTOR">Vendor / Contractor</option>
                    </optgroup>
                    <optgroup label="Co-working Space">
                      <option value="MEETING_GUEST">Meeting Guest</option>
                      <option value="EVENT_GUEST">Workshop / Event Participant</option>
                      <option value="TEMPORARY_MEMBER">Day Pass Guest</option>
                    </optgroup>
                  </select>
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold">No. of Visitors</label>
                  <input
                    type="number"
                    min="1"
                    className="form-control form-control-sm"
                    value={formData.numberOfVisitors}
                    onChange={(e) => setFormData({ ...formData, numberOfVisitors: parseInt(e.target.value) || 1 })}
                  />
                </div>
                <div className="col-12 col-md-8">
                  <label className="form-label small fw-semibold">Accompanying Persons (Names separated by comma)</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    placeholder="e.g. Sunita Chawla, Aman Chawla"
                    value={formData.accompanyingVisitors}
                    onChange={(e) => setFormData({ ...formData, accompanyingVisitors: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">ID Proof Type</label>
                  <select
                    className="form-select form-select-sm"
                    value={formData.idProofType}
                    onChange={(e) => setFormData({ ...formData, idProofType: e.target.value })}
                  >
                    <option value="AADHAAR">National ID / Aadhaar Card</option>
                    <option value="DRIVING_LICENSE">Driving License</option>
                    <option value="PASSPORT">Passport</option>
                    <option value="EMPLOYEE_ID">Corporate Employee ID</option>
                    <option value="VOTER_ID">Voter Identity Card</option>
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">ID Number (Last 4 Digits)</label>
                  <input
                    type="text"
                    maxLength={4}
                    className="form-control form-control-sm"
                    placeholder="e.g. 8832"
                    value={formData.idProofNumber}
                    onChange={(e) => setFormData({ ...formData, idProofNumber: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Purpose of Visit *</label>
                  <textarea
                    className="form-control form-control-sm"
                    rows={2}
                    required
                    placeholder="Provide a clear brief reason for visit..."
                    value={formData.purpose}
                    onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: HOST AND LOCATION */}
          {currentStep === 2 && (
            <div>
              <h5 className="fw-bold mb-3 text-primary">Step 2 — Host, Property & Location Hierarchy</h5>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Property *</label>
                  <select
                    className="form-select form-select-sm"
                    value={formData.propertyId}
                    onChange={handlePropertySelect}
                    required
                  >
                    {properties.map((p) => (
                      <option key={p._id} value={p._id}>{p.name} ({p.propertyType})</option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">
                    {formData.propertyType === 'RESIDENTIAL' ? 'Tower / Block *' : formData.propertyType === 'COMMERCIAL' ? 'Building / Wing *' : 'Hub / Building *'}
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={formData.buildingId}
                    onChange={(e) => {
                      const b = buildings.find(x => x._id === e.target.value);
                      setFormData({ ...formData, buildingId: e.target.value, buildingName: b?.name || '' });
                    }}
                    required
                  >
                    {buildings.map((b) => (
                      <option key={b._id} value={b._id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Floor *</label>
                  <select
                    className="form-select form-select-sm"
                    value={formData.floorId}
                    onChange={(e) => {
                      const f = floors.find(x => x._id === e.target.value);
                      setFormData({ ...formData, floorId: e.target.value, floorName: f?.floorName || `Floor ${f?.floorNumber}` });
                    }}
                    required
                  >
                    {floors.map((f) => (
                      <option key={f._id} value={f._id}>{f.floorName || `Floor ${f.floorNumber}`}</option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">
                    {formData.propertyType === 'RESIDENTIAL' ? 'Flat / Apartment Number *' : formData.propertyType === 'COMMERCIAL' ? 'Office / Suite Number *' : 'Desk / Cabin / Room *'}
                  </label>
                  <select
                    className="form-select form-select-sm"
                    value={formData.unitId}
                    onChange={(e) => {
                      const u = units.find(x => x._id === e.target.value);
                      setFormData({ ...formData, unitId: e.target.value, unitNumber: u?.unitNumber || '' });
                    }}
                    required
                  >
                    {units.map((u) => (
                      <option key={u._id} value={u._id}>{u.unitNumber} ({u.unitType})</option>
                    ))}
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">
                    {formData.propertyType === 'RESIDENTIAL' ? 'Host Resident Name *' : formData.propertyType === 'COMMERCIAL' ? 'Host Employee / Contact Person *' : 'Host Member / Community Desk *'}
                  </label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    required
                    placeholder="Full name of host"
                    value={formData.hostName}
                    onChange={(e) => setFormData({ ...formData, hostName: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Host Mobile Number</label>
                  <input
                    type="tel"
                    className="form-control form-control-sm"
                    placeholder="+91 98..."
                    value={formData.hostMobile}
                    onChange={(e) => setFormData({ ...formData, hostMobile: e.target.value })}
                  />
                </div>
                {formData.propertyType !== 'RESIDENTIAL' && (
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Host Company / Organisation Name</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. Nexus Cloud Technologies"
                      value={formData.companyName}
                      onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* STEP 3: VISIT SCHEDULE */}
          {currentStep === 3 && (
            <div>
              <h5 className="fw-bold mb-3 text-primary">Step 3 — Visit Schedule & Pass Type</h5>
              <div className="row g-3">
                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold">Visit Date *</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    required
                    value={formData.expectedDate}
                    onChange={(e) => setFormData({ ...formData, expectedDate: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold">Expected Arrival Time *</label>
                  <input
                    type="time"
                    className="form-control form-control-sm"
                    required
                    value={formData.expectedTime}
                    onChange={(e) => setFormData({ ...formData, expectedTime: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-4">
                  <label className="form-label small fw-semibold">Expected Exit Time *</label>
                  <input
                    type="time"
                    className="form-control form-control-sm"
                    required
                    value={formData.expectedExitTime}
                    onChange={(e) => setFormData({ ...formData, expectedExitTime: e.target.value })}
                  />
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Gate Pass Type</label>
                  <select
                    className="form-select form-select-sm"
                    value={formData.gatePassType}
                    onChange={(e) => setFormData({ ...formData, gatePassType: e.target.value })}
                  >
                    <option value="ONE_TIME">One-Time Digital Pass</option>
                    <option value="DAILY">Daily Multi-entry Pass</option>
                    <option value="RECURRING">Recurring (Regular Visitor)</option>
                    <option value="EMPLOYEE_GUEST">Corporate Guest Pass</option>
                  </select>
                </div>
              </div>
            </div>
          )}

          {/* STEP 4: VEHICLE DETAILS */}
          {currentStep === 4 && (
            <div>
              <h5 className="fw-bold mb-3 text-primary">Step 4 — Vehicle & Parking Allocation</h5>
              <div className="form-check form-switch mb-3">
                <input
                  className="form-check-input"
                  type="checkbox"
                  id="visitingByVehicle"
                  checked={formData.visitingByVehicle}
                  onChange={(e) => setFormData({ ...formData, visitingByVehicle: e.target.checked })}
                />
                <label className="form-check-label fw-semibold small" htmlFor="visitingByVehicle">
                  Visitor arriving by vehicle (Car / Bike / Taxi)
                </label>
              </div>

              {formData.visitingByVehicle && (
                <div className="row g-3 p-3 bg-light rounded border">
                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold">Vehicle Type *</label>
                    <select
                      className="form-select form-select-sm"
                      value={formData.vehicleType}
                      onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                    >
                      <option value="CAR">Car / SUV</option>
                      <option value="TWO_WHEELER">Two Wheeler / Motorcycle</option>
                      <option value="TAXI">Cab / Taxi (Ola/Uber)</option>
                      <option value="COMMERCIAL_VEHICLE">Commercial Vehicle / Van</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>
                  <div className="col-12 col-md-6">
                    <label className="form-label small fw-semibold">Vehicle Plate Number *</label>
                    <input
                      type="text"
                      className="form-control form-control-sm text-uppercase fw-bold"
                      placeholder="e.g. MH 02 BG 4421"
                      required={formData.visitingByVehicle}
                      value={formData.vehicleNumber}
                      onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                    />
                  </div>
                  <div className="col-12 col-md-6">
                    <div className="form-check mt-3">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id="parkingRequired"
                        checked={formData.parkingRequired}
                        onChange={(e) => setFormData({ ...formData, parkingRequired: e.target.checked })}
                      />
                      <label className="form-check-label small fw-semibold" htmlFor="parkingRequired">
                        Allocate Visitor Parking Slot
                      </label>
                    </div>
                  </div>
                  {formData.parkingRequired && (
                    <div className="col-12 col-md-6">
                      <label className="form-label small fw-semibold">Preferred Parking Slot / Bay</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. V-Slot-05 or Basement-2"
                        value={formData.parkingSlot}
                        onChange={(e) => setFormData({ ...formData, parkingSlot: e.target.value })}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* STEP 5: ADDITIONAL ACCESS & GATES */}
          {currentStep === 5 && (
            <div>
              <h5 className="fw-bold mb-3 text-primary">Step 5 — Entry Gates & Permitted Access</h5>
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Designated Entry Gates</label>
                  <select
                    className="form-select form-select-sm"
                    value={formData.allowedGates[0]}
                    onChange={(e) => setFormData({ ...formData, allowedGates: [e.target.value] })}
                  >
                    <option value="Main Gate 1">Main Gate 1 (North)</option>
                    <option value="Visitor Gate 2">Visitor Gate 2 (East Turnstile)</option>
                    <option value="Service Gate 3">Service Gate 3 (Back Entrance)</option>
                  </select>
                </div>
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Allowed Access Areas</label>
                  <input
                    type="text"
                    className="form-control form-control-sm"
                    value={formData.allowedAreas}
                    onChange={(e) => setFormData({ ...formData, allowedAreas: e.target.value })}
                  />
                </div>
                <div className="col-12">
                  <label className="form-label small fw-semibold">Special Instructions for Gate Security Staff</label>
                  <textarea
                    className="form-control form-control-sm"
                    rows={2}
                    placeholder="e.g. Verified guest, allowed with laptop backpack..."
                    value={formData.securityRemarks}
                    onChange={(e) => setFormData({ ...formData, securityRemarks: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 6: REVIEW & SUBMIT */}
          {currentStep === 6 && (
            <div>
              <h5 className="fw-bold mb-3 text-success">Step 6 — Review & Issue Gate Pass</h5>
              <div className="p-3 bg-light rounded border mb-3">
                <div className="row g-3">
                  <div className="col-6">
                    <span className="text-muted extra-small">Visitor Name</span>
                    <div className="fw-bold fs-6">{formData.visitorName} ({formData.mobile})</div>
                    <span className="badge bg-secondary-subtle text-secondary extra-small">{formData.visitorType}</span>
                  </div>
                  <div className="col-6">
                    <span className="text-muted extra-small">Host & Destination</span>
                    <div className="fw-bold fs-6">{formData.hostName} (Unit {formData.unitNumber})</div>
                    <div className="text-secondary small">{formData.propertyName} ({formData.buildingName})</div>
                  </div>
                  <div className="col-6">
                    <span className="text-muted extra-small">Scheduled Window</span>
                    <div className="small fw-semibold">{formData.expectedDate} from {formData.expectedTime} to {formData.expectedExitTime}</div>
                  </div>
                  <div className="col-6">
                    <span className="text-muted extra-small">Vehicle</span>
                    <div className="small fw-semibold">{formData.visitingByVehicle ? `${formData.vehicleNumber} (${formData.vehicleType})` : 'Pedestrian'}</div>
                  </div>
                </div>
              </div>
              <p className="text-secondary small">
                Upon submitting, a unique QR Gate Pass code will be generated and saved to MongoDB. The host will be notified immediately.
              </p>
            </div>
          )}

          {/* Navigation Controls */}
          <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
            {currentStep > 1 ? (
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setCurrentStep(prev => prev - 1)}
              >
                <i className="bi bi-arrow-left me-1"></i> Previous
              </button>
            ) : <div />}

            {currentStep < 6 ? (
              <button type="submit" className="btn btn-primary btn-sm">
                Next <i className="bi bi-arrow-right ms-1"></i>
              </button>
            ) : (
              <button type="submit" className="btn btn-success btn-sm px-4 shadow" disabled={submitting}>
                {submitting ? 'Generating Pass...' : <><i className="bi bi-qr-code me-1"></i> Issue Digital Gate Pass</>}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
