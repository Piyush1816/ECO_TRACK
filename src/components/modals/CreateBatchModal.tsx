import React, { useState } from 'react';
import { 
  X, 
  Factory, 
  Package, 
  FileCheck, 
  Scale, 
  CheckCircle2, 
  Truck, 
  Check,
  AlertCircle,
  Loader2 
} from 'lucide-react';
import { store } from '../../lib/store';
import { PickupRequest } from '../../types';

interface CreateBatchModalProps {
  isOpen: boolean;
  onClose: () => void;
  verifiedPickups: PickupRequest[];
}

export const CreateBatchModal: React.FC<CreateBatchModalProps> = ({
  isOpen,
  onClose,
  verifiedPickups
}) => {
  if (!isOpen) return null;

  const state = store.getState();
  const recyclers = state.recyclers.map(r => r.profile);
  
  const [selectedRecyclerId, setSelectedRecyclerId] = useState<string>(
    recyclers[0]?.id || 'user-recycler'
  );
  const [selectedRequestIds, setSelectedRequestIds] = useState<string[]>(
    verifiedPickups.map(p => p.id)
  );
  const [manifestNumber, setManifestNumber] = useState<string>(
    `MNF-CPCB-2026-${Math.floor(1000 + Math.random() * 9000)}`
  );
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [createdBatchNumber, setCreatedBatchNumber] = useState('');

  const toggleSelect = (id: string) => {
    setSelectedRequestIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const selectedPickups = verifiedPickups.filter(p => selectedRequestIds.includes(p.id));
  const totalBatchWeight = selectedPickups.reduce((sum, p) => 
    sum + (p.weightVerification?.verifiedWeightKg || p.collectionRecord?.actualWeightKg || p.estimatedWeightKg), 0
  );
  const totalItems = selectedPickups.reduce((sum, p) => sum + (p.collectionRecord?.itemCount || p.estimatedQuantity), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedRequestIds.length === 0 || !selectedRecyclerId) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const newBatch = await store.createRecyclingBatch({
        recyclerId: selectedRecyclerId,
        requestIds: selectedRequestIds,
        manifestNumber
      });

      setCreatedBatchNumber(newBatch.batchNumber);
      setSubmitted(true);
    } catch (err: any) {
      console.error('Failed to create batch in Supabase:', err);
      setErrorMessage(err.message || 'Failed to dispatch recycling batch to database.');
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
        className="bg-white rounded-2xl border border-[#E2E8E4] shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 bg-white/95 backdrop-blur-md flex items-center justify-between p-5 border-b border-[#E2E8E4] z-10">
          <div>
            <h3 className="text-base font-bold text-[#17231C]">
              Consolidate Verified E-Waste Batch
            </h3>
            <p className="text-xs text-[#64748B]">
              Dispatch sealed e-waste shipment with CPCB transport manifest to certified recycler
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
              <span className="font-semibold block">Batch Consolidation Error:</span>
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
              <span className="text-xs font-semibold text-[#15803D] uppercase tracking-wider block">Shipment Dispatched</span>
              <h4 className="text-xl font-bold text-[#17231C] mt-1">
                Batch #{createdBatchNumber} Logged in PostgreSQL
              </h4>
              <p className="text-xs text-[#64748B] max-w-md mx-auto mt-2 leading-relaxed">
                Consolidated batch containing <span className="font-bold text-[#17231C]">{totalBatchWeight.toFixed(1)} kg</span> across {selectedPickups.length} verified collections dispatched under Manifest <span className="font-mono text-[#15803D] font-bold">{manifestNumber}</span>.
              </p>
            </div>

            <div className="pt-2">
              <button
                onClick={handleFinish}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-[#15803D] rounded-lg hover:bg-[#166534] transition-colors shadow-sm"
              >
                Back to Admin Batch Management
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
            
            {/* Recycler Facility Selector */}
            <div>
              <label className="block font-medium text-[#17231C] mb-1.5">
                Authorized Recovery & Refining Facility *
              </label>
              <select
                value={selectedRecyclerId}
                onChange={(e) => setSelectedRecyclerId(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAF8] border border-[#E2E8E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15803D]"
              >
                {recyclers.length === 0 ? (
                  <option value="user-recycler">GreenCycle Refining Inc. (CPCB Certified Facility)</option>
                ) : (
                  recyclers.map((rec) => (
                    <option key={rec.id} value={rec.id}>
                      {rec.organizationName || rec.fullName} (CPCB Certified Facility)
                    </option>
                  ))
                )}
              </select>
            </div>

            {/* Manifest Number */}
            <div>
              <label className="block font-medium text-[#17231C] mb-1">
                Hazardous E-Waste Transport Manifest Number *
              </label>
              <input
                type="text"
                required
                value={manifestNumber}
                onChange={(e) => setManifestNumber(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAF8] border border-[#E2E8E4] rounded-lg font-mono text-xs focus:outline-none focus:ring-1 focus:ring-[#15803D]"
              />
            </div>

            {/* Verified Pickups Selection */}
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="font-medium text-[#17231C]">
                  Select Verified Pickups for Consolidation ({selectedRequestIds.length} of {verifiedPickups.length})
                </label>
                <button
                  type="button"
                  onClick={() => {
                    if (selectedRequestIds.length === verifiedPickups.length) {
                      setSelectedRequestIds([]);
                    } else {
                      setSelectedRequestIds(verifiedPickups.map(p => p.id));
                    }
                  }}
                  className="text-[11px] text-[#15803D] hover:underline"
                >
                  {selectedRequestIds.length === verifiedPickups.length ? 'Deselect All' : 'Select All'}
                </button>
              </div>

              {verifiedPickups.length === 0 ? (
                <div className="p-6 text-center text-[#64748B] bg-[#F8FAF8] rounded-xl border border-[#E2E8E4]">
                  No unassigned verified pickups available. Verify incoming collection records first.
                </div>
              ) : (
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {verifiedPickups.map((p) => {
                    const isChecked = selectedRequestIds.includes(p.id);
                    const weight = p.weightVerification?.verifiedWeightKg || p.collectionRecord?.actualWeightKg || p.estimatedWeightKg;
                    return (
                      <div
                        key={p.id}
                        onClick={() => toggleSelect(p.id)}
                        className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between ${
                          isChecked 
                            ? 'bg-emerald-50/50 border-[#15803D]' 
                            : 'bg-white border-[#E2E8E4] hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                            isChecked ? 'bg-[#15803D] border-[#15803D] text-white' : 'border-[#CBD5E1]'
                          }`}>
                            {isChecked && <Check className="w-3 h-3" />}
                          </div>
                          <div>
                            <span className="font-mono font-bold text-[#17231C]">{p.requestNumber}</span>
                            <div className="text-[11px] text-[#64748B]">{p.categoryName} · {p.userFullName}</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-mono font-bold text-[#15803D] tabular-nums">{weight.toFixed(1)} kg</span>
                          <div className="text-[10px] text-[#64748B]">{p.collectionRecord?.itemCount || p.estimatedQuantity} items</div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Total Batch Metrics Bar */}
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] text-emerald-800 uppercase block font-semibold">Total Batch Weight</span>
                <span className="text-xl font-mono font-extrabold text-[#15803D] tabular-nums">
                  {totalBatchWeight.toFixed(1)} kg
                </span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-emerald-800 uppercase block font-semibold">Consolidated Units</span>
                <span className="text-xl font-mono font-extrabold text-[#17231C] tabular-nums">
                  {totalItems} items
                </span>
              </div>
            </div>

            {/* Actions */}
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
                disabled={isSubmitting || selectedRequestIds.length === 0}
                className="px-5 py-2 font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-40"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Dispatching Batch...</span>
                  </>
                ) : (
                  <span>Generate Manifest & Dispatch Batch</span>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
