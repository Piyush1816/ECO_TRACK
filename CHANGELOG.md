# Changelog

All notable changes to the **EcoTrack** platform will be documented in this file.

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
- **Data & Supabase Integration**:
  - Comprehensive PostgreSQL migration (`supabase/migrations/20261101_init_ecotrack.sql`) with 16 tables, constraints, foreign keys, indexes, and Row-Level Security policies.
  - Hybrid storage layer (`src/lib/store.ts` & `src/lib/supabase.ts`) providing direct Supabase cloud connectivity with graceful offline seed fallback.
  - In-app Supabase Connection Modal for testing credentials.
- **Design & UI**:
  - Tailored environmental color palette (#15803D primary green, #10B981 emerald, #F8FAF8 neutral canvas).
  - Tabular numerals for weights, credits, and timestamps.
  - Recharts integration for collection trends and material recovery breakdowns.
