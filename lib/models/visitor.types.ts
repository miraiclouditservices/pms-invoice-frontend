export type PropertyType = 'RESIDENTIAL' | 'COMMERCIAL' | 'COWORKING';

export type VisitorType =
  // Residential
  | 'GUEST' | 'FAMILY_VISITOR' | 'DELIVERY' | 'DOMESTIC_HELP' | 'CAB_DRIVER' | 'SERVICE_TECHNICIAN' | 'VENDOR' | 'EMERGENCY_VISITOR' | 'EVENT_VISITOR' | 'TEMPORARY_RESIDENT'
  // Commercial
  | 'CLIENT' | 'BUSINESS_GUEST' | 'INTERVIEW_CANDIDATE' | 'COURIER' | 'SERVICE_ENGINEER' | 'CONTRACTOR' | 'EMPLOYEE_GUEST' | 'MEETING_VISITOR'
  // Coworking
  | 'MEETING_GUEST' | 'EVENT_GUEST' | 'SERVICE_PROVIDER' | 'TRAINING_PARTICIPANT' | 'TEMPORARY_MEMBER' | 'COMPANY_GUEST';

export type VisitorStatus =
  | 'EXPECTED'
  | 'CHECKED_IN'
  | 'CHECKED_OUT'
  | 'CANCELLED'
  | 'DENIED'
  | 'OVERSTAY';

export type GatePassType =
  | 'ONE_TIME'
  | 'RECURRING'
  | 'DAILY'
  | 'EMPLOYEE_GUEST'
  | 'DELIVERY'
  | 'VENDOR'
  | 'EVENT'
  | 'EMERGENCY';

export type GatePassStatus =
  | 'GENERATED'
  | 'ACTIVE'
  | 'USED'
  | 'EXPIRED'
  | 'REVOKED'
  | 'COMPLETED';

export type VehicleType =
  | 'TWO_WHEELER'
  | 'CAR'
  | 'TAXI'
  | 'COMMERCIAL_VEHICLE'
  | 'BICYCLE'
  | 'OTHER'
  | 'NONE';

export type DeliveryType =
  | 'FOOD_DELIVERY'
  | 'COURIER'
  | 'ECOMMERCE'
  | 'GROCERY'
  | 'MEDICINE'
  | 'DOCUMENTS'
  | 'MAINTENANCE_MATERIAL'
  | 'OTHER';

export type DeliveryStatus =
  | 'EXPECTED'
  | 'ARRIVED'
  | 'HOST_CONTACTED'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'HANDED_OVER'
  | 'COLLECTED'
  | 'EXITED'
  | 'CANCELLED';

export interface Visitor {
  _id: string;
  id?: string;
  passCode: string;
  visitorNumber?: string;
  organisationId: string;
  propertyId: any;
  propertyType: PropertyType;
  propertyName?: string;
  buildingId?: any;
  buildingName?: string;
  floorId?: any;
  floorName?: string;
  unitId?: any;
  unitNumber?: string;
  visitorType: VisitorType;
  visitorName: string;
  mobile: string;
  email?: string;
  visitorPhoto?: string;
  purpose: string;
  numberOfVisitors: number;
  accompanyingVisitors?: string[];
  hostType: 'RESIDENT' | 'TENANT_EMPLOYEE' | 'TENANT_ADMIN' | 'COWORKING_MEMBER' | 'OFFICE_ADMIN' | 'SECURITY';
  hostUserId?: any;
  hostName: string;
  hostMobile?: string;
  companyName?: string;
  expectedDate: string;
  expectedTime: string;
  expectedExitTime?: string;
  actualArrivalTime?: string;
  vehicleType?: VehicleType;
  vehicleNumber?: string;
  parkingRequired: boolean;
  parkingSlot?: string;
  driverName?: string;
  idProofType?: 'AADHAAR' | 'DRIVING_LICENSE' | 'PASSPORT' | 'EMPLOYEE_ID' | 'VOTER_ID' | 'OTHER';
  idProofNumber?: string;
  hostApprovalStatus: 'PENDING' | 'APPROVED' | 'REJECTED' | 'AUTO_APPROVED' | 'NOT_REQUIRED';
  approvalBy?: string;
  approvalAt?: string;
  rejectionReason?: string;
  gatePassType: GatePassType;
  gatePassStatus: GatePassStatus;
  qrCodeUrl?: string;
  allowedGates?: string[];
  allowedAreas?: string[];
  checkInGate?: string;
  checkOutGate?: string;
  checkInTime?: string;
  checkOutTime?: string;
  visitDuration?: string;
  isOverstay?: boolean;
  overstayDuration?: string;
  securityRemarks?: string;
  denialReason?: string;
  status: VisitorStatus;
  createdAt: string;
  updatedAt?: string;
}

export interface Delivery {
  _id: string;
  deliveryNumber: string;
  deliveryPersonName: string;
  mobile: string;
  deliveryCompany: string;
  deliveryType: DeliveryType;
  hostName: string;
  unitNumber: string;
  buildingName?: string;
  vehicleNumber?: string;
  packageCount: number;
  packageDescription?: string;
  otpCode: string;
  isOtpVerified: boolean;
  recipientConfirmation: boolean;
  deliveryStatus: DeliveryStatus;
  entryGate: string;
  entryTime: string;
  exitTime?: string;
  securityRemarks?: string;
}

export interface VisitorAnalyticsSummary {
  expectedToday: number;
  currentlyInside: number;
  checkedOutToday: number;
  pendingApprovals: number;
  deniedEntries: number;
  overstayCount: number;
  vehicleVisitors: number;
  deliveriesCount: number;
  emergencyCount: number;
  totalPasses: number;
}
