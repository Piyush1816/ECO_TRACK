import React, { useState } from 'react';
import { 
  Building2, 
  Plus, 
  FileCheck2, 
  Download, 
  Scale, 
  CheckCircle2, 
  ShieldCheck, 
  FileSpreadsheet, 
  Printer, 
  FileText 
} from 'lucide-react';
import { store } from '../../lib/store';
import { PickupRequest, EprLedgerEntry } from '../../types';

interface OrganizationDashboardProps {
  onOpenNewPickup: () => void;
  onOpenCertificateModal: (entry: EprLedgerEntry) => void;
  activeSubTab: string;
}

export const OrganizationDashboard: React.FC<OrganizationDashboardProps> = ({
  onOpenNewPickup,
  onOpenCertificateModal,
  activeSubTab
}) => {
  const currentUser = store.getCurrentUser();
  const state = store.getState();

  // Corporate enterprise stats
  const orgName = currentUser.organizationName || 'Apex Technology Corp (Enterprise ITAD)';
  const orgPickups = state.pickups.filter(p => p.organizationId || p.userId === currentUser.id);

  const orgEprRecords = state.eprLedger.filter(
    e => e.organizationName?.includes('Apex') || e.organizationId === 'org-01'
  );

  const annualTargetKg = 1500.0;
  const verifiedCollectedKg = orgPickups.reduce((sum, p) => 
    sum + (p.weightVerification?.verifiedWeightKg || p.collectionRecord?.actualWeightKg || 0), 0
  );
  const totalCreditsAllocated = orgEprRecords.reduce((sum, e) => sum + e.creditAmount, 0);
  const targetFulfillmentPercent = Math.min(100, Math.round((totalCreditsAllocated / annualTargetKg) * 100));

  return (
    <div className="space-y-6">
      
      {/* Enterprise Compliance Header */}
      <div className="bg-white rounded-2xl border border-[#E2E8E4] p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[#15803D] uppercase tracking-wider">
              Corporate Producer Compliance
            </span>
            <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
              EPR Reg: EPR-PROD-2026-APEX-99
            </span>
          </div>
          <h2 className="text-xl font-bold text-[#17231C] mt-1">
            {orgName}
          </h2>
          <div className="flex items-center gap-3 text-xs text-[#64748B] mt-1">
            <span>Primary Contact: {currentUser.fullName}</span>
            <span>·</span>
            <span>Sector: Enterprise Datacenter Infrastructure & Hardware</span>
          </div>
        </div>

        <button
          onClick={onOpenNewPickup}
          className="flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors shadow-sm whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Submit Bulk ITAD Request</span>
        </button>
      </div>

      {/* Annual EPR Target Progress Bar */}
      <div className="bg-white rounded-xl border border-[#E2E8E4] p-5 shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
          <div>
            <h3 className="font-bold text-sm text-[#17231C]">FY2026 Extended Producer Responsibility (EPR) Quota</h3>
            <p className="text-xs text-[#64748B]">Audited mass balance tracking against annual environmental fulfillment targets</p>
          </div>
          <div className="text-right">
            <span className="text-sm font-bold font-mono text-[#15803D] tabular-nums">
              {totalCreditsAllocated.toFixed(1)} / {annualTargetKg.toFixed(1)} kg
            </span>
            <span className="text-xs text-[#64748B] block font-semibold">{targetFulfillmentPercent}% Fulfilled</span>
          </div>
        </div>

        {/* Visual Progress Bar */}
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-emerald-600 to-[#15803D] transition-all duration-500 rounded-full"
            style={{ width: `${targetFulfillmentPercent}%` }}
          />
        </div>

        <div className="flex justify-between items-center text-[11px] text-[#64748B] pt-1">
          <span>0 kg (Baseline)</span>
          <span>Target Milestone: {annualTargetKg} kg</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-[#E2E8E4] shadow-xs">
          <span className="text-xs font-medium text-[#64748B] uppercase">Bulk Manifests</span>
          <div className="text-2xl font-extrabold text-[#17231C] mt-1 tabular-nums font-mono">
            {orgPickups.length}
          </div>
          <span className="text-[11px] text-[#64748B] mt-0.5 block">ITAD bulk pickups</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E2E8E4] shadow-xs">
          <span className="text-xs font-medium text-[#64748B] uppercase">Verified Diverted</span>
          <div className="text-2xl font-extrabold text-[#15803D] mt-1 tabular-nums font-mono">
            {verifiedCollectedKg.toFixed(1)} <span className="text-xs font-sans font-normal text-[#64748B]">kg</span>
          </div>
          <span className="text-[11px] text-[#64748B] mt-0.5 block">Dock scale confirmed</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E2E8E4] shadow-xs">
          <span className="text-xs font-medium text-[#64748B] uppercase">Allocated EPR Credits</span>
          <div className="text-2xl font-extrabold text-emerald-800 mt-1 tabular-nums font-mono">
            {totalCreditsAllocated.toFixed(1)}
          </div>
          <span className="text-[11px] text-emerald-700 font-semibold mt-0.5 block">Legitimate ledger balance</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-[#E2E8E4] shadow-xs">
          <span className="text-xs font-medium text-[#64748B] uppercase">Audited Destruction</span>
          <div className="text-2xl font-extrabold text-[#17231C] mt-1 tabular-nums font-mono">
            100%
          </div>
          <span className="text-[11px] text-[#64748B] mt-0.5 block">Zero-landfill certified</span>
        </div>
      </div>

      {/* SECTION 1: Bulk Collections & ITAD Pickups */}
      <div className="bg-white rounded-xl border border-[#E2E8E4] p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#17231C]">Bulk Asset Disposition (ITAD) Shipments</h3>
            <p className="text-xs text-[#64748B]">Decommissioned datacenter and corporate electrical hardware</p>
          </div>
          <button
            onClick={onOpenNewPickup}
            className="text-xs font-semibold text-[#15803D] hover:underline"
          >
            + New Bulk Manifest
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAF8] text-[#64748B] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Manifest #</th>
                <th className="py-2.5 px-3">Description</th>
                <th className="py-2.5 px-3 text-right">Est. Weight</th>
                <th className="py-2.5 px-3 text-right">Verified Weight</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3">Logistics Partner</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8E4]">
              {orgPickups.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#15803D]">{p.requestNumber}</td>
                  <td className="py-2.5 px-3 text-[#17231C] max-w-xs truncate">{p.itemDescription}</td>
                  <td className="py-2.5 px-3 text-right font-mono tabular-nums">{p.estimatedWeightKg} kg</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-emerald-800 tabular-nums">
                    {p.weightVerification ? `${p.weightVerification.verifiedWeightKg} kg` : (p.collectionRecord ? `${p.collectionRecord.actualWeightKg} kg` : '—')}
                  </td>
                  <td className="py-2.5 px-3 capitalize">
                    <span className="font-semibold text-xs text-[#17231C]">{p.status.replace('_', ' ')}</span>
                  </td>
                  <td className="py-2.5 px-3 text-[#64748B]">
                    {p.assignment?.partnerCompanyName || 'Pending Dispatch'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* SECTION 2: Verified EPR Ledger Records */}
      <div className="bg-white rounded-xl border border-[#E2E8E4] p-5 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-[#17231C]">Verified Corporate EPR Credit Records</h3>
            <p className="text-xs text-[#64748B]">Evidence records ready for ESG reporting and sustainability disclosures</p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAF8] text-[#64748B] uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-2.5 px-3">Ledger Ref</th>
                <th className="py-2.5 px-3">Batch Ref</th>
                <th className="py-2.5 px-3">Stream</th>
                <th className="py-2.5 px-3 text-right">Verified Mass</th>
                <th className="py-2.5 px-3 text-right">EPR Credits</th>
                <th className="py-2.5 px-3 text-center">Audit Certificate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8E4]">
              {orgEprRecords.map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50">
                  <td className="py-2.5 px-3 font-mono font-bold text-[#15803D]">{entry.ledgerReference}</td>
                  <td className="py-2.5 px-3 font-mono text-[#64748B]">{entry.batchNumber}</td>
                  <td className="py-2.5 px-3 text-[#17231C]">{entry.categoryName}</td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-[#17231C] tabular-nums">
                    {entry.verifiedWeightKg.toFixed(1)} kg
                  </td>
                  <td className="py-2.5 px-3 text-right font-mono font-bold text-[#15803D] tabular-nums">
                    +{entry.creditAmount.toFixed(1)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <button
                      onClick={() => onOpenCertificateModal(entry)}
                      className="px-2.5 py-1 text-[11px] font-semibold text-[#15803D] bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 inline-flex items-center gap-1"
                    >
                      <FileText className="w-3 h-3" />
                      <span>View & Print</span>
                    </button>
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
