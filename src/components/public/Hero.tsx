import React from 'react';
import { 
  ArrowRight, 
  ShieldCheck, 
  Truck, 
  Factory, 
  Building2, 
  User, 
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { UserRole } from '../../types';
import { store } from '../../lib/store';

interface HeroProps {
  onOpenPickupModal: () => void;
  onNavigateTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const Hero: React.FC<HeroProps> = ({
  onOpenPickupModal,
  onNavigateTab
}) => {
  const state = store.getState();

  // Compute live aggregates from store
  const totalVerifiedWeight = state.eprLedger.reduce((sum, item) => sum + item.verifiedWeightKg, 0)
    + state.pickups.filter(p => p.status === 'verified').reduce((sum, p) => sum + (p.weightVerification?.verifiedWeightKg || 0), 0);
  
  const totalCredits = state.eprLedger.reduce((sum, item) => sum + item.creditAmount, 0);
  const totalCO2SavedKg = Math.round(totalVerifiedWeight * 2.3);

  const roleGateways: Array<{
    role: UserRole;
    title: string;
    description: string;
    icon: React.ComponentType<{ className?: string }>;
    accentColor: string;
    kicker: string;
  }> = [
    {
      role: 'citizen',
      title: 'Citizens & Households',
      kicker: 'Doorstep Collection',
      description: 'Schedule home pickups, track verified scales, earn reward points, and plant verified native trees.',
      icon: User,
      accentColor: 'text-[#15803D]'
    },
    {
      role: 'partner',
      title: 'Collection Partners',
      kicker: 'Logistics Routing',
      description: 'Accept dispatch routes, capture calibrated weights, upload scale photo slips, and seal containers.',
      icon: Truck,
      accentColor: 'text-emerald-600'
    },
    {
      role: 'recycler',
      title: 'Certified Recyclers',
      kicker: 'Material Recovery',
      description: 'Receive sealed batches, log hydrometallurgical yields (Cu, Al, Au), and submit destruction certificates.',
      icon: Factory,
      accentColor: 'text-teal-600'
    },
    {
      role: 'organization',
      title: 'Enterprises & Producers',
      kicker: 'Corporate ITAD & EPR',
      description: 'Bulk electronics decommissioning, automated ESG compliance manifests, and annual EPR fulfillment.',
      icon: Building2,
      accentColor: 'text-emerald-700'
    },
    {
      role: 'admin',
      title: 'Compliance Admins',
      kicker: 'Governance & Auditing',
      description: 'Cross-verify scales, approve facility licenses, consolidate processing batches, and maintain the EPR ledger.',
      icon: ShieldCheck,
      accentColor: 'text-[#15803D]'
    }
  ];

  const handleSelectRoleGateway = (role: UserRole) => {
    store.switchRole(role);
    onNavigateTab('dashboard');
  };

  return (
    <section className="relative overflow-hidden pt-8 pb-16 lg:pt-14 lg:pb-24">
      {/* Background Subtle Gradient Field */}
      <div className="absolute inset-0 bg-gradient-to-b from-emerald-50/50 via-white to-[#F8FAF8] -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Top Kicker Label */}
        <div className="flex items-center gap-2 text-xs font-semibold text-[#15803D] uppercase tracking-wider mb-3">
          <span>Enterprise E-Waste Stewardship</span>
          <span aria-hidden="true" className="text-[#64748B]">·</span>
          <span>EPR Compliance Platform</span>
        </div>

        {/* Hero Headline & Intro */}
        <div className="max-w-3xl mb-8">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-[#17231C] leading-[1.15] text-balance">
            Transparent e-waste collection, verified recovery, and EPR credit ledger.
          </h1>
          <p className="mt-4 text-base sm:text-lg text-[#64748B] leading-relaxed">
            EcoTrack connects citizens, authorized collection partners, and certified recyclers into an immutable chain of custody. Every kilogram of electronic scrap is tracked from pickup to refined secondary materials.
          </p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 mb-12">
          <button
            onClick={onOpenPickupModal}
            className="flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-[#15803D] rounded-lg hover:bg-[#166534] transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-[#15803D] focus:ring-offset-2 whitespace-nowrap shrink-0"
          >
            <span>Schedule E-Waste Pickup</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          <button
            onClick={() => onNavigateTab('epr-ledger')}
            className="flex items-center gap-2 px-5 py-3 text-sm font-medium text-[#17231C] bg-white border border-[#E2E8E4] rounded-lg hover:bg-slate-50 transition-colors shadow-sm whitespace-nowrap shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4 text-[#15803D]" />
            <span>Explore EPR Credit Ledger</span>
          </button>
          <button
            onClick={() => onNavigateTab('how-it-works')}
            className="text-sm font-medium text-[#64748B] hover:text-[#15803D] px-2 py-3 transition-colors whitespace-nowrap"
          >
            View 6-Stage Process →
          </button>
        </div>

        {/* Proof of Impact: Full-width KPI Strip (adjacent to claim) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-white rounded-xl border border-[#E2E8E4] shadow-xs mb-14">
          <div className="px-2">
            <span className="block text-xs font-medium text-[#64748B] uppercase tracking-wider">Verified Diverted</span>
            <div className="mt-1 text-2xl lg:text-3xl font-extrabold text-[#17231C] tabular-nums font-mono">
              {totalVerifiedWeight.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })} <span className="text-sm font-normal text-[#64748B] font-sans">kg</span>
            </div>
            <span className="text-[11px] text-emerald-700 font-medium mt-0.5 flex items-center gap-1">
              <CheckCircle2 className="w-3 h-3 inline" /> 100% Calibrated Scale Cross-Checked
            </span>
          </div>

          <div className="px-2 border-l border-[#E2E8E4]">
            <span className="block text-xs font-medium text-[#64748B] uppercase tracking-wider">CO₂ Abated</span>
            <div className="mt-1 text-2xl lg:text-3xl font-extrabold text-[#17231C] tabular-nums font-mono">
              {totalCO2SavedKg.toLocaleString('en-US')} <span className="text-sm font-normal text-[#64748B] font-sans">kg</span>
            </div>
            <span className="text-[11px] text-[#64748B] mt-0.5 block">
              Based on EPA / WEEE LCA factors
            </span>
          </div>

          <div className="px-2 border-t md:border-t-0 md:border-l border-[#E2E8E4] pt-3 md:pt-0">
            <span className="block text-xs font-medium text-[#64748B] uppercase tracking-wider">EPR Credits Generated</span>
            <div className="mt-1 text-2xl lg:text-3xl font-extrabold text-[#15803D] tabular-nums font-mono">
              {totalCredits.toLocaleString('en-US', { minimumFractionDigits: 1, maximumFractionDigits: 1 })}
            </div>
            <span className="text-[11px] text-[#64748B] mt-0.5 block">
              1 credit per verified kg recycled
            </span>
          </div>

          <div className="px-2 border-t md:border-t-0 md:border-l border-[#E2E8E4] pt-3 md:pt-0">
            <span className="block text-xs font-medium text-[#64748B] uppercase tracking-wider">Traceability Rating</span>
            <div className="mt-1 text-2xl lg:text-3xl font-extrabold text-[#17231C] tabular-nums font-mono">
              99.8%
            </div>
            <span className="text-[11px] text-[#64748B] mt-0.5 block">
              Zero unverified landfill disposal
            </span>
          </div>
        </div>

        {/* Role Gateways Section */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-2">
            <div>
              <span className="text-xs font-semibold text-[#15803D] uppercase tracking-wider">Role-Based Workspaces</span>
              <h2 className="text-xl sm:text-2xl font-bold text-[#17231C]">
                Explore EcoTrack by stakeholder role
              </h2>
            </div>
            <p className="text-xs text-[#64748B]">
              Click any card to immediately jump into that role's interactive live dashboard
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {roleGateways.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.role}
                  onClick={() => handleSelectRoleGateway(item.role)}
                  className="group cursor-pointer p-4 bg-white rounded-xl border border-[#E2E8E4] hover:border-[#15803D] hover:shadow-md transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-[#F8FAF8] border border-[#E2E8E4] flex items-center justify-center mb-3 group-hover:bg-emerald-50 transition-colors">
                      <Icon className={`w-5 h-5 ${item.accentColor}`} />
                    </div>
                    <span className="text-[11px] font-semibold text-[#15803D] block">{item.kicker}</span>
                    <h3 className="text-sm font-bold text-[#17231C] mt-0.5">{item.title}</h3>
                    <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-[#E2E8E4] flex items-center justify-between text-xs font-semibold text-[#15803D]">
                    <span>Enter Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
};
