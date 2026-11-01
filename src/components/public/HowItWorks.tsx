import React, { useState } from 'react';
import { 
  CalendarClock, 
  Truck, 
  Scale, 
  ShieldCheck, 
  Factory, 
  FileCheck2, 
  Check, 
  ArrowRight
} from 'lucide-react';

export const HowItWorks: React.FC<{ onSchedulePickup: () => void }> = ({ onSchedulePickup }) => {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      step: '01',
      title: 'Digital Pickup Request',
      actor: 'Citizen or Enterprise',
      icon: CalendarClock,
      summary: 'Users catalog discarded electronic hardware, estimate quantity and weight, and select preferred pickup dates.',
      details: [
        'Select standardized e-waste categories (ITEW, CEEW, Batteries)',
        'Automatic carbon savings and reward point estimation',
        'Optional photo attachment and special handling instructions',
        'Tamper-resistant digital manifest generation'
      ],
      systemOutput: 'REQ-2026-0891 registered with status "requested"'
    },
    {
      step: '02',
      title: 'Partner Dispatch & Route Scheduling',
      actor: 'Platform Administrator & Logistics Partner',
      icon: Truck,
      summary: 'Admin reviews the geographic zone and dispatches the pickup to an authorized licensed collection agency.',
      details: [
        'Fleet partner reviews material hazard level and weight estimate',
        'Partner accepts dispatch or rejects with capacity rationale',
        'Vehicle registration and field agent assigned',
        'Citizen notified of confirmed arrival window'
      ],
      systemOutput: 'Assigned to EcoHaul Logistics; vehicle EV-TRK-708'
    },
    {
      step: '03',
      title: 'On-Site Weighing & Tamper Sealing',
      actor: 'Collection Partner Field Agent',
      icon: Scale,
      summary: 'Collector arrives on-site with calibrated digital scale, records actual kilogram weight, and attaches serialized security seal.',
      details: [
        'Calibrated scale weighing with photo capture',
        'Digital weighing slip uploaded with GPS coordinates',
        'Anti-tamper serialized seal barcode tagged to bin',
        'Real-time collection manifest timestamped'
      ],
      systemOutput: 'Actual weight 42.5 kg logged; Seal #SEAL-2026-88194'
    },
    {
      step: '04',
      title: 'Admin Weight Cross-Verification',
      actor: 'Compliance Administrator',
      icon: ShieldCheck,
      summary: 'Platform QA officers cross-reference partner scale logs against weighing slips to confirm legitimate material quantities.',
      details: [
        'Tolerance variance calculation (Flag if > 15% discrepancy)',
        'Formal approval or adjustment of verified weight',
        'Instant reward points credited to citizen account',
        'Status promoted to "verified", ready for batch consolidation'
      ],
      systemOutput: 'Verified at 42.5 kg (0.0% variance); +425 Eco-Points awarded'
    },
    {
      step: '05',
      title: 'Recycling Batch Consolidation',
      actor: 'Consolidated Logistics & Recycler',
      icon: Factory,
      summary: 'Multiple verified pickups are consolidated into a bulk transport manifest and routed to authorized recovery plants.',
      details: [
        'Hazardous waste movement pass issued under environmental guidelines',
        'Facility verifies tamper seals and physical gross weight',
        'Material triage: optical separation, shredding, and hydrometallurgy',
        'Zero-landfill certified recovery operations'
      ],
      systemOutput: 'Batch BATCH-2026-0042 dispatched to GreenCycle Refining'
    },
    {
      step: '06',
      title: 'Yield Verification & EPR Credit Ledger',
      actor: 'Auditor & EPR Compliance Office',
      icon: FileCheck2,
      summary: 'Recycler submits verified recovery breakdown (Copper, Gold, Aluminum, Plastics) and immutable EPR ledger entry is generated.',
      details: [
        'Quantified yield logging (e.g., 88.5kg Cu, 142kg Al, 42.8g Au)',
        'Environmental destruction certificate generated',
        'Cryptographic hash logged in permanent compliance ledger',
        'Corporate producers receive verifiable ESG and EPR audit credits'
      ],
      systemOutput: 'EPR-REC-2026-00084 issued (592.0 credits verified)'
    }
  ];

  return (
    <section className="py-14 lg:py-20 bg-[#F8FAF8] border-b border-[#E2E8E4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Heading */}
        <div className="max-w-3xl mb-12">
          <span className="text-xs font-semibold text-[#15803D] uppercase tracking-wider">End-to-End Traceability</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-[#17231C] mt-1">
            How EcoTrack guarantees an unbroken chain of custody
          </h2>
          <p className="mt-2 text-sm sm:text-base text-[#64748B]">
            From your residential doorstep or enterprise server room to certified hydrometallurgical refining, every stage is verified by licensed operators.
          </p>
        </div>

        {/* 6 Steps Interactive Horizontal Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 mb-8">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            const isCurrent = activeStep === idx;
            return (
              <button
                key={item.step}
                onClick={() => setActiveStep(idx)}
                className={`p-3 text-left rounded-lg border transition-all ${
                  isCurrent 
                    ? 'bg-white border-[#15803D] shadow-sm ring-1 ring-[#15803D]' 
                    : 'bg-white/60 border-[#E2E8E4] hover:bg-white text-[#64748B]'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={`text-xs font-mono font-bold ${isCurrent ? 'text-[#15803D]' : 'text-[#64748B]'}`}>
                    {item.step}
                  </span>
                  <Icon className={`w-4 h-4 ${isCurrent ? 'text-[#15803D]' : 'text-[#64748B]'}`} />
                </div>
                <div className={`text-xs font-bold leading-snug line-clamp-2 ${isCurrent ? 'text-[#17231C]' : 'text-[#64748B]'}`}>
                  {item.title}
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Step Deep-Dive Showcase */}
        <div className="bg-white rounded-2xl border border-[#E2E8E4] p-6 lg:p-8 shadow-xs">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            <div className="lg:col-span-7">
              <div className="flex items-center gap-2 text-xs font-semibold text-[#15803D] uppercase tracking-wider mb-1">
                <span>Stage {steps[activeStep].step} of 06</span>
                <span aria-hidden="true" className="text-[#64748B]">·</span>
                <span>Actor: {steps[activeStep].actor}</span>
              </div>
              <h3 className="text-2xl font-bold text-[#17231C]">
                {steps[activeStep].title}
              </h3>
              <p className="mt-3 text-sm text-[#64748B] leading-relaxed">
                {steps[activeStep].summary}
              </p>

              <div className="mt-6 space-y-2.5">
                {steps[activeStep].details.map((detail, dIdx) => (
                  <div key={dIdx} className="flex items-start gap-2.5 text-xs text-[#17231C]">
                    <div className="w-4 h-4 rounded-full bg-emerald-100 flex items-center justify-center text-[#15803D] shrink-0 mt-0.5">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                    <span>{detail}</span>
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-6 border-t border-[#E2E8E4] flex flex-wrap items-center gap-4">
                <button
                  onClick={onSchedulePickup}
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#15803D] rounded-lg hover:bg-[#166534] transition-colors shadow-sm"
                >
                  Start at Step 01: Request Pickup
                </button>
                <div className="flex items-center gap-1.5 text-xs text-[#64748B]">
                  <button 
                    disabled={activeStep === 0} 
                    onClick={() => setActiveStep(prev => Math.max(0, prev - 1))}
                    className="px-2.5 py-1.5 border border-[#E2E8E4] rounded-md hover:bg-slate-50 disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <button 
                    disabled={activeStep === steps.length - 1} 
                    onClick={() => setActiveStep(prev => Math.min(steps.length - 1, prev + 1))}
                    className="px-2.5 py-1.5 border border-[#E2E8E4] rounded-md hover:bg-slate-50 disabled:opacity-40 font-medium text-[#15803D]"
                  >
                    Next Stage →
                  </button>
                </div>
              </div>
            </div>

            {/* Right Card: Real Output Manifest Simulator */}
            <div className="lg:col-span-5 bg-[#F8FAF8] rounded-xl p-5 border border-[#E2E8E4]">
              <span className="text-[11px] font-semibold text-[#64748B] uppercase tracking-wider block mb-2">
                Chain of Custody Data Record
              </span>
              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 bg-white rounded-lg border border-[#E2E8E4]">
                  <div className="text-[11px] text-[#64748B] font-sans">Active Status Transition</div>
                  <div className="font-bold text-[#15803D] mt-0.5">{steps[activeStep].systemOutput}</div>
                </div>

                <div className="p-3 bg-white rounded-lg border border-[#E2E8E4] space-y-1.5">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#64748B] font-sans">Security Seal:</span>
                    <span className="font-medium text-[#17231C]">TAMPER-EVIDENT-BARCODE</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#64748B] font-sans">Scale Calibration:</span>
                    <span className="font-medium text-[#17231C]">ISO/IEC 17025 VERIFIED</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-[#64748B] font-sans">EPR Eligibility:</span>
                    <span className="font-medium text-emerald-700">CPCB FORM 6 COMPLIANT</span>
                  </div>
                </div>

                <div className="text-[11px] text-[#64748B] font-sans pt-1">
                  💡 Every transaction in EcoTrack is cross-verified before inclusion in the Extended Producer Responsibility (EPR) ledger.
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
