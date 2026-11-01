# EcoTrack — E-Waste Collection & EPR Credit Management Platform

**EcoTrack** is a full-stack, enterprise-grade environmental technology web platform designed to streamline electronic waste (e-waste) collection, multi-tier logistics, verified material recovery, and Extended Producer Responsibility (EPR) credit ledger tracking.

---

## 🌟 Key Highlights

- **Role-Based Workspaces**: 5 specialized dashboards for Citizens, Collection Partners, Certified Recyclers, Organizations/Producers, and Platform Administrators.
- **End-to-End Chain of Custody**:
  1. **Citizen / Org Request**: Schedule doorstep pickup with estimated weights and e-waste category classification.
  2. **Admin Logistics Routing**: Dispatch to certified Collection Partners by service zone.
  3. **Collection & On-Site Weighing**: Partner logs actual weight, photographs seal tags, and uploads digital weighing slips.
  4. **Admin Weight Verification**: Quality assurance cross-checking with tolerance validation.
  5. **Recycling Dispatch**: Consolidate verified e-waste into sealed manifest batches for processing.
  6. **Material Recovery**: Recyclers process metals, plastics, glass, and safely dispose of hazardous fractions.
  7. **EPR Credit Ledger**: Tamper-evident ledger logging verified weights, recycling yields, and compliance credits.
- **Environmental Impact Analytics**: Real-time calculations for CO2 emissions prevented, toxic heavy metals diverted, and precious metals reclaimed.
- **Gamified Citizen Incentives**: Eco-points earned per verified kg, redeemable for native tree planting, green tech vouchers, and eco-merchandise.
- **Supabase & PostgreSQL Ready**: Complete schema migrations with foreign keys, checks, indexes, and Row-Level Security (RLS) rules.

---

## 👥 User Roles & Capabilities

| Role | Core Workflow & Capabilities |
| :--- | :--- |
| **Citizen** | Schedule residential pickup, select e-waste categories, track real-time collection stages, view verified weight slips, earn eco-points, redeem rewards, view personal environmental impact. |
| **Collection Partner** | Receive assigned pickup requests, accept/reject route dispatches, schedule vehicle/agent, capture actual collected weight, upload weighing slip & photos, submit for verification. |
| **Recycler** | Receive consolidated batches, record inbound weight, document material separation (Copper, Aluminum, Gold, Glass, Plastics, Hazardous Residue), upload recycling certificates, submit for EPR qualification. |
| **Organization (Bulk Producer)** | Schedule corporate bulk IT asset disposition (ITAD), track enterprise e-waste manifests, monitor annual EPR quota targets, download audit-ready compliance certificates. |
| **Administrator** | Approve partners and recyclers, route collection assignments, verify weight records, batch e-waste for processing, review recycling yield declarations, maintain EPR ledger, inspect immutable audit logs. |

---

## 🗄️ Database Architecture (PostgreSQL / Supabase)

EcoTrack features a 16-table relational schema located in `supabase/migrations/20261101_init_ecotrack.sql`:

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

---

## 🚀 Quick Start & Supabase Configuration

### 1. Environment Variables
Copy `.env.example` to `.env`:
```bash
VITE_SUPABASE_URL="https://your-project.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key"
```

### 2. Standalone & Live Preview Mode
EcoTrack contains an integrated **Hybrid Storage Engine**:
- If Supabase environment variables are provided, EcoTrack connects directly to your live Supabase cloud database.
- If running in standalone preview or before setting up Supabase, EcoTrack seamlessly utilizes its rich, interactive local store pre-populated with realistic seed data across all 5 roles.
- You can connect your live Supabase project at any time via the **"Supabase Config"** button in the top navigation or settings.

---

## ⚖️ EPR Compliance & Legal Notice
EcoTrack provides an internal compliance management ledger and chain of custody documentation. This software does not claim to issue official sovereign government certificates or legally transferable statutory securities without integration into corresponding state pollution control authorities.
