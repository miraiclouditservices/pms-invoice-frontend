'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { apiClient } from '../../../lib/apiClient';
import { useAuth } from '../../../context/AuthContext';
import Link from 'next/link';

export default function NewOccupancyWizardPage() {
  const router = useRouter();
  const { activeProperty, organisation } = useAuth();

  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Data Sources
  const [properties, setProperties] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loadingInitial, setLoadingInitial] = useState(true);

  // Form State across 7 steps
  const [formData, setFormData] = useState({
    // Step 1: Selection
    propertyId: '',
    propertyType: 'RESIDENTIAL',
    buildingId: '',
    floorId: '',
    unitId: '',

    // Step 2: Occupant
    occupantType: 'RESIDENT',
    fullName: '',
    companyName: '',
    companyCode: '',
    contactPerson: '',
    email: '',
    mobile: '',
    gstNumber: '',
    panNumber: '',
    ownerName: '',
    familyMembersCount: 0,
    emergencyContactName: '',
    emergencyContactPhone: '',

    // Step 3: Agreement
    contractNumber: '',
    contractType: 'RENTAL_AGREEMENT',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    lockInPeriodMonths: 6,
    noticePeriodMonths: 1,
    billingCycle: 'MONTHLY',
    paymentDueDate: 5,
    meetingRoomAccess: false,
    lockerAccess: false,
    printingAccess: false,
    parkingAccess: false,
    accessTiming: '24/7',

    // Step 4: Charges & Deposit
    baseRentOrFee: 0,
    maintenanceAmount: 0,
    camCharges: 0,
    securityDeposit: 0,
    advanceAmount: 0,
    taxPercentage: 0,
    escalationPercentage: 5,

    // Step 5: Allocation
    allocationType: 'PERMANENT',
    parkingSlots: '',
    accessLevel: 'Standard',

    // Step 6: Account Provisioning
    createAccount: true,
    accountRole: 'RESIDENT',
    sendInvitation: true
  });

  // Load initial hierarchy data
  useEffect(() => {
    const init = async () => {
      setLoadingInitial(true);
      try {
        const [propsRes, bldgsRes, floorsRes, unitsRes] = await Promise.all([
          apiClient.get('/properties'),
          apiClient.get('/structure/buildings'),
          apiClient.get('/structure/floors'),
          apiClient.get('/structure/units')
        ]);

        if (propsRes.data.success) {
          const props = propsRes.data.data;
          setProperties(props);
          if (props.length > 0) {
            const defaultProp = activeProperty?._id || props[0]._id;
            const foundProp = props.find((p: any) => p._id === defaultProp) || props[0];
            setFormData(prev => ({
              ...prev,
              propertyId: foundProp._id,
              propertyType: foundProp.propertyType || 'RESIDENTIAL'
            }));
          }
        }
        if (bldgsRes.data.success) setBuildings(bldgsRes.data.data);
        if (floorsRes.data.success) setFloors(floorsRes.data.data);
        if (unitsRes.data.success) setUnits(unitsRes.data.data);
      } catch (err: any) {
        setError(err.message || 'Failed to initialize wizard data');
      } finally {
        setLoadingInitial(false);
      }
    };
    init();
  }, []);

  // Filtered dropdowns
  const availableBuildings = useMemo(() => {
    return buildings.filter(b => (b.propertyId?._id || b.propertyId) === formData.propertyId);
  }, [buildings, formData.propertyId]);

  const availableFloors = useMemo(() => {
    return floors.filter(f => (f.buildingId?._id || f.buildingId) === formData.buildingId);
  }, [floors, formData.buildingId]);

  const availableUnits = useMemo(() => {
    return units.filter(u => {
      const pMatch = (u.propertyId?._id || u.propertyId) === formData.propertyId;
      const bMatch = !formData.buildingId || (u.buildingId?._id || u.buildingId) === formData.buildingId;
      const fMatch = !formData.floorId || (u.floorId?._id || u.floorId) === formData.floorId;
      return pMatch && bMatch && fMatch;
    });
  }, [units, formData.propertyId, formData.buildingId, formData.floorId]);

  const selectedUnitObj = useMemo(() => {
    return units.find(u => u._id === formData.unitId);
  }, [units, formData.unitId]);

  // When property changes, auto-adjust occupant type and contract type defaults
  const handlePropertyChange = (propId: string) => {
    const prop = properties.find(p => p._id === propId);
    const pType = prop?.propertyType || 'RESIDENTIAL';

    let defaultOccupantType = 'RESIDENT';
    let defaultContractType = 'RENTAL_AGREEMENT';
    let defaultRole = 'RESIDENT';

    if (pType === 'COMMERCIAL') {
      defaultOccupantType = 'TENANT_COMPANY';
      defaultContractType = 'STANDARD_COMMERCIAL_LEASE';
      defaultRole = 'TENANT_ADMIN';
    } else if (pType === 'COWORKING') {
      defaultOccupantType = 'INDIVIDUAL_MEMBER';
      defaultContractType = 'DEDICATED_DESK_MEMBERSHIP';
      defaultRole = 'MEMBER';
    }

    setFormData(prev => ({
      ...prev,
      propertyId: propId,
      propertyType: pType,
      buildingId: '',
      floorId: '',
      unitId: '',
      occupantType: defaultOccupantType,
      contractType: defaultContractType,
      accountRole: defaultRole
    }));
  };

  // When unit is picked, pre-populate rental / maintenance charges if available
  const handleUnitChange = (unitId: string) => {
    const u = units.find(unit => unit._id === unitId);
    setFormData(prev => ({
      ...prev,
      unitId,
      baseRentOrFee: u?.monthlyRent || u?.monthlyPrice || u?.baseRentOrMaintenanceRate || 0,
      maintenanceAmount: u?.monthlyMaintenanceAmount || 0
    }));
  };

  // Step 1 Validation
  const validateStep1 = () => {
    if (!formData.propertyId) return 'Please select a property';
    if (!formData.unitId) return 'Please select a unit or space';
    if (selectedUnitObj?.occupancyStatus === 'OCCUPIED') {
      return 'Selected unit is currently OCCUPIED. Please choose a vacant unit or release existing allocation first.';
    }
    return null;
  };

  // Step 2 Validation
  const validateStep2 = () => {
    if (formData.propertyType === 'COMMERCIAL') {
      if (!formData.companyName.trim()) return 'Company Name is required for commercial tenants';
      if (!formData.contactPerson.trim() && !formData.fullName.trim()) return 'Contact person name is required';
      if (!formData.email.trim() && !formData.mobile.trim()) return 'At least one contact method (email or mobile) is required';
    } else {
      if (!formData.fullName.trim()) return 'Occupant full name is required';
      if (!formData.email.trim() && !formData.mobile.trim()) return 'Email or mobile number is required';
    }
    return null;
  };

  const handleNext = () => {
    setError('');
    if (step === 1) {
      const err = validateStep1();
      if (err) { setError(err); return; }
    } else if (step === 2) {
      const err = validateStep2();
      if (err) { setError(err); return; }
    }
    setStep(prev => Math.min(prev + 1, 7));
  };

  const handleBack = () => {
    setError('');
    setStep(prev => Math.max(prev - 1, 1));
  };

  // Final Submit
  const handleFinalSubmit = async () => {
    setSubmitting(true);
    setError('');
    try {
      const payload = {
        propertyId: formData.propertyId,
        buildingId: formData.buildingId || selectedUnitObj?.buildingId?._id || selectedUnitObj?.buildingId,
        floorId: formData.floorId || selectedUnitObj?.floorId?._id || selectedUnitObj?.floorId,
        unitId: formData.unitId,
        propertyType: formData.propertyType,
        occupantType: formData.occupantType,
        occupantData: {
          fullName: formData.fullName.trim() || formData.contactPerson.trim(),
          companyName: formData.companyName.trim(),
          companyCode: formData.companyCode.trim(),
          contactPerson: formData.contactPerson.trim() || formData.fullName.trim(),
          email: formData.email.trim(),
          mobile: formData.mobile.trim(),
          gstNumber: formData.gstNumber.trim(),
          panNumber: formData.panNumber.trim(),
          ownerName: formData.ownerName.trim(),
          familyMembersCount: Number(formData.familyMembersCount) || 0,
          emergencyContact: {
            name: formData.emergencyContactName.trim(),
            phone: formData.emergencyContactPhone.trim()
          }
        },
        agreementData: {
          contractNumber: formData.contractNumber.trim(),
          contractType: formData.contractType,
          startDate: formData.startDate,
          endDate: formData.endDate,
          lockInPeriodMonths: Number(formData.lockInPeriodMonths) || 0,
          noticePeriodMonths: Number(formData.noticePeriodMonths) || 1,
          billingCycle: formData.billingCycle,
          paymentDueDate: Number(formData.paymentDueDate) || 5,
          meetingRoomAccess: formData.meetingRoomAccess,
          lockerAccess: formData.lockerAccess,
          printingAccess: formData.printingAccess,
          parkingAccess: formData.parkingAccess,
          accessTiming: formData.accessTiming
        },
        financialData: {
          baseRentOrFee: Number(formData.baseRentOrFee) || 0,
          maintenanceAmount: Number(formData.maintenanceAmount) || 0,
          camCharges: Number(formData.camCharges) || 0,
          securityDeposit: Number(formData.securityDeposit) || 0,
          advanceAmount: Number(formData.advanceAmount) || 0,
          taxPercentage: Number(formData.taxPercentage) || 0,
          escalationPercentage: Number(formData.escalationPercentage) || 0
        },
        allocationData: {
          allocationType: formData.allocationType,
          parkingSlots: formData.parkingSlots ? formData.parkingSlots.split(',').map(s => s.trim()) : [],
          accessLevel: formData.accessLevel
        },
        accountData: {
          createAccount: formData.createAccount,
          role: formData.accountRole,
          sendInvitation: formData.sendInvitation
        }
      };

      const res = await apiClient.post('/occupancies', payload);
      if (res.data.success) {
        router.push('/occupancies');
      }
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Error executing occupancy creation workflow');
    } finally {
      setSubmitting(false);
    }
  };

  const stepsList = [
    { num: 1, label: 'Space Selection', icon: 'bi-door-open' },
    { num: 2, label: 'Occupant Details', icon: 'bi-person-badge' },
    { num: 3, label: 'Agreement & Terms', icon: 'bi-file-earmark-text' },
    { num: 4, label: 'Charges & Deposit', icon: 'bi-currency-rupee' },
    { num: 5, label: 'Spatial Allocation', icon: 'bi-grid-3x3-gap' },
    { num: 6, label: 'User Account', icon: 'bi-shield-lock' },
    { num: 7, label: 'Review & Confirm', icon: 'bi-check2-circle' }
  ];

  return (
    <div className="container-fluid py-2" style={{ maxWidth: '1000px' }}>
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-3">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-1 small">
              <li className="breadcrumb-item"><Link href="/occupancies" className="text-decoration-none">Occupancies</Link></li>
              <li className="breadcrumb-item active" aria-current="page">New Occupancy Wizard</li>
            </ol>
          </nav>
          <h3 className="fw-bold mb-0">Occupancy & Agreement Provisioning</h3>
        </div>
        <Link href="/occupancies" className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-x-lg me-1"></i> Exit Wizard
        </Link>
      </div>

      {/* Stepper Progress Header */}
      <div className="card border-0 shadow-sm rounded-3 p-3 mb-4 bg-white">
        <div className="d-flex justify-content-between align-items-center position-relative">
          {stepsList.map(s => {
            const isDone = s.num < step;
            const isCurrent = s.num === step;
            return (
              <div key={s.num} className="d-flex flex-column align-items-center position-relative" style={{ zIndex: 2 }}>
                <div
                  className={`rounded-circle d-flex align-items-center justify-content-center fw-bold shadow-sm ${
                    isDone ? 'bg-success text-white' : isCurrent ? 'bg-primary text-white' : 'bg-light text-muted border'
                  }`}
                  style={{ width: 38, height: 38, fontSize: 13 }}
                >
                  {isDone ? <i className="bi bi-check-lg"></i> : s.num}
                </div>
                <span className={`small mt-1 text-center d-none d-md-block ${isCurrent ? 'fw-bold text-primary' : 'text-muted'}`} style={{ fontSize: 11 }}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {error && (
        <div className="alert alert-danger shadow-sm rounded-3 small mb-3">
          <i className="bi bi-exclamation-triangle me-2"></i>{error}
        </div>
      )}

      {/* Main Step Content Card */}
      <div className="card border-0 shadow-sm rounded-3 p-4 bg-white mb-4">
        {loadingInitial ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status"></div>
            <p className="text-muted small mt-2">Loading space hierarchy data...</p>
          </div>
        ) : (
          <div>
            {/* STEP 1: PROPERTY & SPACE SELECTION */}
            {step === 1 && (
              <div>
                <h5 className="fw-bold mb-1">Step 1: Property & Space Selection</h5>
                <p className="text-muted small mb-4">
                  Select the target property, building, and unit or space to allocate.
                </p>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Target Property *</label>
                    <select
                      className="form-select form-select-sm"
                      value={formData.propertyId}
                      onChange={e => handlePropertyChange(e.target.value)}
                    >
                      <option value="">Select Property</option>
                      {properties.map(p => (
                        <option key={p._id} value={p._id}>
                          {p.name} ({p.propertyType})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Model Configuration</label>
                    <input
                      type="text"
                      className="form-control form-control-sm bg-light"
                      readOnly
                      value={formData.propertyType}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Building / Wing / Hub</label>
                    <select
                      className="form-select form-select-sm"
                      value={formData.buildingId}
                      onChange={e => setFormData({ ...formData, buildingId: e.target.value, floorId: '', unitId: '' })}
                    >
                      <option value="">All Buildings</option>
                      {availableBuildings.map(b => (
                        <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Floor Level</label>
                    <select
                      className="form-select form-select-sm"
                      value={formData.floorId}
                      onChange={e => setFormData({ ...formData, floorId: e.target.value, unitId: '' })}
                    >
                      <option value="">All Floors</option>
                      {availableFloors.map(f => (
                        <option key={f._id} value={f._id}>{f.floorName || `Floor ${f.floorNumber}`}</option>
                      ))}
                    </select>
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Target Unit / Space *</label>
                    <select
                      className="form-select form-select-sm"
                      value={formData.unitId}
                      onChange={e => handleUnitChange(e.target.value)}
                    >
                      <option value="">Select Unit</option>
                      {availableUnits.map(u => (
                        <option key={u._id} value={u._id}>
                          {u.wing ? `${u.wing}-` : ''}{u.unitNumber} ({u.unitType}) - {u.occupancyStatus || 'VACANT'}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Selected Unit Preview Card */}
                  {selectedUnitObj && (
                    <div className="col-12 mt-3">
                      <div className={`p-3 rounded-3 border ${selectedUnitObj.occupancyStatus === 'OCCUPIED' ? 'border-danger bg-danger-subtle' : 'border-success bg-success-subtle'}`}>
                        <div className="d-flex justify-content-between align-items-center">
                          <div>
                            <div className="fw-bold text-dark">
                              Unit {selectedUnitObj.wing ? `${selectedUnitObj.wing}-` : ''}{selectedUnitObj.unitNumber} ({selectedUnitObj.unitType})
                            </div>
                            <div className="small text-muted">
                              Carpet Area: {selectedUnitObj.carpetArea ? `${selectedUnitObj.carpetArea} sq.ft` : 'N/A'} • Base Rate: ₹{selectedUnitObj.monthlyRent || selectedUnitObj.monthlyPrice || selectedUnitObj.baseRentOrMaintenanceRate || 0}
                            </div>
                          </div>
                          <span className={`badge ${selectedUnitObj.occupancyStatus === 'OCCUPIED' ? 'bg-danger text-white' : 'bg-success text-white'}`}>
                            {selectedUnitObj.occupancyStatus || 'AVAILABLE'}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: OCCUPANT / COMPANY DETAILS */}
            {step === 2 && (
              <div>
                <h5 className="fw-bold mb-1">Step 2: Occupant / Company Profile</h5>
                <p className="text-muted small mb-4">
                  Provide primary occupant, legal entity, and emergency contact information.
                </p>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Occupant Classification *</label>
                    <select
                      className="form-select form-select-sm"
                      value={formData.occupantType}
                      onChange={e => setFormData({ ...formData, occupantType: e.target.value })}
                    >
                      {formData.propertyType === 'RESIDENTIAL' && (
                        <>
                          <option value="RESIDENT">Resident Tenant</option>
                          <option value="FLAT_OWNER">Flat Owner</option>
                          <option value="FAMILY_MEMBER">Family Member</option>
                          <option value="CO_OWNER">Co-Owner</option>
                        </>
                      )}
                      {formData.propertyType === 'COMMERCIAL' && (
                        <>
                          <option value="TENANT_COMPANY">Tenant Corporate Company</option>
                          <option value="BRANCH_OFFICE">Branch Office</option>
                          <option value="INDIVIDUAL_TENANT">Individual Commercial Tenant</option>
                        </>
                      )}
                      {formData.propertyType === 'COWORKING' && (
                        <>
                          <option value="INDIVIDUAL_MEMBER">Individual Member</option>
                          <option value="COMPANY">Company / Team</option>
                          <option value="STARTUP">Startup</option>
                          <option value="FREELANCER">Freelancer</option>
                        </>
                      )}
                    </select>
                  </div>

                  {formData.propertyType === 'COMMERCIAL' ? (
                    <>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Company Name *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          required
                          placeholder="e.g. Apex Global Tech LLP"
                          value={formData.companyName}
                          onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Company Identifier / Short Code</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="e.g. APEX-01"
                          value={formData.companyCode}
                          onChange={e => setFormData({ ...formData, companyCode: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Authorized Signatory Name *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          required
                          placeholder="Contact person"
                          value={formData.contactPerson}
                          onChange={e => setFormData({ ...formData, contactPerson: e.target.value, fullName: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">GSTIN</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="27AAAAA0000A1Z5"
                          value={formData.gstNumber}
                          onChange={e => setFormData({ ...formData, gstNumber: e.target.value })}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">PAN Number</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          placeholder="ABCDE1234F"
                          value={formData.panNumber}
                          onChange={e => setFormData({ ...formData, panNumber: e.target.value })}
                        />
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Primary Occupant Full Name *</label>
                        <input
                          type="text"
                          className="form-control form-control-sm"
                          required
                          placeholder="e.g. Rajesh Kumar"
                          value={formData.fullName}
                          onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                        />
                      </div>
                      {formData.propertyType === 'COWORKING' && (
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Affiliated Company (Optional)</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="e.g. Zeta Labs"
                            value={formData.companyName}
                            onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                          />
                        </div>
                      )}
                      {formData.propertyType === 'RESIDENTIAL' && (
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Family Members Count</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={formData.familyMembersCount}
                            onChange={e => setFormData({ ...formData, familyMembersCount: Number(e.target.value) })}
                          />
                        </div>
                      )}
                    </>
                  )}

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Email Address *</label>
                    <input
                      type="email"
                      className="form-control form-control-sm"
                      placeholder="leases@company.com or user@gmail.com"
                      value={formData.email}
                      onChange={e => setFormData({ ...formData, email: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Mobile Number *</label>
                    <input
                      type="tel"
                      className="form-control form-control-sm"
                      placeholder="+91 9876543210"
                      value={formData.mobile}
                      onChange={e => setFormData({ ...formData, mobile: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Emergency Contact Person</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Emergency contact name"
                      value={formData.emergencyContactName}
                      onChange={e => setFormData({ ...formData, emergencyContactName: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Emergency Contact Phone</label>
                    <input
                      type="tel"
                      className="form-control form-control-sm"
                      placeholder="Emergency contact mobile"
                      value={formData.emergencyContactPhone}
                      onChange={e => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: AGREEMENT & TERMS */}
            {step === 3 && (
              <div>
                <h5 className="fw-bold mb-1">Step 3: Agreement / Lease / Membership Terms</h5>
                <p className="text-muted small mb-4">
                  Define validity dates, notice periods, and specialized space amenities.
                </p>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Agreement / Lease Number</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="Leave blank for auto-generation"
                      value={formData.contractNumber}
                      onChange={e => setFormData({ ...formData, contractNumber: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Agreement Classification</label>
                    <select
                      className="form-select form-select-sm"
                      value={formData.contractType}
                      onChange={e => setFormData({ ...formData, contractType: e.target.value })}
                    >
                      {formData.propertyType === 'RESIDENTIAL' && (
                        <>
                          <option value="RENTAL_AGREEMENT">Standard Rental Agreement</option>
                          <option value="OWNER_OCCUPANCY_AGREEMENT">Owner Occupancy Agreement</option>
                          <option value="FAMILY_OCCUPANCY_AGREEMENT">Family Occupancy Agreement</option>
                        </>
                      )}
                      {formData.propertyType === 'COMMERCIAL' && (
                        <>
                          <option value="STANDARD_COMMERCIAL_LEASE">Standard Commercial Lease</option>
                          <option value="OFFICE_LEASE">Office Suite Lease</option>
                          <option value="RETAIL_LEASE">Retail Shop Lease</option>
                          <option value="WAREHOUSE_LEASE">Warehouse Lease</option>
                        </>
                      )}
                      {formData.propertyType === 'COWORKING' && (
                        <>
                          <option value="DEDICATED_DESK_MEMBERSHIP">Dedicated Desk Membership</option>
                          <option value="HOT_DESK_MEMBERSHIP">Hot / Flex Desk Membership</option>
                          <option value="PRIVATE_CABIN_AGREEMENT">Private Cabin Agreement</option>
                          <option value="MEETING_ROOM_PACKAGE">Meeting Room Package</option>
                        </>
                      )}
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Commencement Date *</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      required
                      value={formData.startDate}
                      onChange={e => setFormData({ ...formData, startDate: e.target.value })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Expiry Date</label>
                    <input
                      type="date"
                      className="form-control form-control-sm"
                      value={formData.endDate}
                      onChange={e => setFormData({ ...formData, endDate: e.target.value })}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Lock-In Period (Months)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={formData.lockInPeriodMonths}
                      onChange={e => setFormData({ ...formData, lockInPeriodMonths: Number(e.target.value) })}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Notice Period (Months)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={formData.noticePeriodMonths}
                      onChange={e => setFormData({ ...formData, noticePeriodMonths: Number(e.target.value) })}
                    />
                  </div>

                  <div className="col-md-4">
                    <label className="form-label small fw-semibold">Billing Frequency</label>
                    <select
                      className="form-select form-select-sm"
                      value={formData.billingCycle}
                      onChange={e => setFormData({ ...formData, billingCycle: e.target.value })}
                    >
                      <option value="MONTHLY">Monthly</option>
                      <option value="QUARTERLY">Quarterly</option>
                      <option value="YEARLY">Yearly</option>
                      {formData.propertyType === 'COWORKING' && (
                        <>
                          <option value="DAILY">Daily</option>
                          <option value="HOURLY">Hourly</option>
                        </>
                      )}
                    </select>
                  </div>

                  {formData.propertyType === 'COWORKING' && (
                    <div className="col-12 mt-3">
                      <h6 className="fw-bold small border-bottom pb-2">Coworking Space Inclusions</h6>
                      <div className="row g-2">
                        <div className="col-6 col-md-3">
                          <div className="form-check form-switch small">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={formData.meetingRoomAccess}
                              onChange={e => setFormData({ ...formData, meetingRoomAccess: e.target.checked })}
                            />
                            <label className="form-check-label">Meeting Room Access</label>
                          </div>
                        </div>
                        <div className="col-6 col-md-3">
                          <div className="form-check form-switch small">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={formData.lockerAccess}
                              onChange={e => setFormData({ ...formData, lockerAccess: e.target.checked })}
                            />
                            <label className="form-check-label">Storage Locker</label>
                          </div>
                        </div>
                        <div className="col-6 col-md-3">
                          <div className="form-check form-switch small">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={formData.printingAccess}
                              onChange={e => setFormData({ ...formData, printingAccess: e.target.checked })}
                            />
                            <label className="form-check-label">Printing Credits</label>
                          </div>
                        </div>
                        <div className="col-6 col-md-3">
                          <div className="form-check form-switch small">
                            <input
                              className="form-check-input"
                              type="checkbox"
                              checked={formData.parkingAccess}
                              onChange={e => setFormData({ ...formData, parkingAccess: e.target.checked })}
                            />
                            <label className="form-check-label">Dedicated Parking</label>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: CHARGES & DEPOSIT */}
            {step === 4 && (
              <div>
                <h5 className="fw-bold mb-1">Step 4: Charges, CAM & Security Deposit</h5>
                <p className="text-muted small mb-4">
                  Configure recurring monthly rates, maintenance, CAM fees, and advance deposits.
                </p>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">
                      {formData.propertyType === 'RESIDENTIAL' ? 'Base Rent (₹)' : formData.propertyType === 'COMMERCIAL' ? 'Monthly Base Rent (₹)' : 'Desk Rate / Membership Fee (₹)'}
                    </label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={formData.baseRentOrFee}
                      onChange={e => setFormData({ ...formData, baseRentOrFee: Number(e.target.value) })}
                    />
                  </div>

                  {formData.propertyType === 'RESIDENTIAL' && (
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Monthly Maintenance Amount (₹)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={formData.maintenanceAmount}
                        onChange={e => setFormData({ ...formData, maintenanceAmount: Number(e.target.value) })}
                      />
                    </div>
                  )}

                  {formData.propertyType === 'COMMERCIAL' && (
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">CAM Charges / Month (₹)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={formData.camCharges}
                        onChange={e => setFormData({ ...formData, camCharges: Number(e.target.value) })}
                      />
                    </div>
                  )}

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Security Deposit (₹)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={formData.securityDeposit}
                      onChange={e => setFormData({ ...formData, securityDeposit: Number(e.target.value) })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Advance Payment Amount (₹)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={formData.advanceAmount}
                      onChange={e => setFormData({ ...formData, advanceAmount: Number(e.target.value) })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Payment Due Day of Month</label>
                    <input
                      type="number"
                      min={1}
                      max={28}
                      className="form-control form-control-sm"
                      value={formData.paymentDueDate}
                      onChange={e => setFormData({ ...formData, paymentDueDate: Number(e.target.value) })}
                    />
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Annual Rent Escalation (%)</label>
                    <input
                      type="number"
                      className="form-control form-control-sm"
                      value={formData.escalationPercentage}
                      onChange={e => setFormData({ ...formData, escalationPercentage: Number(e.target.value) })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 5: SPATIAL ALLOCATION */}
            {step === 5 && (
              <div>
                <h5 className="fw-bold mb-1">Step 5: Spatial Allocation Configuration</h5>
                <p className="text-muted small mb-4">
                  Assign allocation mode and associate parking bays or access clearance.
                </p>

                <div className="row g-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Allocation Mode</label>
                    <select
                      className="form-select form-select-sm"
                      value={formData.allocationType}
                      onChange={e => setFormData({ ...formData, allocationType: e.target.value })}
                    >
                      <option value="PERMANENT">Permanent / Primary Allocation</option>
                      <option value="TEMPORARY">Temporary Allocation</option>
                      <option value="SHARED">Shared Workstation Allocation</option>
                      <option value="RESERVED">Reserved / Blocked Allocation</option>
                    </select>
                  </div>

                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Security Access Level</label>
                    <select
                      className="form-select form-select-sm"
                      value={formData.accessLevel}
                      onChange={e => setFormData({ ...formData, accessLevel: e.target.value })}
                    >
                      <option value="Standard">Standard Facility Access</option>
                      <option value="Executive">Executive / 24-7 Access</option>
                      <option value="VIP">VIP Full Complex Access</option>
                    </select>
                  </div>

                  <div className="col-12">
                    <label className="form-label small fw-semibold">Allocated Parking Slots (comma separated)</label>
                    <input
                      type="text"
                      className="form-control form-control-sm"
                      placeholder="e.g. B1-04, B2-18"
                      value={formData.parkingSlots}
                      onChange={e => setFormData({ ...formData, parkingSlots: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 6: USER ACCOUNT & ROLE */}
            {step === 6 && (
              <div>
                <h5 className="fw-bold mb-1">Step 6: User Account & Role Provisioning</h5>
                <p className="text-muted small mb-4">
                  Optionally provision a login portal account linked to this occupancy.
                </p>

                <div className="row g-3">
                  <div className="col-12">
                    <div className="form-check form-switch">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        checked={formData.createAccount}
                        onChange={e => setFormData({ ...formData, createAccount: e.target.checked })}
                      />
                      <label className="form-check-label fw-bold small">
                        Provision User Portal Account for Occupant
                      </label>
                    </div>
                  </div>

                  {formData.createAccount && (
                    <>
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Assigned Portal Role</label>
                        <select
                          className="form-select form-select-sm"
                          value={formData.accountRole}
                          onChange={e => setFormData({ ...formData, accountRole: e.target.value })}
                        >
                          {formData.propertyType === 'RESIDENTIAL' && (
                            <>
                              <option value="RESIDENT">Resident Portal</option>
                              <option value="PROPERTY_MANAGER">Flat Owner Portal</option>
                            </>
                          )}
                          {formData.propertyType === 'COMMERCIAL' && (
                            <>
                              <option value="TENANT_ADMIN">Tenant Corporate Admin</option>
                              <option value="TENANT_EMPLOYEE">Tenant Employee</option>
                            </>
                          )}
                          {formData.propertyType === 'COWORKING' && (
                            <>
                              <option value="MEMBER">Coworking Member</option>
                              <option value="COMPANY_ADMIN">Company Team Admin</option>
                            </>
                          )}
                        </select>
                      </div>

                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Login Email (Linked to Step 2)</label>
                        <input
                          type="email"
                          className="form-control form-control-sm bg-light"
                          readOnly
                          value={formData.email || 'None provided'}
                        />
                      </div>

                      <div className="col-12">
                        <div className="form-check small">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            checked={formData.sendInvitation}
                            onChange={e => setFormData({ ...formData, sendInvitation: e.target.checked })}
                          />
                          <label className="form-check-label">
                            Send immediate invitation email with activation instructions
                          </label>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* STEP 7: REVIEW & CONFIRM */}
            {step === 7 && (
              <div>
                <h5 className="fw-bold mb-1">Step 7: Final Review & Confirmation</h5>
                <p className="text-muted small mb-4">
                  Verify the occupancy details. Submitting will allocate the space, execute the agreement, and provision the account.
                </p>

                <div className="row g-3 small">
                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <h6 className="fw-bold border-bottom pb-2 mb-2">Space & Property</h6>
                      <div><strong>Property:</strong> {properties.find(p => p._id === formData.propertyId)?.name}</div>
                      <div><strong>Model:</strong> {formData.propertyType}</div>
                      <div><strong>Unit:</strong> Unit {selectedUnitObj?.wing ? `${selectedUnitObj.wing}-` : ''}{selectedUnitObj?.unitNumber} ({selectedUnitObj?.unitType})</div>
                      <div><strong>Allocation:</strong> {formData.allocationType}</div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <h6 className="fw-bold border-bottom pb-2 mb-2">Occupant Profile</h6>
                      <div><strong>Name / Contact:</strong> {formData.fullName || formData.contactPerson}</div>
                      {formData.companyName && <div><strong>Company:</strong> {formData.companyName}</div>}
                      <div><strong>Email:</strong> {formData.email || 'N/A'}</div>
                      <div><strong>Mobile:</strong> {formData.mobile || 'N/A'}</div>
                      <div><strong>Occupant Type:</strong> {formData.occupantType}</div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <h6 className="fw-bold border-bottom pb-2 mb-2">Agreement Terms</h6>
                      <div><strong>Type:</strong> {formData.contractType}</div>
                      <div><strong>Dates:</strong> {formData.startDate} to {formData.endDate || 'Ongoing'}</div>
                      <div><strong>Lock-In:</strong> {formData.lockInPeriodMonths} Months</div>
                      <div><strong>Notice:</strong> {formData.noticePeriodMonths} Months</div>
                    </div>
                  </div>

                  <div className="col-md-6">
                    <div className="p-3 bg-light rounded-3 h-100">
                      <h6 className="fw-bold border-bottom pb-2 mb-2">Financial Commitment</h6>
                      <div><strong>Monthly Rate:</strong> ₹{Number(formData.baseRentOrFee || 0).toLocaleString()}</div>
                      {formData.maintenanceAmount > 0 && <div><strong>Maintenance:</strong> ₹{Number(formData.maintenanceAmount).toLocaleString()}</div>}
                      {formData.camCharges > 0 && <div><strong>CAM:</strong> ₹{Number(formData.camCharges).toLocaleString()}</div>}
                      <div><strong>Security Deposit:</strong> ₹{Number(formData.securityDeposit || 0).toLocaleString()}</div>
                      <div><strong>Due Date:</strong> {formData.paymentDueDate}th of every month</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Navigation Footer */}
            <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
              {step > 1 ? (
                <button type="button" className="btn btn-outline-secondary btn-sm px-3" onClick={handleBack} disabled={submitting}>
                  <i className="bi bi-arrow-left me-1"></i> Back
                </button>
              ) : (
                <div></div>
              )}

              {step < 7 ? (
                <button type="button" className="btn btn-primary btn-sm px-4" onClick={handleNext}>
                  Next Step <i className="bi bi-arrow-right ms-1"></i>
                </button>
              ) : (
                <button
                  type="button"
                  className="btn btn-success btn-sm px-4 d-flex align-items-center gap-2"
                  onClick={handleFinalSubmit}
                  disabled={submitting}
                >
                  {submitting && <span className="spinner-border spinner-border-sm" role="status"></span>}
                  <i className="bi bi-check2-circle"></i> Activate & Register Occupancy
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
