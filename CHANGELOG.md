# Changelog

All notable changes to the **EcoTrack** platform will be documented in this file.

## [2.0.0] - 2026-11-02

### Upgraded to Genuine Supabase Full-Stack Architecture
- **Supabase Authentication**:
  - Replaced simulated client-side switching with real Supabase Auth sessions and JSON Web Tokens.
  - Implemented `src/contexts/AuthContext.tsx` with real-time auth state listeners and profile synchronization.
  - Added authentic demo persona authentication (`authService.signInDemoPersona`) with credentials for all 5 roles.
  - Created automated demo account provisioning script (`scripts/provision-demo-accounts.ts`) with `npm run seed:demo`.
- **Database & Row-Level Security**:
  - Created `supabase/migrations/20261102_security_rls_and_fixes.sql`.
  - Added non-recursive security definer helper functions `public.is_admin()` and `public.get_auth_role()`.
  - Enforced strict RLS policies across all 16 tables.
  - Added automated `auth.users` profile synchronization trigger (`on_auth_user_created`).
  - Added role protection trigger (`trg_protect_profile_role`) to prevent unauthorized role escalation.
  - Fixed variance calculation with database trigger computing `verified_weight_kg - actual_weight_kg`.
  - Added non-negative check constraints on all weights, quantities, and yields.
- **Supabase Storage Integration**:
  - Configured 4 dedicated private buckets: `ewaste-photos`, `weighing-slips`, `recycling-documents`, and `epr-manifests`.
  - Implemented `storageService.ts` with 10MB file limit, MIME-type validation, and signed URL generation with 1-hour expiry.
- **Modular Service Layer (`src/services/`)**:
  - Implemented dedicated async service modules for Auth, Profiles, Pickups, Assignments, Collections, Weight Verification, Batches, Recycling, EPR, Notifications, Rewards, and Audit Logs.
  - Removed reliance on `localStorage` as an authoritative business database.
  - Added Supabase Realtime channel subscriptions to broadcast instant updates across connected clients.
- **Workflow Modals & Dashboards**:
  - Updated `NewPickupModal`, `CollectWeightModal`, `VerifyWeightModal`, `CreateBatchModal`, and `ProcessRecyclingModal` with asynchronous Supabase submissions, loading spinners, and error alerts.
  - Updated all 5 dashboards to execute async actions with error handling.

## [1.0.0] - 2026-11-01

### Added
- **Public Website**:
  - Landing Hero with high-impact environmental graphics, clear value proposition, and role-based quick starts.
  - Interactive "How It Works" 6-stage lifecycle walkthrough.
  - "Accepted E-Waste" categorizer with hazardous components and recovery potential.
  - "Our Impact" live calculator showing CO2 offsets, heavy metals diverted, and precious metals reclaimed.
  - Contact Inquiry form with instant validation and submission feedback.
  - Authentication portal with real registration/login and instant 1-click test role switcher.
- **5 Complete Role-Based Dashboards**:
  - **Citizen Dashboard**: Pickup scheduling, active tracking timeline, verified weight records, rewards redemption store, and personal CO2 savings.
  - **Collection Partner Dashboard**: Dispatch queue, accept/reject assignments, schedule pickup, record actual collected weights, upload weighing proof, and submit for verification.
  - **Recycler Dashboard**: Inbound batch confirmation, material processing fractions (Copper, Aluminum, Gold, Plastics, Glass, Hazardous Residue), and recycling certificates.
  - **Organization Dashboard**: Bulk ITAD requests, enterprise chain of custody, ESG compliance reports, and annual EPR quota tracking.
  - **Admin Dashboard**: Master compliance overview, partner/recycler approvals, assignment dispatcher, weight cross-verification with tolerance flags, batch consolidation, recycling yield verification, immutable EPR ledger, and system audit logs.
- **Data & Initial Relational Design**:
  - Initial PostgreSQL migration (`supabase/migrations/20261101_init_ecotrack.sql`) with 16 tables.
  - In-app Supabase Connection Modal for configuring and testing credentials.
