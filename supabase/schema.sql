-- Quality status of received material
CREATE TYPE quality_status AS ENUM (
  'PENDING',
  'APPROVED',
  'REJECTED'
);

-- Batch lifecycle
CREATE TYPE batch_status AS ENUM (
  'CREATED',
  'IN_PROCESS',
  'CONVERTED'
);

-- Material form
CREATE TYPE material_type AS ENUM (
  'FRESH',
  'DRY'
);

CREATE TABLE suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  supplier_type TEXT CHECK (supplier_type IN ('FPO', 'FARMER', 'VENDOR')),
  state TEXT,
  block TEXT,
  area TEXT,
  phone TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  supplier_id UUID REFERENCES suppliers(id),
  product TEXT NOT NULL,
  quantity_kg NUMERIC NOT NULL,
  rate_per_kg NUMERIC NOT NULL,
  material_type material_type NOT NULL,
  expected_delivery_date DATE,
  status TEXT DEFAULT 'CREATED',
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE grns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_id UUID REFERENCES purchase_orders(id),
  received_quantity_kg NUMERIC NOT NULL,
  quality_status quality_status DEFAULT 'PENDING',
  received_at TIMESTAMP DEFAULT now()
);

CREATE TABLE batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  grn_id UUID REFERENCES grns(id),
  batch_code TEXT UNIQUE NOT NULL,
  status batch_status DEFAULT 'CREATED',
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE raw_material_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES batches(id),
  quantity_kg NUMERIC NOT NULL,
  location TEXT,
  recorded_at TIMESTAMP DEFAULT now()
);

CREATE TABLE finished_goods_inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_id UUID REFERENCES batches(id),
  product TEXT NOT NULL,
  quantity_kg NUMERIC NOT NULL,
  location TEXT,
  created_at TIMESTAMP DEFAULT now()
);

CREATE TABLE skus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_name TEXT NOT NULL,
  weight_grams INTEGER NOT NULL,
  mrp NUMERIC NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT now()
);