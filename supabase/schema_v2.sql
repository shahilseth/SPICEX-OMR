-- =====================================
-- SAFE MIGRATION SCRIPT (PHASE 1)
-- This script ONLY ADDs missing PRD tables.
-- It will NOT delete or overlap your existing data.
-- =====================================

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'role_type') THEN
    CREATE TYPE role_type AS ENUM ('ADMIN', 'SOURCING_MANAGER', 'FACTORY_MANAGER', 'SALES_MANAGER', 'WAREHOUSE_MANAGER', 'DISTRIBUTION_MANAGER', 'SALES_PERSON');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'sale_channel') THEN
    CREATE TYPE sale_channel AS ENUM ('B2B', 'DISTRIBUTOR', 'FRANCHISEE', 'ONLINE');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'order_status') THEN
    CREATE TYPE order_status AS ENUM ('PENDING', 'APPROVED', 'FULFILLED', 'DISPATCHED', 'DELIVERED');
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE payment_status AS ENUM ('PENDING', 'PARTIAL', 'COMPLETED');
  END IF;
END $$;

-- =====================================
-- MASTER DATA (NEW TABLES)
-- =====================================

CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  role role_type NOT NULL,
  location TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS b2b_customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  gst_number TEXT,
  billing_address TEXT,
  shipping_address TEXT,
  payment_terms TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS distribution_partners (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_type TEXT CHECK (partner_type IN ('DISTRIBUTOR', 'FRANCHISEE')),
  business_name TEXT NOT NULL,
  contact_person TEXT,
  phone TEXT,
  email TEXT,
  gst_number TEXT,
  address TEXT,
  margin_percentage NUMERIC NOT NULL DEFAULT 0,
  assigned_salesperson_id UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now()
);

-- =====================================
-- FACTORY PROCESSING TRACKING
-- =====================================

CREATE TABLE IF NOT EXISTS processing_runs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES batches(id),
  machine_type TEXT CHECK (machine_type IN ('DEHYDRATOR', 'SOLAR_TUNNEL_DRYER')),
  fresh_weight_kg NUMERIC NOT NULL,
  slice_weight_kg NUMERIC,
  dry_weight_kg NUMERIC,
  drying_time_hours NUMERIC,
  started_at TIMESTAMP DEFAULT now(),
  completed_at TIMESTAMP,
  recorded_by UUID REFERENCES users(id)
);

-- =====================================
-- SALES & ORDER MANAGEMENT
-- =====================================

CREATE TABLE IF NOT EXISTS b2b_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  b2b_customer_id UUID REFERENCES b2b_customers(id),
  order_source TEXT CHECK (order_source IN ('EMAIL', 'PHONE_CALL', 'WHATSAPP')),
  total_amount NUMERIC NOT NULL DEFAULT 0,
  order_status order_status DEFAULT 'PENDING',
  payment_status payment_status DEFAULT 'PENDING',
  tracking_notes TEXT,
  courier_details TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS b2b_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES b2b_orders(id),
  sku_id UUID REFERENCES skus(id),
  quantity INTEGER NOT NULL,
  unit_price NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS partner_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID REFERENCES distribution_partners(id),
  created_by UUID REFERENCES users(id),
  total_amount NUMERIC NOT NULL DEFAULT 0,
  order_status order_status DEFAULT 'PENDING',
  payment_status payment_status DEFAULT 'PENDING',
  tracking_notes TEXT,
  courier_details TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS partner_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID REFERENCES partner_orders(id),
  sku_id UUID REFERENCES skus(id),
  quantity INTEGER NOT NULL,
  mrp NUMERIC NOT NULL,
  applied_margin_percentage NUMERIC NOT NULL,
  selling_price NUMERIC NOT NULL,
  created_at TIMESTAMP DEFAULT now()
);

-- =====================================
-- WAREHOUSE MONTHLY PACKING
-- =====================================

CREATE TABLE IF NOT EXISTS monthly_packing_summary (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  month_year TEXT NOT NULL,
  sku_id UUID REFERENCES skus(id),
  packed_quantity INTEGER DEFAULT 0,
  dispatched_quantity INTEGER DEFAULT 0,
  balance_in_stock INTEGER GENERATED ALWAYS AS (packed_quantity - dispatched_quantity) STORED,
  updated_at TIMESTAMP DEFAULT now()
);

CREATE TABLE IF NOT EXISTS dispatch_register (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  dispatch_date TIMESTAMP DEFAULT now(),
  channel sale_channel NOT NULL,
  reference_order_id UUID,
  destination TEXT NOT NULL,
  transport_details TEXT,
  dispatched_by UUID REFERENCES users(id)
);
