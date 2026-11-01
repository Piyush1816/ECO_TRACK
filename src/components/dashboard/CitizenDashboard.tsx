import React, { useState } from 'react';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Scale, 
  Sparkles, 
  Plus, 
  ArrowRight, 
  CheckCircle2, 
  Trees, 
  Award, 
  ShieldCheck, 
  Gift, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { store } from '../../lib/store';
import { PickupRequest, RewardItem } from '../../types';

interface CitizenDashboardProps {
  onOpenNewPickup: () => void;
  activeSubTab: string;
}

export const CitizenDashboard: React.FC<CitizenDashboardProps> = ({
  onOpenNewPickup,
  activeSubTab
}) => {
  const currentUser = store.getCurrentUser();
  const state = store.getState();
  
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedPickup, setSelectedPickup] = useState<PickupRequest | null>(null);
  const [redeemFeedback, setRedeemFeedback] = useState<{ msg: string; code?: string } | null>(null);

  // Pickups for this citizen
  const citizenPickups = state.pickups.filter(p => p.userId === currentUser.id);

  const filteredPickups = citizenPickups.filter(p => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'active') return ['requested', 'assigned', 'scheduled', 'collected'].includes(p.status);
    if (statusFilter === 'verified') return ['verified', 'batch_assigned', 'recycled'].includes(p.status);
    return true;
  });

  // Calculate stats
  const totalPickups = citizenPickups.length;
  const verifiedWeightKg = citizenPickups.reduce((sum, p) => 
    sum + (p.weightVerification?.verifiedWeightKg || (p.status === 'recycled' ? p.estimatedWeightKg : 0)), 0
  );
  const co2AvoidedKg = Math.round(verifiedWeightKg * 2.3);

  const handleRedeem = (reward: RewardItem) => {
    const res = store.redeemReward(reward.id);
    if (res.success) {
      setRedeemFeedback({ msg: res.message, code: res.claimCode });
    } else {
      setRedeemFeedback({ msg: res.message });
    }
  };

  const getStatusBadge = (status: PickupRequest['status']) => {
    switch (status) {
      case 'requested':
        return <span className="text-[#64748B] bg-slate-100 px-2 py-0.5 rounded text-[10px] font-semibold">1. Awaiting Dispatch</span>;
      case 'assigned':
        return <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-semibold">2. Assigned to Partner</span>;
      case 'scheduled':
        return <span className="text-teal-800 bg-teal-50 px-2 py-0.5 rounded text-[10px] font-semibold">3. Route Scheduled</span>;
      case 'collected':
        return <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-semibold">4. Collected & Weighed</span>;
      case 'verified':
        return <span className="text-[#15803D] bg-emerald-100/70 px-2 py-0.5 rounded text-[10px] font-semibold">5. Weight Verified</span>;
      case 'batch_assigned':
        return <span className="text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded text-[10px] font-semibold">6. En Route to Recycler</span>;
      case 'recycled':
        return <span className="text-emerald-900 bg-emerald-200/60 px-2 py-0.5 rounded text-[10px] font-semibold">7. Recycled & Recovered</span>;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Overview Subtab */}
      {(activeSubTab === 'overview' || !activeSubTab) && (
        <>
          {/* Welcome Banner */}
          <div className="bg-white rounded-2xl border border-[#E2E8E4] p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-semibold text-[#15803D] uppercase tracking-wider block">
                Citizen Sustainability Portal
              </span>
              <h2 className="text-2xl font-extrabold text-[#17231C] mt-1">
                Welcome back, {currentUser.fullName}
              </h2>
              <p className="text-xs text-[#64748B] mt-1">
                Track your active doorstep pickups, verified material weights, and redeem earned rewards.
              </p>
            </div>
            <button
              onClick={onOpenNewPickup}
              className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors shadow-sm whitespace-nowrap self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>Schedule New Pickup</span>
            </button>
          </div>

          {/* KPI Stat Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-5 bg-white rounded-xl border border-[#E2E8E4] shadow-xs">
              <span className="text-xs font-medium text-[#64748B] uppercase">Total Pickups</span>
              <div className="text-2xl font-extrabold text-[#17231C] mt-1 tabular-nums font-mono">
                {totalPickups}
              </div>
              <span className="text-[11px] text-[#64748B] mt-0.5 block">Doorstep requests</span>
            </div>

            <div className="p-5 bg-white rounded-xl border border-[#E2E8E4] shadow-xs">
              <span className="text-xs font-medium text-[#64748B] uppercase">Verified Diverted</span>
              <div className="text-2xl font-extrabold text-[#15803D] mt-1 tabular-nums font-mono">
                {verifiedWeightKg.toFixed(1)} <span className="text-xs font-sans font-normal text-[#64748B]">kg</span>
              </div>
              <span className="text-[11px] text-emerald-700 font-medium mt-0.5 block">Calibrated scale verified</span>
            </div>

            <div className="p-5 bg-white rounded-xl border border-[#E2E8E4] shadow-xs">
              <span className="text-xs font-medium text-[#64748B] uppercase">Eco-Points Balance</span>
              <div className="text-2xl font-extrabold text-amber-700 mt-1 tabular-nums font-mono">
                {currentUser.rewardPoints}
              </div>
              <span className="text-[11px] text-[#64748B] mt-0.5 block">Ready to redeem</span>
            </div>

            <div className="p-5 bg-white rounded-xl border border-[#E2E8E4] shadow-xs">
              <span className="text-xs font-medium text-[#64748B] uppercase">CO₂ Abated</span>
              <div className="text-2xl font-extrabold text-emerald-800 mt-1 tabular-nums font-mono">
                {co2AvoidedKg} <span className="text-xs font-sans font-normal text-[#64748B]">kg</span>
              </div>
              <span className="text-[11px] text-[#64748B] mt-0.5 block">Based on LCA factor</span>
            </div>
          </div>

          {/* Active Pickups & Lifecycle Progress Section */}
          <div className="bg-white rounded-xl border border-[#E2E8E4] p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-[#17231C]">Recent Pickup Requests & Lifecycles</h3>
                <p className="text-xs text-[#64748B]">Track real-time status transitions across the 6-stage chain of custody</p>
              </div>
              <button
                onClick={onOpenNewPickup}
                className="text-xs font-semibold text-[#15803D] hover:underline"
              >
                + Schedule Another
              </button>
            </div>

            <div className="space-y-3">
              {citizenPickups.length === 0 ? (
                <div className="py-12 text-center text-xs text-[#64748B]">
                  No pickup requests yet. Click above to schedule your first collection!
                </div>
              ) : (
                citizenPickups.slice(0, 4).map((pickup) => (
                  <div
                    key={pickup.id}
                    className="p-4 bg-[#F8FAF8] rounded-xl border border-[#E2E8E4] hover:border-[#15803D] transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-[#17231C]">{pickup.requestNumber}</span>
                        <span className="text-xs text-[#64748B]">·</span>
                        <span className="text-xs font-semibold text-[#17231C]">{pickup.categoryName}</span>
                      </div>
                      <div>{getStatusBadge(pickup.status)}</div>
                    </div>

                    <p className="text-xs text-[#64748B] mb-3">
                      {pickup.itemDescription}
                    </p>

                    {/* Progress stage tracker */}
                    <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-semibold text-[#64748B] pt-2 border-t border-[#E2E8E4]">
                      <div className={`py-1 rounded ${['requested', 'assigned', 'scheduled', 'collected', 'verified', 'recycled'].includes(pickup.status) ? 'bg-emerald-100 text-[#15803D]' : 'bg-slate-100'}`}>
                        1. Requested
                      </div>
                      <div className={`py-1 rounded ${['assigned', 'scheduled', 'collected', 'verified', 'recycled'].includes(pickup.status) ? 'bg-emerald-100 text-[#15803D]' : 'bg-slate-100'}`}>
                        2. Assigned
                      </div>
                      <div className={`py-1 rounded ${['collected', 'verified', 'recycled'].includes(pickup.status) ? 'bg-emerald-100 text-[#15803D]' : 'bg-slate-100'}`}>
                        3. Collected ({pickup.collectionRecord?.actualWeightKg ? `${pickup.collectionRecord.actualWeightKg}kg` : 'Pending'})
                      </div>
                      <div className={`py-1 rounded ${['verified', 'batch_assigned', 'recycled'].includes(pickup.status) ? 'bg-[#15803D] text-white' : 'bg-slate-100'}`}>
                        4. Verified ({pickup.weightVerification?.verifiedWeightKg ? `${pickup.weightVerification.verifiedWeightKg}kg` : 'Pending'})
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </>
      )}

      {/* Pickups History Subtab */}
      {activeSubTab === 'pickups' && (
        <div className="bg-white rounded-xl border border-[#E2E8E4] p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-[#17231C]">All Pickup Requests & Weighing Slips</h3>
              <p className="text-xs text-[#64748B]">Complete history of items declared and certified weight slips</p>
            </div>
            
            <div className="flex items-center gap-1.5 text-xs">
              <button
                onClick={() => setStatusFilter('all')}
                className={`px-3 py-1.5 rounded-lg font-medium ${statusFilter === 'all' ? 'bg-[#15803D] text-white' : 'bg-[#F8FAF8] text-[#64748B] border border-[#E2E8E4]'}`}
              >
                All ({citizenPickups.length})
              </button>
              <button
                onClick={() => setStatusFilter('active')}
                className={`px-3 py-1.5 rounded-lg font-medium ${statusFilter === 'active' ? 'bg-[#15803D] text-white' : 'bg-[#F8FAF8] text-[#64748B] border border-[#E2E8E4]'}`}
              >
                In Progress
              </button>
              <button
                onClick={() => setStatusFilter('verified')}
                className={`px-3 py-1.5 rounded-lg font-medium ${statusFilter === 'verified' ? 'bg-[#15803D] text-white' : 'bg-[#F8FAF8] text-[#64748B] border border-[#E2E8E4]'}`}
              >
                Verified & Completed
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAF8] text-[#64748B] border-b border-[#E2E8E4] uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-3">Req Number</th>
                  <th className="py-3 px-3">Stream</th>
                  <th className="py-3 px-3">Items Declared</th>
                  <th className="py-3 px-3 text-right">Est. Weight</th>
                  <th className="py-3 px-3 text-right">Actual Weight</th>
                  <th className="py-3 px-3 text-right">Verified Weight</th>
                  <th className="py-3 px-3">Status</th>
                  <th className="py-3 px-3 text-center">Weighing Slip</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E4]">
                {filteredPickups.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-[#15803D]">{p.requestNumber}</td>
                    <td className="py-3 px-3 text-[#17231C]">{p.categoryName}</td>
                    <td className="py-3 px-3 text-[#64748B] max-w-xs truncate">{p.itemDescription}</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">{p.estimatedWeightKg} kg</td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-semibold">
                      {p.collectionRecord ? `${p.collectionRecord.actualWeightKg} kg` : '—'}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums font-bold text-emerald-800">
                      {p.weightVerification ? `${p.weightVerification.verifiedWeightKg} kg` : '—'}
                    </td>
                    <td className="py-3 px-3">{getStatusBadge(p.status)}</td>
                    <td className="py-3 px-3 text-center">
                      {p.collectionRecord ? (
                        <button
                          onClick={() => setSelectedPickup(p)}
                          className="px-2 py-1 text-[11px] font-semibold text-[#15803D] bg-emerald-50 rounded border border-emerald-200"
                        >
                          View Slip
                        </button>
                      ) : (
                        <span className="text-[11px] text-[#94A3B8]">Pending</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Rewards Store Subtab */}
      {activeSubTab === 'rewards' && (
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-[#E2E8E4] p-5 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#15803D] uppercase">Eco-Points Balance</span>
              <div className="text-3xl font-extrabold text-[#17231C] font-mono tabular-nums mt-0.5">
                {currentUser.rewardPoints} <span className="text-xs font-sans font-normal text-[#64748B]">available points</span>
              </div>
              <p className="text-xs text-[#64748B] mt-1">
                Points are credited immediately when platform administrators verify collection weights.
              </p>
            </div>
            <Award className="w-12 h-12 text-amber-500 shrink-0" />
          </div>

          {redeemFeedback && (
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-900 flex items-start justify-between">
              <div>
                <span className="font-bold block">{redeemFeedback.msg}</span>
                {redeemFeedback.code && (
                  <span className="font-mono text-xs font-bold text-[#15803D] mt-1 block">
                    Claim Code: {redeemFeedback.code}
                  </span>
                )}
              </div>
              <button onClick={() => setRedeemFeedback(null)} className="text-emerald-800 font-bold">×</button>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {state.rewards.map((reward) => {
              const canAfford = currentUser.rewardPoints >= reward.pointsRequired;
              return (
                <div key={reward.id} className="p-5 bg-white rounded-xl border border-[#E2E8E4] flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-semibold text-[#15803D] uppercase">{reward.sponsorName}</span>
                      <span className="font-mono font-bold text-sm text-[#17231C]">{reward.pointsRequired} pts</span>
                    </div>
                    <h4 className="font-bold text-sm text-[#17231C]">{reward.title}</h4>
                    <p className="text-xs text-[#64748B] mt-1 leading-relaxed">{reward.description}</p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E2E8E4] flex items-center justify-between">
                    <span className="text-[11px] text-[#64748B]">
                      {canAfford ? 'Eligible for instant redemption' : `Need ${reward.pointsRequired - currentUser.rewardPoints} more pts`}
                    </span>
                    <button
                      onClick={() => handleRedeem(reward)}
                      disabled={!canAfford}
                      className="px-3.5 py-1.5 text-xs font-semibold rounded-lg transition-colors bg-[#15803D] text-white hover:bg-[#166534] disabled:opacity-40"
                    >
                      Redeem Reward
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Slip Viewer Modal */}
      {selectedPickup && selectedPickup.collectionRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E2E8E4] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8E4] pb-3">
              <div>
                <span className="text-[10px] font-mono font-bold text-[#15803D]">{selectedPickup.requestNumber}</span>
                <h4 className="font-bold text-sm text-[#17231C]">Verified Weighing Slip</h4>
              </div>
              <button onClick={() => setSelectedPickup(null)} className="text-[#64748B]">✕</button>
            </div>

            <div className="p-3 bg-[#F8FAF8] rounded-xl border border-[#E2E8E4] space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-[#64748B]">Collector Agent:</span>
                <span className="font-bold text-[#17231C]">{selectedPickup.collectionRecord.collectorName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Actual Field Weight:</span>
                <span className="font-mono font-bold text-[#15803D] text-sm">{selectedPickup.collectionRecord.actualWeightKg} kg</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Security Seal Tag:</span>
                <span className="font-mono text-[#17231C]">{selectedPickup.collectionRecord.sealTagNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">GPS Location:</span>
                <span className="font-mono text-[#17231C]">{selectedPickup.collectionRecord.gpsCoordinates || 'Verified Zone'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#64748B]">Admin Verified:</span>
                <span className="font-bold text-emerald-700">
                  {selectedPickup.weightVerification ? `${selectedPickup.weightVerification.verifiedWeightKg} kg Approved` : 'Pending QA'}
                </span>
              </div>
            </div>

            <div className="text-right">
              <button
                onClick={() => setSelectedPickup(null)}
                className="px-4 py-2 text-xs font-semibold bg-[#15803D] text-white rounded-lg"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
