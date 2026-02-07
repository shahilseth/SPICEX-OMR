INSERT INTO skus (id, product_name, weight_grams, mrp) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Turmeric Powder', 200, 180),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Turmeric Powder', 500, 420),
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Ginger Powder', 200, 190),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'Ginger Powder', 500, 440);

INSERT INTO suppliers (id, name, supplier_type, state, block, area, phone)
VALUES (
  '11111111-1111-1111-1111-111111111111',
  'Malwa Spice Farmers FPO',
  'FPO',
  'Punjab',
  'Sangrur',
  'Sunam',
  '9876543210'
);

INSERT INTO purchase_orders (
  id, supplier_id, product, quantity_kg, rate_per_kg, material_type, expected_delivery_date
)
VALUES (
  '22222222-2222-2222-2222-222222222222',
  '11111111-1111-1111-1111-111111111111',
  'Turmeric (Raw)',
  1000,
  85,
  'FRESH',
  '2026-02-10'
);

INSERT INTO grns (
  id, po_id, received_quantity_kg, quality_status
)
VALUES (
  '33333333-3333-3333-3333-333333333333',
  '22222222-2222-2222-2222-222222222222',
  980,
  'APPROVED'
);

INSERT INTO batches (
  id, grn_id, batch_code, status
)
VALUES (
  '44444444-4444-4444-4444-444444444444',
  '33333333-3333-3333-3333-333333333333',
  'BATCH-TUR-20260207-001',
  'CREATED'
);

INSERT INTO raw_material_inventory (
  id, batch_id, quantity_kg, location
)
VALUES (
  '55555555-5555-5555-5555-555555555555',
  '44444444-4444-4444-4444-444444444444',
  980,
  'Raw Material Store - A'
);

ALTER TABLE finished_goods_inventory
ALTER COLUMN product DROP NOT NULL;

INSERT INTO finished_goods_inventory (
  id, batch_id, sku_id, quantity_kg, location
)
VALUES (
  '66666666-6666-6666-6666-666666666666',
  '44444444-4444-4444-4444-444444444444',
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  900,
  'FG Warehouse - A'
);