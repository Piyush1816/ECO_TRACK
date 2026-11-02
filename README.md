# EcoTrack — E-Waste Collection & EPR Credit Management Platform

**EcoTrack** is a production-grade, full-stack environmental technology web application built to streamline electronic waste (e-waste) collection, reverse logistics, verified material recovery, and Extended Producer Responsibility (EPR) credit management.

EcoTrack is connected to **Supabase** (PostgreSQL, Supabase Authentication, Supabase Storage, and Realtime Postgres Changes) with complete non-recursive Row-Level Security (RLS) policies, atomic database triggers, and audit logging.

---

## 🌟 Key Capabilities

- **Role-Based Workspaces**: 5 specialized workspaces for Citizens, Collection Partners, Certified Recyclers, Organizations/Producers, and Platform Administrators.
- **End-to-End Chain of Custody**:
  1. **Citizen / Org Request**: Schedule doorstep pickup with estimated weights, device descriptions, and e-waste category classification.
  2. **Admin Logistics Routing**: Dispatch to authorized Collection Partners by geographic zone and vehicle capacity.
  3. **Collection & On-Site Weighing**: Partner logs actual calibrated weight, photographs seal tags, and uploads digital weighing slips to Supabase Storage.
  4. **Admin Scale QA Verification**: Quality assurance cross-checking with automated variance calculation and automatic citizen eco-points crediting.
  5. **Recycling Dispatch**: Consolidate verified e-waste into sealed manifest batches for processing.
  6. **Material Recovery & Mass Balance**: Recyclers process metals, plastics, glass, and safely dispose of hazardous fractions with strict mass balance checks.
  7. **EPR Credit Ledger**: Tamper-evident ledger logging verified weights, recycling yields, and compliance credits with cryptographic transaction hashes.
- **Environmental Impact Analytics**: Real-time calculations for CO2 emissions prevented, toxic heavy metals diverted, and precious metals reclaimed.
- **Gamified Citizen Incentives**: Eco-points earned per verified kg, redeemable for native tree planting, green tech vouchers, and eco-merchandise.
- **Real Supabase Backend**:
  - PostgreSQL schema with 16 relational tables and constraints.
  - Supabase Auth supporting real signup, login, password resets, and demo account authentication.
  - Non-recursive RLS security policies using `is_admin()` and `get_auth_role()` helper functions.
  - Supabase Storage buckets (`ewaste-photos`, `weighing-slips`, `recycling-documents`, `epr-manifests`) with mime validation and signed URL generation.
  - Realtime subscriptions to `pickup_requests`, `notifications`, `ewaste_batches`, and `epr_ledger`.

---

## 👥 User Roles & Personas

| Role | Demo Credentials | Capabilities |
| :--- | :--- | :--- |
| **Citizen** | `citizen@ecotrack.org` / `EcoCitizen2026!` | Schedule residential pickup, select e-waste categories, track real-time collection stages, view verified weight slips, earn eco-points, redeem rewards, view personal environmental impact. |
| **Collection Partner** | `partner@ecotrack.org` / `EcoPartner2026!` | Receive assigned pickup requests, accept/reject route dispatches, schedule vehicle/agent, capture actual collected weight, upload weighing slip & photos, submit for verification. |
| **Recycler** | `recycler@ecotrack.org` / `EcoRecycler2026!` | Receive consolidated batches, record inbound dock weight, document material separation (Copper, Aluminum, Gold, Glass, Plastics, Hazardous Residue), upload recycling certificates, submit for EPR qualification. |
| **Organization (Bulk Producer)** | `org@ecotrack.org` / `EcoOrg2026!` | Schedule corporate bulk IT asset disposition (ITAD), track enterprise e-waste manifests, monitor annual EPR quota targets, download audit-ready compliance certificates. |
| **Administrator** | `admin@ecotrack.org` / `EcoAdmin2026!` | Route collection assignments, verify weight records, batch e-waste for processing, review recycling yield declarations, maintain EPR ledger, inspect immutable audit logs. |

---

## 🗄️ Database Architecture & Migrations

The database migrations are located in `supabase/migrations/`:

### 1. `20261101_init_ecotrack.sql`
Defines the 16 core relational tables:
1. `profiles`: User accounts, roles (`citizen`, `partner`, `recycler`, `organization`, `admin`), points.
2. `organizations`: Corporate entity data, annual EPR compliance quota.
3. `partner_details`: Collection agency licensing, vehicle fleet size, zones, calibration dates.
4. `recycler_details`: Recycling facility registrations, processing capacity, certified recovery methods.
5. `ewaste_categories`: Standard streams (IT & Telecom, Large Appliances, Small Electronics, Batteries, Lighting).
6. `pickup_requests`: Pickups with status lifecycle (`requested` → `assigned` → `scheduled` → `collected` → `verified` → `batch_assigned` → `recycled`).
7. `pickup_assignments`: Partner dispatch and vehicle assignment records.
8. `collection_records`: On-site actual weight, scale photos, seal tags, GPS coordinates.
9. `weight_verifications`: Cross-verification logs and weight adjustment notes by Admin.
10. `ewaste_batches`: Consolidated shipments to recyclers with manifests.
11. `recycling_records`: Yield declarations of recovered copper, gold, aluminum, plastics, and safe residue disposal.
12. `document_records`: File metadata for weighing slips, manifests, and certificates.
13. `epr_ledger`: Immutable ledger entries with unique references and cryptographic transaction hashes.
14. `notifications`: In-app workflow updates across roles.
15. `rewards` & `reward_redemptions`: Citizen incentives and claim codes.
16. `audit_logs`: Detailed operational and security event trails.

### 2. `20261102_security_rls_and_fixes.sql`
- **Security Definer Functions**: Non-recursive `public.is_admin()` and `public.get_auth_role()` to eliminate RLS infinite recursion.
- **Auth Sync Trigger**: `on_auth_user_created` trigger on `auth.users` automatically synchronizes new signups to `public.profiles`.
- **Role Protection Trigger**: `trg_protect_profile_role` prevents regular users from elevating their role.
- **Variance Trigger**: Computes `variance_kg = verified_weight_kg - actual_weight_kg` from `collection_records`.
- **Row-Level Security Policies**: Enforced on all 16 tables.
- **Storage Buckets & Policies**: Creates `ewaste-photos`, `weighing-slips`, `recycling-documents`, and `epr-manifests` with authenticated upload and read permissions.

---

## 🚀 Setup & Execution

### 1. Configure Environment Variables
Set the following in `.env` (or via the in-app Supabase Config modal):
```env
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-publishable-key"

# For one-time server-side demo provisioning script:
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key"
```

### 2. Run Database Migrations
Execute the SQL files in your Supabase SQL Editor:
1. `supabase/migrations/20261101_init_ecotrack.sql`
2. `supabase/migrations/20261102_security_rls_and_fixes.sql`

### 3. Provision Demo Accounts in Supabase Auth
Run the provisioning script to create the 5 authentic Supabase Auth accounts and seed profiles:
```bash
npm run seed:demo
```

### 4. Run Development Server
```bash
npm run dev
```
Dev server runs at `http://localhost:3000`.

---

## ⚖️ EPR Compliance & Legal Notice
EcoTrack provides an internal compliance management ledger and chain of custody documentation. This software does not claim to issue official sovereign government certificates or legally transferable statutory securities without integration into corresponding state pollution control authorities.
