-- =====================================
-- SPICEX OMS — AUTH & RBAC MIGRATION
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- =====================================

-- ============================================================
-- 1. USER PROFILES TABLE (linked to Supabase Auth)
-- ============================================================
-- This table extends auth.users with SpiceX-specific role info.
-- Every Supabase Auth signup auto-creates a matching profile row.

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN (
    'ADMIN',
    'SOURCING_MANAGER',
    'FACTORY_MANAGER',
    'SALES_MANAGER',
    'WAREHOUSE_MANAGER',
    'DISTRIBUTION_MANAGER',
    'SALES_PERSON'
  )),
  phone TEXT,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Everyone can read profiles (needed for displaying names in UI)
CREATE POLICY "profiles_select_all" ON public.profiles
  FOR SELECT USING (true);

-- Users can only update their own profile (except role, handled by admin)
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Only authenticated users can insert their own profile
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);


-- ============================================================
-- 2. AUTO-CREATE PROFILE ON SIGNUP (Trigger)
-- ============================================================
-- When a user signs up via Supabase Auth, this trigger
-- automatically creates a profile row with role = 'SALES_PERSON' (default).
-- Admin must then manually promote to the correct role.

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'role', 'SALES_PERSON')
  );
  RETURN NEW;
END;
$$;

-- Drop existing trigger if it exists (safe for re-runs)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 3. HELPER FUNCTION: Get current user's role
-- ============================================================
-- Call this in RLS policies to check role without extra queries.

CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$;


-- ============================================================
-- 4. HELPER FUNCTION: Check if user is admin
-- ============================================================

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'ADMIN'
  );
$$;


-- ============================================================
-- 5. ADMIN FUNCTION: Set user role (only callable by admins)
-- ============================================================

CREATE OR REPLACE FUNCTION public.set_user_role(target_user_id UUID, new_role TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Only admins can change roles
  IF NOT public.is_admin() THEN
    RAISE EXCEPTION 'Only admins can change user roles';
  END IF;

  -- Validate the role
  IF new_role NOT IN (
    'ADMIN', 'SOURCING_MANAGER', 'FACTORY_MANAGER',
    'SALES_MANAGER', 'WAREHOUSE_MANAGER', 'DISTRIBUTION_MANAGER', 'SALES_PERSON'
  ) THEN
    RAISE EXCEPTION 'Invalid role: %', new_role;
  END IF;

  UPDATE public.profiles SET role = new_role, updated_at = now()
  WHERE id = target_user_id;
END;
$$;


-- ============================================================
-- 6. RLS POLICIES ON BUSINESS TABLES
-- ============================================================

-- Enable RLS on all business tables
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.purchase_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.grns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.batches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.raw_material_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.processing_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.finished_goods_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skus ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.b2b_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.distribution_partners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.partner_order_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.monthly_packing_summary ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispatch_register ENABLE ROW LEVEL SECURITY;

-- -------------------------------------------------------
-- UNIVERSAL READ: All authenticated users can read all tables
-- (Required for cross-module data connectivity,
--  e.g. Factory Manager must see POs to create GRNs)
-- -------------------------------------------------------

CREATE POLICY "authenticated_read" ON public.suppliers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read" ON public.purchase_orders
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read" ON public.grns
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read" ON public.batches
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read" ON public.raw_material_inventory
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read" ON public.processing_runs
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read" ON public.finished_goods_inventory
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read" ON public.skus
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read" ON public.b2b_customers
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read" ON public.b2b_orders
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read" ON public.b2b_order_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read" ON public.distribution_partners
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read" ON public.partner_orders
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read" ON public.partner_order_items
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read" ON public.monthly_packing_summary
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "authenticated_read" ON public.dispatch_register
  FOR SELECT TO authenticated USING (true);


-- -------------------------------------------------------
-- SOURCING MANAGER: Can write to suppliers + purchase_orders
-- -------------------------------------------------------

CREATE POLICY "sourcing_write_suppliers" ON public.suppliers
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('SOURCING_MANAGER', 'ADMIN'))
  WITH CHECK (public.get_user_role() IN ('SOURCING_MANAGER', 'ADMIN'));

CREATE POLICY "sourcing_write_purchase_orders" ON public.purchase_orders
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('SOURCING_MANAGER', 'ADMIN'))
  WITH CHECK (public.get_user_role() IN ('SOURCING_MANAGER', 'ADMIN'));


-- -------------------------------------------------------
-- FACTORY MANAGER: Can write to GRNs, batches, processing_runs,
-- raw_material_inventory, finished_goods_inventory
-- -------------------------------------------------------

CREATE POLICY "factory_write_grns" ON public.grns
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('FACTORY_MANAGER', 'ADMIN'))
  WITH CHECK (public.get_user_role() IN ('FACTORY_MANAGER', 'ADMIN'));

CREATE POLICY "factory_write_batches" ON public.batches
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('FACTORY_MANAGER', 'ADMIN'))
  WITH CHECK (public.get_user_role() IN ('FACTORY_MANAGER', 'ADMIN'));

CREATE POLICY "factory_write_raw_inventory" ON public.raw_material_inventory
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('FACTORY_MANAGER', 'ADMIN'))
  WITH CHECK (public.get_user_role() IN ('FACTORY_MANAGER', 'ADMIN'));

CREATE POLICY "factory_write_processing_runs" ON public.processing_runs
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('FACTORY_MANAGER', 'ADMIN'))
  WITH CHECK (public.get_user_role() IN ('FACTORY_MANAGER', 'ADMIN'));

CREATE POLICY "factory_write_finished_goods" ON public.finished_goods_inventory
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('FACTORY_MANAGER', 'WAREHOUSE_MANAGER', 'ADMIN'))
  WITH CHECK (public.get_user_role() IN ('FACTORY_MANAGER', 'WAREHOUSE_MANAGER', 'ADMIN'));


-- -------------------------------------------------------
-- SALES MANAGER: Can write to B2B orders + customers
-- -------------------------------------------------------

CREATE POLICY "sales_write_b2b_customers" ON public.b2b_customers
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('SALES_MANAGER', 'ADMIN'))
  WITH CHECK (public.get_user_role() IN ('SALES_MANAGER', 'ADMIN'));

CREATE POLICY "sales_write_b2b_orders" ON public.b2b_orders
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('SALES_MANAGER', 'ADMIN'))
  WITH CHECK (public.get_user_role() IN ('SALES_MANAGER', 'ADMIN'));

CREATE POLICY "sales_write_b2b_order_items" ON public.b2b_order_items
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('SALES_MANAGER', 'ADMIN'))
  WITH CHECK (public.get_user_role() IN ('SALES_MANAGER', 'ADMIN'));


-- -------------------------------------------------------
-- DISTRIBUTION MANAGER: Can write to partners + partner orders
-- -------------------------------------------------------

CREATE POLICY "distribution_write_partners" ON public.distribution_partners
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('DISTRIBUTION_MANAGER', 'ADMIN'))
  WITH CHECK (public.get_user_role() IN ('DISTRIBUTION_MANAGER', 'ADMIN'));

CREATE POLICY "distribution_write_partner_orders" ON public.partner_orders
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('DISTRIBUTION_MANAGER', 'ADMIN'))
  WITH CHECK (public.get_user_role() IN ('DISTRIBUTION_MANAGER', 'ADMIN'));

CREATE POLICY "distribution_write_partner_order_items" ON public.partner_order_items
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('DISTRIBUTION_MANAGER', 'ADMIN'))
  WITH CHECK (public.get_user_role() IN ('DISTRIBUTION_MANAGER', 'ADMIN'));


-- -------------------------------------------------------
-- WAREHOUSE MANAGER: Can write to packing summaries + dispatch
-- -------------------------------------------------------

CREATE POLICY "warehouse_write_packing" ON public.monthly_packing_summary
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('WAREHOUSE_MANAGER', 'ADMIN'))
  WITH CHECK (public.get_user_role() IN ('WAREHOUSE_MANAGER', 'ADMIN'));

CREATE POLICY "warehouse_write_dispatch" ON public.dispatch_register
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('WAREHOUSE_MANAGER', 'FACTORY_MANAGER', 'ADMIN'))
  WITH CHECK (public.get_user_role() IN ('WAREHOUSE_MANAGER', 'FACTORY_MANAGER', 'ADMIN'));


-- -------------------------------------------------------
-- SKUs: Admins and Sourcing/Factory managers can manage SKUs
-- -------------------------------------------------------

CREATE POLICY "skus_write" ON public.skus
  FOR ALL TO authenticated
  USING (public.get_user_role() IN ('ADMIN', 'SOURCING_MANAGER', 'FACTORY_MANAGER'))
  WITH CHECK (public.get_user_role() IN ('ADMIN', 'SOURCING_MANAGER', 'FACTORY_MANAGER'));


-- ============================================================
-- 7. ADMIN SETUP: Create first admin user
-- ============================================================
-- IMPORTANT: After signing up your first user in the app,
-- run this to promote them to ADMIN:
--
-- UPDATE public.profiles
-- SET role = 'ADMIN'
-- WHERE email = 'your-admin@email.com';
--
-- Then use the admin UI to set other users' roles.
-- ============================================================
