import { 
  UserProfile, 
  UserRole, 
  PickupRequest, 
  EWasteBatch, 
  EprLedgerEntry, 
  RewardItem, 
  RewardRedemption,
  AuditLog, 
  NotificationItem
} from '../types';
import { getSupabaseClient, getSupabaseConfig } from './supabase';
import { pickupService } from '../services/pickupService';
import { assignmentService } from '../services/assignmentService';
import { collectionService } from '../services/collectionService';
import { verificationService } from '../services/verificationService';
import { batchService } from '../services/batchService';
import { recyclingService } from '../services/recyclingService';
import { eprService } from '../services/eprService';
import { rewardService } from '../services/rewardService';
import { notificationService } from '../services/notificationService';
import { auditService } from '../services/auditService';
import { profileService } from '../services/profileService';
import { authService, DEMO_CREDENTIALS } from '../services/authService';

export interface AppState {
  pickups: PickupRequest[];
  batches: EWasteBatch[];
  eprLedger: EprLedgerEntry[];
  rewards: RewardItem[];
  redemptions: RewardRedemption[];
  notifications: NotificationItem[];
  auditLogs: AuditLog[];
  partners: Array<{ profile: UserProfile; details: any }>;
  recyclers: Array<{ profile: UserProfile; details: any }>;
  isLoading: boolean;
  error: string | null;
  isConfigured: boolean;
  currentUser: UserProfile;
}

const DEFAULT_DEMO_USER: UserProfile = {
  id: '00000000-0000-0000-0000-000000000001',
  email: 'citizen@ecotrack.org',
  fullName: 'Sarah Jenkins',
  phone: '+1 (555) 382-9011',
  role: 'citizen',
  rewardPoints: 0,
  isVerified: true,
  createdAt: new Date().toISOString()
};

let state: AppState = {
  pickups: [],
  batches: [],
  eprLedger: [],
  rewards: [],
  redemptions: [],
  notifications: [],
  auditLogs: [],
  partners: [],
  recyclers: [],
  isLoading: false,
  error: null,
  isConfigured: false,
  currentUser: DEFAULT_DEMO_USER
};

const listeners = new Set<(state: AppState) => void>();
let realtimeChannel: any = null;

function notify() {
  listeners.forEach(fn => fn(state));
}

export const store = {
  getState(): AppState {
    return state;
  },

  subscribe(listener: (state: AppState) => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  getCurrentUser(): UserProfile {
    return state.currentUser;
  },

  setCurrentUser(user: UserProfile) {
    state = {
      ...state,
      currentUser: user
    };
    notify();
  },

  isConfigured(): boolean {
    return getSupabaseConfig().isConfigured;
  },

  async init(user?: UserProfile | null) {
    const config = getSupabaseConfig();
    state = {
      ...state,
      isConfigured: config.isConfigured,
      isLoading: true,
      error: null
    };
    if (user) {
      state.currentUser = user;
    }
    notify();

    if (!config.isConfigured) {
      state = {
        ...state,
        isLoading: false,
        error: 'Supabase credentials not configured. Please connect your Supabase project.'
      };
      notify();
      return;
    }

    await this.refreshData();
    this.setupRealtime();
  },

  async refreshData() {
    const supabase = getSupabaseClient();
    if (!supabase) return;

    try {
      state = { ...state, isLoading: true };
      notify();

      const [
        pickups,
        batches,
        eprLedger,
        rewards,
        auditLogs,
        partners,
        recyclers
      ] = await Promise.all([
        pickupService.getPickups(),
        batchService.getBatches(),
        eprService.getEprLedger(),
        rewardService.getRewards(),
        auditService.getAuditLogs(),
        profileService.getPartners(),
        profileService.getRecyclers()
      ]);

      let notifications: NotificationItem[] = [];
      let redemptions: RewardRedemption[] = [];

      if (state.currentUser?.id) {
        [notifications, redemptions] = await Promise.all([
          notificationService.getNotifications(state.currentUser.id),
          rewardService.getRedemptions(state.currentUser.id)
        ]);
      }

      state = {
        ...state,
        pickups,
        batches,
        eprLedger,
        rewards,
        redemptions,
        notifications,
        auditLogs,
        partners,
        recyclers,
        isLoading: false,
        error: null
      };
      notify();
    } catch (err: any) {
      console.error('Failed to refresh data from Supabase:', err);
      state = {
        ...state,
        isLoading: false,
        error: err.message || 'Failed to load records from Supabase database.'
      };
      notify();
    }
  },

  setupRealtime() {
    const supabase = getSupabaseClient();
    if (!supabase || realtimeChannel) return;

    try {
      realtimeChannel = supabase
        .channel('ecotrack_realtime_db')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'pickup_requests' }, () => {
          this.refreshData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
          this.refreshData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ewaste_batches' }, () => {
          this.refreshData();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'epr_ledger' }, () => {
          this.refreshData();
        })
        .subscribe();
    } catch (err) {
      console.warn('Realtime subscription error:', err);
    }
  },

  cleanupRealtime() {
    if (realtimeChannel) {
      const supabase = getSupabaseClient();
      if (supabase) {
        supabase.removeChannel(realtimeChannel);
      }
      realtimeChannel = null;
    }
  },

  async switchRole(role: UserRole) {
    // Attempt authentic demo persona sign in
    const res = await authService.signInDemoPersona(role);
    if (res.data?.profile) {
      this.setCurrentUser(res.data.profile);
      await this.refreshData();
      return { success: true };
    }
    return { 
      success: false, 
      error: res.error?.message || 'Could not authenticate demo persona' 
    };
  },

  async createPickupRequest(params: {
    categoryId: string;
    itemDescription: string;
    estimatedQuantity: number;
    estimatedWeightKg: number;
    pickupAddress: string;
    pickupCity: string;
    preferredDate: string;
    timeSlot: string;
    specialNotes?: string;
  }): Promise<PickupRequest> {
    const user = this.getCurrentUser();
    const newReq = await pickupService.createPickup({
      userId: user.id,
      organizationId: user.role === 'organization' ? user.id : undefined,
      ...params
    });

    await this.refreshData();
    return newReq;
  },

  async assignPartnerToPickup(requestId: string, partnerId: string) {
    const admin = this.getCurrentUser();
    await assignmentService.assignPartner(requestId, partnerId, admin.id);
    await this.refreshData();
  },

  async respondToAssignment(requestId: string, accepted: boolean, rejectionReason?: string) {
    const partner = this.getCurrentUser();
    const pickup = state.pickups.find(p => p.id === requestId);
    if (!pickup?.assignment) throw new Error('Assignment record not found for this pickup.');

    await assignmentService.respondToAssignment(
      pickup.assignment.id,
      requestId,
      partner.id,
      accepted,
      rejectionReason
    );
    await this.refreshData();
  },

  async schedulePickup(requestId: string, scheduledAt: string, agentName: string, vehicleReg: string) {
    const partner = this.getCurrentUser();
    const pickup = state.pickups.find(p => p.id === requestId);
    if (!pickup?.assignment) throw new Error('Assignment record not found for this pickup.');

    await assignmentService.schedulePickup({
      assignmentId: pickup.assignment.id,
      requestId,
      partnerId: partner.id,
      scheduledAt,
      assignedAgentName: agentName,
      vehicleRegistration: vehicleReg
    });
    await this.refreshData();
  },

  async submitCollectionRecord(params: {
    requestId: string;
    actualWeightKg: number;
    itemCount: number;
    sealTagNumber: string;
    weighingSlipUrl?: string;
    notes?: string;
  }) {
    const partner = this.getCurrentUser();
    await collectionService.submitCollectionRecord({
      collectorId: partner.id,
      ...params
    });
    await this.refreshData();
  },

  async verifyWeight(params: {
    requestId: string;
    verifiedWeightKg: number;
    notes?: string;
  }) {
    const admin = this.getCurrentUser();
    const pickup = state.pickups.find(p => p.id === params.requestId);
    if (!pickup?.collectionRecord) throw new Error('Collection record not found for this request.');

    await verificationService.verifyWeight({
      requestId: params.requestId,
      collectionRecordId: pickup.collectionRecord.id,
      adminId: admin.id,
      verifiedWeightKg: params.verifiedWeightKg,
      notes: params.notes
    });
    await this.refreshData();
  },

  async createRecyclingBatch(params: {
    recyclerId: string;
    requestIds: string[];
    manifestNumber: string;
  }): Promise<EWasteBatch> {
    const admin = this.getCurrentUser();
    const batch = await batchService.createBatch({
      recyclerId: params.recyclerId,
      requestIds: params.requestIds,
      manifestNumber: params.manifestNumber,
      adminId: admin.id
    });
    await this.refreshData();
    return batch;
  },

  async confirmBatchReceipt(batchId: string) {
    const recycler = this.getCurrentUser();
    await batchService.confirmBatchReceipt(batchId, recycler.id);
    await this.refreshData();
  },

  async submitRecyclingRecord(params: {
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
    await recyclingService.submitRecyclingRecord({
      recyclerId: recycler.id,
      ...params
    });
    await this.refreshData();
  },

  async verifyRecyclingAndIssueEpr(batchId: string, notes?: string) {
    const admin = this.getCurrentUser();
    await eprService.verifyRecyclingAndIssueEpr({
      batchId,
      adminId: admin.id,
      notes
    });
    await this.refreshData();
  },

  async redeemReward(rewardId: string): Promise<{ success: boolean; message: string; claimCode?: string }> {
    const user = this.getCurrentUser();
    const res = await rewardService.redeemReward(rewardId, user.id);
    await this.refreshData();
    return res;
  },

  async markNotificationAsRead(notifId: string) {
    await notificationService.markAsRead(notifId);
    state = {
      ...state,
      notifications: state.notifications.map(n => n.id === notifId ? { ...n, isRead: true } : n)
    };
    notify();
  },

  async markAllNotificationsAsRead(userId: string) {
    await notificationService.markAllAsRead(userId);
    state = {
      ...state,
      notifications: state.notifications.map(n => n.userId === userId ? { ...n, isRead: true } : n)
    };
    notify();
  }
};
