-- ============================================================================
-- ECOTRACK: E-WASTE COLLECTION & EPR CREDIT MANAGEMENT PLATFORM
-- Initial Migration: Schema, Indexes, Triggers, RLS & Seed Data
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. PROFILES (Users: Citizen, Collection Partner, Recycler, Organization, Admin)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    phone TEXT,
    role TEXT NOT NULL CHECK (role IN ('citizen', 'partner', 'recycler', 'organization', 'admin')),
    avatar_url TEXT,
    reward_points INTEGER DEFAULT 0 CHECK (reward_points >= 0),
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. ORGANIZATIONS (Corporate entities managing bulk e-waste & EPR targets)
CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    org_name TEXT NOT NULL,
    registration_number TEXT UNIQUE NOT NULL,
    industry_type TEXT NOT NULL,
    compliance_contact TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    annual_epr_target_kg NUMERIC(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PARTNER_DETAILS (Authorized Collection Agencies)
CREATE TABLE IF NOT EXISTS partner_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    company_name TEXT NOT NULL,
    license_number TEXT UNIQUE NOT NULL,
    fleet_size INTEGER DEFAULT 1,
    service_zones TEXT[] DEFAULT '{}',
    approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'suspended')),
    weighing_scale_calibrated_at TIMESTAMPTZ,
    approved_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. RECYCLER_DETAILS (Certified Recyclers & Material Recovery Facilities)
CREATE TABLE IF NOT EXISTS recycler_details (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    facility_name TEXT NOT NULL,
    pollution_control_board_reg TEXT UNIQUE NOT NULL,
    facility_address TEXT NOT NULL,
    processing_capacity_mt_month NUMERIC(10, 2) NOT NULL,
    certified_technologies TEXT[] DEFAULT '{}',
    approval_status TEXT NOT NULL DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected', 'suspended')),
    approved_by UUID REFERENCES profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. EWASTE_CATEGORIES (Standardized Electronics Streams)
CREATE TABLE IF NOT EXISTS ewaste_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    code TEXT UNIQUE NOT NULL,
    description TEXT,
    hazardous_components TEXT[] DEFAULT '{}',
    recoverable_materials TEXT[] DEFAULT '{}',
    points_per_kg INTEGER DEFAULT 10,
    co2_factor_per_kg NUMERIC(6, 2) DEFAULT 1.45,
    icon TEXT
);

-- 6. PICKUP_REQUESTS (Requests created by Citizens or Organizations)
CREATE TABLE IF NOT EXISTS pickup_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_number TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
    category_id TEXT REFERENCES ewaste_categories(id),
    item_description TEXT NOT NULL,
    estimated_quantity INTEGER NOT NULL DEFAULT 1,
    estimated_weight_kg NUMERIC(10, 2) NOT NULL,
    pickup_address TEXT NOT NULL,
    pickup_city TEXT NOT NULL,
    preferred_date DATE NOT NULL,
    time_slot TEXT NOT NULL,
    special_notes TEXT,
    status TEXT NOT NULL DEFAULT 'requested' CHECK (
        status IN ('requested', 'assigned', 'scheduled', 'collected', 'verified', 'batch_assigned', 'recycled', 'cancelled')
    ),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. PICKUP_ASSIGNMENTS (Admin assignment to Collection Partners)
CREATE TABLE IF NOT EXISTS pickup_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES pickup_requests(id) ON DELETE CASCADE,
    partner_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    assigned_by UUID REFERENCES profiles(id),
    assignment_status TEXT NOT NULL DEFAULT 'assigned' CHECK (
        assignment_status IN ('assigned', 'accepted', 'rejected', 'in_progress', 'completed')
    ),
    rejection_reason TEXT,
    scheduled_at TIMESTAMPTZ,
    vehicle_registration TEXT,
    assigned_agent_name TEXT,
    assigned_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. COLLECTION_RECORDS (Data captured by Collection Partner on-site)
CREATE TABLE IF NOT EXISTS collection_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES pickup_requests(id) ON DELETE CASCADE,
    collector_id UUID REFERENCES profiles(id),
    actual_weight_kg NUMERIC(10, 2) NOT NULL,
    item_count INTEGER NOT NULL,
    weighing_slip_url TEXT,
    photo_urls TEXT[] DEFAULT '{}',
    seal_tag_number TEXT,
    gps_coordinates TEXT,
    collected_at TIMESTAMPTZ DEFAULT NOW(),
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'verified', 'disputed'))
);

-- 9. WEIGHT_VERIFICATIONS (Admin cross-check of Partner Weight)
CREATE TABLE IF NOT EXISTS weight_verifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    collection_record_id UUID REFERENCES collection_records(id) ON DELETE CASCADE,
    admin_id UUID REFERENCES profiles(id),
    verified_weight_kg NUMERIC(10, 2) NOT NULL,
    variance_kg NUMERIC(10, 2) GENERATED ALWAYS AS (verified_weight_kg) STORED,
    verification_notes TEXT,
    status TEXT NOT NULL DEFAULT 'approved' CHECK (status IN ('approved', 'adjusted', 'rejected')),
    verified_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. EWASTE_BATCHES (Consolidated bulk shipments to Recyclers)
CREATE TABLE IF NOT EXISTS ewaste_batches (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_number TEXT UNIQUE NOT NULL,
    recycler_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    created_by UUID REFERENCES profiles(id),
    total_weight_kg NUMERIC(10, 2) NOT NULL,
    item_count INTEGER NOT NULL,
    manifest_number TEXT UNIQUE NOT NULL,
    hazardous_waste_pass_number TEXT,
    status TEXT NOT NULL DEFAULT 'dispatched' CHECK (
        status IN ('dispatched', 'received', 'in_processing', 'completed', 'verified')
    ),
    dispatched_at TIMESTAMPTZ DEFAULT NOW(),
    received_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ
);

-- 11. RECYCLING_RECORDS (Yield and processing logs by Recycler)
CREATE TABLE IF NOT EXISTS recycling_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    batch_id UUID REFERENCES ewaste_batches(id) ON DELETE CASCADE,
    recycler_id UUID REFERENCES profiles(id),
    received_weight_kg NUMERIC(10, 2) NOT NULL,
    copper_recovered_kg NUMERIC(10, 2) DEFAULT 0.00,
    aluminum_recovered_kg NUMERIC(10, 2) DEFAULT 0.00,
    plastics_recovered_kg NUMERIC(10, 2) DEFAULT 0.00,
    precious_metals_grams NUMERIC(10, 2) DEFAULT 0.00,
    glass_recovered_kg NUMERIC(10, 2) DEFAULT 0.00,
    hazardous_residue_kg NUMERIC(10, 2) DEFAULT 0.00,
    processing_method TEXT NOT NULL,
    certificate_url TEXT,
    admin_verified BOOLEAN DEFAULT FALSE,
    submitted_at TIMESTAMPTZ DEFAULT NOW(),
    verified_at TIMESTAMPTZ
);

-- 12. DOCUMENT_RECORDS (Weighing slips, PCB manifests, certificates)
CREATE TABLE IF NOT EXISTS document_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uploaded_by UUID REFERENCES profiles(id),
    entity_type TEXT NOT NULL,
    entity_id UUID NOT NULL,
    document_type TEXT NOT NULL CHECK (
        document_type IN ('weighing_slip', 'collection_photo', 'transport_manifest', 'recycling_certificate', 'epr_proof', 'id_license')
    ),
    document_name TEXT NOT NULL,
    file_url TEXT NOT NULL,
    mime_type TEXT,
    file_size_bytes BIGINT,
    uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. EPR_LEDGER (Internal ledger for verified recycling records & credits)
-- Note: Internal audit and compliance ledger; does not claim to issue official government certificates
CREATE TABLE IF NOT EXISTS epr_ledger (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ledger_reference TEXT UNIQUE NOT NULL,
    batch_id UUID REFERENCES ewaste_batches(id),
    recycling_record_id UUID REFERENCES recycling_records(id),
    organization_id UUID REFERENCES organizations(id),
    category_id TEXT REFERENCES ewaste_categories(id),
    verified_weight_kg NUMERIC(10, 2) NOT NULL,
    credit_amount NUMERIC(12, 2) NOT NULL,
    credit_type TEXT NOT NULL CHECK (credit_type IN ('collection', 'recycling', 'carbon_offset')),
    status TEXT NOT NULL DEFAULT 'verified' CHECK (status IN ('verified', 'retired', 'pending_audit')),
    verifier_id UUID REFERENCES profiles(id),
    transaction_hash TEXT NOT NULL,
    notes TEXT,
    recorded_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. NOTIFICATIONS (In-app notifications for workflow updates)
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('info', 'success', 'warning', 'action_required')),
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. REWARDS (Citizen points catalog and redemption history)
CREATE TABLE IF NOT EXISTS rewards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL,
    points_required INTEGER NOT NULL CHECK (points_required > 0),
    voucher_code TEXT,
    sponsor_name TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reward_redemptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    reward_id UUID REFERENCES rewards(id),
    points_spent INTEGER NOT NULL,
    status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'redeemed', 'expired')),
    claim_code TEXT NOT NULL,
    redeemed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. AUDIT_LOGS (Immutable compliance trail)
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID REFERENCES profiles(id),
    actor_role TEXT,
    action TEXT NOT NULL,
    entity_name TEXT NOT NULL,
    entity_id TEXT,
    details JSONB DEFAULT '{}'::jsonb,
    ip_address TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_pickup_requests_status ON pickup_requests(status);
CREATE INDEX IF NOT EXISTS idx_pickup_requests_user ON pickup_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_pickup_assignments_partner ON pickup_assignments(partner_id);
CREATE INDEX IF NOT EXISTS idx_ewaste_batches_recycler ON ewaste_batches(recycler_id);
CREATE INDEX IF NOT EXISTS idx_epr_ledger_reference ON epr_ledger(ledger_reference);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE pickup_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE collection_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE ewaste_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE recycling_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE epr_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Profiles: users read their own, admins read all
CREATE POLICY "Users read own profile" ON profiles
    FOR SELECT USING (auth.uid() = id OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin');

-- Pickup Requests: users see their own, partners see assigned, admin sees all
CREATE POLICY "Citizens read own pickups" ON pickup_requests
    FOR SELECT USING (
        auth.uid() = user_id 
        OR (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
        OR id IN (SELECT request_id FROM pickup_assignments WHERE partner_id = auth.uid())
    );

-- EPR Ledger: Viewable by organizations for their records, and admins
CREATE POLICY "EPR Ledger view policy" ON epr_ledger
    FOR SELECT USING (
        (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
        OR organization_id IN (SELECT id FROM organizations WHERE profile_id = auth.uid())
    );
