import { supabase } from '../db/supabaseClient';

export interface CreateRMStockInput {
  batchId: string; // UUID
  location?: string;
}

export async function createRMStock(input: CreateRMStockInput) {
  const { batchId, location = 'Factory Store' } = input;

  if (!batchId) {
    throw new Error('Batch ID is required');
  }

  // 1️⃣ Fetch batch (UUID-safe)
  const { data: batch, error: batchError } = await supabase
    .from('batches')
    .select('*')
    .eq('id', batchId)
    .single();

  if (batchError || !batch) {
    throw new Error('Batch does not exist');
  }

  // 2️⃣ Check existing RM inventory
  const { data: existingStock } = await supabase
    .from('raw_material_inventory')
    .select('id')
    .eq('batch_id', batchId)
    .limit(1);

  if (existingStock && existingStock.length > 0) {
    throw new Error('RM inventory already exists for this batch');
  }

  // 3️⃣ Create RM inventory
  const { data: rmStock, error: rmError } = await supabase
    .from('raw_material_inventory')
    .insert({
      batch_id: batchId,
      quantity_kg: batch.received_quantity_kg ?? null, // safe fallback
      location
    })
    .select()
    .single();

  if (rmError) {
    throw new Error(rmError.message);
  }

  return rmStock;
}