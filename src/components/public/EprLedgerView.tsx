import React, { useState } from 'react';
import { 
  FileSpreadsheet, 
  Search, 
  CheckCircle2, 
  ExternalLink, 
  ShieldCheck, 
  Copy, 
  Check, 
  Download,
  Building2,
  FileText
} from 'lucide-react';
import { store } from '../../lib/store';
import { EprLedgerEntry } from '../../types';

interface EprLedgerViewProps {
  onOpenCertificateModal: (entry: EprLedgerEntry) => void;
}

export const EprLedgerView: React.FC<EprLedgerViewProps> = ({ onOpenCertificateModal }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const state = store.getState();

  const handleCopyHash = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const filteredEntries = state.eprLedger.filter(entry => 
    entry.ledgerReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.batchNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.organizationName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    entry.transactionHash.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalVerifiedWeight = state.eprLedger.reduce((sum, item) => sum + item.verifiedWeightKg, 0);
  const totalCredits = state.eprLedger.reduce((sum, item) => sum + item.creditAmount, 0);

  return (
    <section className="py-14 lg:py-20 bg-white border-b border-[#E2E8E4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-[#15803D] uppercase tracking-wider mb-1">
              <FileSpreadsheet className="w-4 h-4" />
              <span>Internal Environmental Compliance Ledger</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17231C]">
              EPR Credit & Material Verification Ledger
            </h2>
            <p className="mt-2 text-sm text-[#64748B] max-w-2xl">
              Immutable ledger of certified recycling batches, verified scrap weights, and allocated Extended Producer Responsibility compliance units.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search reference, batch, hash..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15803D]"
              />
            </div>
          </div>
        </div>

        {/* Top Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          <div className="p-4 bg-[#F8FAF8] rounded-xl border border-[#E2E8E4]">
            <span className="text-xs font-medium text-[#64748B] uppercase">Total Verified Scrap Mass</span>
            <div className="mt-1 text-2xl font-extrabold text-[#17231C] tabular-nums font-mono">
              {totalVerifiedWeight.toLocaleString('en-US', { minimumFractionDigits: 1 })} <span className="text-sm font-sans font-normal text-[#64748B]">kg</span>
            </div>
          </div>
          <div className="p-4 bg-[#F8FAF8] rounded-xl border border-[#E2E8E4]">
            <span className="text-xs font-medium text-[#64748B] uppercase">Total Allocated EPR Credits</span>
            <div className="mt-1 text-2xl font-extrabold text-[#15803D] tabular-nums font-mono">
              {totalCredits.toLocaleString('en-US', { minimumFractionDigits: 1 })}
            </div>
          </div>
          <div className="p-4 bg-[#F8FAF8] rounded-xl border border-[#E2E8E4]">
            <span className="text-xs font-medium text-[#64748B] uppercase">Ledger Invariant Status</span>
            <div className="mt-1 text-base font-bold text-emerald-700 flex items-center gap-1.5">
              <CheckCircle2 className="w-5 h-5 text-[#10B981]" />
              <span>100% Cryptographically Intact</span>
            </div>
          </div>
        </div>

        {/* Ledger Table */}
        <div className="bg-white rounded-xl border border-[#E2E8E4] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F8FAF8] text-[#64748B] border-b border-[#E2E8E4] font-semibold uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="py-3 px-4">Ledger Reference</th>
                  <th className="py-3 px-4">Batch Reference</th>
                  <th className="py-3 px-4">Beneficiary / Enterprise</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4 text-right">Verified Weight</th>
                  <th className="py-3 px-4 text-right">EPR Credits</th>
                  <th className="py-3 px-4">Audit Signature</th>
                  <th className="py-3 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E2E8E4] text-[#17231C]">
                {filteredEntries.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-[#64748B]">
                      No matching EPR ledger records found.
                    </td>
                  </tr>
                ) : (
                  filteredEntries.map((entry) => (
                    <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-semibold text-[#15803D] whitespace-nowrap">
                        {entry.ledgerReference}
                      </td>
                      <td className="py-3.5 px-4 font-mono text-[#64748B] whitespace-nowrap">
                        {entry.batchNumber}
                      </td>
                      <td className="py-3.5 px-4 font-medium">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-[#64748B]" />
                          <span>{entry.organizationName || 'Public Producer Pool'}</span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-[#64748B]">
                        {entry.categoryName}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold tabular-nums">
                        {entry.verifiedWeightKg.toFixed(1)} kg
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#15803D] tabular-nums">
                        +{entry.creditAmount.toFixed(1)}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-[10px] text-[#64748B] max-w-[120px] truncate" title={entry.transactionHash}>
                            {entry.transactionHash.substring(0, 12)}...
                          </span>
                          <button
                            onClick={() => handleCopyHash(entry.transactionHash, entry.id)}
                            className="text-[#64748B] hover:text-[#17231C] p-1"
                            title="Copy full hash"
                          >
                            {copiedId === entry.id ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-center">
                        <button
                          onClick={() => onOpenCertificateModal(entry)}
                          className="px-2.5 py-1 text-[11px] font-semibold text-[#15803D] bg-emerald-50 hover:bg-emerald-100 rounded border border-emerald-200 transition-colors inline-flex items-center gap-1 whitespace-nowrap"
                        >
                          <FileText className="w-3 h-3" />
                          <span>Certificate</span>
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Regulatory Disclosure Notice */}
        <div className="mt-8 p-4 bg-[#F8FAF8] rounded-xl border border-[#E2E8E4] text-xs text-[#64748B] flex items-start gap-3">
          <ShieldCheck className="w-5 h-5 text-[#15803D] shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold text-[#17231C] block">Compliance Ledger Architecture Notice</span>
            <p>
              EcoTrack maintains an internal, verifiable audit trail for material collection and certified destruction. In accordance with platform governance, EcoTrack records serve as evidentiary documentation for corporate ESG disclosures and do not claim to issue official sovereign statutory certificates or legally transferable securities without authorization from relevant state environmental regulatory boards.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
};
