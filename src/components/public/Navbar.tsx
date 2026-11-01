import React, { useState } from 'react';
import { 
  Recycle, 
  ChevronDown, 
  Database, 
  User, 
  ArrowRight, 
  Menu, 
  X,
  ShieldCheck,
  Truck,
  Building2,
  Factory
} from 'lucide-react';
import { UserRole } from '../../types';
import { store } from '../../lib/store';
import { getSupabaseConfig } from '../../lib/supabase';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuth: () => void;
  onOpenSupabaseModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenAuth,
  onOpenSupabaseModal
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const currentUser = store.getCurrentUser();
  const supabaseConfig = getSupabaseConfig();

  const handleRoleSelect = (role: UserRole) => {
    store.switchRole(role);
    setRoleMenuOpen(false);
  };

  const navLinks = [
    { id: 'home', label: 'Home' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'accepted-ewaste', label: 'Accepted E-Waste' },
    { id: 'our-impact', label: 'Our Impact' },
    { id: 'epr-ledger', label: 'EPR Ledger' },
    { id: 'contact', label: 'Contact' }
  ];

  const roleLabels: Record<UserRole, { label: string; icon: React.ComponentType<{ className?: string }> }> = {
    citizen: { label: 'Citizen', icon: User },
    partner: { label: 'Collection Partner', icon: Truck },
    recycler: { label: 'Recycler', icon: Factory },
    organization: { label: 'Organization', icon: Building2 },
    admin: { label: 'Administrator', icon: ShieldCheck }
  };

  const CurrentRoleIcon = roleLabels[currentUser.role]?.icon || User;

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E2E8E4]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-8">
          
          {/* Zone 1: Brand Wordmark */}
          <button 
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-2.5 text-left group whitespace-nowrap shrink-0 focus:outline-none"
          >
            <div className="w-9 h-9 rounded-lg bg-[#15803D] flex items-center justify-center text-white shadow-sm group-hover:bg-[#166534] transition-colors">
              <Recycle className="w-5 h-5" />
            </div>
            <div>
              <span className="text-lg font-bold tracking-tight text-[#17231C]">
                EcoTrack
              </span>
              <span className="hidden sm:inline-block text-[11px] font-medium text-[#64748B] ml-2 pl-2 border-l border-[#E2E8E4]">
                EPR & E-Waste
              </span>
            </div>
          </button>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-[#64748B]">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => setCurrentTab(link.id)}
                className={`transition-colors whitespace-nowrap shrink-0 hover:text-[#15803D] pb-1 ${
                  currentTab === link.id
                    ? 'text-[#15803D] border-b-2 border-[#15803D] font-semibold'
                    : 'text-[#64748B]'
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Zone 3: Actions & Role Gateway */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Supabase Connection Status Button */}
            <button
              onClick={onOpenSupabaseModal}
              title={supabaseConfig.isConfigured ? 'Supabase Connected' : 'Supabase Not Connected (Using Hybrid Local Store)'}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-medium border transition-colors ${
                supabaseConfig.isConfigured
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-slate-50 border-[#E2E8E4] text-[#64748B] hover:text-[#17231C]'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>{supabaseConfig.isConfigured ? 'Supabase Live' : 'DB Setup'}</span>
            </button>

            {/* Role Switcher Dropdown */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E2E8E4] bg-[#F8FAF8] text-xs font-medium text-[#17231C] hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                <CurrentRoleIcon className="w-3.5 h-3.5 text-[#15803D]" />
                <span className="hidden md:inline font-semibold">{roleLabels[currentUser.role]?.label}</span>
                <span className="md:hidden capitalize">{currentUser.role}</span>
                <ChevronDown className="w-3 h-3 text-[#64748B]" />
              </button>

              {roleMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-[#E2E8E4] py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setRoleMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-[#E2E8E4] text-[11px] font-semibold text-[#64748B] uppercase tracking-wider">
                    Switch Test Persona
                  </div>
                  {(['citizen', 'partner', 'recycler', 'organization', 'admin'] as UserRole[]).map((role) => {
                    const RoleIcon = roleLabels[role].icon;
                    return (
                      <button
                        key={role}
                        onClick={() => handleRoleSelect(role)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors ${
                          currentUser.role === role 
                            ? 'bg-emerald-50 text-[#15803D] font-semibold' 
                            : 'text-[#17231C] hover:bg-slate-50'
                        }`}
                      >
                        <RoleIcon className={`w-4 h-4 ${currentUser.role === role ? 'text-[#15803D]' : 'text-[#64748B]'}`} />
                        <span>{roleLabels[role].label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Launch Dashboard Button */}
            <button
              onClick={() => setCurrentTab('dashboard')}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-[#15803D] rounded-lg hover:bg-[#166534] transition-colors shadow-sm whitespace-nowrap shrink-0"
            >
              <span>Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-1.5 text-[#64748B] hover:text-[#17231C] focus:outline-none"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-3 border-t border-[#E2E8E4] space-y-1">
            {navLinks.map((link) => (
              <button
                key={link.id}
                onClick={() => {
                  setCurrentTab(link.id);
                  setMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-md text-sm font-medium ${
                  currentTab === link.id
                    ? 'bg-emerald-50 text-[#15803D] font-semibold'
                    : 'text-[#17231C] hover:bg-slate-50'
                }`}
              >
                {link.label}
              </button>
            ))}
            <div className="pt-2 border-t border-[#E2E8E4] flex gap-2 px-3">
              <button
                onClick={() => {
                  onOpenSupabaseModal();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-xs py-2 border border-[#E2E8E4] rounded-md text-center text-[#64748B] hover:bg-slate-50"
              >
                Supabase Settings
              </button>
              <button
                onClick={() => {
                  onOpenAuth();
                  setMobileMenuOpen(false);
                }}
                className="w-full text-xs py-2 bg-[#15803D] text-white rounded-md text-center font-medium"
              >
                Sign In / Switch
              </button>
            </div>
          </div>
        )}

      </div>
    </header>
  );
};
