import React, { useState } from 'react';
import { 
  X, 
  Scale, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  ArrowRight,
  Sparkles,
  Loader2
} from 'lucide-react';
import { PickupRequest } from '../../types';
import { store } from '../../lib/store';
import { INITIAL_CATEGORIES } from '../../lib/seedData';

interface VerifyWeightModalProps {
  isOpen: boolean;
  onClose: () => void;
  pickup: PickupRequest | null;
}

export const VerifyWeightModal: React.FC<VerifyWeightModalProps> = ({
  isOpen,
  onClose,
  pickup
}) => {
  if (!isOpen || !pickup) return null;

  const actualWeight = pickup.collectionRecord?.actualWeightKg || pickup.estimatedWeightKg;
  const [verifiedWeightKg, setVerifiedWeightKg] = useState<number>(actualWeight);
  const [notes, setNotes] = useState<string>(
    'Verified against digital scale readout and field collector slip. Zero discrepancies identified.'
  );
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const category = INITIAL_CATEGORIES.find(c => c.id === pickup.categoryId) || INITIAL_CATEGORIES[0];
  const pointsAwarded = Math.round(verifiedWeightKg * category.pointsPerKg);
  const varianceKg = Number((verifiedWeightKg - actualWeight).toFixed(2));
  const estimatedDiffKg = Number((verifiedWeightKg - pickup.estimatedWeightKg).toFixed(2));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (verifiedWeightKg <= 0) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await store.verifyWeight({
        requestId: pickup.id,
        verifiedWeightKg,
        notes
      });

      setSubmitted(true);
    } catch (err: any) {
      console.error('Failed to verify weight:', err);
      setErrorMessage(err.message || 'Failed to verify weight in Supabase database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    setSubmitted(false);
    setErrorMessage(null);
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
              Admin Weight Verification Terminal
            </h3>
            <p className="text-xs text-[#64748B]">
              Quality Assurance & Mass Balance Cross-Check in PostgreSQL
            </p>
          </div>
          <button
            onClick={handleFinish}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#17231C] hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="m-5 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Verification Error:</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#15803D] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-[#17231C]">
                Weight Successfully Verified in PostgreSQL!
              </h4>
              <p className="text-xs text-[#64748B] max-w-md mx-auto mt-2 leading-relaxed">
                Official verified weight of <span className="font-bold text-[#17231C]">{verifiedWeightKg} kg</span> approved. <span className="font-bold text-[#15803D]">+{pointsAwarded} Eco-Points</span> credited to {pickup.userFullName}. Record is ready for recycling batch consolidation.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleFinish}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-[#15803D] rounded-lg hover:bg-[#166534] transition-colors shadow-sm"
              >
                Back to Admin Dashboard
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
            
            {/* Weight Comparison Matrix */}
            <div className="grid grid-cols-2 gap-3 p-3 bg-[#F8FAF8] rounded-xl border border-[#E2E8E4]">
              <div>
                <span className="text-[11px] text-[#64748B] block">Initial User Estimate:</span>
                <span className="text-sm font-mono font-bold text-[#17231C]">{pickup.estimatedWeightKg} kg</span>
                <div className="text-[10px] text-[#64748B]">{pickup.estimatedQuantity} items declared</div>
              </div>

              <div>
                <span className="text-[11px] text-[#64748B] block">Collector Field Weight:</span>
                <span className="text-sm font-mono font-bold text-emerald-800">{actualWeight} kg</span>
                <div className="text-[10px] text-[#64748B]">Seal #{pickup.collectionRecord?.sealTagNumber || 'N/A'}</div>
              </div>
            </div>

            {/* Variance indicator */}
            <div className="flex items-center justify-between p-3 rounded-lg border text-xs bg-emerald-50/60 border-emerald-100 text-emerald-900">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#15803D]" />
                <span>Field Scale Variance vs Estimate:</span>
              </div>
              <span className="font-mono font-bold">
                {estimatedDiffKg >= 0 ? `+${estimatedDiffKg}` : estimatedDiffKg} kg ({((estimatedDiffKg / pickup.estimatedWeightKg) * 100).toFixed(1)}%)
              </span>
            </div>

            {/* Verified Weight Input */}
            <div>
              <label className="block font-medium text-[#17231C] mb-1">
                Final Verified Weight (kg) *
              </label>
              <div className="relative">
                <Scale className="w-4 h-4 text-[#15803D] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="0.1"
                  step="0.1"
                  required
                  value={verifiedWeightKg}
                  onChange={(e) => setVerifiedWeightKg(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 bg-[#F8FAF8] border border-[#E2E8E4] rounded-lg font-mono font-bold text-sm text-[#17231C] focus:outline-none focus:ring-1 focus:ring-[#15803D]"
                />
              </div>
              <span className="text-[11px] text-[#64748B] mt-0.5 block">
                Approved weight will be locked into the batch consolidation manifest.
              </span>
            </div>

            {/* Points Award Preview */}
            <div className="p-3 bg-amber-50/70 rounded-lg border border-amber-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span className="text-[#17231C]">Citizen Reward Points to Allocate:</span>
              </div>
              <span className="font-mono font-bold text-amber-800 text-sm">+{pointsAwarded} pts</span>
            </div>

            {/* Verification Notes */}
            <div>
              <label className="block font-medium text-[#17231C] mb-1">
                QA Verification Audit Notes
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAF8] border border-[#E2E8E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15803D]"
              />
            </div>

            {/* Submit Actions */}
            <div className="pt-4 border-t border-[#E2E8E4] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleFinish}
                className="px-4 py-2 font-semibold text-[#64748B] hover:text-[#17231C]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Verifying Weight...</span>
                  </>
                ) : (
                  <span>Approve & Credit Weight</span>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
