import React, { useState } from 'react';
import { 
  X, 
  Calendar, 
  Clock, 
  MapPin, 
  Package, 
  Scale, 
  FileText, 
  Sparkles, 
  Upload, 
  CheckCircle2,
  AlertCircle,
  Loader2 
} from 'lucide-react';
import { INITIAL_CATEGORIES } from '../../lib/seedData';
import { store } from '../../lib/store';
import { storageService } from '../../services/storageService';

interface NewPickupModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedCategoryId?: string;
}

export const NewPickupModal: React.FC<NewPickupModalProps> = ({
  isOpen,
  onClose,
  preselectedCategoryId
}) => {
  const [categoryId, setCategoryId] = useState(preselectedCategoryId || 'cat-it');
  const [itemDescription, setItemDescription] = useState('');
  const [estimatedQuantity, setEstimatedQuantity] = useState(2);
  const [estimatedWeightKg, setEstimatedWeightKg] = useState(15.0);
  const [pickupAddress, setPickupAddress] = useState('742 Evergreen Terrace, Apt 4B');
  const [pickupCity, setPickupCity] = useState('Metro City');
  const [preferredDate, setPreferredDate] = useState('2026-11-05');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 01:00 PM');
  const [specialNotes, setSpecialNotes] = useState('');
  
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoName, setPhotoName] = useState<string | null>(null);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [createdRequestId, setCreatedRequestId] = useState('');

  if (!isOpen) return null;

  const selectedCategory = INITIAL_CATEGORIES.find(c => c.id === categoryId) || INITIAL_CATEGORIES[0];
  const estimatedPoints = Math.round(estimatedWeightKg * selectedCategory.pointsPerKg);
  const estimatedCO2 = (estimatedWeightKg * selectedCategory.co2FactorPerKg).toFixed(1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!itemDescription || estimatedWeightKg <= 0) return;

    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      let photoUrl: string | undefined = undefined;
      if (photoFile) {
        const uploadRes = await storageService.uploadFile('ewaste-photos', photoFile.name, photoFile);
        if (uploadRes.url) {
          photoUrl = uploadRes.url;
        }
      }

      const newReq = await store.createPickupRequest({
        categoryId,
        itemDescription,
        estimatedQuantity,
        estimatedWeightKg,
        pickupAddress,
        pickupCity,
        preferredDate,
        timeSlot,
        specialNotes: photoUrl ? `${specialNotes} [Photo: ${photoUrl}]`.trim() : specialNotes
      });

      setCreatedRequestId(newReq.requestNumber);
      setSubmitted(true);
    } catch (err: any) {
      console.error('Failed to create pickup request:', err);
      setErrorMessage(err.message || 'Failed to submit pickup request to database.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setSubmitted(false);
    setItemDescription('');
    setPhotoFile(null);
    setPhotoName(null);
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
              Schedule E-Waste Doorstep Pickup
            </h3>
            <p className="text-xs text-[#64748B]">
              Authorized logistics partners will weigh and provide a tamper-sealed receipt on-site
            </p>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#17231C] hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {errorMessage && (
          <div className="m-5 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Submission Error:</span>
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
              <span className="text-xs font-semibold text-[#15803D] uppercase tracking-wider block">Pickup Registered</span>
              <h4 className="text-xl font-bold text-[#17231C] mt-1">
                Request #{createdRequestId}
              </h4>
              <p className="text-xs text-[#64748B] max-w-md mx-auto mt-2 leading-relaxed">
                Your e-waste pickup request has been saved to the PostgreSQL database and routed to central dispatch. A licensed partner will be assigned to confirm your preferred slot ({preferredDate}, {timeSlot}).
              </p>
            </div>

            <div className="p-4 bg-[#F8FAF8] rounded-xl border border-[#E2E8E4] max-w-md mx-auto text-xs grid grid-cols-2 gap-3 text-left">
              <div>
                <span className="text-[#64748B] block">Category:</span>
                <span className="font-semibold text-[#17231C]">{selectedCategory.name}</span>
              </div>
              <div>
                <span className="text-[#64748B] block">Estimated Weight:</span>
                <span className="font-semibold text-[#17231C]">{estimatedWeightKg} kg</span>
              </div>
              <div>
                <span className="text-[#64748B] block">Expected Eco-Points:</span>
                <span className="font-semibold text-[#15803D]">+{estimatedPoints} pts</span>
              </div>
              <div>
                <span className="text-[#64748B] block">CO₂ Abatement:</span>
                <span className="font-semibold text-emerald-700">{estimatedCO2} kg CO₂</span>
              </div>
            </div>

            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={handleResetAndClose}
                className="px-6 py-2.5 text-xs font-semibold text-white bg-[#15803D] rounded-lg hover:bg-[#166534] transition-colors shadow-sm"
              >
                Track in Dashboard
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs">
            
            {/* Category Selector */}
            <div>
              <label className="block font-medium text-[#17231C] mb-1.5">
                Select Electronics Stream *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {INITIAL_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategoryId(cat.id)}
                    className={`p-2.5 rounded-lg border text-left transition-all ${
                      categoryId === cat.id
                        ? 'border-[#15803D] bg-emerald-50/60 ring-1 ring-[#15803D]'
                        : 'border-[#E2E8E4] bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[10px] text-[#64748B]">{cat.code}</span>
                      <span className="text-[10px] font-semibold text-[#15803D]">+{cat.pointsPerKg}p/kg</span>
                    </div>
                    <div className="font-bold text-[#17231C] mt-1 text-xs truncate">
                      {cat.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block font-medium text-[#17231C] mb-1">
                Item Inventory & Description *
              </label>
              <textarea
                required
                rows={2}
                placeholder="e.g. 2 Old Laptops, 1 CRT Monitor, 3 Power Cables, 1 Tablet with swollen battery"
                value={itemDescription}
                onChange={(e) => setItemDescription(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAF8] border border-[#E2E8E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15803D]"
              />
            </div>

            {/* Quantity and Weight estimation */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-[#17231C] mb-1">
                  Estimated Item Count
                </label>
                <div className="relative">
                  <Package className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="1"
                    max="1000"
                    value={estimatedQuantity}
                    onChange={(e) => setEstimatedQuantity(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 bg-[#F8FAF8] border border-[#E2E8E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15803D]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#17231C] mb-1">
                  Estimated Weight (kg) *
                </label>
                <div className="relative">
                  <Scale className="w-4 h-4 text-[#15803D] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    required
                    value={estimatedWeightKg}
                    onChange={(e) => setEstimatedWeightKg(Number(e.target.value))}
                    className="w-full pl-9 pr-3 py-2 bg-[#F8FAF8] border border-[#E2E8E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15803D]"
                  />
                </div>
              </div>
            </div>

            {/* Live Incentive Banner */}
            <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#10B981]" />
                <span className="text-[#17231C]">Estimated Citizen Reward:</span>
              </div>
              <div className="flex items-center gap-3 font-semibold">
                <span className="text-[#15803D] tabular-nums font-mono text-sm">+{estimatedPoints} Eco-Points</span>
                <span className="text-emerald-700 tabular-nums font-mono text-xs">({estimatedCO2} kg CO₂)</span>
              </div>
            </div>

            {/* Address */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-medium text-[#17231C] mb-1">
                  Pickup Street Address *
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    required
                    value={pickupAddress}
                    onChange={(e) => setPickupAddress(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#F8FAF8] border border-[#E2E8E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15803D]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#17231C] mb-1">
                  City / Zone *
                </label>
                <input
                  type="text"
                  required
                  value={pickupCity}
                  onChange={(e) => setPickupCity(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAF8] border border-[#E2E8E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15803D]"
                />
              </div>
            </div>

            {/* Date & Time Slot */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-medium text-[#17231C] mb-1">
                  Preferred Pickup Date *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    required
                    value={preferredDate}
                    onChange={(e) => setPreferredDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#F8FAF8] border border-[#E2E8E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15803D]"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-[#17231C] mb-1">
                  Preferred Time Slot *
                </label>
                <div className="relative">
                  <Clock className="w-4 h-4 text-[#64748B] absolute left-3 top-1/2 -translate-y-1/2" />
                  <select
                    value={timeSlot}
                    onChange={(e) => setTimeSlot(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-[#F8FAF8] border border-[#E2E8E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15803D]"
                  >
                    <option value="09:00 AM - 12:00 PM">Morning (09:00 AM - 12:00 PM)</option>
                    <option value="12:00 PM - 03:00 PM">Afternoon (12:00 PM - 03:00 PM)</option>
                    <option value="03:00 PM - 06:00 PM">Evening (03:00 PM - 06:00 PM)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Notes & Photo Attachment to Supabase Storage */}
            <div>
              <label className="block font-medium text-[#17231C] mb-1">
                Access Instructions / Notes (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Ring Apt 4B buzzer, heavy items located in garage, elevator available"
                value={specialNotes}
                onChange={(e) => setSpecialNotes(e.target.value)}
                className="w-full px-3 py-2 bg-[#F8FAF8] border border-[#E2E8E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15803D]"
              />
            </div>

            <div>
              <label className="block font-medium text-[#17231C] mb-1">
                Attach Item Photograph (Uploaded to Supabase Storage)
              </label>
              <div className="flex items-center gap-3">
                <label className="cursor-pointer px-3 py-2 border border-dashed border-[#E2E8E4] rounded-lg hover:border-[#15803D] bg-[#F8FAF8] text-[#64748B] flex items-center gap-2">
                  <Upload className="w-4 h-4" />
                  <span>{photoName ? photoName : 'Choose Photo...'}</span>
                  <input 
                    type="file" 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setPhotoFile(e.target.files[0]);
                        setPhotoName(e.target.files[0].name);
                      }
                    }}
                  />
                </label>
                {photoName && (
                  <button 
                    type="button" 
                    onClick={() => {
                      setPhotoFile(null);
                      setPhotoName(null);
                    }}
                    className="text-[11px] text-red-600 hover:underline"
                  >
                    Remove
                  </button>
                )}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-4 border-t border-[#E2E8E4] flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleResetAndClose}
                className="px-4 py-2 text-xs font-semibold text-[#64748B] hover:text-[#17231C]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#15803D] hover:bg-[#166534] rounded-lg transition-colors shadow-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Saving to Supabase...</span>
                  </>
                ) : (
                  <span>Confirm Pickup Request</span>
                )}
              </button>
            </div>

          </form>
        )}

      </div>
    </div>
  );
};
