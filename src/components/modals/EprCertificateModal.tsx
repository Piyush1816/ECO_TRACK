import React from 'react';
import { 
  X, 
  Printer, 
  ShieldCheck, 
  FileCheck2, 
  Recycle, 
  Building2, 
  CheckCircle2, 
  Copy, 
  Check 
} from 'lucide-react';
import { EprLedgerEntry } from '../../types';

interface EprCertificateModalProps {
  isOpen: boolean;
  onClose: () => void;
  entry: EprLedgerEntry | null;
}

export const EprCertificateModal: React.FC<EprCertificateModalProps> = ({
  isOpen,
  onClose,
  entry
}) => {
  const [copied, setCopied] = React.useState(false);

  if (!isOpen || !entry) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleCopyHash = () => {
    navigator.clipboard.writeText(entry.transactionHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl border border-[#E2E8E4] shadow-2xl w-full max-w-2xl max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Actions */}
        <div className="flex items-center justify-between p-4 border-b border-[#E2E8E4] bg-[#F8FAF8] no-print">
          <div className="flex items-center gap-2 text-xs font-semibold text-[#15803D]">
            <FileCheck2 className="w-4 h-4" />
            <span>Verified Compliance Record</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-[#17231C] bg-white border border-[#E2E8E4] rounded-lg hover:bg-slate-50 transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Manifest</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-[#64748B] hover:text-[#17231C] hover:bg-slate-100 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Certificate Printable Canvas */}
        <div className="p-8 space-y-6">
          
          {/* Certificate Header Lockup */}
          <div className="flex items-start justify-between border-b-2 border-[#15803D] pb-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-[#15803D] text-white flex items-center justify-center shadow-sm">
                <Recycle className="w-7 h-7" />
              </div>
              <div>
                <span className="text-xl font-extrabold tracking-tight text-[#17231C] block">
                  EcoTrack Compliance Ledger
                </span>
                <span className="text-xs font-medium text-[#64748B]">
                  Chain-of-Custody Material Recovery & EPR Credit Record
                </span>
              </div>
            </div>

            <div className="text-right font-mono">
              <span className="text-[10px] text-[#64748B] block uppercase font-sans font-semibold">Ledger Ref:</span>
              <span className="text-sm font-bold text-[#15803D]">{entry.ledgerReference}</span>
              <span className="text-[10px] text-[#64748B] block font-sans mt-0.5">
                {new Date(entry.recordedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
          </div>

          {/* Beneficiary & Certified Quantity Callout */}
          <div className="bg-[#F8FAF8] rounded-xl border border-[#E2E8E4] p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block">Beneficiary Entity / Producer</span>
              <span className="text-base font-bold text-[#17231C] mt-0.5 block">
                {entry.organizationName || 'Public Producer Pool'}
              </span>
              <span className="text-xs text-[#64748B] mt-1 block">
                Category: {entry.categoryName} ({entry.categoryId})
              </span>
            </div>

            <div className="sm:border-l sm:border-[#E2E8E4] sm:pl-4">
              <span className="text-[10px] text-[#64748B] uppercase font-bold tracking-wider block">Verified Scrap Mass Recovered</span>
              <span className="text-2xl font-mono font-extrabold text-[#15803D] mt-0.5 block tabular-nums">
                {entry.verifiedWeightKg.toFixed(1)} kg
              </span>
              <span className="text-xs font-semibold text-emerald-800">
                +{entry.creditAmount.toFixed(1)} Verified EPR Compliance Credits
              </span>
            </div>
          </div>

          {/* Audit Trail Details */}
          <div className="space-y-3 text-xs">
            <h4 className="text-xs font-bold text-[#17231C] uppercase tracking-wider">
              Verification & Custody Manifest
            </h4>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 bg-white rounded-lg border border-[#E2E8E4]">
                <span className="text-[#64748B] text-[11px] block">Recycling Batch Ref:</span>
                <span className="font-mono font-bold text-[#17231C]">{entry.batchNumber}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#E2E8E4]">
                <span className="text-[#64748B] text-[11px] block">Audit Verifier:</span>
                <span className="font-bold text-[#17231C]">{entry.verifierName}</span>
              </div>
            </div>

            {/* Cryptographic Transaction Hash */}
            <div className="p-3 bg-white rounded-lg border border-[#E2E8E4]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-[#64748B] text-[11px] font-medium">Cryptographic Ledger Signature:</span>
                <button
                  onClick={handleCopyHash}
                  className="text-[11px] text-[#15803D] hover:underline flex items-center gap-1 font-semibold"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy Signature'}</span>
                </button>
              </div>
              <div className="font-mono text-[11px] text-[#17231C] bg-[#F8FAF8] p-2 rounded border border-[#E2E8E4] break-all select-all">
                {entry.transactionHash}
              </div>
            </div>

            {/* Auditor Notes */}
            {entry.notes && (
              <div className="p-3 bg-emerald-50/50 rounded-lg border border-emerald-100 text-[#17231C]">
                <span className="font-bold text-[#15803D] block text-[11px]">Compliance Note:</span>
                <p className="text-[11px] text-emerald-900 mt-0.5">{entry.notes}</p>
              </div>
            )}
          </div>

          {/* Official Stamp & Signatures */}
          <div className="pt-6 border-t border-[#E2E8E4] flex items-center justify-between">
            <div className="space-y-1">
              <div className="w-32 border-b border-[#17231C] pb-1">
                <span className="font-serif italic text-xs text-[#17231C]">Priya Sharma</span>
              </div>
              <span className="text-[10px] text-[#64748B] block">Chief Compliance Officer</span>
              <span className="text-[10px] text-[#64748B] block">EcoTrack Platform Registry</span>
            </div>

            <div className="w-24 h-24 rounded-full border-2 border-dashed border-[#15803D] flex flex-col items-center justify-center text-center p-2 text-[9px] text-[#15803D] font-bold uppercase rotate-[-6deg]">
              <ShieldCheck className="w-6 h-6 mb-0.5" />
              <span>VERIFIED</span>
              <span>MASS BALANCE</span>
            </div>
          </div>

          {/* Statutory Notice */}
          <div className="pt-4 border-t border-[#E2E8E4] text-[10px] text-[#94A3B8] leading-relaxed">
            Statutory Notice: This certificate is an evidentiary record of calibrated on-site collection and certified zero-landfill processing managed within the EcoTrack software system. It does not claim to issue official sovereign statutory certificates or legally transferable securities without authorization from relevant state environmental regulatory boards.
          </div>

        </div>

      </div>
    </div>
  );
};
