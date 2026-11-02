import React, { useState } from 'react';
import { 
  X, 
  User, 
  Truck, 
  Factory, 
  Building2, 
  ShieldCheck, 
  ArrowRight, 
  LogIn, 
  UserPlus, 
  Zap,
  Check,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { UserRole } from '../../types';
import { useAuth } from '../../contexts/AuthContext';
import { DEMO_CREDENTIALS } from '../../services/authService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  initialRole?: UserRole;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  initialRole = 'citizen'
}) => {
  const { login, loginDemoPersona, register, isConfigured } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'demo' | 'login' | 'register'>('demo');
  const [selectedRole, setSelectedRole] = useState<UserRole>(initialRole);
  
  // Login form state
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register form state
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regOrgName, setRegOrgName] = useState('');
  const [regPassword, setRegPassword] = useState('');

  // Feedback & Loading
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleQuickSwitch = async (role: UserRole) => {
    setErrorMessage(null);
    setSuccessNotice(null);
    setIsSubmitting(true);

    const res = await loginDemoPersona(role);
    setIsSubmitting(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMessage(res.error || 'Authentication failed. Please verify Supabase configuration.');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    setErrorMessage(null);
    setSuccessNotice(null);
    setIsSubmitting(true);

    const res = await login(loginEmail, loginPassword);
    setIsSubmitting(false);

    if (res.success) {
      onSuccess();
      onClose();
    } else {
      setErrorMessage(res.error || 'Invalid credentials or user does not exist.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regEmail || !regFullName || !regPassword) return;

    setErrorMessage(null);
    setSuccessNotice(null);
    setIsSubmitting(true);

    const res = await register({
      fullName: regFullName,
      email: regEmail,
      password: regPassword,
      phone: regPhone,
      role: selectedRole,
      organizationName: regOrgName
    });
    setIsSubmitting(false);

    if (res.success) {
      if (res.emailConfirmationRequired) {
        setSuccessNotice('Registration successful! Please check your email to confirm your account.');
      } else {
        onSuccess();
        onClose();
      }
    } else {
      setErrorMessage(res.error || 'Registration failed. Please check inputs.');
    }
  };

  const roleMeta: Record<UserRole, { label: string; icon: React.ComponentType<{ className?: string }>; desc: string }> = {
    citizen: {
      label: 'Citizen / Household',
      icon: User,
      desc: 'Schedule e-waste pickups, earn rewards & plant trees.'
    },
    partner: {
      label: 'Collection Partner',
      icon: Truck,
      desc: 'Field logistics, on-site weighing & container sealing.'
    },
    recycler: {
      label: 'Certified Recycler',
      icon: Factory,
      desc: 'Refining facility, hydrometallurgy & material yields.'
    },
    organization: {
      label: 'Enterprise / Producer',
      icon: Building2,
      desc: 'Bulk ITAD decommissioning & annual EPR compliance.'
    },
    admin: {
      label: 'System Administrator',
      icon: ShieldCheck,
      desc: 'Scale QA, approvals, batch routing & EPR ledger.'
    }
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
            <h3 className="text-base font-bold text-[#17231C]">
              EcoTrack Access Portal
            </h3>
            <p className="text-xs text-[#64748B]">
              Authenticated via Supabase PostgreSQL & Auth
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#64748B] hover:text-[#17231C] hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E2E8E4] bg-[#F8FAF8] text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('demo');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 px-4 text-center transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'demo'
                ? 'bg-white text-[#15803D] border-b-2 border-[#15803D]'
                : 'text-[#64748B] hover:text-[#17231C]'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-amber-500" />
            <span>Test Personas</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('login');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 px-4 text-center transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'login'
                ? 'bg-white text-[#15803D] border-b-2 border-[#15803D]'
                : 'text-[#64748B] hover:text-[#17231C]'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Log In</span>
          </button>
          <button
            onClick={() => {
              setActiveTab('register');
              setErrorMessage(null);
            }}
            className={`flex-1 py-3 px-4 text-center transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-white text-[#15803D] border-b-2 border-[#15803D]'
                : 'text-[#64748B] hover:text-[#17231C]'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Register Role</span>
          </button>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="m-4 p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Authentication Error:</span>
              <span>{errorMessage}</span>
            </div>
          </div>
        )}

        {successNotice && (
          <div className="m-4 p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold block">Notice:</span>
              <span>{successNotice}</span>
            </div>
          </div>
        )}

        {/* Tab Body */}
        <div className="p-6">
          
          {/* TAB 1: Real Supabase Demo Personas */}
          {activeTab === 'demo' && (
            <div className="space-y-4">
              <div className="p-3 bg-emerald-50/80 rounded-lg border border-emerald-100 text-xs text-emerald-900">
                <span className="font-semibold block">⚡ Real Supabase Persona Sign-In:</span>
                Authenticates directly via Supabase Auth with secure role profiles retrieved from PostgreSQL.
              </div>

              <div className="space-y-2">
                {(['citizen', 'partner', 'recycler', 'organization', 'admin'] as UserRole[]).map((role) => {
                  const meta = roleMeta[role];
                  const Icon = meta.icon;
                  const creds = DEMO_CREDENTIALS[role];

                  return (
                    <button
                      key={role}
                      disabled={isSubmitting}
                      onClick={() => handleQuickSwitch(role)}
                      className="w-full p-3 rounded-xl border border-[#E2E8E4] hover:border-[#15803D] hover:bg-[#F8FAF8] text-left transition-all flex items-center justify-between group disabled:opacity-50"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-white border border-[#E2E8E4] flex items-center justify-center text-[#15803D] shrink-0">
                          <Icon className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-[#17231C]">
                              {creds.name}
                            </span>
                            <span className="text-[10px] font-semibold text-[#15803D] uppercase bg-emerald-100/60 px-1.5 py-0.2 rounded">
                              {role}
                            </span>
                          </div>
                          <span className="text-[11px] text-[#64748B] block mt-0.5">
                            {creds.email} · {meta.desc}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#15803D]">
                        {isSubmitting ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                            Sign In <ArrowRight className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: Standard Login */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#17231C] mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  placeholder="e.g. citizen@ecotrack.org"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15803D]"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-[#17231C] mb-1">
                  Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15803D]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Sign In with Supabase Auth</span>}
                </button>
              </div>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('demo')}
                  className="text-xs text-[#15803D] hover:underline"
                >
                  Or authenticate with pre-configured Test Personas →
                </button>
              </div>
            </form>
          )}

          {/* TAB 3: Register New Account */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#17231C] mb-1">
                  Select Role Workspace *
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {(['citizen', 'partner', 'recycler', 'organization'] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      type="button"
                      onClick={() => setSelectedRole(role)}
                      className={`p-2 rounded-lg border text-xs font-medium capitalize text-left transition-colors ${
                        selectedRole === role
                          ? 'border-[#15803D] bg-emerald-50 text-[#15803D] font-bold'
                          : 'border-[#E2E8E4] text-[#64748B] hover:bg-slate-50'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#17231C] mb-1">
                    Full Name / Contact Person *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Alex Morgan"
                    value={regFullName}
                    onChange={(e) => setRegFullName(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15803D]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#17231C] mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    required
                    placeholder="alex@example.com"
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15803D]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#17231C] mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15803D]"
                  />
                </div>

                {(selectedRole === 'organization' || selectedRole === 'partner' || selectedRole === 'recycler') && (
                  <div>
                    <label className="block text-xs font-medium text-[#17231C] mb-1">
                      Company / Facility Name *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Organization Ltd."
                      value={regOrgName}
                      onChange={(e) => setRegOrgName(e.target.value)}
                      className="w-full px-3 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15803D]"
                    />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#17231C] mb-1">
                  Create Password *
                </label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-[#F8FAF8] border border-[#E2E8E4] rounded-lg focus:outline-none focus:ring-1 focus:ring-[#15803D]"
                />
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-2.5 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-semibold rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Create Supabase Account</span>}
                </button>
              </div>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};
