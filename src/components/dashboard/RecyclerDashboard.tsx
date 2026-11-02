import React, { useState } from 'react';
import { 
  Factory, 
  Package, 
  Scale, 
  Sparkles, 
  CheckCircle2, 
  FileCheck2, 
  FileText, 
  ShieldCheck, 
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';
import { store } from '../../lib/store';
import { EWasteBatch } from '../../types';
import { INITIAL_RECYCLER_DETAILS } from '../../lib/seedData';

interface RecyclerDashboardProps {
  onOpenProcessYield: (batch: EWasteBatch) => void;
  activeSubTab: string;
}

export const RecyclerDashboard: React.FC<RecyclerDashboardProps> = ({
  onOpenProcessYield,
  activeSubTab
}) => {
  const currentUser = store.getCurrentUser();
  const state = store.getState();
  const recyclerDetail = INITIAL_RECYCLER_DETAILS[0];

  // Batches routed to this recycler (or all in demo mode)
  const recyclerBatches = state.batches.filter(
    b => b.recyclerId === currentUser.id || b.recyclerId === 'user-recycler'
  );

  const inboundDispatched = recyclerBatches.filter(b => b.status === 'dispatched');
  const inProcessing = recyclerBatches.filter(b => b.status === 'received' || b.status === 'in_processing');
  const completedBatches = recyclerBatches.filter(b => b.status === 'completed' || b.status === 'verified');

  const totalProcessedKg = completedBatches.reduce((sum, b) => 
    sum + (b.recyclingRecord?.receivedWeightKg || b.totalWeightKg), 0
  );

  const totalCopperRecoveredKg = completedBatches.reduce((sum, b) => 
    sum + (b.recyclingRecord?.copperRecoveredKg || 0), 0
  );

  const totalPreciousMetalsGrams = completedBatches.reduce((sum, b) => 
    sum + (b.recyclingRecord?.preciousMetalsGrams || 0), 0
  );

  const [receiptError, setReceiptError] = useState<string | null>(null);

  const handleConfirmReceipt = async (batchId: string) => {
    setReceiptError(null);
    try {
      await store.confirmBatchReceipt(batchId);
    } catch (err: any) {
      console.error('Confirm receipt error:', err);
      setReceiptError(err.message || 'Failed to confirm batch receipt');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Facility Header */}
      <div className="bg-white rounded-2xl border border-[#E2E8E4] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#15803D] uppercase tracking-wider">
              Certified Material Recovery Facility
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" /> PCB Reg: {recyclerDetail.pollutionControlBoardReg}
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#17231C] mt-1">
            {recyclerDetail.facilityName}
          </h2>
          <div className="flex items-center gap-3 text-xs text-[#64748B] mt-1">
            <span>Monthly Capacity: {recyclerDetail.processingCapacityMtMonth} MT</span>
            <span>·</span>
            <span>Zero-Landfill Protocol: Active</span>
          </div>
        </div>

        <div className="p-3 bg-[#F8FAF8] rounded-xl border border-[#E2E8E4] text-xs">
          <span className="text-[#64748B] block text-[10px] uppercase font-bold">Authorized Technologies</span>
          <span className="font-semibold text-[#17231C] block mt-0.5">Hydrometallurgy & Optical Sorting</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-[#E2E8E4] shadow-xs">
          <span className="text-xs font-medium text-[#64748B] uppercase">Inbound Shipments</span>
          <div className="text-2xl font-extrabold text-amber-700 mt-1 tabular-nums font-mono">
            {inboundDispatched.length}
          </div>
          <span className="text-[11px] text-[#64748B] mt-0.5 block">Awaiting physical dock check</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E2E8E4] shadow-xs">
          <span className="text-xs font-medium text-[#64748B] uppercase">In Processing</span>
          <div className="text-2xl font-extrabold text-teal-800 mt-1 tabular-nums font-mono">
            {inProcessing.length}
          </div>
          <span className="text-[11px] text-[#64748B] mt-0.5 block">Sorting & refining active</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E2E8E4] shadow-xs">
          <span className="text-xs font-medium text-[#64748B] uppercase">Refined Secondary Copper</span>
          <div className="text-2xl font-extrabold text-[#15803D] mt-1 tabular-nums font-mono">
            {totalCopperRecoveredKg.toFixed(1)} <span className="text-xs font-sans font-normal text-[#64748B]">kg</span>
          </div>
          <span className="text-[11px] text-[#64748B] mt-0.5 block">High-purity electrolytic</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E2E8E4] shadow-xs">
          <span className="text-xs font-medium text-[#64748B] uppercase">Precious Metals Reclaimed</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1 tabular-nums font-mono">
            {totalPreciousMetalsGrams.toFixed(1)} <span className="text-xs font-sans font-normal text-[#64748B]">g</span>
          </div>
          <span className="text-[11px] text-[#64748B] mt-0.5 block">Gold, Silver, Palladium</span>
        </div>
      </div>

      {/* SECTION 1: Inbound Dispatched Batches (Awaiting Dock Confirmation) */}
      {inboundDispatched.length > 0 && (
        <div className="bg-amber-50/60 rounded-xl border border-amber-200 p-5 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-amber-700" />
              <h3 className="font-bold text-sm text-amber-900">
                Inbound Dispatched Batches ({inboundDispatched.length})
              </h3>
            </div>
            <span className="text-xs text-amber-800 font-semibold">Verify Tamper Seals on Dock</span>
          </div>

          <div className="space-y-3">
            {inboundDispatched.map((b) => (
              <div key={b.id} className="p-4 bg-white rounded-lg border border-amber-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#17231C]">{b.batchNumber}</span>
                    <span className="font-mono text-[11px] text-[#64748B]">Manifest: {b.manifestNumber}</span>
                  </div>
                  <div className="text-[#17231C] mt-1 font-semibold">
                    Consolidated Gross Weight: {b.totalWeightKg} kg ({b.itemCount} items)
                  </div>
                  <div className="text-[#64748B] mt-0.5">
                    Dispatched on {new Date(b.dispatchedAt).toLocaleDateString()} by Compliance Logistics
                  </div>
                </div>

                <button
                  onClick={() => handleConfirmReceipt(b.id)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors shadow-sm self-start sm:self-auto shrink-0 flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Physical Receipt</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* SECTION 2: Batches In Processing (Ready to declare recovery yield) */}
      <div className="bg-white rounded-xl border border-[#E2E8E4] p-5 shadow-xs space-y-3">
        <div>
          <h3 className="font-bold text-sm text-[#17231C]">
            Batches Received & Ready for Yield Declaration ({inProcessing.length})
          </h3>
          <p className="text-xs text-[#64748B]">
            Perform optical separation and hydrometallurgical extraction, then log mass balance yields
          </p>
        </div>

        {inProcessing.length === 0 ? (
          <div className="py-8 text-center text-xs text-[#64748B]">
            No batches currently in sorting queue. Confirm physical receipt of inbound shipments above.
          </div>
        ) : (
          <div className="space-y-3">
            {inProcessing.map((b) => (
              <div key={b.id} className="p-4 bg-[#F8FAF8] rounded-xl border border-[#E2E8E4] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-xs text-[#15803D]">{b.batchNumber}</span>
                    <span className="font-mono text-[#64748B]">· {b.manifestNumber}</span>
                  </div>
                  <h4 className="font-bold text-sm text-[#17231C] mt-0.5">
                    Inbound Mass: {b.totalWeightKg} kg ({b.itemCount} electrical units)
                  </h4>
                  <div className="text-[11px] text-teal-800 font-medium mt-1">
                    Status: Received at facility dock on {b.receivedAt ? new Date(b.receivedAt).toLocaleDateString() : 'Today'}
                  </div>
                </div>

                <button
                  onClick={() => onOpenProcessYield(b)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors shadow-sm self-start sm:self-auto shrink-0 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Log Recovery Fractions</span>
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 3: Completed & Verified Batches (EPR Eligibility) */}
      <div className="bg-white rounded-xl border border-[#E2E8E4] p-5 shadow-xs space-y-3">
        <h3 className="font-bold text-sm text-[#17231C]">
          Refined Batches & Yield Logs ({completedBatches.length})
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAF8] text-[#64748B] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Batch Number</th>
                <th className="py-2.5 px-3 text-right">Processed Mass</th>
                <th className="py-2.5 px-3 text-right">Copper (kg)</th>
                <th className="py-2.5 px-3 text-right">Aluminum (kg)</th>
                <th className="py-2.5 px-3 text-right">Polymers (kg)</th>
                <th className="py-2.5 px-3 text-right">Au/Ag/Pd (g)</th>
                <th className="py-2.5 px-3">EPR Verification</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8E4]">
              {completedBatches.map((b) => (
                <tr key={b.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#15803D]">{b.batchNumber}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold tabular-nums">
                    {b.recyclingRecord?.receivedWeightKg || b.totalWeightKg} kg
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[#17231C]">
                    {b.recyclingRecord?.copperRecoveredKg} kg
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[#17231C]">
                    {b.recyclingRecord?.aluminumRecoveredKg} kg
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums text-[#17231C]">
                    {b.recyclingRecord?.plasticsRecoveredKg} kg
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-amber-700 tabular-nums">
                    {b.recyclingRecord?.preciousMetalsGrams} g
                  </td>
                  <td className="py-2.5 px-3">
                    {b.status === 'verified' || b.recyclingRecord?.adminVerified ? (
                      <span className="text-[#15803D] bg-emerald-50 px-2 py-0.5 rounded text-[10px] font-bold">
                        EPR Credit Issued
                      </span>
                    ) : (
                      <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded text-[10px] font-semibold">
                        Admin QA Review
                      </span>
                    )}
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
