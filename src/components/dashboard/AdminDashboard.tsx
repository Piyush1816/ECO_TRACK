import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Users, 
  Truck, 
  Factory, 
  Scale, 
  CheckCircle2, 
  Layers, 
  FileSpreadsheet, 
  History, 
  Check, 
  AlertCircle,
  FileCheck2,
  FileText
} from 'lucide-react';
import { store } from '../../lib/store';
import { PickupRequest, EWasteBatch, EprLedgerEntry } from '../../types';

interface AdminDashboardProps {
  onOpenVerifyWeight: (pickup: PickupRequest) => void;
  onOpenCreateBatch: () => void;
  onOpenCertificateModal: (entry: EprLedgerEntry) => void;
  activeSubTab: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onOpenVerifyWeight,
  onOpenCreateBatch,
  onOpenCertificateModal,
  activeSubTab
}) => {
  const currentUser = store.getCurrentUser();
  const state = store.getState();

  const [selectedPartnerForAssign, setSelectedPartnerForAssign] = useState<Record<string, string>>({});

  // Filter queues
  const pendingAssignmentPickups = state.pickups.filter(p => p.status === 'requested');
  const pendingWeightVerification = state.pickups.filter(p => p.status === 'collected' && !p.weightVerification);
  const verifiedPickupsForBatch = state.pickups.filter(p => p.status === 'verified');
  const batchesAwaitingEpr = state.batches.filter(b => b.status === 'completed' && b.recyclingRecord && !b.recyclingRecord.adminVerified);

  const partners = state.users.filter(u => u.role === 'partner');
  const recyclers = state.users.filter(u => u.role === 'recycler');

  const totalVerifiedWeight = state.eprLedger.reduce((sum, item) => sum + item.verifiedWeightKg, 0)
    + state.pickups.filter(p => p.status === 'verified').reduce((sum, p) => sum + (p.weightVerification?.verifiedWeightKg || 0), 0);
  
  const totalCredits = state.eprLedger.reduce((sum, item) => sum + item.creditAmount, 0);

  const handleAssignPartner = (requestId: string) => {
    const partnerId = selectedPartnerForAssign[requestId] || partners[0]?.id;
    if (!partnerId) return;
    store.assignPartnerToPickup(requestId, partnerId);
  };

  const handleVerifyEprRecord = (batchId: string) => {
    store.verifyRecyclingAndIssueEpr(batchId);
  };

  return (
    <div className="space-y-6">
      
      {/* Admin Executive Header */}
      <div className="bg-white rounded-2xl border border-[#E2E8E4] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#15803D] uppercase tracking-wider">
              Governance & Compliance Administration
            </span>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              Admin Access Level: Super
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#17231C] mt-1">
            System Control & Verification Terminal
          </h2>
          <div className="flex items-center gap-3 text-xs text-[#64748B] mt-1">
            <span>Logged in as: {currentUser.fullName}</span>
            <span>·</span>
            <span>All System Operations Logged in Cryptographic Audit Trail</span>
          </div>
        </div>

        <button
          onClick={onOpenCreateBatch}
          disabled={verifiedPickupsForBatch.length === 0}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors shadow-sm disabled:opacity-40 self-start sm:self-auto"
        >
          <Layers className="w-4 h-4" />
          <span>Consolidate Recycling Batch ({verifiedPickupsForBatch.length} Ready)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-[#E2E8E4] shadow-xs">
          <span className="text-xs font-medium text-[#64748B] uppercase">Unassigned Requests</span>
          <div className="text-2xl font-extrabold text-amber-700 mt-1 tabular-nums font-mono">
            {pendingAssignmentPickups.length}
          </div>
          <span className="text-[11px] text-[#64748B] mt-0.5 block">Pending fleet dispatch</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E2E8E4] shadow-xs">
          <span className="text-xs font-medium text-[#64748B] uppercase">Pending Scale QA</span>
          <div className="text-2xl font-extrabold text-[#15803D] mt-1 tabular-nums font-mono">
            {pendingWeightVerification.length}
          </div>
          <span className="text-[11px] text-[#64748B] mt-0.5 block">Field weight slips ready</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E2E8E4] shadow-xs">
          <span className="text-xs font-medium text-[#64748B] uppercase">Pending EPR Sign-Off</span>
          <div className="text-2xl font-extrabold text-teal-800 mt-1 tabular-nums font-mono">
            {batchesAwaitingEpr.length}
          </div>
          <span className="text-[11px] text-[#64748B] mt-0.5 block">Recycling yield submitted</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E2E8E4] shadow-xs">
          <span className="text-xs font-medium text-[#64748B] uppercase">Total EPR Credits Issued</span>
          <div className="text-2xl font-extrabold text-emerald-800 mt-1 tabular-nums font-mono">
            {totalCredits.toFixed(1)}
          </div>
          <span className="text-[11px] text-[#64748B] mt-0.5 block">Immutable ledger entries</span>
        </div>
      </div>

      {/* SECTION 1: Pending Logistics Dispatch (Assign Partner) */}
      <div className="bg-white rounded-xl border border-[#E2E8E4] p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#17231C]">
              Pickup Dispatch Assignment Matrix ({pendingAssignmentPickups.length})
            </h3>
            <p className="text-xs text-[#64748B]">Route newly submitted citizen & enterprise requests to authorized collection agencies</p>
          </div>
        </div>

        {pendingAssignmentPickups.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#64748B]">
            All pickup requests are currently dispatched. New requests will appear here.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingAssignmentPickups.map((p) => (
              <div key={p.id} className="p-4 bg-[#F8FAF8] rounded-xl border border-[#E2E8E4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#15803D]">{p.requestNumber}</span>
                    <span className="font-semibold text-[#17231C]">{p.userFullName}</span>
                    <span className="text-[#64748B]">· {p.categoryName}</span>
                  </div>
                  <p className="text-[#17231C] mt-1 font-medium">{p.itemDescription}</p>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    {p.pickupAddress}, {p.pickupCity} · Est: {p.estimatedWeightKg} kg · Pref Date: {p.preferredDate} ({p.timeSlot})
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                  <select
                    value={selectedPartnerForAssign[p.id] || partners[0]?.id || ''}
                    onChange={(e) => setSelectedPartnerForAssign({ ...selectedPartnerForAssign, [p.id]: e.target.value })}
                    className="px-2.5 py-1.5 bg-white border border-[#E2E8E4] rounded-lg text-xs"
                  >
                    {partners.map(part => (
                      <option key={part.id} value={part.id}>
                        {part.organizationName || part.fullName}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleAssignPartner(p.id)}
                    className="px-4 py-1.5 font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors shadow-sm"
                  >
                    Assign Partner
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 2: Weight Verification Terminal (Pending Admin QA) */}
      <div className="bg-white rounded-xl border border-[#E2E8E4] p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#17231C]">
              On-Site Weight Verification Queue ({pendingWeightVerification.length})
            </h3>
            <p className="text-xs text-[#64748B]">Cross-check field collector actual weights against digital slips and approve citizen points</p>
          </div>
        </div>

        {pendingWeightVerification.length === 0 ? (
          <div className="py-6 text-center text-xs text-[#64748B]">
            All submitted collection weights have been verified.
          </div>
        ) : (
          <div className="space-y-3">
            {pendingWeightVerification.map((p) => (
              <div key={p.id} className="p-4 bg-emerald-50/40 rounded-xl border border-emerald-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#15803D]">{p.requestNumber}</span>
                    <span className="font-semibold text-[#17231C]">{p.userFullName}</span>
                    <span className="text-[#64748B]">· {p.categoryName}</span>
                  </div>
                  <div className="text-[#17231C] mt-1 font-semibold flex items-center gap-3">
                    <span>Field Scale Weight: <span className="font-mono text-[#15803D] text-sm font-bold">{p.collectionRecord?.actualWeightKg} kg</span></span>
                    <span className="text-[#64748B] font-normal">(Initial User Estimate: {p.estimatedWeightKg} kg)</span>
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    Collector: {p.collectionRecord?.collectorName} · Seal #{p.collectionRecord?.sealTagNumber}
                  </div>
                </div>

                <button
                  onClick={() => onOpenVerifyWeight(p)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors shadow-sm self-start sm:self-auto shrink-0 flex items-center gap-1.5"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Verify Weight & Credit Points</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: Batches Awaiting Recycling Verification & EPR Credit Issuance */}
      {batchesAwaitingEpr.length > 0 && (
        <div className="bg-teal-50/60 rounded-xl border border-teal-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-teal-800" />
              <h3 className="font-bold text-sm text-teal-900">
                Recycling Recovery Records Pending EPR Credit Issuance ({batchesAwaitingEpr.length})
              </h3>
            </div>
            <span className="text-xs text-teal-800 font-semibold">Yield Declaration Ready</span>
          </div>

          <div className="space-y-3">
            {batchesAwaitingEpr.map((b) => (
              <div key={b.id} className="p-4 bg-white rounded-lg border border-teal-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#17231C]">{b.batchNumber}</span>
                    <span className="text-[#64748B]">· {b.recyclerFacilityName}</span>
                  </div>
                  <div className="text-[#17231C] mt-1 font-semibold">
                    Recovered Fractions: Cu {b.recyclingRecord?.copperRecoveredKg}kg · Al {b.recyclingRecord?.aluminumRecoveredKg}kg · Plastics {b.recyclingRecord?.plasticsRecoveredKg}kg · Au/Ag {b.recyclingRecord?.preciousMetalsGrams}g
                  </div>
                  <div className="text-[11px] text-[#64748B] mt-0.5">
                    Gross Received: {b.recyclingRecord?.receivedWeightKg} kg · Certificate: {b.recyclingRecord?.certificateNumber}
                  </div>
                </div>

                <button
                  onClick={() => handleVerifyEprRecord(b.id)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors shadow-sm self-start sm:self-auto shrink-0 flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>Verify Yield & Issue EPR Credits</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 4: Immutable Audit Trail */}
      <div className="bg-white rounded-xl border border-[#E2E8E4] p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#17231C]">System Audit Log & State Invariants</h3>
            <p className="text-xs text-[#64748B]">Chronological audit trail of all custody transitions and scale verifications</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAF8] text-[#64748B] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Timestamp</th>
                <th className="py-2.5 px-3">Actor</th>
                <th className="py-2.5 px-3">Action</th>
                <th className="py-2.5 px-3">Entity</th>
                <th className="py-2.5 px-3">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8E4]">
              {state.auditLogs.slice(0, 10).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono text-[#64748B] whitespace-nowrap">
                    {new Date(log.timestamp).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="py-2.5 px-3 font-semibold text-[#17231C] whitespace-nowrap">
                    {log.actorName} <span className="text-[10px] text-[#64748B] font-normal uppercase">({log.actorRole})</span>
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] font-bold text-[#15803D]">
                    {log.action}
                  </td>
                  <td className="py-2.5 px-3 font-mono text-[11px] text-[#64748B]">
                    {log.entityName}
                  </td>
                  <td className="py-2.5 px-3 text-[#17231C] max-w-sm truncate">
                    {log.details}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};
