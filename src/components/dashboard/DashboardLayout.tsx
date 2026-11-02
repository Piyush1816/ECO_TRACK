import React, { useState } from 'react';
import { 
  Recycle, 
  Bell, 
  ChevronDown, 
  LogOut, 
  Settings, 
  User, 
  Truck, 
  Factory, 
  Building2, 
  ShieldCheck, 
  ArrowLeft, 
  Menu, 
  X, 
  Database,
  CheckCircle2,
  ExternalLink
} from 'lucide-react';
import { UserRole, NotificationItem } from '../../types';
import { store } from '../../lib/store';
import { getSupabaseConfig } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';

interface NavItem {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

interface DashboardLayoutProps {
  navItems: NavItem[];
  activeSubTab: string;
  setActiveSubTab: (id: string) => void;
  onReturnHome: () => void;
  onOpenSupabaseModal: () => void;
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({
  navItems,
  activeSubTab,
  setActiveSubTab,
  onReturnHome,
  onOpenSupabaseModal,
  children
}) => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  const { logout, loginDemoPersona } = useAuth();
  const currentUser = store.getCurrentUser();
  const state = store.getState();
  const supabaseConfig = getSupabaseConfig();

  const userNotifications = state.notifications.filter(
    n => n.userId === currentUser.id || n.userId === 'all'
  );
  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  const roleMeta: Record<UserRole, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
    citizen: { label: 'Citizen', icon: User, color: 'text-[#15803D]' },
    partner: { label: 'Collection Partner', icon: Truck, color: 'text-emerald-600' },
    recycler: { label: 'Certified Recycler', icon: Factory, color: 'text-teal-600' },
    organization: { label: 'Enterprise / Producer', icon: Building2, color: 'text-emerald-700' },
    admin: { label: 'Administrator', icon: ShieldCheck, color: 'text-[#15803D]' }
  };

  const CurrentRoleIcon = roleMeta[currentUser.role]?.icon || User;

  const handleRoleSelect = async (role: UserRole) => {
    try {
      await loginDemoPersona(role);
      await store.switchRole(role);
    } catch (e) {
      console.warn('Demo persona switch notice:', e);
      await store.switchRole(role);
    }
    setRoleMenuOpen(false);
  };

  const currentNav = navItems.find(i => i.id === activeSubTab);

  return (
    <div className="min-h-screen bg-[#F8FAF8] flex text-[#17231C]">
      
      {/* Desktop Sidebar (260px) */}
      <aside className="hidden lg:flex w-64 bg-white border-r border-[#E2E8E4] flex-col justify-between shrink-0 sticky top-0 h-screen z-30">
        <div>
          {/* Brand Wordmark & Role Indicator */}
          <div className="p-4 border-b border-[#E2E8E4]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-[#15803D] flex items-center justify-center text-white shadow-xs">
                <Recycle className="w-4 h-4" />
              </div>
              <div>
                <span className="font-bold text-base text-[#17231C] tracking-tight block">
                  EcoTrack
                </span>
                <span className="text-[10px] font-semibold text-[#15803D] uppercase tracking-wider block">
                  {roleMeta[currentUser.role]?.label} Workspace
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSubTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveSubTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-[#15803D] font-bold'
                      : 'text-[#64748B] hover:text-[#17231C] hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-[#15803D]' : 'text-[#64748B]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold ${
                      isActive ? 'bg-[#15803D] text-white' : 'bg-slate-100 text-[#64748B]'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer: User Card & Return to Public Site */}
        <div className="p-3 border-t border-[#E2E8E4] space-y-2">
          
          <div className="p-2.5 bg-[#F8FAF8] rounded-lg border border-[#E2E8E4] flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#15803D] flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser.fullName.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-[#17231C] truncate block">
                {currentUser.fullName}
              </span>
              <span className="text-[10px] text-[#64748B] truncate block">
                {currentUser.email}
              </span>
            </div>
          </div>

          <button
            onClick={onReturnHome}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-medium text-[#64748B] hover:text-[#17231C] hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-[#E2E8E4]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Public Website</span>
          </button>

          <button
            onClick={async () => {
              await logout();
              onReturnHome();
            }}
            className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-transparent"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* Top Header Bar */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-[#E2E8E4] h-14 flex items-center justify-between px-4 sm:px-6 lg:px-8">
          
          {/* Breadcrumb Left Zone */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-1.5 text-[#64748B] hover:text-[#17231C] focus:outline-none"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs text-[#64748B]">
              <span className="font-semibold text-[#17231C] capitalize">{currentUser.role} Workspace</span>
              <span aria-hidden="true">/</span>
              <span className="text-[#15803D] font-medium">{currentNav?.label || 'Overview'}</span>
            </div>
          </div>

          {/* Right Action Zone */}
          <div className="flex items-center gap-2 sm:gap-3">
            
            {/* Supabase Cloud Connection Indicator */}
            <button
              onClick={onOpenSupabaseModal}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border transition-colors ${
                supabaseConfig.isConfigured
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  : 'bg-[#F8FAF8] border-[#E2E8E4] text-[#64748B] hover:text-[#17231C]'
              }`}
              title="Click to view database settings"
            >
              <Database className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">{supabaseConfig.isConfigured ? 'Supabase Live' : 'DB Setup'}</span>
            </button>

            {/* Notifications Menu */}
            <div className="relative">
              <button
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 text-[#64748B] hover:text-[#17231C] hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-600 ring-2 ring-white" />
                )}
              </button>

              {notificationsOpen && (
                <div 
                  className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-[#E2E8E4] p-3 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setNotificationsOpen(false)}
                >
                  <div className="flex items-center justify-between pb-2 border-b border-[#E2E8E4] mb-2">
                    <span className="text-xs font-bold text-[#17231C]">Notifications ({unreadCount} unread)</span>
                    <button
                      onClick={() => store.markAllNotificationsAsRead(currentUser.id)}
                      className="text-[11px] text-[#15803D] hover:underline"
                    >
                      Mark all as read
                    </button>
                  </div>

                  <div className="space-y-2 max-h-72 overflow-y-auto">
                    {userNotifications.length === 0 ? (
                      <div className="py-6 text-center text-xs text-[#64748B]">
                        No notifications yet.
                      </div>
                    ) : (
                      userNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => store.markNotificationAsRead(notif.id)}
                          className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors ${
                            notif.isRead 
                              ? 'bg-white border-[#E2E8E4] text-[#64748B]' 
                              : 'bg-emerald-50/50 border-emerald-100 text-[#17231C]'
                          }`}
                        >
                          <div className="font-semibold">{notif.title}</div>
                          <div className="text-[11px] text-[#64748B] mt-0.5">{notif.message}</div>
                          <div className="text-[10px] text-[#94A3B8] mt-1">
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Quick Role Switcher Button */}
            <div className="relative">
              <button
                onClick={() => setRoleMenuOpen(!roleMenuOpen)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-[#E2E8E4] bg-[#F8FAF8] text-xs font-semibold text-[#17231C] hover:bg-slate-100 transition-colors whitespace-nowrap"
              >
                <CurrentRoleIcon className="w-3.5 h-3.5 text-[#15803D]" />
                <span className="hidden sm:inline">{roleMeta[currentUser.role]?.label}</span>
                <ChevronDown className="w-3 h-3 text-[#64748B]" />
              </button>

              {roleMenuOpen && (
                <div 
                  className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-[#E2E8E4] py-1 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onMouseLeave={() => setRoleMenuOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-[#E2E8E4] text-[10px] font-bold text-[#64748B] uppercase tracking-wider">
                    Switch Test Persona
                  </div>
                  {(['citizen', 'partner', 'recycler', 'organization', 'admin'] as UserRole[]).map((role) => {
                    const RoleIcon = roleMeta[role].icon;
                    return (
                      <button
                        key={role}
                        onClick={() => handleRoleSelect(role)}
                        className={`w-full flex items-center gap-2.5 px-3 py-2 text-xs text-left transition-colors ${
                          currentUser.role === role 
                            ? 'bg-emerald-50 text-[#15803D] font-bold' 
                            : 'text-[#17231C] hover:bg-slate-50'
                        }`}
                      >
                        <RoleIcon className={`w-4 h-4 ${currentUser.role === role ? 'text-[#15803D]' : 'text-[#64748B]'}`} />
                        <span>{roleMeta[role].label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Settings Trigger */}
            <button
              onClick={() => setSettingsOpen(true)}
              className="p-2 text-[#64748B] hover:text-[#17231C] hover:bg-slate-100 rounded-lg transition-colors"
              title="Profile & Workspace Settings"
            >
              <Settings className="w-4 h-4" />
            </button>

          </div>
        </header>

        {/* Dashboard Child Viewport */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>

      </div>

      {/* Mobile Drawer */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div className="fixed inset-0 bg-black/40" onClick={() => setMobileSidebarOpen(false)} />
          <div className="relative w-72 bg-white flex flex-col justify-between p-4 z-10 shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-[#E2E8E4]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-[#15803D] flex items-center justify-center text-white">
                    <Recycle className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-[#17231C] text-sm">EcoTrack Workspace</span>
                </div>
                <button onClick={() => setMobileSidebarOpen(false)}>
                  <X className="w-5 h-5 text-[#64748B]" />
                </button>
              </div>

              <nav className="py-4 space-y-1">
                {navItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeSubTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveSubTab(item.id);
                        setMobileSidebarOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-semibold ${
                        isActive
                          ? 'bg-emerald-50 text-[#15803D]'
                          : 'text-[#64748B] hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </div>
                      {item.badge !== undefined && (
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-100">
                          {item.badge}
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>
            </div>

            <div className="pt-4 border-t border-[#E2E8E4] space-y-2">
              <button
                onClick={() => {
                  onReturnHome();
                  setMobileSidebarOpen(false);
                }}
                className="w-full text-xs py-2 bg-slate-100 rounded-lg text-[#17231C] font-medium"
              >
                Back to Public Site
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {settingsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl border border-[#E2E8E4] p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#E2E8E4] pb-3">
              <h3 className="font-bold text-sm text-[#17231C]">Profile & Workspace Settings</h3>
              <button onClick={() => setSettingsOpen(false)}>
                <X className="w-4 h-4 text-[#64748B]" />
              </button>
            </div>
            
            <div className="space-y-3 text-xs">
              <div>
                <label className="text-[#64748B] block mb-1">Full Name</label>
                <input 
                  type="text" 
                  defaultValue={currentUser.fullName} 
                  className="w-full px-3 py-2 bg-[#F8FAF8] border border-[#E2E8E4] rounded-lg"
                />
              </div>
              <div>
                <label className="text-[#64748B] block mb-1">Email</label>
                <input 
                  type="email" 
                  disabled 
                  defaultValue={currentUser.email} 
                  className="w-full px-3 py-2 bg-slate-100 border border-[#E2E8E4] rounded-lg text-[#64748B]"
                />
              </div>
              <div>
                <label className="text-[#64748B] block mb-1">Role Permission Tier</label>
                <div className="p-2 bg-emerald-50 rounded text-[#15803D] font-bold uppercase text-[11px]">
                  {currentUser.role}
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E2E8E4] flex justify-end gap-2">
              <button
                onClick={() => setSettingsOpen(false)}
                className="px-4 py-2 text-xs font-semibold bg-[#15803D] text-white rounded-lg"
              >
                Close Settings
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
