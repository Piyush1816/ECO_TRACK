# Project Context: EcoTrack Platform

## Project Overview
- **Name**: EcoTrack — E-Waste Collection & EPR Credit Management Platform
- **Scope**: Enterprise Full-Stack Web Application connecting Citizens, Collection Partners, Recyclers, Organizations, and Administrators.
- **Visual Language**: High-trust environmental technology theme (#15803D Forest Green, #10B981 Emerald, #F8FAF8 Canvas, #17231C Typography, #64748B Secondary, #E2E8E4 Hairline Borders).
- **Architecture**: Modular React SPA on Vite with Supabase PostgreSQL, Supabase Authentication, Supabase Storage, and Realtime WebSocket integration, full TypeScript type safety, Recharts analytics, and Lucide icons.

## Workflows Covered
1. **Public Information**: Hero value proposition, interactive "How It Works" 6-step diagram, searchable "Accepted E-Waste" catalogue with recovery potential, live environmental impact metrics, contact inquiry desk, and authentication portal.
2. **Citizen Workflow**: Doorstep e-waste pickup request with item weight estimation and instant points calculation, live status tracking timeline, digital weighing slip viewer, personal carbon offset calculator, and reward redemption.
3. **Collection Partner Workflow**: Dispatch queue with zone filters, assignment acceptance/rejection, route scheduling with vehicle/agent assignment, on-site weighing verification with photo proof upload, and submission to Admin QA.
4. **Recycler Workflow**: Inbound sealed batch receiving, manifest confirmation, material breakdown yield logging (Copper, Aluminum, Gold, Plastics, Glass, Hazardous Residue), and recycling certificate issuance.
5. **Organization Workflow**: Corporate IT Asset Disposition (ITAD) bulk pickup generator, enterprise chain of custody verification, annual EPR target progress bar, and audit-ready ESG report downloads.
6. **Administrator Workflow**: Master platform metrics, user approval management for licensed partners and certified recyclers, partner dispatch assignment board, weight verification terminal with variance calculation, recycler batch consolidation, recycling yield verification, and immutable EPR ledger auditing.

## Backend Architecture & Services
- **Auth Service (`src/services/authService.ts`)**: Real Supabase Auth for signup, login, password resets, and authentic demo persona authentications.
- **Pickup Service (`src/services/pickupService.ts`)**: Creates and queries pickup requests with unique request numbers and audit logging.
- **Assignment Service (`src/services/assignmentService.ts`)**: Partner assignment, route scheduling, vehicle allocations, and route acceptance/rejections.
- **Collection Service (`src/services/collectionService.ts`)**: On-site weighing recordings, seal tags, slip upload tracking, and admin notifications.
- **Verification Service (`src/services/verificationService.ts`)**: QA weight verification with automatic variance calculations and citizen points crediting.
- **Batch Service (`src/services/batchService.ts`)**: Consolidation of verified pickups into batches with manifests and receipt confirmations.
- **Recycling Service (`src/services/recyclingService.ts`)**: Material recovery fraction declarations with mass balance accounting.
- **EPR Service (`src/services/eprService.ts`)**: Verification and issuance of EPR ledger records with cryptographic hashes.
- **Storage Service (`src/services/storageService.ts`)**: Private Supabase Storage uploads with 10MB limit and signed URL generation.
- **Realtime Integration (`src/lib/store.ts`)**: Subscribes to Postgres change events across `pickup_requests`, `notifications`, `ewaste_batches`, and `epr_ledger`.

## Security & Access
- Non-recursive RLS policies on all 16 PostgreSQL tables using `public.is_admin()` and `public.get_auth_role()`.
- Server-side database triggers prevent privilege escalation (`trg_protect_profile_role`) and enforce mass balance rules.
- Complete audit logging on every critical status transition and weight verification (`public.audit_logs`).
