import React, { useState } from 'react';
import { 
  X, 
  Factory, 
  Sparkles, 
  FileCheck, 
  CheckCircle2, 
  Scale, 
  AlertTriangle, 
  Upload 
} from 'lucide-react';
import { EWasteBatch } from '../../types';
import { store } from '../../lib/store';

interface ProcessRecyclingModalProps {
  isOpen: boolean;
  onClose: () => void;
  batch: EWasteBatch | null;
}

export const ProcessRecyclingModal: React.FC<ProcessRecyclingModalProps> = ({
  isOpen,
  onClose,
  batch
}) => {
  if (!isOpen || !batch) return null;

  const [receivedWeightKg, setReceivedWeightKg] = useState<number>(batch.totalWeightKg);
  // Default realistic yield estimates based on received weight
  const [copperRecoveredKg, setCopperRecoveredKg] = useState<number>(
    Number((batch.totalWeightKg * 0.15).toFixed(1))
  );
  const [aluminumRecoveredKg, setAluminumRecoveredKg] = useState<number>(
    Number((batch.totalWeightKg * 0.24).toFixed(1))
  );
  const [plasticsRecoveredKg, setPlasticsRecoveredKg] = useState<number>(
    Number((batch.totalWeightKg * 0.33).toFixed(1))
  );
  const [preciousMetalsGrams, setPreciousMetalsGrams] = useState<number>(
    Number((batch.totalWeightKg * 0.07).toFixed(1))
  );
  const [glassRecoveredKg, setGlassRecoveredKg] = useState<number>(
    Number((batch.totalWeightKg * 0.06).toFixed(1))
  );
  const [hazardousResidueKg, setHazardousResidueKg] = useState<number>(
    Number((batch.totalWeightKg * 0.03).toFixed(1))
  );
  const [processingMethod, setProcessingMethod] = useState<string>(
    'Hydrometallurgical extraction + Automated optical mechanical polymer sorting (Zero Landfill certified)'
  );
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totalYieldKg = Number((copperRecoveredKg + aluminumRecoveredKg + plasticsRecoveredKg + glassRecoveredKg + hazardousResidueKg).toFixed(1));
  const massBalanceVariance = Number((receivedWeightKg - totalYieldKg).toFixed(1));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (receivedWeightKg <= 0) return;
    setError(null);
    setIsSubmitting(true);

    try {
      await store.submitRecyclingRecord({
        batchId: batch.id,
        receivedWeightKg,
        copperRecoveredKg,
        aluminumRecoveredKg,
        plasticsRecoveredKg,
        preciousMetalsGrams,
        glassRecoveredKg,
        hazardousResidueKg,
        processingMethod
      });
      setSubmitted(true);
    } catch (err: any) {
      console.error('Failed to submit recycling record:', err);
      setError(err.message || 'Failed to submit recycling record to Supabase.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFinish = () => {
    setSubmitted(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl border border-[#E2E8E4] shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md flex items-center justify-between p-5 border-b border-[#E2E8E4] z-10">
          <div>
            <span className="text-[10px] font-mono font-semibold text-[#15803D] uppercase">
              {batch.batchNumber}
            </span>
            <h3 className="text-base font-bold text-[#17231C]">
              Log Material Recovery & Recycling Yield
            </h3>
            <p className="text-xs text-[#64748B]">
              Manifest: {batch.manifestNumber} · Inbound Gross Weight: {batch.totalWeightKg} kg
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
              <span className="text-xs font-semibold text-[#15803D] uppercase tracking-wider block">Yield Logged</span>
              <h4 className="text-xl font-bold text-[#17231C] mt-1">
                Recycling Declaration Submitted
              </h4>
              <p className="text-xs text-[#64748B] max-w-md mx-auto mt-2 leading-relaxed">
                Refining yield of <span className="font-bold text-[#17231C]">{receivedWeightKg} kg</span> submitted to Administrator. Once verified, official EPR compliance credits will be credited into the public ledger.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleFinish}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-[#15803D] rounded-lg hover:bg-[#166534] transition-colors shadow-sm"
              >
                Return to Facility Workboard
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span className="text-xs">{error}</span>
              </div>
            )}
            
            {/* Inbound Received Weight */}
            <div>
              <label className="block font-medium text-[#17231C] mb-1">
                Gross Inbound Weight Checked at Facility (kg) *
              </label>
              <div className="relative">
                <Scale className="w-4 h-4 text-[#15803D] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="1"
                  step="0.1"
                  required
                  value={receivedWeightKg}
                  onChange={(e) => setReceivedWeightKg(Number(e.target.value))}
                  className="w-full pl-9 pr-3 py-2 bg-[#F8FAF8] border border-[#E2E8E4] rounded-lg font-mono font-bold text-sm text-[#17231C] focus:outline-none focus:ring-1 focus:ring-[#15803D]"
                />
              </div>
            </div>

            {/* Recovered Fractions Grid */}
            <div>
              <label className="block font-medium text-[#17231C] mb-2">
                Secondary Material Recovery Breakdown *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                
                <div className="p-3 bg-[#F8FAF8] rounded-lg border border-[#E2E8E4]">
                  <label className="text-[11px] text-[#64748B] block mb-1">Refined Copper (kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    required
                    value={copperRecoveredKg}
                    onChange={(e) => setCopperRecoveredKg(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8E4] rounded font-mono font-bold text-[#17231C]"
                  />
                </div>

                <div className="p-3 bg-[#F8FAF8] rounded-lg border border-[#E2E8E4]">
                  <label className="text-[11px] text-[#64748B] block mb-1">Structural Aluminum (kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    required
                    value={aluminumRecoveredKg}
                    onChange={(e) => setAluminumRecoveredKg(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8E4] rounded font-mono font-bold text-[#17231C]"
                  />
                </div>

                <div className="p-3 bg-[#F8FAF8] rounded-lg border border-[#E2E8E4]">
                  <label className="text-[11px] text-[#64748B] block mb-1">Granulated Plastics (kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    required
                    value={plasticsRecoveredKg}
                    onChange={(e) => setPlasticsRecoveredKg(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8E4] rounded font-mono font-bold text-[#17231C]"
                  />
                </div>

                <div className="p-3 bg-[#F8FAF8] rounded-lg border border-[#E2E8E4]">
                  <label className="text-[11px] text-[#64748B] block mb-1">Optical Cullet Glass (kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    required
                    value={glassRecoveredKg}
                    onChange={(e) => setGlassRecoveredKg(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8E4] rounded font-mono font-bold text-[#17231C]"
                  />
                </div>

                <div className="p-3 bg-amber-50/50 rounded-lg border border-amber-200">
                  <label className="text-[11px] text-amber-900 font-semibold block mb-1">Precious Metals - Au/Ag/Pd (Grams)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    required
                    value={preciousMetalsGrams}
                    onChange={(e) => setPreciousMetalsGrams(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-amber-300 rounded font-mono font-bold text-amber-900"
                  />
                </div>

                <div className="p-3 bg-slate-100 rounded-lg border border-[#E2E8E4]">
                  <label className="text-[11px] text-slate-700 font-semibold block mb-1">Hazardous Residue Encapsulated (kg)</label>
                  <input
                    type="number"
                    min="0"
                    step="0.1"
                    required
                    value={hazardousResidueKg}
                    onChange={(e) => setHazardousResidueKg(Number(e.target.value))}
                    className="w-full px-2.5 py-1.5 bg-white border border-[#E2E8E4] rounded font-mono font-bold text-slate-800"
                  />
                </div>

              </div>
            </div>

            {/* Mass Balance Check */}
            <div className="p-3 bg-[#F8FAF8] rounded-lg border border-[#E2E8E4] flex justify-between items-center">
              <div>
                <span className="text-[11px] text-[#64748B] block">Mass Balance Accounting:</span>
                <span className="font-bold text-[#17231C]">
                  {totalYieldKg} kg accounted of {receivedWeightKg} kg received
                </span>
              </div>
              <span className={`font-mono text-xs font-bold ${Math.abs(massBalanceVariance) < 2 ? 'text-[#15803D]' : 'text-amber-600'}`}>
                {massBalanceVariance === 0 ? 'Exact Match' : `${massBalanceVariance} kg process loss/ash`}
              </span>
            </div>

            {/* Processing Method */}
            <div>
              <label className="block font-medium text-[#17231C] mb-1">
                Refining & De-manufacturing Methodology *
              </label>
              <textarea
                rows={2}
                required
                value={processingMethod}
                onChange={(e) => setProcessingMethod(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAF8] border border-[#E2E8E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15803D]"
              />
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-[#E2E8E4] flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={onClose}
                className="px-4 py-2 font-semibold text-[#64748B] hover:text-[#17231C] disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 font-semibold text-white bg-[#15803D] hover:bg-[#166534] disabled:opacity-60 rounded-lg transition-colors shadow-sm flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Submitting to Supabase...</span>
                  </>
                ) : (
                  <span>Submit Recycling Declaration</span>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
