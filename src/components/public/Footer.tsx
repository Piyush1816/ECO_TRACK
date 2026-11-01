import React from 'react';
import { Recycle, ShieldCheck, Heart } from 'lucide-react';

interface FooterProps {
  onNavigateTab: (tab: string) => void;
  onOpenSupabaseModal: () => void;
}

export const Footer: React.FC<FooterProps> = ({ onNavigateTab, onOpenSupabaseModal }) => {
  return (
    <footer className="bg-white border-t border-[#E2E8E4] text-xs text-[#64748B]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-md bg-[#15803D] flex items-center justify-center text-white">
                <Recycle className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-[#17231C]">
                EcoTrack
              </span>
            </div>
            <p className="text-xs leading-relaxed text-[#64748B]">
              Full-lifecycle e-waste collection, verified recovery logistics, and internal Extended Producer Responsibility (EPR) compliance ledger.
            </p>
            <div className="flex items-center gap-2 pt-1 text-[11px] text-[#15803D] font-medium">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Zero-Landfill Protocol Compliant</span>
            </div>
          </div>

          {/* Platform Navigation */}
          <div>
            <h4 className="font-bold text-[#17231C] text-xs uppercase tracking-wider mb-3">
              Platform Modules
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigateTab('home')} className="hover:text-[#15803D] transition-colors">
                  Home & Overview
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('how-it-works')} className="hover:text-[#15803D] transition-colors">
                  6-Stage Chain of Custody
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('accepted-ewaste')} className="hover:text-[#15803D] transition-colors">
                  Accepted Electronics Catalog
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('our-impact')} className="hover:text-[#15803D] transition-colors">
                  Environmental Impact Calculator
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('epr-ledger')} className="hover:text-[#15803D] transition-colors">
                  Public EPR Credit Ledger
                </button>
              </li>
            </ul>
          </div>

          {/* Role Workspaces */}
          <div>
            <h4 className="font-bold text-[#17231C] text-xs uppercase tracking-wider mb-3">
              Stakeholder Workspaces
            </h4>
            <ul className="space-y-2">
              <li>
                <button onClick={() => onNavigateTab('dashboard')} className="hover:text-[#15803D] transition-colors">
                  Citizen Portal (Pickups & Rewards)
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('dashboard')} className="hover:text-[#15803D] transition-colors">
                  Collection Logistics Partner Console
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('dashboard')} className="hover:text-[#15803D] transition-colors">
                  Certified Recycler Terminal
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('dashboard')} className="hover:text-[#15803D] transition-colors">
                  Enterprise ITAD & ESG Reporting
                </button>
              </li>
              <li>
                <button onClick={() => onNavigateTab('dashboard')} className="hover:text-[#15803D] transition-colors">
                  Administrator Audit & Verification
                </button>
              </li>
            </ul>
          </div>

          {/* Database & Deployment */}
          <div>
            <h4 className="font-bold text-[#17231C] text-xs uppercase tracking-wider mb-3">
              Infrastructure & Auditing
            </h4>
            <p className="text-xs leading-relaxed text-[#64748B] mb-3">
              Built on PostgreSQL with Row Level Security (RLS) and cryptographic ledger hashing.
            </p>
            <button
              onClick={onOpenSupabaseModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#F8FAF8] border border-[#E2E8E4] rounded-lg text-[#17231C] hover:bg-slate-100 transition-colors"
            >
              Configure Supabase Cloud DB
            </button>
          </div>

        </div>

        {/* Legal Disclaimer & Copyright */}
        <div className="pt-8 border-t border-[#E2E8E4] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="text-[11px] text-[#64748B] text-center md:text-left">
            © 2026 EcoTrack Systems. Internal compliance and chain-of-custody platform.
            <div className="text-[10px] text-[#94A3B8] mt-0.5">
              Legal Notice: EcoTrack records are for internal environmental accounting and corporate ESG disclosures; does not issue sovereign statutory certificates without state regulatory authority integration.
            </div>
          </div>
          <div className="flex items-center gap-1 text-[11px] text-[#64748B]">
            <span>Engineered for a clean circular economy</span>
            <Heart className="w-3.5 h-3.5 text-emerald-600 inline" />
          </div>
        </div>

      </div>
    </footer>
  );
};
