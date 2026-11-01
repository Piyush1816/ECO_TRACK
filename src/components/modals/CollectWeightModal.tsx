import React, { useState } from 'react';
import { 
  X, 
  Scale, 
  Tag, 
  Package, 
  FileCheck, 
  Upload, 
  ShieldCheck, 
  CheckCircle2 
} from 'lucide-react';
import { PickupRequest } from '../../types';
import { store } from '../../lib/store';

interface CollectWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  pickup: PickupRequest | null;
}

export const CollectWeightModal: React.FC<CollectWeightModalProps> = ({
  isOpen,
  onClose,
  pickup
}) => {
  if (!isOpen || !pickup) return null;

  const [actualWeightKg, setActualWeightKg] = useState<number>(pickup.estimatedWeightKg);
  const [itemCount, setItemCount] = useState<number>(pickup.estimatedQuantity);
  const [sealTagNumber, setSealTagNumber] = useState<string>(
    `SEAL-2026-${Math.floor(10000 + Math.random() * 90000)}`
  );
  const [notes, setNotes] = useState<string>('Weighed on certified calibrated fleet digital scale. Tamper seal attached.');
  const [slipFileName, setSlipFileName] = useState<string>('calibrated_scale_readout_slip.jpg');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (actualWeightKg <= 0 || itemCount <= 0 || !sealTagNumber) return;

    store.submitCollectionRecord({
      requestId: pickup.id,
      actualWeightKg,
      itemCount,
      sealTagNumber,
      notes
    });

    setSubmitted(true);
  };

  const handleFinish = () => {
    setSubmitted(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl border border-[#E2E8E4] shadow-xl w-full max-w-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[#E2E8E4]">
          <div>
            <span className="text-[10px] font-mono font-semibold text-[#15803D] uppercase">
              {pickup.requestNumber}
            </span>
            <h3 className="text-base font-bold text-[#17231C]">
              Execute Collection & Log Actual Weight
            </h3>
            <p className="text-xs text-[#64748B]">
              On-site weight record for {pickup.categoryName} ({pickup.userFullName})
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#17231C] hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#15803D] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-[#17231C]">
                Collection Manifest Logged!
              </h4>
              <p className="text-xs text-[#64748B] max-w-md mx-auto mt-2 leading-relaxed">
                Actual weight of <span className="font-bold text-[#17231C]">{actualWeightKg} kg</span> and Security Seal <span className="font-mono text-[#15803D] font-bold">{sealTagNumber}</span> have been submitted to the Admin QA queue for verification.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleFinish}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-[#15803D] rounded-lg hover:bg-[#166534] transition-colors shadow-sm"
              >
                Return to Logistics Queue
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            
            {/* Request Summary */}
            <div className="p-3 bg-[#F8FAF8] rounded-xl border border-[#E2E8E4] flex justify-between items-center">
              <div>
                <span className="text-[#64748B] text-[11px] block">Customer / Address:</span>
                <span className="font-bold text-[#17231C]">{pickup.userFullName}</span>
                <div className="text-[#64748B] text-[11px]">{pickup.pickupAddress}, {pickup.pickupCity}</div>
              </div>
              <div className="text-right">
                <span className="text-[#64748B] text-[11px] block">Estimated Weight:</span>
                <span className="font-mono font-bold text-[#17231C] text-sm">{pickup.estimatedWeightKg} kg</span>
              </div>
            </div>

            {/* Actual Weight & Item Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-[#17231C] mb-1">
                  Actual Calibrated Weight (kg) *
                </label>
                <div className="relative">
                  <Scale className="w-4 h-4 text-[#15803D] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="0.1"
                    step="0.1"
                    required
                    value={actualWeightKg}
                    onChange={(e) => setActualWeightKg(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 bg-[#F8FAF8] border border-[#E2E8E4] rounded-lg font-mono font-bold text-sm text-[#17231C] focus:outline-none focus:ring-1 focus:ring-[#15803D]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#17231C] mb-1">
                  Verified Item Count *
                </label>
                <div className="relative">
                  <Package className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="1"
                    required
                    value={itemCount}
                    onChange={(e) => setItemCount(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 bg-[#F8FAF8] border border-[#E2E8E4] rounded-lg font-mono font-bold text-sm text-[#17231C] focus:outline-none focus:ring-1 focus:ring-[#15803D]"
                  />
                </div>
              </div>
            </div>

            {/* Seal Tag & Slip Upload */}
            <div>
              <label className="block font-medium text-[#17231C] mb-1">
                Tamper-Evident Security Seal Tag Number *
              </label>
              <div className="relative">
                <Tag className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  value={sealTagNumber}
                  onChange={(e) => setSealTagNumber(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-[#F8FAF8] border border-[#E2E8E4] rounded-lg font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#15803D]"
                />
              </div>
              <span className="text-[11px] text-[#64748B] mt-0.5 block">
                Attach physically serialized barcode seal to the collection container.
              </span>
            </div>

            {/* Upload weighing proof */}
            <div>
              <label className="block font-medium text-[#17231C] mb-1">
                Weighing Scale Readout Slip / Photo Proof
              </label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer px-3 py-2 border border-dashed border-[#E2E8E4] rounded-lg hover:border-[#15803D] bg-[#F8FAF8] text-[#64748B] flex items-center gap-2">
                  <Upload className="w-4 h-4 text-[#15803D]" />
                  <span>{slipFileName}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files?.[0]) setSlipFileName(e.target.files[0].name);
                    }}
                  />
                </label>
                <span className="text-[11px] text-emerald-700 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Scale Calibrated
                </span>
              </div>
            </div>

            {/* Notes */}
            <div>
              <label className="block font-medium text-[#17231C] mb-1">
                Collector Field Remarks
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAF8] border border-[#E2E8E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15803D]"
              />
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-[#E2E8E4] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 font-semibold text-[#64748B] hover:text-[#17231C]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors shadow-sm"
              >
                Submit Collection Record
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
