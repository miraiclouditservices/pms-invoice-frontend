'use client';

import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import { apiClient } from '../../lib/apiClient';
import { useAuth } from '../../context/AuthContext';
import Link from 'next/link';

export default function UnitsPage() {
  const searchParams = useSearchParams();
  const initialPropertyParam = searchParams.get('propertyId') || '';
  const initialBuildingParam = searchParams.get('buildingId') || '';
  const initialFloorParam = searchParams.get('floorId') || '';

  const { organisation, user, activeProperty } = useAuth();
  const [units, setUnits] = useState<any[]>([]);
  const [buildings, setBuildings] = useState<any[]>([]);
  const [floors, setFloors] = useState<any[]>([]);
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // UI Controls
  const [viewMode, setViewMode] = useState<'grid' | 'table'>('table');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [activeModalTab, setActiveModalTab] = useState<'core' | 'specs' | 'occupant' | 'rates'>('core');

  // Filters
  const [search, setSearch] = useState('');
  const [selectedPropertyId, setSelectedPropertyId] = useState<string>(initialPropertyParam);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string>(initialBuildingParam);
  const [selectedFloorId, setSelectedFloorId] = useState<string>(initialFloorParam);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [unitTypeFilter, setUnitTypeFilter] = useState<string>('ALL');

  // Currently selected property to dynamically adapt fields and terminology
  const currentSelectedProperty = useMemo(() => {
    return properties.find(p => p._id === selectedPropertyId) || activeProperty || properties[0] || null;
  }, [properties, selectedPropertyId, activeProperty]);

  const currentPropType = (currentSelectedProperty?.propertyType || organisation?.type || 'RESIDENTIAL').toUpperCase();

  // Dynamic Type Options based on Property Type
  const unitTypeOptions = useMemo(() => {
    if (currentPropType === 'COMMERCIAL') {
      return [
        { value: 'OFFICE', label: 'Commercial Office Suite' },
        { value: 'SHOP', label: 'Retail Shop / Showroom' },
        { value: 'SHOWROOM', label: 'Display Showroom' },
        { value: 'RESTAURANT', label: 'Restaurant / Cafe Space' },
        { value: 'CLINIC', label: 'Clinic / Healthcare' },
        { value: 'WAREHOUSE', label: 'Storage / Warehouse' },
        { value: 'ATM', label: 'ATM / Kiosk Unit' },
        { value: 'OTHER', label: 'Other Commercial Unit' }
      ];
    }
    if (currentPropType === 'COWORKING') {
      return [
        { value: 'HOT_DESK', label: 'Flex / Hot Desk' },
        { value: 'DEDICATED_DESK', label: 'Dedicated Desk' },
        { value: 'PRIVATE_CABIN', label: 'Private Team Cabin' },
        { value: 'MEETING_ROOM', label: 'Conference / Meeting Room' },
        { value: 'EVENT_SPACE', label: 'Event / Workshop Space' },
        { value: 'DAY_PASS', label: 'Day Pass Station' },
        { value: 'POD', label: 'Phone Booth / Focus Pod' }
      ];
    }
    // Apartment / Residential
    return [
      { value: 'FLAT', label: 'Apartment / Flat' },
      { value: 'PENTHOUSE', label: 'Penthouse' },
      { value: 'STUDIO', label: 'Studio Apartment' },
      { value: 'DUPLEX', label: 'Duplex Apartment' },
      { value: 'VILLA', label: 'Independent Villa' },
      { value: 'ROW_HOUSE', label: 'Row House' }
    ];
  }, [currentPropType]);

  const getInitialForm = () => ({
    propertyId: selectedPropertyId || currentSelectedProperty?._id || '',
    buildingId: selectedBuildingId || '',
    floorId: selectedFloorId || '',
    
    // Identifiers
    unitNumber: '',
    unitCode: '',
    unitName: '',
    wing: '',
    unitType: unitTypeOptions[0]?.value || 'FLAT',
    description: '',
    status: 'AVAILABLE',
    occupancyStatus: 'VACANT',
    furnishingType: 'UNFURNISHED',
    
    // Areas & Capacity
    carpetArea: '',
    builtUpArea: '',
    superBuiltUpArea: '',
    capacity: 1,
    seatingCapacity: 1,
    workstationsCount: 0,
    
    // Residential specific
    flatNumber: '',
    bhkType: '2BHK',
    facing: 'EAST',
    ownershipType: 'OWNER_OCCUPIED',
    ownerName: '',
    residentName: '',
    familyMembersCount: 0,
    monthlyMaintenanceAmount: '',
    electricityMeter: '',
    waterMeter: '',
    gasMeter: '',
    moveInDate: '',
    
    // Commercial specific
    officeShopNumber: '',
    commercialUnitType: 'OFFICE',
    tenantCompany: '',
    tenantContactPerson: '',
    tenantEmail: '',
    tenantPhone: '',
    businessCategory: '',
    gstNumber: '',
    panNumber: '',
    leaseStartDate: '',
    leaseEndDate: '',
    lockInPeriodMonths: 12,
    noticePeriodMonths: 2,
    monthlyRent: '',
    camCharges: '',
    securityDeposit: '',
    taxPercentage: 18,
    escalationPercentage: 5,
    rentDueDate: 5,
    
    // Co-working specific
    spaceNumber: '',
    spaceCode: '',
    spaceName: '',
    spaceType: 'DEDICATED_DESK',
    deskNumber: '',
    cabinNumber: '',
    hourlyPrice: '',
    dailyPrice: '',
    monthlyPrice: '',
    membershipPlan: 'MONTHLY_DEDICATED',
    assignedCompanyName: '',
    assignedMemberName: '',
    bookingRequired: false,
    approvalRequired: false,
    accessTiming: '24/7',
    internetAvailability: true,
    powerBackupAvailable: true,
    meetingRoomAccess: true,
    printingAccess: true,
    lockerAvailable: false,
    parkingAvailable: false
  });

  const [formData, setFormData] = useState(getInitialForm);

  const loadData = async () => {
    setLoading(true);
    setError('');
    try {
      const [unitsRes, bldgRes, floorRes, propRes] = await Promise.all([
        apiClient.get('/structure/units'),
        apiClient.get('/structure/buildings'),
        apiClient.get('/structure/floors'),
        apiClient.get('/properties')
      ]);

      if (unitsRes.data.success) setUnits(unitsRes.data.data);
      if (bldgRes.data.success) setBuildings(bldgRes.data.data);
      if (floorRes.data.success) setFloors(floorRes.data.data);
      if (propRes.data.success) {
        const props = propRes.data.data;
        setProperties(props);
        if (!selectedPropertyId && props.length > 0) {
          const defaultProp = activeProperty?._id || props[0]._id;
          setSelectedPropertyId(defaultProp);
          setFormData(prev => ({ ...prev, propertyId: defaultProp }));
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load units directory');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Update building and floor options filtered by selected property in form
  const formBuildings = useMemo(() => {
    if (!formData.propertyId) return buildings;
    return buildings.filter(b => (b.propertyId?._id || b.propertyId) === formData.propertyId);
  }, [buildings, formData.propertyId]);

  const formFloors = useMemo(() => {
    if (!formData.buildingId) return floors;
    return floors.filter(f => (f.buildingId?._id || f.buildingId) === formData.buildingId);
  }, [floors, formData.buildingId]);

  // Filters for Main List
  const filterBuildings = useMemo(() => {
    if (!selectedPropertyId) return buildings;
    return buildings.filter(b => (b.propertyId?._id || b.propertyId) === selectedPropertyId);
  }, [buildings, selectedPropertyId]);

  const filterFloors = useMemo(() => {
    if (!selectedBuildingId) return floors;
    return floors.filter(f => (f.buildingId?._id || f.buildingId) === selectedBuildingId);
  }, [floors, selectedBuildingId]);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setActiveModalTab('core');
    const init = getInitialForm();
    if (formBuildings.length > 0) {
      init.buildingId = formBuildings[0]._id;
      const fFloors = floors.filter(f => (f.buildingId?._id || f.buildingId) === formBuildings[0]._id);
      if (fFloors.length > 0) init.floorId = fFloors[0]._id;
    }
    setFormData(init);
    setShowModal(true);
  };

  const openEditModal = (unit: any) => {
    setModalMode('edit');
    setEditingId(unit._id);
    setActiveModalTab('core');
    setFormData({
      propertyId: unit.propertyId?._id || unit.propertyId || '',
      buildingId: unit.buildingId?._id || unit.buildingId || '',
      floorId: unit.floorId?._id || unit.floorId || '',
      unitNumber: unit.unitNumber || '',
      unitCode: unit.unitCode || '',
      unitName: unit.unitName || '',
      wing: unit.wing || '',
      unitType: unit.unitType || unitTypeOptions[0]?.value || 'FLAT',
      description: unit.description || '',
      status: unit.status || 'AVAILABLE',
      occupancyStatus: unit.occupancyStatus || 'VACANT',
      furnishingType: unit.furnishingType || 'UNFURNISHED',
      carpetArea: unit.carpetArea || '',
      builtUpArea: unit.builtUpArea || '',
      superBuiltUpArea: unit.superBuiltUpArea || '',
      capacity: unit.capacity || 1,
      seatingCapacity: unit.seatingCapacity || 1,
      workstationsCount: unit.workstationsCount || 0,
      flatNumber: unit.flatNumber || '',
      bhkType: unit.bhkType || '2BHK',
      facing: unit.facing || 'EAST',
      ownershipType: unit.ownershipType || 'OWNER_OCCUPIED',
      ownerName: unit.ownerName || '',
      residentName: unit.residentName || '',
      familyMembersCount: unit.familyMembersCount || 0,
      monthlyMaintenanceAmount: unit.monthlyMaintenanceAmount || '',
      electricityMeter: unit.utilityMeters?.electricity || '',
      waterMeter: unit.utilityMeters?.water || '',
      gasMeter: unit.utilityMeters?.gas || '',
      moveInDate: unit.moveInDate ? new Date(unit.moveInDate).toISOString().split('T')[0] : '',
      officeShopNumber: unit.officeShopNumber || '',
      commercialUnitType: unit.commercialUnitType || 'OFFICE',
      tenantCompany: unit.tenantCompany || '',
      tenantContactPerson: unit.tenantContactPerson || '',
      tenantEmail: unit.tenantEmail || '',
      tenantPhone: unit.tenantPhone || '',
      businessCategory: unit.businessCategory || '',
      gstNumber: unit.gstNumber || '',
      panNumber: unit.panNumber || '',
      leaseStartDate: unit.leaseStartDate ? new Date(unit.leaseStartDate).toISOString().split('T')[0] : '',
      leaseEndDate: unit.leaseEndDate ? new Date(unit.leaseEndDate).toISOString().split('T')[0] : '',
      lockInPeriodMonths: unit.lockInPeriodMonths || 12,
      noticePeriodMonths: unit.noticePeriodMonths || 2,
      monthlyRent: unit.monthlyRent || '',
      camCharges: unit.camCharges || '',
      securityDeposit: unit.securityDeposit || '',
      taxPercentage: unit.taxPercentage || 18,
      escalationPercentage: unit.escalationPercentage || 5,
      rentDueDate: unit.rentDueDate || 5,
      spaceNumber: unit.spaceNumber || '',
      spaceCode: unit.spaceCode || '',
      spaceName: unit.spaceName || '',
      spaceType: unit.spaceType || 'DEDICATED_DESK',
      deskNumber: unit.deskNumber || '',
      cabinNumber: unit.cabinNumber || '',
      hourlyPrice: unit.hourlyPrice || '',
      dailyPrice: unit.dailyPrice || '',
      monthlyPrice: unit.monthlyPrice || '',
      membershipPlan: unit.membershipPlan || 'MONTHLY_DEDICATED',
      assignedCompanyName: unit.assignedCompanyName || '',
      assignedMemberName: unit.assignedMemberName || '',
      bookingRequired: unit.bookingRequired || false,
      approvalRequired: unit.approvalRequired || false,
      accessTiming: unit.accessTiming || '24/7',
      internetAvailability: unit.internetAvailability !== false,
      powerBackupAvailable: unit.powerBackupAvailable !== false,
      meetingRoomAccess: unit.meetingRoomAccess !== false,
      printingAccess: unit.printingAccess !== false,
      lockerAvailable: unit.lockerAvailable || false,
      parkingAvailable: unit.parkingAvailable || false
    });
    setShowModal(true);
  };

  const handleStatusQuickChange = async (unitId: string, newStatus: string) => {
    try {
      const res = await apiClient.put(`/structure/units/${unitId}/status`, { occupancyStatus: newStatus });
      if (res.data.success) {
        setUnits(prev => prev.map(u => u._id === unitId ? { ...u, occupancyStatus: newStatus } : u));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error updating unit status');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload: any = {
        propertyId: formData.propertyId,
        buildingId: formData.buildingId,
        floorId: formData.floorId,
        unitNumber: formData.unitNumber.trim(),
        unitCode: formData.unitCode.trim() || formData.unitNumber.trim(),
        unitName: formData.unitName.trim(),
        wing: formData.wing.trim(),
        unitType: formData.unitType,
        description: formData.description,
        status: formData.status,
        occupancyStatus: formData.occupancyStatus,
        furnishingType: formData.furnishingType,
        carpetArea: Number(formData.carpetArea) || 0,
        builtUpArea: Number(formData.builtUpArea) || 0,
        superBuiltUpArea: Number(formData.superBuiltUpArea) || 0,
        capacity: Number(formData.capacity) || 1,
        seatingCapacity: Number(formData.seatingCapacity) || 1,
        workstationsCount: Number(formData.workstationsCount) || 0
      };

      // Type-specific payloads
      if (currentPropType === 'RESIDENTIAL') {
        payload.flatNumber = formData.flatNumber || formData.unitNumber;
        payload.bhkType = formData.bhkType;
        payload.facing = formData.facing;
        payload.ownershipType = formData.ownershipType;
        payload.ownerName = formData.ownerName;
        payload.residentName = formData.residentName;
        payload.familyMembersCount = Number(formData.familyMembersCount) || 0;
        payload.monthlyMaintenanceAmount = Number(formData.monthlyMaintenanceAmount) || 0;
        payload.utilityMeters = {
          electricity: formData.electricityMeter,
          water: formData.waterMeter,
          gas: formData.gasMeter
        };
        if (formData.moveInDate) payload.moveInDate = formData.moveInDate;
      } else if (currentPropType === 'COMMERCIAL') {
        payload.officeShopNumber = formData.officeShopNumber || formData.unitNumber;
        payload.commercialUnitType = formData.commercialUnitType;
        payload.tenantCompany = formData.tenantCompany;
        payload.tenantContactPerson = formData.tenantContactPerson;
        payload.tenantEmail = formData.tenantEmail;
        payload.tenantPhone = formData.tenantPhone;
        payload.businessCategory = formData.businessCategory;
        payload.gstNumber = formData.gstNumber;
        payload.panNumber = formData.panNumber;
        if (formData.leaseStartDate) payload.leaseStartDate = formData.leaseStartDate;
        if (formData.leaseEndDate) payload.leaseEndDate = formData.leaseEndDate;
        payload.lockInPeriodMonths = Number(formData.lockInPeriodMonths) || 0;
        payload.noticePeriodMonths = Number(formData.noticePeriodMonths) || 0;
        payload.monthlyRent = Number(formData.monthlyRent) || 0;
        payload.camCharges = Number(formData.camCharges) || 0;
        payload.securityDeposit = Number(formData.securityDeposit) || 0;
        payload.taxPercentage = Number(formData.taxPercentage) || 0;
        payload.escalationPercentage = Number(formData.escalationPercentage) || 0;
        payload.rentDueDate = Number(formData.rentDueDate) || 1;
      } else if (currentPropType === 'COWORKING') {
        payload.spaceNumber = formData.spaceNumber || formData.unitNumber;
        payload.spaceCode = formData.spaceCode || formData.unitCode;
        payload.spaceName = formData.spaceName || formData.unitName;
        payload.spaceType = formData.spaceType || formData.unitType;
        payload.deskNumber = formData.deskNumber;
        payload.cabinNumber = formData.cabinNumber;
        payload.hourlyPrice = Number(formData.hourlyPrice) || 0;
        payload.dailyPrice = Number(formData.dailyPrice) || 0;
        payload.monthlyPrice = Number(formData.monthlyPrice) || 0;
        payload.membershipPlan = formData.membershipPlan;
        payload.assignedCompanyName = formData.assignedCompanyName;
        payload.assignedMemberName = formData.assignedMemberName;
        payload.bookingRequired = formData.bookingRequired;
        payload.approvalRequired = formData.approvalRequired;
        payload.accessTiming = formData.accessTiming;
        payload.internetAvailability = formData.internetAvailability;
        payload.powerBackupAvailable = formData.powerBackupAvailable;
        payload.meetingRoomAccess = formData.meetingRoomAccess;
        payload.printingAccess = formData.printingAccess;
        payload.lockerAvailable = formData.lockerAvailable;
        payload.parkingAvailable = formData.parkingAvailable;
      }

      if (modalMode === 'create') {
        const res = await apiClient.post('/structure/units', payload);
        if (res.data.success) {
          setShowModal(false);
          loadData();
        }
      } else {
        const res = await apiClient.put(`/structure/units/${editingId}`, payload);
        if (res.data.success) {
          setShowModal(false);
          loadData();
        }
      }
    } catch (err: any) {
      alert(err.response?.data?.message || `Error ${modalMode === 'create' ? 'creating' : 'updating'} unit`);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to archive unit "${name}"?`)) return;
    try {
      const res = await apiClient.delete(`/structure/units/${id}`);
      if (res.data.success) {
        setUnits(prev => prev.filter(u => u._id !== id));
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error archiving unit');
    }
  };

  // Filtered List
  const filteredUnits = useMemo(() => {
    return units.filter(u => {
      const pId = u.propertyId?._id || u.propertyId;
      if (selectedPropertyId && pId !== selectedPropertyId) return false;

      const bId = u.buildingId?._id || u.buildingId;
      if (selectedBuildingId && bId !== selectedBuildingId) return false;

      const fId = u.floorId?._id || u.floorId;
      if (selectedFloorId && fId !== selectedFloorId) return false;

      if (statusFilter !== 'ALL' && u.occupancyStatus !== statusFilter && u.status !== statusFilter) return false;
      if (unitTypeFilter !== 'ALL' && u.unitType !== unitTypeFilter) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const matchNum = u.unitNumber?.toLowerCase().includes(q);
        const matchCode = u.unitCode?.toLowerCase().includes(q);
        const matchWing = u.wing?.toLowerCase().includes(q);
        const matchResident = u.residentName?.toLowerCase().includes(q) || u.currentResidentId?.name?.toLowerCase().includes(q);
        const matchTenant = u.tenantCompany?.toLowerCase().includes(q) || u.currentTenantCompanyId?.companyName?.toLowerCase().includes(q);
        const matchMember = u.assignedMemberName?.toLowerCase().includes(q) || u.currentMemberId?.memberName?.toLowerCase().includes(q);
        if (!matchNum && !matchCode && !matchWing && !matchResident && !matchTenant && !matchMember) return false;
      }
      return true;
    });
  }, [units, selectedPropertyId, selectedBuildingId, selectedFloorId, statusFilter, unitTypeFilter, search]);

  // Statistics KPIs
  const stats = useMemo(() => {
    const total = filteredUnits.length;
    const occupied = filteredUnits.filter(u => u.occupancyStatus === 'OCCUPIED' || u.status === 'OCCUPIED' || u.status === 'RENTED').length;
    const vacant = filteredUnits.filter(u => u.occupancyStatus === 'VACANT' || u.status === 'AVAILABLE' || u.status === 'VACANT').length;
    const maintenance = filteredUnits.filter(u => u.occupancyStatus === 'MAINTENANCE' || u.status === 'UNDER_MAINTENANCE').length;
    const occupancyRate = total > 0 ? Math.round((occupied / total) * 100) : 0;
    return { total, occupied, vacant, maintenance, occupancyRate };
  }, [filteredUnits]);

  // Terminology helper
  const unitLabel = currentPropType === 'RESIDENTIAL' ? 'Flat / Apartment' : currentPropType === 'COMMERCIAL' ? 'Office / Commercial Unit' : 'Space / Desk';
  const unitsLabelPlural = currentPropType === 'RESIDENTIAL' ? 'Flats & Apartments' : currentPropType === 'COMMERCIAL' ? 'Offices & Suites' : 'Desks & Cabins';

  return (
    <div className="container-fluid py-2">
      {/* Header Bar */}
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-2">
        <div>
          <nav aria-label="breadcrumb">
            <ol className="breadcrumb mb-1 small">
              <li className="breadcrumb-item"><Link href="/dashboard" className="text-decoration-none">Dashboard</Link></li>
              <li className="breadcrumb-item"><Link href="/properties" className="text-decoration-none">Properties</Link></li>
              <li className="breadcrumb-item active" aria-current="page">Units & Spaces</li>
            </ol>
          </nav>
          <div className="d-flex align-items-center gap-2">
            <h2 className="fw-bold mb-0">{unitsLabelPlural}</h2>
            <span className={`badge ${
              currentPropType === 'COMMERCIAL' ? 'bg-info-subtle text-info border border-info-subtle' :
              currentPropType === 'COWORKING' ? 'bg-warning-subtle text-warning border border-warning-subtle' :
              'bg-primary-subtle text-primary border border-primary-subtle'
            }`}>
              {currentPropType}
            </span>
          </div>
          <p className="text-secondary small mb-0 mt-1">
            Manage inventory, layout specs, pricing, and occupancy across your properties.
          </p>
        </div>

        <div className="d-flex align-items-center gap-2">
          {/* Grid / Table Switch */}
          <div className="btn-group btn-group-sm" role="group">
            <button
              type="button"
              className={`btn ${viewMode === 'table' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <i className="bi bi-list-ul"></i>
            </button>
            <button
              type="button"
              className={`btn ${viewMode === 'grid' ? 'btn-primary' : 'btn-outline-secondary'}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <i className="bi bi-grid-fill"></i>
            </button>
          </div>

          <button
            onClick={openCreateModal}
            className="btn btn-primary btn-sm d-flex align-items-center gap-1 shadow-sm px-3"
          >
            <i className="bi bi-plus-lg"></i> Add {unitLabel}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="row g-3 mb-4">
        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-body">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-medium">Total Inventory</span>
                <h4 className="fw-bold mb-0 mt-1">{stats.total}</h4>
              </div>
              <div className="p-3 bg-primary-subtle text-primary rounded-3">
                <i className="bi bi-door-open-fill fs-5"></i>
              </div>
            </div>
            <div className="mt-2 text-muted small">
              Across selected filters
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-body">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-medium">Occupied</span>
                <h4 className="fw-bold mb-0 mt-1 text-success">{stats.occupied}</h4>
              </div>
              <div className="p-3 bg-success-subtle text-success rounded-3">
                <i className="bi bi-person-check-fill fs-5"></i>
              </div>
            </div>
            <div className="mt-2 text-success small fw-semibold">
              {stats.occupancyRate}% Occupancy Rate
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-body">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-medium">Vacant / Available</span>
                <h4 className="fw-bold mb-0 mt-1 text-primary">{stats.vacant}</h4>
              </div>
              <div className="p-3 bg-info-subtle text-info rounded-3">
                <i className="bi bi-check-circle-fill fs-5"></i>
              </div>
            </div>
            <div className="mt-2 text-muted small">
              Ready for immediate allocation
            </div>
          </div>
        </div>

        <div className="col-6 col-md-3">
          <div className="card border-0 shadow-sm rounded-3 p-3 bg-body">
            <div className="d-flex align-items-center justify-content-between">
              <div>
                <span className="text-muted small fw-medium">Maintenance / Blocked</span>
                <h4 className="fw-bold mb-0 mt-1 text-warning">{stats.maintenance}</h4>
              </div>
              <div className="p-3 bg-warning-subtle text-warning rounded-3">
                <i className="bi bi-tools fs-5"></i>
              </div>
            </div>
            <div className="mt-2 text-muted small">
              Requires attention / repairs
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card border-0 shadow-sm rounded-3 p-3 mb-4">
        <div className="row g-2 align-items-center">
          {/* Search */}
          <div className="col-12 col-md-3">
            <div className="input-group input-group-sm">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted"></i>
              </span>
              <input
                type="text"
                className="form-control border-start-0"
                placeholder="Search unit #, code, resident..."
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
              {search && (
                <button className="btn btn-outline-secondary" onClick={() => setSearch('')}>
                  <i className="bi bi-x"></i>
                </button>
              )}
            </div>
          </div>

          {/* Property Filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={selectedPropertyId}
              onChange={e => {
                setSelectedPropertyId(e.target.value);
                setSelectedBuildingId('');
                setSelectedFloorId('');
              }}
            >
              <option value="">All Properties</option>
              {properties.map(p => (
                <option key={p._id} value={p._id}>{p.name}</option>
              ))}
            </select>
          </div>

          {/* Building Filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={selectedBuildingId}
              onChange={e => {
                setSelectedBuildingId(e.target.value);
                setSelectedFloorId('');
              }}
            >
              <option value="">All Buildings</option>
              {filterBuildings.map(b => (
                <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
              ))}
            </select>
          </div>

          {/* Floor Filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={selectedFloorId}
              onChange={e => setSelectedFloorId(e.target.value)}
            >
              <option value="">All Floors</option>
              {filterFloors.map(f => (
                <option key={f._id} value={f._id}>{f.floorName || `Floor ${f.floorNumber}`}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="col-6 col-md-1">
            <select
              className="form-select form-select-sm"
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="ALL">Status</option>
              <option value="VACANT">Vacant</option>
              <option value="OCCUPIED">Occupied</option>
              <option value="RESERVED">Reserved</option>
              <option value="MAINTENANCE">Maint.</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="col-6 col-md-2">
            <select
              className="form-select form-select-sm"
              value={unitTypeFilter}
              onChange={e => setUnitTypeFilter(e.target.value)}
            >
              <option value="ALL">All Types</option>
              {unitTypeOptions.map(t => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status"></div>
          <p className="text-muted small mt-2">Loading inventory...</p>
        </div>
      ) : error ? (
        <div className="alert alert-danger shadow-sm rounded-3">
          <i className="bi bi-exclamation-triangle me-2"></i>{error}
          <button className="btn btn-sm btn-outline-danger ms-3" onClick={loadData}>Retry</button>
        </div>
      ) : filteredUnits.length === 0 ? (
        <div className="card border-0 shadow-sm rounded-3 text-center py-5 px-3">
          <div className="display-6 text-muted mb-3">
            <i className="bi bi-door-closed"></i>
          </div>
          <h5 className="fw-bold">No {unitsLabelPlural} Found</h5>
          <p className="text-muted small mx-auto" style={{ maxWidth: '400px' }}>
            There are no units matching your search and filter criteria. You can register a new unit to expand your space inventory.
          </p>
          <button onClick={openCreateModal} className="btn btn-primary btn-sm mx-auto d-inline-flex align-items-center gap-1">
            <i className="bi bi-plus-lg"></i> Add New {unitLabel}
          </button>
        </div>
      ) : viewMode === 'table' ? (
        /* TABLE VIEW */
        <div className="card border-0 shadow-sm rounded-3 overflow-hidden">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light small">
                <tr>
                  <th className="ps-3">Unit / Space</th>
                  <th>Type</th>
                  <th>Location (Building & Floor)</th>
                  <th>Area / Specs</th>
                  <th>Pricing / Maintenance</th>
                  <th>Current Occupant</th>
                  <th>Status</th>
                  <th className="text-end pe-3">Actions</th>
                </tr>
              </thead>
              <tbody className="border-top-0">
                {filteredUnits.map(u => {
                  const pType = u.propertyId?.propertyType || currentPropType;
                  return (
                    <tr key={u._id}>
                      <td className="ps-3">
                        <div className="fw-bold text-primary">
                          {u.wing ? `${u.wing}-` : ''}{u.unitNumber}
                        </div>
                        {u.unitCode && u.unitCode !== u.unitNumber && (
                          <div className="text-muted small">Code: {u.unitCode}</div>
                        )}
                        {pType === 'RESIDENTIAL' && u.bhkType && (
                          <span className="badge bg-light text-secondary border small mt-1">{u.bhkType}</span>
                        )}
                      </td>

                      <td>
                        <span className="badge bg-light text-dark border">
                          {u.unitType?.replace('_', ' ') || 'STANDARD'}
                        </span>
                        {u.furnishingType && u.furnishingType !== 'UNFURNISHED' && (
                          <div className="text-muted small mt-1">{u.furnishingType.replace('_', ' ')}</div>
                        )}
                      </td>

                      <td>
                        <div className="small fw-semibold text-dark">{u.buildingId?.name || 'Building'}</div>
                        <div className="text-muted small">
                          {u.floorId?.floorName || (u.floorId?.floorNumber !== undefined ? `Floor ${u.floorId.floorNumber}` : 'N/A')}
                        </div>
                      </td>

                      <td>
                        {u.carpetArea ? (
                          <div className="small fw-semibold">{u.carpetArea} sq.ft <span className="text-muted fw-normal">(Carpet)</span></div>
                        ) : u.superBuiltUpArea ? (
                          <div className="small fw-semibold">{u.superBuiltUpArea} sq.ft</div>
                        ) : (
                          <span className="text-muted small">-</span>
                        )}
                        {u.seatingCapacity > 1 && (
                          <div className="text-muted small"><i className="bi bi-people me-1"></i>{u.seatingCapacity} seats</div>
                        )}
                      </td>

                      <td>
                        {pType === 'RESIDENTIAL' ? (
                          <div>
                            <span className="small fw-bold text-dark">
                              {u.monthlyMaintenanceAmount ? `₹${Number(u.monthlyMaintenanceAmount).toLocaleString()}` : '-'}
                            </span>
                            <div className="text-muted small">Maint./mo</div>
                          </div>
                        ) : pType === 'COMMERCIAL' ? (
                          <div>
                            <span className="small fw-bold text-dark">
                              {u.monthlyRent ? `₹${Number(u.monthlyRent).toLocaleString()}` : '-'}
                            </span>
                            <div className="text-muted small">Rent/mo</div>
                          </div>
                        ) : (
                          <div>
                            <span className="small fw-bold text-dark">
                              {u.monthlyPrice ? `₹${Number(u.monthlyPrice).toLocaleString()}` : u.dailyPrice ? `₹${Number(u.dailyPrice).toLocaleString()}/day` : '-'}
                            </span>
                            <div className="text-muted small">Desk rate</div>
                          </div>
                        )}
                      </td>

                      <td>
                        {u.currentResidentId?.name || u.residentName ? (
                          <div>
                            <div className="small fw-semibold">{u.currentResidentId?.name || u.residentName}</div>
                            <div className="text-muted small">{u.currentResidentId?.mobile || u.ownershipType?.replace('_', ' ')}</div>
                          </div>
                        ) : u.currentTenantCompanyId?.companyName || u.tenantCompany ? (
                          <div>
                            <div className="small fw-semibold">{u.currentTenantCompanyId?.companyName || u.tenantCompany}</div>
                            <div className="text-muted small">{u.tenantContactPerson || u.currentTenantCompanyId?.contactPerson || 'Lease active'}</div>
                          </div>
                        ) : u.currentMemberId?.memberName || u.assignedMemberName ? (
                          <div>
                            <div className="small fw-semibold">{u.currentMemberId?.memberName || u.assignedMemberName}</div>
                            <div className="text-muted small">{u.assignedCompanyName || 'Coworker'}</div>
                          </div>
                        ) : (
                          <span className="badge bg-light text-muted border fst-italic">Vacant / Available</span>
                        )}
                      </td>

                      <td>
                        <span className={`badge ${
                          u.occupancyStatus === 'OCCUPIED'
                            ? 'bg-success-subtle text-success border border-success-subtle'
                            : u.occupancyStatus === 'VACANT'
                            ? 'bg-info-subtle text-info border border-info-subtle'
                            : u.occupancyStatus === 'RESERVED'
                            ? 'bg-primary-subtle text-primary border border-primary-subtle'
                            : 'bg-warning-subtle text-warning border border-warning-subtle'
                        }`}>
                          {u.occupancyStatus || 'VACANT'}
                        </span>
                      </td>

                      <td className="text-end pe-3">
                        <div className="dropdown">
                          <button className="btn btn-light btn-sm dropdown-toggle py-0 px-2" data-bs-toggle="dropdown">
                            Manage
                          </button>
                          <ul className="dropdown-menu dropdown-menu-end shadow-sm">
                            <li>
                              <Link href={`/units/${u._id}`} className="dropdown-item small">
                                <i className="bi bi-eye me-2 text-primary"></i> View Details
                              </Link>
                            </li>
                            <li>
                              <button className="dropdown-item small" onClick={() => openEditModal(u)}>
                                <i className="bi bi-pencil me-2 text-secondary"></i> Edit Info
                              </button>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                              <button
                                className="dropdown-item small text-success"
                                onClick={() => handleStatusQuickChange(u._id, 'OCCUPIED')}
                              >
                                <i className="bi bi-person-check me-2"></i> Mark Occupied
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item small text-info"
                                onClick={() => handleStatusQuickChange(u._id, 'VACANT')}
                              >
                                <i className="bi bi-door-open me-2"></i> Mark Vacant
                              </button>
                            </li>
                            <li>
                              <button
                                className="dropdown-item small text-warning"
                                onClick={() => handleStatusQuickChange(u._id, 'MAINTENANCE')}
                              >
                                <i className="bi bi-tools me-2"></i> Under Maintenance
                              </button>
                            </li>
                            <li><hr className="dropdown-divider" /></li>
                            <li>
                              <button
                                className="dropdown-item small text-danger"
                                onClick={() => handleDelete(u._id, u.unitNumber)}
                              >
                                <i className="bi bi-archive me-2"></i> Archive Unit
                              </button>
                            </li>
                          </ul>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* GRID VIEW */
        <div className="row g-3">
          {filteredUnits.map(u => {
            const pType = u.propertyId?.propertyType || currentPropType;
            return (
              <div key={u._id} className="col-12 col-md-6 col-xl-4">
                <div className="card border-0 shadow-sm rounded-3 h-100 position-relative pms-unit-card">
                  <div className="card-body p-3 d-flex flex-column">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                      <div>
                        <div className="d-flex align-items-center gap-2">
                          <h5 className="fw-bold mb-0 text-primary">
                            {u.wing ? `${u.wing}-` : ''}{u.unitNumber}
                          </h5>
                          <span className={`badge ${
                            u.occupancyStatus === 'OCCUPIED'
                              ? 'bg-success-subtle text-success border border-success-subtle'
                              : u.occupancyStatus === 'VACANT'
                              ? 'bg-info-subtle text-info border border-info-subtle'
                              : 'bg-warning-subtle text-warning border border-warning-subtle'
                          }`}>
                            {u.occupancyStatus || 'VACANT'}
                          </span>
                        </div>
                        <div className="text-muted small mt-1">
                          {u.buildingId?.name} • {u.floorId?.floorName || `Floor ${u.floorId?.floorNumber || 0}`}
                        </div>
                      </div>

                      <span className="badge bg-light text-dark border">
                        {u.unitType?.replace('_', ' ')}
                      </span>
                    </div>

                    <div className="row g-2 my-2 py-2 border-top border-bottom small">
                      <div className="col-6">
                        <span className="text-muted d-block">Carpet Area:</span>
                        <span className="fw-semibold">{u.carpetArea ? `${u.carpetArea} sq.ft` : 'N/A'}</span>
                      </div>
                      <div className="col-6">
                        <span className="text-muted d-block">
                          {pType === 'RESIDENTIAL' ? 'Maint. Rate:' : pType === 'COMMERCIAL' ? 'Monthly Rent:' : 'Desk Rate:'}
                        </span>
                        <span className="fw-semibold text-primary">
                          {pType === 'RESIDENTIAL'
                            ? (u.monthlyMaintenanceAmount ? `₹${Number(u.monthlyMaintenanceAmount).toLocaleString()}` : '-')
                            : pType === 'COMMERCIAL'
                            ? (u.monthlyRent ? `₹${Number(u.monthlyRent).toLocaleString()}` : '-')
                            : (u.monthlyPrice ? `₹${Number(u.monthlyPrice).toLocaleString()}` : '-')}
                        </span>
                      </div>
                    </div>

                    {/* Occupant Preview */}
                    <div className="mt-auto pt-2">
                      <div className="small text-muted mb-1">Assigned Occupant:</div>
                      {u.currentResidentId?.name || u.residentName ? (
                        <div className="d-flex align-items-center gap-2">
                          <div className="avatar-circle bg-primary-subtle text-primary fw-bold" style={{ width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 11 }}>
                            {(u.currentResidentId?.name || u.residentName).substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <div className="small fw-semibold">{u.currentResidentId?.name || u.residentName}</div>
                            <div className="text-muted small" style={{ fontSize: '11px' }}>{u.ownershipType?.replace('_', ' ') || 'Resident'}</div>
                          </div>
                        </div>
                      ) : u.currentTenantCompanyId?.companyName || u.tenantCompany ? (
                        <div className="d-flex align-items-center gap-2">
                          <div className="avatar-circle bg-info-subtle text-info fw-bold" style={{ width: 28, height: 28, borderRadius: '50%', display: 'grid', placeItems: 'center', fontSize: 11 }}>
                            <i className="bi bi-building"></i>
                          </div>
                          <div>
                            <div className="small fw-semibold">{u.currentTenantCompanyId?.companyName || u.tenantCompany}</div>
                            <div className="text-muted small" style={{ fontSize: '11px' }}>{u.tenantContactPerson || 'Commercial Tenant'}</div>
                          </div>
                        </div>
                      ) : (
                        <span className="text-muted small fst-italic">Currently Unassigned / Vacant</span>
                      )}
                    </div>

                    <div className="d-flex justify-content-between align-items-center mt-3 pt-2 border-top">
                      <Link href={`/units/${u._id}`} className="btn btn-outline-primary btn-sm">
                        View Details
                      </Link>
                      <button onClick={() => openEditModal(u)} className="btn btn-light btn-sm text-secondary">
                        <i className="bi bi-pencil me-1"></i> Edit
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* CREATE & EDIT MODAL (Scrollable & Responsive) */}
      {showModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1050 }}>
          <div className="modal-dialog modal-lg modal-dialog-centered modal-dialog-scrollable">
            <form onSubmit={handleSubmit} className="modal-content shadow-lg border-0" style={{ maxHeight: '88vh' }}>
              <div className="modal-header border-bottom flex-shrink-0">
                <div>
                  <h5 className="modal-title fw-bold mb-0">
                    {modalMode === 'create' ? `Register New ${unitLabel}` : `Edit ${unitLabel}`}
                  </h5>
                  <div className="small text-muted">
                    Property Model: <span className="badge bg-secondary-subtle text-secondary">{currentPropType}</span>
                  </div>
                </div>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>

              {/* Navigation Tabs for Clean Organization */}
              <div className="bg-light border-bottom px-3 pt-2 flex-shrink-0">
                <ul className="nav nav-tabs border-bottom-0 small">
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link py-2 ${activeModalTab === 'core' ? 'active fw-bold' : 'text-secondary'}`}
                      onClick={() => setActiveModalTab('core')}
                    >
                      <i className="bi bi-pin-map me-1"></i> Core Location & IDs
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link py-2 ${activeModalTab === 'specs' ? 'active fw-bold' : 'text-secondary'}`}
                      onClick={() => setActiveModalTab('specs')}
                    >
                      <i className="bi bi-rulers me-1"></i> Area & Specifications
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link py-2 ${activeModalTab === 'occupant' ? 'active fw-bold' : 'text-secondary'}`}
                      onClick={() => setActiveModalTab('occupant')}
                    >
                      <i className="bi bi-person-badge me-1"></i>
                      {currentPropType === 'RESIDENTIAL' ? 'Resident / Ownership' : currentPropType === 'COMMERCIAL' ? 'Tenant / Lease' : 'Member / Workstation'}
                    </button>
                  </li>
                  <li className="nav-item">
                    <button
                      type="button"
                      className={`nav-link py-2 ${activeModalTab === 'rates' ? 'active fw-bold' : 'text-secondary'}`}
                      onClick={() => setActiveModalTab('rates')}
                    >
                      <i className="bi bi-currency-rupee me-1"></i> Pricing & Status
                    </button>
                  </li>
                </ul>
              </div>

              <div className="modal-body overflow-y-auto p-3 p-md-4">
                {/* TAB 1: CORE LOCATION */}
                {activeModalTab === 'core' && (
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Property *</label>
                      <select
                        className="form-select form-select-sm"
                        required
                        value={formData.propertyId}
                        onChange={e => {
                          const pId = e.target.value;
                          const nextBldgs = buildings.filter(b => (b.propertyId?._id || b.propertyId) === pId);
                          setFormData({
                            ...formData,
                            propertyId: pId,
                            buildingId: nextBldgs[0]?._id || '',
                            floorId: ''
                          });
                        }}
                      >
                        <option value="">Select Property</option>
                        {properties.map(p => (
                          <option key={p._id} value={p._id}>{p.name} ({p.propertyType})</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Building / Block *</label>
                      <select
                        className="form-select form-select-sm"
                        required
                        value={formData.buildingId}
                        onChange={e => {
                          const bId = e.target.value;
                          const nextFloors = floors.filter(f => (f.buildingId?._id || f.buildingId) === bId);
                          setFormData({
                            ...formData,
                            buildingId: bId,
                            floorId: nextFloors[0]?._id || ''
                          });
                        }}
                      >
                        <option value="">Select Building</option>
                        {formBuildings.map(b => (
                          <option key={b._id} value={b._id}>{b.name} ({b.code})</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Floor Level *</label>
                      <select
                        className="form-select form-select-sm"
                        required
                        value={formData.floorId}
                        onChange={e => setFormData({ ...formData, floorId: e.target.value })}
                      >
                        <option value="">Select Floor</option>
                        {formFloors.map(f => (
                          <option key={f._id} value={f._id}>{f.floorName || `Floor ${f.floorNumber}`}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">
                        {currentPropType === 'RESIDENTIAL' ? 'Flat / Unit Number *' : currentPropType === 'COMMERCIAL' ? 'Office / Shop Number *' : 'Desk / Space Number *'}
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        required
                        placeholder="e.g. 402, B-12, DESK-07"
                        value={formData.unitNumber}
                        onChange={e => setFormData({ ...formData, unitNumber: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Unit / Space Code</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. T1-F4-402"
                        value={formData.unitCode}
                        onChange={e => setFormData({ ...formData, unitCode: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Wing / Sector / Zone</label>
                      <input
                        type="text"
                        className="form-control form-control-sm"
                        placeholder="e.g. East Wing, Sector B"
                        value={formData.wing}
                        onChange={e => setFormData({ ...formData, wing: e.target.value })}
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Classification Type *</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.unitType}
                        onChange={e => setFormData({ ...formData, unitType: e.target.value })}
                      >
                        {unitTypeOptions.map(t => (
                          <option key={t.value} value={t.value}>{t.label}</option>
                        ))}
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Furnishing State</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.furnishingType}
                        onChange={e => setFormData({ ...formData, furnishingType: e.target.value })}
                      >
                        <option value="UNFURNISHED">Unfurnished / Bare Shell</option>
                        <option value="SEMI_FURNISHED">Semi-Furnished / Warm Shell</option>
                        <option value="FULLY_FURNISHED">Fully Furnished / Plug & Play</option>
                      </select>
                    </div>

                    <div className="col-12">
                      <label className="form-label small fw-semibold">Description / Remarks</label>
                      <textarea
                        className="form-control form-control-sm"
                        rows={2}
                        placeholder="Key highlights, orientation or access instructions..."
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                      ></textarea>
                    </div>
                  </div>
                )}

                {/* TAB 2: SPECS & MEASUREMENTS */}
                {activeModalTab === 'specs' && (
                  <div className="row g-3">
                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Carpet Area (sq.ft)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="e.g. 850"
                        value={formData.carpetArea}
                        onChange={e => setFormData({ ...formData, carpetArea: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Built-Up Area (sq.ft)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="e.g. 1020"
                        value={formData.builtUpArea}
                        onChange={e => setFormData({ ...formData, builtUpArea: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Super Built-Up Area (sq.ft)</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        placeholder="e.g. 1250"
                        value={formData.superBuiltUpArea}
                        onChange={e => setFormData({ ...formData, superBuiltUpArea: e.target.value })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Seating / Occupancy Capacity</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={formData.seatingCapacity}
                        onChange={e => setFormData({ ...formData, seatingCapacity: Number(e.target.value) })}
                      />
                    </div>

                    <div className="col-md-4">
                      <label className="form-label small fw-semibold">Workstations Count</label>
                      <input
                        type="number"
                        className="form-control form-control-sm"
                        value={formData.workstationsCount}
                        onChange={e => setFormData({ ...formData, workstationsCount: Number(e.target.value) })}
                      />
                    </div>

                    {currentPropType === 'RESIDENTIAL' && (
                      <>
                        <div className="col-md-4">
                          <label className="form-label small fw-semibold">BHK Configuration</label>
                          <select
                            className="form-select form-select-sm"
                            value={formData.bhkType}
                            onChange={e => setFormData({ ...formData, bhkType: e.target.value })}
                          >
                            <option value="1BHK">1 BHK</option>
                            <option value="2BHK">2 BHK</option>
                            <option value="3BHK">3 BHK</option>
                            <option value="4BHK">4 BHK</option>
                            <option value="PENTHOUSE">Penthouse</option>
                            <option value="VILLA">Villa</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>

                        <div className="col-md-4">
                          <label className="form-label small fw-semibold">Facing / Orientation</label>
                          <select
                            className="form-select form-select-sm"
                            value={formData.facing}
                            onChange={e => setFormData({ ...formData, facing: e.target.value })}
                          >
                            <option value="EAST">East</option>
                            <option value="WEST">West</option>
                            <option value="NORTH">North</option>
                            <option value="SOUTH">South</option>
                            <option value="NORTH_EAST">North-East</option>
                            <option value="SOUTH_EAST">South-East</option>
                          </select>
                        </div>

                        <div className="col-12 mt-3">
                          <h6 className="fw-bold small border-bottom pb-2">Utility Meter Numbers</h6>
                          <div className="row g-2">
                            <div className="col-md-4">
                              <label className="form-label small text-muted">Electricity Meter</label>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="EB meter #"
                                value={formData.electricityMeter}
                                onChange={e => setFormData({ ...formData, electricityMeter: e.target.value })}
                              />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small text-muted">Water Meter</label>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Water submeter #"
                                value={formData.waterMeter}
                                onChange={e => setFormData({ ...formData, waterMeter: e.target.value })}
                              />
                            </div>
                            <div className="col-md-4">
                              <label className="form-label small text-muted">Gas Pipeline Meter</label>
                              <input
                                type="text"
                                className="form-control form-control-sm"
                                placeholder="Piped gas meter #"
                                value={formData.gasMeter}
                                onChange={e => setFormData({ ...formData, gasMeter: e.target.value })}
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}

                    {currentPropType === 'COWORKING' && (
                      <div className="col-12 mt-2">
                        <h6 className="fw-bold small border-bottom pb-2">Space Amenities & Access Features</h6>
                        <div className="row g-2">
                          <div className="col-6 col-md-4">
                            <div className="form-check form-switch small">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={formData.internetAvailability}
                                onChange={e => setFormData({ ...formData, internetAvailability: e.target.checked })}
                              />
                              <label className="form-check-label">High-Speed WiFi</label>
                            </div>
                          </div>
                          <div className="col-6 col-md-4">
                            <div className="form-check form-switch small">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={formData.powerBackupAvailable}
                                onChange={e => setFormData({ ...formData, powerBackupAvailable: e.target.checked })}
                              />
                              <label className="form-check-label">24/7 Power Backup</label>
                            </div>
                          </div>
                          <div className="col-6 col-md-4">
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
                          <div className="col-6 col-md-4">
                            <div className="form-check form-switch small">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={formData.printingAccess}
                                onChange={e => setFormData({ ...formData, printingAccess: e.target.checked })}
                              />
                              <label className="form-check-label">Printing / Scanning</label>
                            </div>
                          </div>
                          <div className="col-6 col-md-4">
                            <div className="form-check form-switch small">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={formData.lockerAvailable}
                                onChange={e => setFormData({ ...formData, lockerAvailable: e.target.checked })}
                              />
                              <label className="form-check-label">Storage Locker</label>
                            </div>
                          </div>
                          <div className="col-6 col-md-4">
                            <div className="form-check form-switch small">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                checked={formData.parkingAvailable}
                                onChange={e => setFormData({ ...formData, parkingAvailable: e.target.checked })}
                              />
                              <label className="form-check-label">Dedicated Parking</label>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: OCCUPANT & TENANT PROFILE */}
                {activeModalTab === 'occupant' && (
                  <div>
                    {currentPropType === 'RESIDENTIAL' ? (
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Ownership Type</label>
                          <select
                            className="form-select form-select-sm"
                            value={formData.ownershipType}
                            onChange={e => setFormData({ ...formData, ownershipType: e.target.value })}
                          >
                            <option value="OWNER_OCCUPIED">Owner Occupied</option>
                            <option value="RENTED">Tenant Occupied / Rented</option>
                            <option value="LEASED">Leased Out</option>
                            <option value="BUILDER">Builder / Developer Owned</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Family Members Count</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            value={formData.familyMembersCount}
                            onChange={e => setFormData({ ...formData, familyMembersCount: Number(e.target.value) })}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Owner Full Name</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Primary property owner"
                            value={formData.ownerName}
                            onChange={e => setFormData({ ...formData, ownerName: e.target.value })}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Current Resident Name</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Person residing currently"
                            value={formData.residentName}
                            onChange={e => setFormData({ ...formData, residentName: e.target.value })}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Move-In Date</label>
                          <input
                            type="date"
                            className="form-control form-control-sm"
                            value={formData.moveInDate}
                            onChange={e => setFormData({ ...formData, moveInDate: e.target.value })}
                          />
                        </div>
                      </div>
                    ) : currentPropType === 'COMMERCIAL' ? (
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Tenant Company Name</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="e.g. Acme Corp LLP"
                            value={formData.tenantCompany}
                            onChange={e => setFormData({ ...formData, tenantCompany: e.target.value })}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Contact Person</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Authorized signatory"
                            value={formData.tenantContactPerson}
                            onChange={e => setFormData({ ...formData, tenantContactPerson: e.target.value })}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Tenant Email</label>
                          <input
                            type="email"
                            className="form-control form-control-sm"
                            placeholder="leases@company.com"
                            value={formData.tenantEmail}
                            onChange={e => setFormData({ ...formData, tenantEmail: e.target.value })}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Tenant Phone</label>
                          <input
                            type="tel"
                            className="form-control form-control-sm"
                            placeholder="+91 9876543210"
                            value={formData.tenantPhone}
                            onChange={e => setFormData({ ...formData, tenantPhone: e.target.value })}
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
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Lease Start Date</label>
                          <input
                            type="date"
                            className="form-control form-control-sm"
                            value={formData.leaseStartDate}
                            onChange={e => setFormData({ ...formData, leaseStartDate: e.target.value })}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Lease End Date</label>
                          <input
                            type="date"
                            className="form-control form-control-sm"
                            value={formData.leaseEndDate}
                            onChange={e => setFormData({ ...formData, leaseEndDate: e.target.value })}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="row g-3">
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Assigned Company / Team</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="e.g. Zeta Labs"
                            value={formData.assignedCompanyName}
                            onChange={e => setFormData({ ...formData, assignedCompanyName: e.target.value })}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Assigned Member Name</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="Primary coworker"
                            value={formData.assignedMemberName}
                            onChange={e => setFormData({ ...formData, assignedMemberName: e.target.value })}
                          />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Membership Plan</label>
                          <select
                            className="form-select form-select-sm"
                            value={formData.membershipPlan}
                            onChange={e => setFormData({ ...formData, membershipPlan: e.target.value })}
                          >
                            <option value="DAILY_PASS">Day Pass</option>
                            <option value="MONTHLY_HOT_DESK">Monthly Flex Desk</option>
                            <option value="MONTHLY_DEDICATED">Monthly Dedicated Desk</option>
                            <option value="PRIVATE_OFFICE">Private Office Cabin</option>
                            <option value="ENTERPRISE">Enterprise Custom</option>
                          </select>
                        </div>
                        <div className="col-md-6">
                          <label className="form-label small fw-semibold">Access Timings</label>
                          <input
                            type="text"
                            className="form-control form-control-sm"
                            placeholder="e.g. 24/7 or 9am - 8pm"
                            value={formData.accessTiming}
                            onChange={e => setFormData({ ...formData, accessTiming: e.target.value })}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 4: PRICING & INVENTORY STATUS */}
                {activeModalTab === 'rates' && (
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Occupancy Status *</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.occupancyStatus}
                        onChange={e => setFormData({ ...formData, occupancyStatus: e.target.value })}
                      >
                        <option value="VACANT">Vacant / Available</option>
                        <option value="OCCUPIED">Occupied</option>
                        <option value="RESERVED">Reserved</option>
                        <option value="MAINTENANCE">Under Maintenance</option>
                      </select>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label small fw-semibold">Inventory Status</label>
                      <select
                        className="form-select form-select-sm"
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value })}
                      >
                        <option value="AVAILABLE">Available</option>
                        <option value="OCCUPIED">Occupied</option>
                        <option value="RENTED">Rented</option>
                        <option value="SOLD">Sold</option>
                        <option value="UNDER_MAINTENANCE">Under Maintenance</option>
                        <option value="BLOCKED">Blocked</option>
                      </select>
                    </div>

                    {currentPropType === 'RESIDENTIAL' ? (
                      <div className="col-md-6">
                        <label className="form-label small fw-semibold">Monthly Maintenance Fee (₹)</label>
                        <input
                          type="number"
                          className="form-control form-control-sm"
                          placeholder="e.g. 3500"
                          value={formData.monthlyMaintenanceAmount}
                          onChange={e => setFormData({ ...formData, monthlyMaintenanceAmount: e.target.value })}
                        />
                      </div>
                    ) : currentPropType === 'COMMERCIAL' ? (
                      <>
                        <div className="col-md-4">
                          <label className="form-label small fw-semibold">Monthly Rent (₹)</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder="e.g. 85000"
                            value={formData.monthlyRent}
                            onChange={e => setFormData({ ...formData, monthlyRent: e.target.value })}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label small fw-semibold">CAM Charges / sq.ft (₹)</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder="e.g. 15"
                            value={formData.camCharges}
                            onChange={e => setFormData({ ...formData, camCharges: e.target.value })}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label small fw-semibold">Security Deposit (₹)</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder="e.g. 500000"
                            value={formData.securityDeposit}
                            onChange={e => setFormData({ ...formData, securityDeposit: e.target.value })}
                          />
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="col-md-4">
                          <label className="form-label small fw-semibold">Monthly Rate (₹)</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder="e.g. 8000"
                            value={formData.monthlyPrice}
                            onChange={e => setFormData({ ...formData, monthlyPrice: e.target.value })}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label small fw-semibold">Daily Rate (₹)</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder="e.g. 500"
                            value={formData.dailyPrice}
                            onChange={e => setFormData({ ...formData, dailyPrice: e.target.value })}
                          />
                        </div>
                        <div className="col-md-4">
                          <label className="form-label small fw-semibold">Hourly Rate (₹)</label>
                          <input
                            type="number"
                            className="form-control form-control-sm"
                            placeholder="e.g. 100"
                            value={formData.hourlyPrice}
                            onChange={e => setFormData({ ...formData, hourlyPrice: e.target.value })}
                          />
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>

              <div className="modal-footer border-top bg-light flex-shrink-0">
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
                  className="btn btn-primary btn-sm px-4 d-flex align-items-center gap-2"
                  disabled={submitting}
                >
                  {submitting && <span className="spinner-border spinner-border-sm" role="status"></span>}
                  {modalMode === 'create' ? `Save & Register ${unitLabel}` : 'Update Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
