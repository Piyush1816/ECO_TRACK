import React, { useState, useEffect } from 'react';
import { 
  Home, 
  Calendar, 
  Layers, 
  FileSpreadsheet, 
  Award, 
  BarChart3, 
  Users, 
  Truck, 
  Factory, 
  Building2, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  RefreshCw,
  Scale
} from 'lucide-react';
import { store, AppState } from './lib/store';
import { PickupRequest, EWasteBatch, EprLedgerEntry, UserRole } from './types';
import { useAuth } from './contexts/AuthContext';

// Public Components
import { Navbar } from './components/public/Navbar';
import { Hero } from './components/public/Hero';
import { HowItWorks } from './components/public/HowItWorks';
import { AcceptedEWaste } from './components/public/AcceptedEWaste';
import { OurImpact } from './components/public/OurImpact';
import { EprLedgerView } from './components/public/EprLedgerView';
import { Contact } from './components/public/Contact';
import { Footer } from './components/public/Footer';
import { AuthModal } from './components/public/AuthModal';

// Dashboard Components
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { CitizenDashboard } from './components/dashboard/CitizenDashboard';
import { PartnerDashboard } from './components/dashboard/PartnerDashboard';
import { RecyclerDashboard } from './components/dashboard/RecyclerDashboard';
import { OrganizationDashboard } from './components/dashboard/OrganizationDashboard';
import { AdminDashboard } from './components/dashboard/AdminDashboard';
import { SupabaseModal } from './components/dashboard/SupabaseModal';

// Workflow Modals
import { NewPickupModal } from './components/modals/NewPickupModal';
import { CollectWeightModal } from './components/modals/CollectWeightModal';
import { VerifyWeightModal } from './components/modals/VerifyWeightModal';
import { CreateBatchModal } from './components/modals/CreateBatchModal';
import { ProcessRecyclingModal } from './components/modals/ProcessRecyclingModal';
import { EprCertificateModal } from './components/modals/EprCertificateModal';

export default function App() {
  const { profile, user, role } = useAuth();
  const [appState, setAppState] = useState<AppState>(store.getState());
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [activeDashboardSubTab, setActiveDashboardSubTab] = useState<string>('overview');

  // Modal visibility states
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [supabaseModalOpen, setSupabaseModalOpen] = useState(false);
  const [newPickupModalOpen, setNewPickupModalOpen] = useState(false);
  const [preselectedCategoryId, setPreselectedCategoryId] = useState<string | undefined>(undefined);
  
  const [collectWeightModalOpen, setCollectWeightModalOpen] = useState(false);
  const [targetPickupForCollect, setTargetPickupForCollect] = useState<PickupRequest | null>(null);

  const [verifyWeightModalOpen, setVerifyWeightModalOpen] = useState(false);
  const [targetPickupForVerify, setTargetPickupForVerify] = useState<PickupRequest | null>(null);

  const [createBatchModalOpen, setCreateBatchModalOpen] = useState(false);

  const [processRecyclingModalOpen, setProcessRecyclingModalOpen] = useState(false);
  const [targetBatchForRecycle, setTargetBatchForRecycle] = useState<EWasteBatch | null>(null);

  const [certificateModalOpen, setCertificateModalOpen] = useState(false);
  const [targetCertificateEntry, setTargetCertificateEntry] = useState<EprLedgerEntry | null>(null);

  // Initialize store and load data on auth profile change
  useEffect(() => {
    store.init(profile);
  }, [profile]);

  // Subscribe to store updates
  useEffect(() => {
    const unsubscribe = store.subscribe((newState) => {
      setAppState({ ...newState });
    });
    return () => unsubscribe();
  }, []);

  const currentUser = profile || appState.currentUser;

  // Handlers
  const handleOpenPickupWithCategory = (catId: string) => {
    setPreselectedCategoryId(catId);
    setNewPickupModalOpen(true);
  };

  const handleOpenCollectWeight = (pickup: PickupRequest) => {
    setTargetPickupForCollect(pickup);
    setCollectWeightModalOpen(true);
  };

  const handleOpenVerifyWeight = (pickup: PickupRequest) => {
    setTargetPickupForVerify(pickup);
    setVerifyWeightModalOpen(true);
  };

  const handleOpenProcessYield = (batch: EWasteBatch) => {
    setTargetBatchForRecycle(batch);
    setProcessRecyclingModalOpen(true);
  };

  const handleOpenCertificate = (entry: EprLedgerEntry) => {
    setTargetCertificateEntry(entry);
    setCertificateModalOpen(true);
  };

  // Role-specific nav items for dashboard
  const getNavItemsForRole = (role: UserRole) => {
    switch (role) {
      case 'citizen':
        return [
          { id: 'overview', label: 'Overview', icon: Home },
          { 
            id: 'pickups', 
            label: 'My Pickups & Slips', 
            icon: Calendar,
            badge: appState.pickups.filter(p => p.userId === currentUser.id).length 
          },
          { 
            id: 'rewards', 
            label: 'Eco-Points Store', 
            icon: Award,
            badge: `${currentUser.rewardPoints} pts` 
          }
        ];
      case 'partner':
        return [
          { id: 'overview', label: 'Logistics Overview', icon: Home },
          { 
            id: 'dispatches', 
            label: 'Assigned Pickups', 
            icon: Truck,
            badge: appState.pickups.filter(p => p.assignment?.partnerId === currentUser.id && p.status !== 'recycled').length 
          }
        ];
      case 'recycler':
        return [
          { id: 'overview', label: 'Facility Dashboard', icon: Home },
          { 
            id: 'batches', 
            label: 'Inbound Batches', 
            icon: Factory,
            badge: appState.batches.filter(b => b.recyclerId === currentUser.id || b.recyclerId === 'user-recycler').length 
          }
        ];
      case 'organization':
        return [
          { id: 'overview', label: 'Enterprise Compliance', icon: Home },
          { 
            id: 'itad', 
            label: 'Bulk ITAD Manifests', 
            icon: Building2,
            badge: appState.pickups.filter(p => p.organizationId || p.userId === currentUser.id).length 
          }
        ];
      case 'admin':
        return [
          { id: 'overview', label: 'Admin Command', icon: Home },
          { 
            id: 'dispatch', 
            label: 'Partner Dispatch', 
            icon: Truck,
            badge: appState.pickups.filter(p => p.status === 'requested').length 
          },
          { 
            id: 'verification', 
            label: 'Scale QA Verifications', 
            icon: Scale,
            badge: appState.pickups.filter(p => p.status === 'collected' && !p.weightVerification).length 
          },
          { 
            id: 'batches', 
            label: 'Recycling Batches', 
            icon: Layers,
            badge: appState.batches.length 
          },
          { 
            id: 'epr-ledger', 
            label: 'EPR Credit Ledger', 
            icon: FileSpreadsheet,
            badge: appState.eprLedger.length 
          }
        ];
      default:
        return [{ id: 'overview', label: 'Overview', icon: Home }];
    }
  };

  const verifiedPickupsForBatch = appState.pickups.filter(p => p.status === 'verified');

  return (
    <div className="min-h-screen bg-[#F8FAF8] text-[#17231C] font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* If in Dashboard Mode */}
      {currentTab === 'dashboard' ? (
        <DashboardLayout
          navItems={getNavItemsForRole(currentUser.role)}
          activeSubTab={activeDashboardSubTab}
          setActiveSubTab={setActiveDashboardSubTab}
          onReturnHome={() => setCurrentTab('home')}
          onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
        >
          {currentUser.role === 'citizen' && (
            <CitizenDashboard
              onOpenNewPickup={() => {
                setPreselectedCategoryId(undefined);
                setNewPickupModalOpen(true);
              }}
              activeSubTab={activeDashboardSubTab}
            />
          )}

          {currentUser.role === 'partner' && (
            <PartnerDashboard
              onOpenCollectWeight={handleOpenCollectWeight}
              activeSubTab={activeDashboardSubTab}
            />
          )}

          {currentUser.role === 'recycler' && (
            <RecyclerDashboard
              onOpenProcessYield={handleOpenProcessYield}
              activeSubTab={activeDashboardSubTab}
            />
          )}

          {currentUser.role === 'organization' && (
            <OrganizationDashboard
              onOpenNewPickup={() => {
                setPreselectedCategoryId('cat-it');
                setNewPickupModalOpen(true);
              }}
              onOpenCertificateModal={handleOpenCertificate}
              activeSubTab={activeDashboardSubTab}
            />
          )}

          {currentUser.role === 'admin' && (
            <AdminDashboard
              onOpenVerifyWeight={handleOpenVerifyWeight}
              onOpenCreateBatch={() => setCreateBatchModalOpen(true)}
              onOpenCertificateModal={handleOpenCertificate}
              activeSubTab={activeDashboardSubTab}
            />
          )}
        </DashboardLayout>
      ) : (
        /* Public Website Mode */
        <div className="flex flex-col min-h-screen">
          <Navbar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            onOpenAuth={() => setAuthModalOpen(true)}
            onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
          />

          <main className="flex-1">
            {currentTab === 'home' && (
              <>
                <Hero
                  onOpenPickupModal={() => {
                    setPreselectedCategoryId(undefined);
                    setNewPickupModalOpen(true);
                  }}
                  onNavigateTab={(tab) => setCurrentTab(tab)}
                  onOpenAuth={() => setAuthModalOpen(true)}
                />
                <HowItWorks 
                  onSchedulePickup={() => {
                    setPreselectedCategoryId(undefined);
                    setNewPickupModalOpen(true);
                  }} 
                />
                <AcceptedEWaste onSelectCategoryForPickup={handleOpenPickupWithCategory} />
                <OurImpact 
                  onSchedulePickup={() => {
                    setPreselectedCategoryId(undefined);
                    setNewPickupModalOpen(true);
                  }} 
                />
                <EprLedgerView onOpenCertificateModal={handleOpenCertificate} />
                <Contact />
              </>
            )}

            {currentTab === 'how-it-works' && (
              <HowItWorks 
                onSchedulePickup={() => {
                  setPreselectedCategoryId(undefined);
                  setNewPickupModalOpen(true);
                }} 
              />
            )}

            {currentTab === 'accepted-ewaste' && (
              <AcceptedEWaste onSelectCategoryForPickup={handleOpenPickupWithCategory} />
            )}

            {currentTab === 'our-impact' && (
              <OurImpact 
                onSchedulePickup={() => {
                  setPreselectedCategoryId(undefined);
                  setNewPickupModalOpen(true);
                }} 
              />
            )}

            {currentTab === 'epr-ledger' && (
              <EprLedgerView onOpenCertificateModal={handleOpenCertificate} />
            )}

            {currentTab === 'contact' && (
              <Contact />
            )}
          </main>

          <Footer
            onNavigateTab={(tab) => setCurrentTab(tab)}
            onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
          />
        </div>
      )}

      {/* Global Modals */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => setCurrentTab('dashboard')}
      />

      <SupabaseModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
      />

      <NewPickupModal
        isOpen={newPickupModalOpen}
        onClose={() => setNewPickupModalOpen(false)}
        preselectedCategoryId={preselectedCategoryId}
      />

      <CollectWeightModal
        isOpen={collectWeightModalOpen}
        onClose={() => {
          setCollectWeightModalOpen(false);
          setTargetPickupForCollect(null);
        }}
        pickup={targetPickupForCollect}
      />

      <VerifyWeightModal
        isOpen={verifyWeightModalOpen}
        onClose={() => {
          setVerifyWeightModalOpen(false);
          setTargetPickupForVerify(null);
        }}
        pickup={targetPickupForVerify}
      />

      <CreateBatchModal
        isOpen={createBatchModalOpen}
        onClose={() => setCreateBatchModalOpen(false)}
        verifiedPickups={verifiedPickupsForBatch}
      />

      <ProcessRecyclingModal
        isOpen={processRecyclingModalOpen}
        onClose={() => {
          setProcessRecyclingModalOpen(false);
          setTargetBatchForRecycle(null);
        }}
        batch={targetBatchForRecycle}
      />

      <EprCertificateModal
        isOpen={certificateModalOpen}
        onClose={() => {
          setCertificateModalOpen(false);
          setTargetCertificateEntry(null);
        }}
        entry={targetCertificateEntry}
      />

    </div>
  );
}
