import { 
  UserProfile, 
  UserRole, 
  PickupRequest, 
  EWasteBatch, 
  EprLedgerEntry, 
  RewardItem, 
  RewardRedemption,
  AuditLog, 
  NotificationItem,
  RecyclingRecord,
  WeightVerification,
  CollectionRecord,
  PickupAssignment
} from '../types';
import { 
  INITIAL_USERS, 
  INITIAL_CATEGORIES, 
  INITIAL_PICKUPS, 
  INITIAL_BATCHES, 
  INITIAL_EPR_LEDGER, 
  INITIAL_REWARDS, 
  INITIAL_AUDIT_LOGS,
  INITIAL_PARTNER_DETAILS,
  INITIAL_RECYCLER_DETAILS
} from './seedData';

const STORAGE_KEY = 'ecotrack_state_v1';
const CURRENT_USER_KEY = 'ecotrack_current_user_id';

export interface AppState {
  users: UserProfile[];
  currentUserId: string;
  pickups: PickupRequest[];
  batches: EWasteBatch[];
  eprLedger: EprLedgerEntry[];
  rewards: RewardItem[];
  redemptions: RewardRedemption[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
}

function loadInitialState(): AppState {
  if (typeof window !== 'undefined') {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (parsed.users && parsed.pickups) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Failed to parse stored state, resetting to initial seed.', e);
    }
  }

  return {
    users: INITIAL_USERS,
    currentUserId: 'user-citizen', // default to Citizen for public/initial view
    pickups: INITIAL_PICKUPS,
    batches: INITIAL_BATCHES,
    eprLedger: INITIAL_EPR_LEDGER,
    rewards: INITIAL_REWARDS,
    redemptions: [
      {
        id: 'red-001',
        userId: 'user-citizen',
        rewardId: 'rew-01',
        rewardTitle: 'Plant 5 Native Agro-Forestry Trees',
        pointsSpent: 200,
        claimCode: 'TREE-ECO-5X-CERT',
        status: 'redeemed',
        redeemedAt: '2026-09-12T14:30:00Z'
      }
    ],
    notifications: [
      {
        id: 'notif-001',
        userId: 'user-citizen',
        title: 'Collection Completed & Weighed',
        message: 'Your telecom e-waste was collected and weighed at 13.2 kg. Weight verification in progress.',
        type: 'info',
        isRead: false,
        createdAt: '2026-10-25T14:40:00Z'
      },
      {
        id: 'notif-002',
        userId: 'user-partner',
        title: 'New Pickup Assigned',
        message: 'Admin assigned pickup REQ-2026-0887 (35.0 kg Power Storage) to your fleet.',
        type: 'action_required',
        isRead: false,
        createdAt: '2026-10-30T08:15:00Z'
      },
      {
        id: 'notif-003',
        userId: 'user-admin',
        title: 'Weight Verification Required',
        message: 'Collector submitted actual weight 13.2 kg for REQ-2026-0850. Pending Admin sign-off.',
        type: 'action_required',
        isRead: false,
        createdAt: '2026-10-25T14:36:00Z'
      }
    ],
    auditLogs: INITIAL_AUDIT_LOGS
  };
}

let currentState: AppState = loadInitialState();
const listeners = new Set<(state: AppState) => void>();

function notify() {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(currentState));
    } catch (e) {
      console.error('Failed to persist state', e);
    }
  }
  listeners.forEach(fn => fn(currentState));
}

export const store = {
  getState(): AppState {
    return currentState;
  },

  subscribe(listener: (state: AppState) => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getCurrentUser(): UserProfile {
    return currentState.users.find(u => u.id === currentState.currentUserId) || currentState.users[0];
  },

  setCurrentUser(userId: string) {
    const user = currentState.users.find(u => u.id === userId);
    if (user) {
      currentState = {
        ...currentState,
        currentUserId: userId
      };
      notify();
    }
  },

  switchRole(role: UserRole) {
    const matchingUser = currentState.users.find(u => u.role === role);
    if (matchingUser) {
      this.setCurrentUser(matchingUser.id);
    }
  },

  login(email: string, role?: UserRole): UserProfile {
    let user = currentState.users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      user = {
        id: `user-${Date.now()}`,
        email,
        fullName: email.split('@')[0].toUpperCase(),
        role: role || 'citizen',
        rewardPoints: 100,
        isVerified: true,
        createdAt: new Date().toISOString()
      };
      currentState = {
        ...currentState,
        users: [...currentState.users, user],
        currentUserId: user.id
      };
    } else {
      currentState = {
        ...currentState,
        currentUserId: user.id
      };
    }
    notify();
    return user;
  },

  register(params: {
    fullName: string;
    email: string;
    role: UserRole;
    phone?: string;
    organizationName?: string;
  }): UserProfile {
    const newUser: UserProfile = {
      id: `user-${Date.now()}`,
      email: params.email,
      fullName: params.fullName,
      phone: params.phone,
      role: params.role,
      organizationName: params.organizationName,
      rewardPoints: params.role === 'citizen' ? 50 : 0, // 50 welcome points
      isVerified: true,
      createdAt: new Date().toISOString()
    };

    currentState = {
      ...currentState,
      users: [...currentState.users, newUser],
      currentUserId: newUser.id,
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          actorId: newUser.id,
          actorName: newUser.fullName,
          actorRole: newUser.role,
          action: 'USER_REGISTERED',
          entityName: 'profiles',
          entityId: newUser.id,
          details: `Registered as ${newUser.role.toUpperCase()}`,
          timestamp: new Date().toISOString()
        },
        ...currentState.auditLogs
      ]
    };
    notify();
    return newUser;
  },

  createPickupRequest(params: {
    categoryId: string;
    itemDescription: string;
    estimatedQuantity: number;
    estimatedWeightKg: number;
    pickupAddress: string;
    pickupCity: string;
    preferredDate: string;
    timeSlot: string;
    specialNotes?: string;
  }): PickupRequest {
    const user = this.getCurrentUser();
    const category = INITIAL_CATEGORIES.find(c => c.id === params.categoryId) || INITIAL_CATEGORIES[0];
    const newRequestNumber = `REQ-2026-0${Math.floor(890 + Math.random() * 900)}`;

    const newRequest: PickupRequest = {
      id: `req-${Date.now()}`,
      requestNumber: newRequestNumber,
      userId: user.id,
      userFullName: user.fullName,
      userEmail: user.email,
      userPhone: user.phone || '+1 (555) 000-0000',
      organizationId: user.role === 'organization' ? 'org-01' : undefined,
      organizationName: user.organizationName,
      categoryId: category.id,
      categoryName: category.name,
      itemDescription: params.itemDescription,
      estimatedQuantity: params.estimatedQuantity,
      estimatedWeightKg: params.estimatedWeightKg,
      pickupAddress: params.pickupAddress,
      pickupCity: params.pickupCity,
      preferredDate: params.preferredDate,
      timeSlot: params.timeSlot,
      specialNotes: params.specialNotes,
      status: 'requested',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Add notification for admins
    const adminNotification: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: 'user-admin',
      title: 'New Pickup Request Submitted',
      message: `${user.fullName} requested pickup of ${params.estimatedWeightKg}kg ${category.name} (#${newRequestNumber}).`,
      type: 'action_required',
      isRead: false,
      createdAt: new Date().toISOString()
    };

    currentState = {
      ...currentState,
      pickups: [newRequest, ...currentState.pickups],
      notifications: [adminNotification, ...currentState.notifications],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          actorId: user.id,
          actorName: user.fullName,
          actorRole: user.role,
          action: 'PICKUP_REQUEST_CREATED',
          entityName: 'pickup_requests',
          entityId: newRequest.id,
          details: `Created pickup ${newRequestNumber} (${params.estimatedWeightKg} kg, ${category.name})`,
          timestamp: new Date().toISOString()
        },
        ...currentState.auditLogs
      ]
    };

    notify();
    return newRequest;
  },

  assignPartnerToPickup(requestId: string, partnerId: string) {
    const admin = this.getCurrentUser();
    const partner = currentState.users.find(u => u.id === partnerId);
    if (!partner) return;

    const partnerName = partner.organizationName || partner.fullName;

    const updatedPickups = currentState.pickups.map(p => {
      if (p.id !== requestId) return p;

      const assignment: PickupAssignment = {
        id: `asg-${Date.now()}`,
        requestId: p.id,
        partnerId: partner.id,
        partnerCompanyName: partnerName,
        assignedByAdminId: admin.id,
        status: 'assigned',
        assignedAt: new Date().toISOString()
      };

      return {
        ...p,
        status: 'assigned' as const,
        updatedAt: new Date().toISOString(),
        assignment
      };
    });

    const partnerNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: partner.id,
      title: 'New Pickup Assigned',
      message: `Pickup has been assigned to your fleet for scheduling and dispatch.`,
      type: 'action_required',
      isRead: false,
      createdAt: new Date().toISOString()
    };

    currentState = {
      ...currentState,
      pickups: updatedPickups,
      notifications: [partnerNotif, ...currentState.notifications],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          actorId: admin.id,
          actorName: admin.fullName,
          actorRole: admin.role,
          action: 'PARTNER_ASSIGNED',
          entityName: 'pickup_assignments',
          entityId: requestId,
          details: `Assigned pickup ${requestId} to partner ${partnerName}`,
          timestamp: new Date().toISOString()
        },
        ...currentState.auditLogs
      ]
    };
    notify();
  },

  respondToAssignment(requestId: string, accepted: boolean, rejectionReason?: string) {
    const partner = this.getCurrentUser();
    const updatedPickups = currentState.pickups.map(p => {
      if (p.id !== requestId) return p;
      if (!p.assignment) return p;

      if (!accepted) {
        return {
          ...p,
          status: 'requested' as const,
          assignment: {
            ...p.assignment,
            status: 'rejected' as const,
            rejectionReason: rejectionReason || 'Fleet capacity exceeded in service zone'
          }
        };
      } else {
        return {
          ...p,
          assignment: {
            ...p.assignment,
            status: 'accepted' as const
          }
        };
      }
    });

    currentState = {
      ...currentState,
      pickups: updatedPickups,
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          actorId: partner.id,
          actorName: partner.fullName,
          actorRole: partner.role,
          action: accepted ? 'ASSIGNMENT_ACCEPTED' : 'ASSIGNMENT_REJECTED',
          entityName: 'pickup_assignments',
          entityId: requestId,
          details: accepted ? 'Partner accepted collection route' : `Partner rejected: ${rejectionReason}`,
          timestamp: new Date().toISOString()
        },
        ...currentState.auditLogs
      ]
    };
    notify();
  },

  schedulePickup(requestId: string, scheduledAt: string, agentName: string, vehicleReg: string) {
    const partner = this.getCurrentUser();
    const updatedPickups = currentState.pickups.map(p => {
      if (p.id !== requestId) return p;
      if (!p.assignment) return p;

      return {
        ...p,
        status: 'scheduled' as const,
        updatedAt: new Date().toISOString(),
        assignment: {
          ...p.assignment,
          status: 'accepted' as const,
          scheduledAt,
          assignedAgentName: agentName,
          vehicleRegistration: vehicleReg
        }
      };
    });

    const targetPickup = currentState.pickups.find(p => p.id === requestId);
    const notifications: NotificationItem[] = [];

    if (targetPickup) {
      notifications.push({
        id: `notif-${Date.now()}`,
        userId: targetPickup.userId,
        title: 'Pickup Confirmed & Scheduled',
        message: `Your e-waste pickup is scheduled for ${new Date(scheduledAt).toLocaleString()} by ${agentName} (${vehicleReg}).`,
        type: 'info',
        isRead: false,
        createdAt: new Date().toISOString()
      });
    }

    currentState = {
      ...currentState,
      pickups: updatedPickups,
      notifications: [...notifications, ...currentState.notifications],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          actorId: partner.id,
          actorName: partner.fullName,
          actorRole: partner.role,
          action: 'PICKUP_SCHEDULED',
          entityName: 'pickup_assignments',
          entityId: requestId,
          details: `Scheduled for ${scheduledAt} by agent ${agentName} (${vehicleReg})`,
          timestamp: new Date().toISOString()
        },
        ...currentState.auditLogs
      ]
    };
    notify();
  },

  submitCollectionRecord(params: {
    requestId: string;
    actualWeightKg: number;
    itemCount: number;
    sealTagNumber: string;
    notes?: string;
  }) {
    const partner = this.getCurrentUser();
    const updatedPickups = currentState.pickups.map(p => {
      if (p.id !== params.requestId) return p;

      const record: CollectionRecord = {
        id: `col-${Date.now()}`,
        requestId: p.id,
        collectorId: partner.id,
        collectorName: partner.fullName,
        actualWeightKg: params.actualWeightKg,
        itemCount: params.itemCount,
        sealTagNumber: params.sealTagNumber,
        notes: params.notes,
        collectedAt: new Date().toISOString(),
        status: 'submitted',
        gpsCoordinates: '40.7128° N, 74.0060° W'
      };

      return {
        ...p,
        status: 'collected' as const,
        updatedAt: new Date().toISOString(),
        collectionRecord: record
      };
    });

    const adminNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: 'user-admin',
      title: 'Weight Verification Ready',
      message: `Partner recorded ${params.actualWeightKg} kg collected for ${params.requestId}. Please review and verify.`,
      type: 'action_required',
      isRead: false,
      createdAt: new Date().toISOString()
    };

    currentState = {
      ...currentState,
      pickups: updatedPickups,
      notifications: [adminNotif, ...currentState.notifications],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          actorId: partner.id,
          actorName: partner.fullName,
          actorRole: partner.role,
          action: 'COLLECTION_RECORD_SUBMITTED',
          entityName: 'collection_records',
          entityId: params.requestId,
          details: `Recorded actual weight: ${params.actualWeightKg} kg, ${params.itemCount} items, Seal: ${params.sealTagNumber}`,
          timestamp: new Date().toISOString()
        },
        ...currentState.auditLogs
      ]
    };
    notify();
  },

  verifyWeight(params: {
    requestId: string;
    verifiedWeightKg: number;
    notes?: string;
  }) {
    const admin = this.getCurrentUser();
    let citizenUserId = '';
    let categoryPointsPerKg = 10;
    let earnedPoints = 0;

    const updatedPickups = currentState.pickups.map(p => {
      if (p.id !== params.requestId) return p;
      citizenUserId = p.userId;
      const cat = INITIAL_CATEGORIES.find(c => c.id === p.categoryId);
      if (cat) categoryPointsPerKg = cat.pointsPerKg;

      const actual = p.collectionRecord ? p.collectionRecord.actualWeightKg : p.estimatedWeightKg;
      const variance = Number((params.verifiedWeightKg - actual).toFixed(2));

      earnedPoints = Math.round(params.verifiedWeightKg * categoryPointsPerKg);

      const verification: WeightVerification = {
        id: `ver-${Date.now()}`,
        collectionRecordId: p.collectionRecord?.id || `col-${p.id}`,
        adminId: admin.id,
        adminName: admin.fullName,
        verifiedWeightKg: params.verifiedWeightKg,
        varianceKg: variance,
        notes: params.notes || 'Verified against digital weighing slip and certified scale calibration certificate.',
        status: variance === 0 ? 'approved' : 'adjusted',
        verifiedAt: new Date().toISOString()
      };

      return {
        ...p,
        status: 'verified' as const,
        updatedAt: new Date().toISOString(),
        weightVerification: verification,
        collectionRecord: p.collectionRecord ? {
          ...p.collectionRecord,
          status: 'verified' as const
        } : undefined
      };
    });

    // Update user's reward points
    const updatedUsers = currentState.users.map(u => {
      if (u.id === citizenUserId) {
        return {
          ...u,
          rewardPoints: u.rewardPoints + earnedPoints
        };
      }
      return u;
    });

    // Notify citizen of verified weight & earned points
    const citizenNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: citizenUserId,
      title: 'Weight Verified & Points Credited!',
      message: `Your e-waste was verified at ${params.verifiedWeightKg} kg. You earned +${earnedPoints} Eco-Points!`,
      type: 'success',
      isRead: false,
      createdAt: new Date().toISOString()
    };

    currentState = {
      ...currentState,
      pickups: updatedPickups,
      users: updatedUsers,
      notifications: [citizenNotif, ...currentState.notifications],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          actorId: admin.id,
          actorName: admin.fullName,
          actorRole: admin.role,
          action: 'WEIGHT_VERIFIED',
          entityName: 'weight_verifications',
          entityId: params.requestId,
          details: `Verified ${params.verifiedWeightKg} kg. Awarded ${earnedPoints} points to citizen.`,
          timestamp: new Date().toISOString()
        },
        ...currentState.auditLogs
      ]
    };
    notify();
  },

  createRecyclingBatch(params: {
    recyclerId: string;
    requestIds: string[];
    manifestNumber: string;
  }): EWasteBatch {
    const admin = this.getCurrentUser();
    const recycler = currentState.users.find(u => u.id === params.recyclerId);
    const facilityName = recycler?.organizationName || recycler?.fullName || 'Certified Recycler';

    // Calculate total weight and item count from verified requests
    let totalWeight = 0;
    let totalItems = 0;

    const updatedPickups = currentState.pickups.map(p => {
      if (params.requestIds.includes(p.id)) {
        const weight = p.weightVerification?.verifiedWeightKg || p.collectionRecord?.actualWeightKg || p.estimatedWeightKg;
        totalWeight += weight;
        totalItems += p.collectionRecord?.itemCount || p.estimatedQuantity;
        return {
          ...p,
          status: 'batch_assigned' as const,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    const newBatchNumber = `BATCH-2026-00${44 + currentState.batches.length}`;
    const newBatch: EWasteBatch = {
      id: `batch-${Date.now()}`,
      batchNumber: newBatchNumber,
      recyclerId: params.recyclerId,
      recyclerFacilityName: facilityName,
      createdById: admin.id,
      pickupRequestIds: params.requestIds,
      totalWeightKg: Number(totalWeight.toFixed(2)),
      itemCount: totalItems,
      manifestNumber: params.manifestNumber || `MNF-CPCB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'dispatched',
      dispatchedAt: new Date().toISOString()
    };

    const recyclerNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: params.recyclerId,
      title: 'Inbound Batch Dispatched',
      message: `Batch ${newBatchNumber} (${totalWeight.toFixed(1)} kg) has been dispatched to your facility. Manifest: ${newBatch.manifestNumber}.`,
      type: 'action_required',
      isRead: false,
      createdAt: new Date().toISOString()
    };

    currentState = {
      ...currentState,
      pickups: updatedPickups,
      batches: [newBatch, ...currentState.batches],
      notifications: [recyclerNotif, ...currentState.notifications],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          actorId: admin.id,
          actorName: admin.fullName,
          actorRole: admin.role,
          action: 'BATCH_DISPATCHED',
          entityName: 'ewaste_batches',
          entityId: newBatch.id,
          details: `Created batch ${newBatchNumber} (${totalWeight.toFixed(1)} kg) assigned to ${facilityName}`,
          timestamp: new Date().toISOString()
        },
        ...currentState.auditLogs
      ]
    };
    notify();
    return newBatch;
  },

  confirmBatchReceipt(batchId: string) {
    const recycler = this.getCurrentUser();
    const updatedBatches = currentState.batches.map(b => {
      if (b.id !== batchId) return b;
      return {
        ...b,
        status: 'received' as const,
        receivedAt: new Date().toISOString()
      };
    });

    currentState = {
      ...currentState,
      batches: updatedBatches,
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          actorId: recycler.id,
          actorName: recycler.fullName,
          actorRole: recycler.role,
          action: 'BATCH_RECEIVED',
          entityName: 'ewaste_batches',
          entityId: batchId,
          details: `Facility confirmed physical receipt and intact tamper seals.`,
          timestamp: new Date().toISOString()
        },
        ...currentState.auditLogs
      ]
    };
    notify();
  },

  submitRecyclingRecord(params: {
    batchId: string;
    receivedWeightKg: number;
    copperRecoveredKg: number;
    aluminumRecoveredKg: number;
    plasticsRecoveredKg: number;
    preciousMetalsGrams: number;
    glassRecoveredKg: number;
    hazardousResidueKg: number;
    processingMethod: string;
  }) {
    const recycler = this.getCurrentUser();
    const certNumber = `CERT-REC-2026-00${Math.floor(10 + Math.random() * 90)}`;
    let targetBatchNumber = '';

    const recyclingRecord: RecyclingRecord = {
      id: `rec-rec-${Date.now()}`,
      batchId: params.batchId,
      batchNumber: '',
      recyclerId: recycler.id,
      facilityName: recycler.organizationName || recycler.fullName,
      receivedWeightKg: params.receivedWeightKg,
      copperRecoveredKg: params.copperRecoveredKg,
      aluminumRecoveredKg: params.aluminumRecoveredKg,
      plasticsRecoveredKg: params.plasticsRecoveredKg,
      preciousMetalsGrams: params.preciousMetalsGrams,
      glassRecoveredKg: params.glassRecoveredKg,
      hazardousResidueKg: params.hazardousResidueKg,
      processingMethod: params.processingMethod,
      certificateNumber: certNumber,
      adminVerified: false,
      submittedAt: new Date().toISOString()
    };

    let linkedRequestIds: string[] = [];

    const updatedBatches = currentState.batches.map(b => {
      if (b.id !== params.batchId) return b;
      targetBatchNumber = b.batchNumber;
      recyclingRecord.batchNumber = b.batchNumber;
      linkedRequestIds = b.pickupRequestIds;
      return {
        ...b,
        status: 'completed' as const,
        completedAt: new Date().toISOString(),
        recyclingRecord
      };
    });

    // Update linked pickup requests to 'recycled'
    const updatedPickups = currentState.pickups.map(p => {
      if (linkedRequestIds.includes(p.id)) {
        return {
          ...p,
          status: 'recycled' as const,
          updatedAt: new Date().toISOString()
        };
      }
      return p;
    });

    const adminNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      userId: 'user-admin',
      title: 'Recycling Manifest Ready for Verification',
      message: `${recycler.fullName} submitted completed recovery yield for ${targetBatchNumber}. Verified EPR credits pending.`,
      type: 'action_required',
      isRead: false,
      createdAt: new Date().toISOString()
    };

    currentState = {
      ...currentState,
      batches: updatedBatches,
      pickups: updatedPickups,
      notifications: [adminNotif, ...currentState.notifications],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          actorId: recycler.id,
          actorName: recycler.fullName,
          actorRole: recycler.role,
          action: 'RECYCLING_RECORD_SUBMITTED',
          entityName: 'recycling_records',
          entityId: recyclingRecord.id,
          details: `Processed ${params.receivedWeightKg} kg: Cu: ${params.copperRecoveredKg}kg, Al: ${params.aluminumRecoveredKg}kg, Plastics: ${params.plasticsRecoveredKg}kg, Au/Ag: ${params.preciousMetalsGrams}g.`,
          timestamp: new Date().toISOString()
        },
        ...currentState.auditLogs
      ]
    };
    notify();
  },

  verifyRecyclingAndIssueEpr(batchId: string, notes?: string) {
    const admin = this.getCurrentUser();
    let verifiedRecord: RecyclingRecord | null = null;
    let batchNumber = '';
    let totalVerifiedKg = 0;

    const updatedBatches = currentState.batches.map(b => {
      if (b.id !== batchId || !b.recyclingRecord) return b;
      batchNumber = b.batchNumber;
      totalVerifiedKg = b.recyclingRecord.receivedWeightKg;

      verifiedRecord = {
        ...b.recyclingRecord,
        adminVerified: true,
        verifiedAt: new Date().toISOString()
      };

      return {
        ...b,
        status: 'verified' as const,
        recyclingRecord: verifiedRecord
      };
    });

    if (!verifiedRecord) return;

    // Create immutable EPR Ledger entry
    const ledgerRef = `EPR-REC-2026-000${85 + currentState.eprLedger.length}`;
    const hash = '0x' + Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join('');

    const newLedgerEntry: EprLedgerEntry = {
      id: `epr-${Date.now()}`,
      ledgerReference: ledgerRef,
      batchId,
      batchNumber,
      recyclingRecordId: (verifiedRecord as RecyclingRecord).id,
      organizationId: 'org-01',
      organizationName: 'Apex Technology Corp (Enterprise ITAD)',
      categoryId: 'cat-it',
      categoryName: 'Computing & IT Hardware',
      verifiedWeightKg: totalVerifiedKg,
      creditAmount: totalVerifiedKg,
      creditType: 'recycling',
      status: 'verified',
      verifierName: admin.fullName,
      transactionHash: hash,
      notes: notes || 'Hydrometallurgical extraction verified against PCB manifest. Form 6 Certificate issued to EPR compliance pool.',
      recordedAt: new Date().toISOString()
    };

    currentState = {
      ...currentState,
      batches: updatedBatches,
      eprLedger: [newLedgerEntry, ...currentState.eprLedger],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          actorId: admin.id,
          actorName: admin.fullName,
          actorRole: admin.role,
          action: 'EPR_CREDIT_ISSUED',
          entityName: 'epr_ledger',
          entityId: newLedgerEntry.id,
          details: `Issued ${totalVerifiedKg} EPR credits for batch ${batchNumber}. Ledger Ref: ${ledgerRef}.`,
          timestamp: new Date().toISOString()
        },
        ...currentState.auditLogs
      ]
    };
    notify();
  },

  redeemReward(rewardId: string): { success: boolean; message: string; claimCode?: string } {
    const user = this.getCurrentUser();
    const reward = currentState.rewards.find(r => r.id === rewardId);

    if (!reward) {
      return { success: false, message: 'Reward not found.' };
    }

    if (user.rewardPoints < reward.pointsRequired) {
      return { 
        success: false, 
        message: `Insufficient points. You have ${user.rewardPoints} points, but ${reward.pointsRequired} are required.` 
      };
    }

    const claimCode = `${reward.voucherCodeSample.split('-')[0]}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`;

    const newRedemption: RewardRedemption = {
      id: `red-${Date.now()}`,
      userId: user.id,
      rewardId: reward.id,
      rewardTitle: reward.title,
      pointsSpent: reward.pointsRequired,
      claimCode,
      status: 'issued',
      redeemedAt: new Date().toISOString()
    };

    const updatedUsers = currentState.users.map(u => {
      if (u.id === user.id) {
        return {
          ...u,
          rewardPoints: u.rewardPoints - reward.pointsRequired
        };
      }
      return u;
    });

    currentState = {
      ...currentState,
      users: updatedUsers,
      redemptions: [newRedemption, ...currentState.redemptions],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          actorId: user.id,
          actorName: user.fullName,
          actorRole: user.role,
          action: 'REWARD_REDEEMED',
          entityName: 'rewards',
          entityId: reward.id,
          details: `Redeemed ${reward.title} for ${reward.pointsRequired} points. Code: ${claimCode}`,
          timestamp: new Date().toISOString()
        },
        ...currentState.auditLogs
      ]
    };
    notify();

    return { 
      success: true, 
      message: `Congratulations! You successfully redeemed: ${reward.title}`,
      claimCode 
    };
  },

  markNotificationAsRead(notifId: string) {
    currentState = {
      ...currentState,
      notifications: currentState.notifications.map(n => n.id === notifId ? { ...n, isRead: true } : n)
    };
    notify();
  },

  markAllNotificationsAsRead(userId: string) {
    currentState = {
      ...currentState,
      notifications: currentState.notifications.map(n => n.userId === userId ? { ...n, isRead: true } : n)
    };
    notify();
  },

  resetDemoData() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
    currentState = loadInitialState();
    notify();
  }
};
