export type UserRole = 'citizen' | 'partner' | 'recycler' | 'organization' | 'admin';

export type PickupStatus = 
  | 'requested' 
  | 'assigned' 
  | 'scheduled' 
  | 'collected' 
  | 'verified' 
  | 'batch_assigned' 
  | 'recycled' 
  | 'cancelled';

export type AssignmentStatus = 'assigned' | 'accepted' | 'rejected' | 'in_progress' | 'completed';

export type ApprovalStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type BatchStatus = 'dispatched' | 'received' | 'in_processing' | 'completed' | 'verified';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: UserRole;
  avatarUrl?: string;
  rewardPoints: number;
  isVerified: boolean;
  createdAt: string;
  organizationName?: string;
}

export interface EWasteCategory {
  id: string;
  name: string;
  code: string;
  description: string;
  hazardousComponents: string[];
  recoverableMaterials: string[];
  pointsPerKg: number;
  co2FactorPerKg: number; // kg CO2 avoided per kg recycled
  iconName: string;
}

export interface PickupRequest {
  id: string;
  requestNumber: string;
  userId: string;
  userFullName: string;
  userEmail: string;
  userPhone: string;
  organizationId?: string;
  organizationName?: string;
  categoryId: string;
  categoryName: string;
  itemDescription: string;
  estimatedQuantity: number;
  estimatedWeightKg: number;
  pickupAddress: string;
  pickupCity: string;
  preferredDate: string;
  timeSlot: string;
  specialNotes?: string;
  status: PickupStatus;
  createdAt: string;
  updatedAt: string;
  // Related workflow data
  assignment?: PickupAssignment;
  collectionRecord?: CollectionRecord;
  weightVerification?: WeightVerification;
}

export interface PickupAssignment {
  id: string;
  requestId: string;
  partnerId: string;
  partnerCompanyName: string;
  assignedByAdminId: string;
  status: AssignmentStatus;
  rejectionReason?: string;
  scheduledAt?: string;
  vehicleRegistration?: string;
  assignedAgentName?: string;
  assignedAt: string;
}

export interface CollectionRecord {
  id: string;
  requestId: string;
  collectorId: string;
  collectorName: string;
  actualWeightKg: number;
  itemCount: number;
  weighingSlipUrl?: string;
  sealTagNumber: string;
  gpsCoordinates?: string;
  collectedAt: string;
  status: 'submitted' | 'verified' | 'disputed';
  notes?: string;
}

export interface WeightVerification {
  id: string;
  collectionRecordId: string;
  adminId: string;
  adminName: string;
  verifiedWeightKg: number;
  varianceKg: number;
  notes?: string;
  status: 'approved' | 'adjusted' | 'rejected';
  verifiedAt: string;
}

export interface EWasteBatch {
  id: string;
  batchNumber: string;
  recyclerId: string;
  recyclerFacilityName: string;
  createdById: string;
  pickupRequestIds: string[];
  totalWeightKg: number;
  itemCount: number;
  manifestNumber: string;
  status: BatchStatus;
  dispatchedAt: string;
  receivedAt?: string;
  completedAt?: string;
  recyclingRecord?: RecyclingRecord;
}

export interface RecyclingRecord {
  id: string;
  batchId: string;
  batchNumber: string;
  recyclerId: string;
  facilityName: string;
  receivedWeightKg: number;
  copperRecoveredKg: number;
  aluminumRecoveredKg: number;
  plasticsRecoveredKg: number;
  preciousMetalsGrams: number;
  glassRecoveredKg: number;
  hazardousResidueKg: number;
  processingMethod: string;
  certificateNumber: string;
  adminVerified: boolean;
  submittedAt: string;
  verifiedAt?: string;
}

export interface EprLedgerEntry {
  id: string;
  ledgerReference: string;
  batchId: string;
  batchNumber: string;
  recyclingRecordId: string;
  organizationId?: string;
  organizationName?: string;
  categoryId: string;
  categoryName: string;
  verifiedWeightKg: number;
  creditAmount: number; // EPR credits (1 credit per kg verified)
  creditType: 'collection' | 'recycling' | 'carbon_offset';
  status: 'verified' | 'retired' | 'pending_audit';
  verifierName: string;
  transactionHash: string;
  notes?: string;
  recordedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'action_required';
  link?: string;
  isRead: boolean;
  createdAt: string;
}

export interface RewardItem {
  id: string;
  title: string;
  description: string;
  category: 'donation' | 'voucher' | 'discount' | 'swag';
  pointsRequired: number;
  sponsorName: string;
  voucherCodeSample: string;
  icon: string;
  isActive: boolean;
}

export interface RewardRedemption {
  id: string;
  userId: string;
  rewardId: string;
  rewardTitle: string;
  pointsSpent: number;
  claimCode: string;
  status: 'issued' | 'redeemed';
  redeemedAt: string;
}

export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityName: string;
  entityId: string;
  details: string;
  timestamp: string;
}

export interface PartnerDetail {
  id: string;
  profileId: string;
  companyName: string;
  licenseNumber: string;
  fleetSize: number;
  serviceZones: string[];
  approvalStatus: ApprovalStatus;
  weighingScaleCalibratedAt: string;
  createdAt: string;
}

export interface RecyclerDetail {
  id: string;
  profileId: string;
  facilityName: string;
  pollutionControlBoardReg: string;
  facilityAddress: string;
  processingCapacityMtMonth: number;
  certifiedTechnologies: string[];
  approvalStatus: ApprovalStatus;
  createdAt: string;
}
