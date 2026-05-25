-- =====================================
-- MIGRATION: Add missing sku_id column to finished_goods_inventory
-- Run this AFTER schema.sql and schema_v2.sql
-- =====================================

-- Add sku_id to finished_goods_inventory if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'finished_goods_inventory' AND column_name = 'sku_id'
  ) THEN
    ALTER TABLE finished_goods_inventory ADD COLUMN sku_id UUID REFERENCES skus(id);
  END IF;
END $$;

-- Allow product to be nullable (for cases where we use sku_id instead)
ALTER TABLE finished_goods_inventory ALTER COLUMN product DROP NOT NULL;
