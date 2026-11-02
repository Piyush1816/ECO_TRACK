-- ============================================================================
-- ECOTRACK: COMPREHENSIVE SECURITY, RLS, TRIGGERS & RECURSION-FREE POLICIES
-- Migration: 20261102_security_rls_and_fixes.sql
-- ============================================================================

-- 1. Helper function for non-recursive admin checks
-- Critical: Using SECURITY DEFINER and STABLE avoids infinite recursion in profiles RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Helper function to get current user role safely
CREATE OR REPLACE FUNCTION public.get_auth_role()
RETURNS TEXT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;

-- 2. Handle New User Signup from Supabase Auth
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_role TEXT;
  v_full_name TEXT;
  v_phone TEXT;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'citizen');
  IF v_role NOT IN ('citizen', 'partner', 'recycler', 'organization', 'admin') THEN
    v_role := 'citizen';
  END IF;

  v_full_name := COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1));
  v_phone := NEW.raw_user_meta_data->>'phone';

  INSERT INTO public.profiles (id, email, full_name, phone, role, reward_points, is_verified)
  VALUES (
    NEW.id,
    NEW.email,
    v_full_name,
    v_phone,
    v_role,
    CASE WHEN v_role = 'citizen' THEN 50 ELSE 0 END,
    TRUE
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 3. Protect Profile Role Updates
-- Ordinary users cannot elevate their own role, is_verified status, or tamper with reward_points
CREATE OR REPLACE FUNCTION public.protect_profile_role()
RETURNS TRIGGER AS $$
BEGIN
  IF auth.uid() IS NOT NULL AND NOT public.is_admin() THEN
    NEW.role := OLD.role;
    NEW.is_verified := OLD.is_verified;
    NEW.reward_points := OLD.reward_points;
  END IF;
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_protect_profile_role ON public.profiles;
CREATE TRIGGER trg_protect_profile_role
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.protect_profile_role();

-- 4. Fix variance_kg in weight_verifications
-- Drop the erroneous generated column (which generated always as verified_weight_kg)
-- and compute actual_weight - verified_weight via trigger
ALTER TABLE public.weight_verifications DROP COLUMN IF EXISTS variance_kg CASCADE;
ALTER TABLE public.weight_verifications ADD COLUMN variance_kg NUMERIC(10, 2) DEFAULT 0.00;

CREATE OR REPLACE FUNCTION public.update_weight_verification_variance()
RETURNS TRIGGER AS $$
DECLARE
  v_actual NUMERIC(10, 2);
BEGIN
  SELECT actual_weight_kg INTO v_actual 
  FROM public.collection_records 
  WHERE id = NEW.collection_record_id;

  IF v_actual IS NOT NULL THEN
    NEW.variance_kg := NEW.verified_weight_kg - v_actual;
  ELSE
    NEW.variance_kg := 0.00;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_weight_verification_variance ON public.weight_verifications;
CREATE TRIGGER trg_weight_verification_variance
  BEFORE INSERT OR UPDATE ON public.weight_verifications
  FOR EACH ROW EXECUTE FUNCTION public.update_weight_verification_variance();

-- 5. Data Validation Constraints
-- Non-negative weights and counts
ALTER TABLE public.pickup_requests
  ADD CONSTRAINT chk_pickup_requests_weight CHECK (estimated_weight_kg > 0),
  ADD CONSTRAINT chk_pickup_requests_qty CHECK (estimated_quantity > 0);

ALTER TABLE public.collection_records
  ADD CONSTRAINT chk_collection_records_weight CHECK (actual_weight_kg > 0),
  ADD CONSTRAINT chk_collection_records_count CHECK (item_count > 0);

ALTER TABLE public.weight_verifications
  ADD CONSTRAINT chk_weight_verifications_weight CHECK (verified_weight_kg > 0);

ALTER TABLE public.ewaste_batches
  ADD CONSTRAINT chk_ewaste_batches_weight CHECK (total_weight_kg > 0),
  ADD CONSTRAINT chk_ewaste_batches_items CHECK (item_count > 0);

ALTER TABLE public.recycling_records
  ADD CONSTRAINT chk_recycling_records_weight CHECK (received_weight_kg > 0),
  ADD CONSTRAINT chk_recycling_records_copper CHECK (copper_recovered_kg >= 0),
  ADD CONSTRAINT chk_recycling_records_aluminum CHECK (aluminum_recovered_kg >= 0),
  ADD CONSTRAINT chk_recycling_records_plastics CHECK (plastics_recovered_kg >= 0),
  ADD CONSTRAINT chk_recycling_records_precious CHECK (precious_metals_grams >= 0),
  ADD CONSTRAINT chk_recycling_records_glass CHECK (glass_recovered_kg >= 0),
  ADD CONSTRAINT chk_recycling_records_hazard CHECK (hazardous_residue_kg >= 0);

ALTER TABLE public.epr_ledger
  ADD CONSTRAINT chk_epr_ledger_weight CHECK (verified_weight_kg > 0),
  ADD CONSTRAINT chk_epr_ledger_credits CHECK (credit_amount > 0);

-- 6. Enable RLS on ALL 16 Tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recycler_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ewaste_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pickup_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ewaste_batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.recycling_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.epr_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- 7. Drop Old Policies (if any) to prevent conflicts
DROP POLICY IF EXISTS "Users read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Citizens read own pickups" ON public.pickup_requests;
DROP POLICY IF EXISTS "EPR Ledger view policy" ON public.epr_ledger;

-- 8. COMPREHENSIVE RLS POLICIES

-- PROFILES
CREATE POLICY "profiles_select_policy" ON public.profiles
  FOR SELECT USING (
    auth.uid() = id 
    OR public.is_admin() 
    OR role IN ('partner', 'recycler')
  );

CREATE POLICY "profiles_update_policy" ON public.profiles
  FOR UPDATE USING (
    auth.uid() = id OR public.is_admin()
  ) WITH CHECK (
    auth.uid() = id OR public.is_admin()
  );

CREATE POLICY "profiles_insert_policy" ON public.profiles
  FOR INSERT WITH CHECK (
    auth.uid() = id OR public.is_admin()
  );

-- ORGANIZATIONS
CREATE POLICY "organizations_select_policy" ON public.organizations
  FOR SELECT USING (
    public.is_admin() OR profile_id = auth.uid()
  );

CREATE POLICY "organizations_insert_policy" ON public.organizations
  FOR INSERT WITH CHECK (
    public.is_admin() OR profile_id = auth.uid()
  );

CREATE POLICY "organizations_update_policy" ON public.organizations
  FOR UPDATE USING (
    public.is_admin() OR profile_id = auth.uid()
  );

-- PARTNER_DETAILS
CREATE POLICY "partner_details_select_policy" ON public.partner_details
  FOR SELECT USING (true);

CREATE POLICY "partner_details_insert_policy" ON public.partner_details
  FOR INSERT WITH CHECK (
    public.is_admin() OR profile_id = auth.uid()
  );

CREATE POLICY "partner_details_update_policy" ON public.partner_details
  FOR UPDATE USING (
    public.is_admin() OR profile_id = auth.uid()
  );

-- RECYCLER_DETAILS
CREATE POLICY "recycler_details_select_policy" ON public.recycler_details
  FOR SELECT USING (true);

CREATE POLICY "recycler_details_insert_policy" ON public.recycler_details
  FOR INSERT WITH CHECK (
    public.is_admin() OR profile_id = auth.uid()
  );

CREATE POLICY "recycler_details_update_policy" ON public.recycler_details
  FOR UPDATE USING (
    public.is_admin() OR profile_id = auth.uid()
  );

-- EWASTE_CATEGORIES
CREATE POLICY "ewaste_categories_select_policy" ON public.ewaste_categories
  FOR SELECT USING (true);

CREATE POLICY "ewaste_categories_admin_all" ON public.ewaste_categories
  FOR ALL USING (public.is_admin());

-- PICKUP_REQUESTS
CREATE POLICY "pickup_requests_select_policy" ON public.pickup_requests
  FOR SELECT USING (
    auth.uid() = user_id 
    OR public.is_admin()
    OR id IN (SELECT request_id FROM public.pickup_assignments WHERE partner_id = auth.uid())
  );

CREATE POLICY "pickup_requests_insert_policy" ON public.pickup_requests
  FOR INSERT WITH CHECK (
    auth.uid() = user_id OR public.is_admin()
  );

CREATE POLICY "pickup_requests_update_policy" ON public.pickup_requests
  FOR UPDATE USING (
    auth.uid() = user_id 
    OR public.is_admin()
    OR id IN (SELECT request_id FROM public.pickup_assignments WHERE partner_id = auth.uid())
  );

-- PICKUP_ASSIGNMENTS
CREATE POLICY "pickup_assignments_select_policy" ON public.pickup_assignments
  FOR SELECT USING (
    partner_id = auth.uid() 
    OR public.is_admin()
    OR request_id IN (SELECT id FROM public.pickup_requests WHERE user_id = auth.uid())
  );

CREATE POLICY "pickup_assignments_insert_policy" ON public.pickup_assignments
  FOR INSERT WITH CHECK (
    public.is_admin()
  );

CREATE POLICY "pickup_assignments_update_policy" ON public.pickup_assignments
  FOR UPDATE USING (
    partner_id = auth.uid() OR public.is_admin()
  );

-- COLLECTION_RECORDS
CREATE POLICY "collection_records_select_policy" ON public.collection_records
  FOR SELECT USING (
    collector_id = auth.uid() 
    OR public.is_admin()
    OR request_id IN (SELECT id FROM public.pickup_requests WHERE user_id = auth.uid())
  );

CREATE POLICY "collection_records_insert_policy" ON public.collection_records
  FOR INSERT WITH CHECK (
    collector_id = auth.uid() OR public.is_admin()
  );

CREATE POLICY "collection_records_update_policy" ON public.collection_records
  FOR UPDATE USING (
    collector_id = auth.uid() OR public.is_admin()
  );

-- WEIGHT_VERIFICATIONS
CREATE POLICY "weight_verifications_select_policy" ON public.weight_verifications
  FOR SELECT USING (
    public.is_admin()
    OR collection_record_id IN (
      SELECT c.id FROM public.collection_records c
      JOIN public.pickup_requests p ON c.request_id = p.id
      WHERE p.user_id = auth.uid() OR c.collector_id = auth.uid()
    )
  );

CREATE POLICY "weight_verifications_admin_all" ON public.weight_verifications
  FOR ALL USING (public.is_admin());

-- EWASTE_BATCHES
CREATE POLICY "ewaste_batches_select_policy" ON public.ewaste_batches
  FOR SELECT USING (
    recycler_id = auth.uid() OR public.is_admin()
  );

CREATE POLICY "ewaste_batches_admin_all" ON public.ewaste_batches
  FOR ALL USING (public.is_admin());

CREATE POLICY "ewaste_batches_recycler_update" ON public.ewaste_batches
  FOR UPDATE USING (recycler_id = auth.uid());

-- RECYCLING_RECORDS
CREATE POLICY "recycling_records_select_policy" ON public.recycling_records
  FOR SELECT USING (
    recycler_id = auth.uid() OR public.is_admin()
  );

CREATE POLICY "recycling_records_recycler_insert" ON public.recycling_records
  FOR INSERT WITH CHECK (
    recycler_id = auth.uid() OR public.is_admin()
  );

CREATE POLICY "recycling_records_update_policy" ON public.recycling_records
  FOR UPDATE USING (
    recycler_id = auth.uid() OR public.is_admin()
  );

-- EPR_LEDGER
CREATE POLICY "epr_ledger_select_policy" ON public.epr_ledger
  FOR SELECT USING (true); -- Public verifiable ledger

CREATE POLICY "epr_ledger_admin_all" ON public.epr_ledger
  FOR ALL USING (public.is_admin());

-- NOTIFICATIONS
CREATE POLICY "notifications_select_policy" ON public.notifications
  FOR SELECT USING (
    user_id = auth.uid() OR public.is_admin()
  );

CREATE POLICY "notifications_update_policy" ON public.notifications
  FOR UPDATE USING (
    user_id = auth.uid() OR public.is_admin()
  );

CREATE POLICY "notifications_insert_policy" ON public.notifications
  FOR INSERT WITH CHECK (true);

-- REWARDS
CREATE POLICY "rewards_select_policy" ON public.rewards
  FOR SELECT USING (true);

CREATE POLICY "rewards_admin_all" ON public.rewards
  FOR ALL USING (public.is_admin());

-- REWARD_REDEMPTIONS
CREATE POLICY "reward_redemptions_select_policy" ON public.reward_redemptions
  FOR SELECT USING (
    user_id = auth.uid() OR public.is_admin()
  );

CREATE POLICY "reward_redemptions_insert_policy" ON public.reward_redemptions
  FOR INSERT WITH CHECK (
    user_id = auth.uid() OR public.is_admin()
  );

-- AUDIT_LOGS
-- Append-only audit table
CREATE POLICY "audit_logs_select_policy" ON public.audit_logs
  FOR SELECT USING (public.is_admin());

CREATE POLICY "audit_logs_insert_policy" ON public.audit_logs
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL OR public.is_admin());

-- 9. Storage Buckets & Policies Setup
-- Insert storage buckets if not already present
INSERT INTO storage.buckets (id, name, public)
VALUES 
  ('ewaste-photos', 'ewaste-photos', false),
  ('weighing-slips', 'weighing-slips', false),
  ('recycling-documents', 'recycling-documents', false),
  ('epr-manifests', 'epr-manifests', false)
ON CONFLICT (id) DO NOTHING;

-- Storage object policies
CREATE POLICY "storage_ewaste_photos_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'ewaste-photos' AND auth.role() = 'authenticated');

CREATE POLICY "storage_ewaste_photos_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'ewaste-photos' AND auth.role() = 'authenticated');

CREATE POLICY "storage_weighing_slips_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'weighing-slips' AND auth.role() = 'authenticated');

CREATE POLICY "storage_weighing_slips_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'weighing-slips' AND auth.role() = 'authenticated');

CREATE POLICY "storage_recycling_documents_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'recycling-documents' AND auth.role() = 'authenticated');

CREATE POLICY "storage_recycling_documents_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'recycling-documents' AND auth.role() = 'authenticated');

CREATE POLICY "storage_epr_manifests_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'epr-manifests' AND auth.role() = 'authenticated');

CREATE POLICY "storage_epr_manifests_insert" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'epr-manifests' AND auth.role() = 'authenticated');
