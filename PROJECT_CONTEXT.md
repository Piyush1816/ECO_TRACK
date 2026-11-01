# Project Context: EcoTrack Platform

## Project Overview
- **Name**: EcoTrack — E-Waste Collection & EPR Credit Management Platform
- **Scope**: Enterprise Web Application connecting Citizens, Collection Partners, Recyclers, Organizations, and Administrators.
- **Visual Language**: High-trust environmental technology theme (#15803D Forest Green, #10B981 Emerald, #F8FAF8 Canvas, #17231C Typography, #64748B Secondary, #E2E8E4 Hairline Borders).
- **Architecture**: Modular React SPA on modern Vite tooling with Supabase SSR/Client integration, full TypeScript type safety, Recharts analytics, and Lucide icons.

## Workflows Covered
1. **Public Information**: Hero value proposition, interactive "How It Works" 6-step diagram, searchable "Accepted E-Waste" catalogue with recovery potential, live environmental impact metrics, contact inquiry desk, and authentication portal.
2. **Citizen Workflow**: Doorstep e-waste pickup request with item weight estimation and instant points calculation, live status tracking timeline, digital weighing slip viewer, personal carbon offset calculator, and reward redemption.
3. **Collection Partner Workflow**: Dispatch queue with zone filters, assignment acceptance/rejection, route scheduling with vehicle/agent assignment, on-site weighing verification with photo proof upload, and submission to Admin QA.
4. **Recycler Workflow**: Inbound sealed batch receiving, manifest confirmation, material breakdown yield logging (Copper, Aluminum, Gold, Plastics, Glass, Hazardous Residue), and recycling certificate issuance.
5. **Organization Workflow**: Corporate IT Asset Disposition (ITAD) bulk pickup generator, enterprise chain of custody verification, annual EPR target progress bar, and audit-ready ESG report downloads.
6. **Administrator Workflow**: Master platform metrics, user approval management for licensed partners and certified recyclers, partner dispatch assignment board, weight verification terminal with variance calculation, recycler batch consolidation, recycling yield verification, and immutable EPR ledger auditing.

## Security & Access
- Role-based route guard and interface partitioning.
- Supabase Row-Level Security (RLS) policies ensuring cross-tenant privacy.
- Complete audit logging on every critical status transition and weight verification.
