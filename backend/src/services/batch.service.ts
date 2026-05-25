import { supabase } from '../db/supabaseClient';

export interface CreateBatchInput {
  grnId: string;
  batchCode: string;
}

export async function createBatch(input: CreateBatchInput) {
  const { grnId, batchCode } = input;

  if (!grnId) {
    throw new Error('GRN ID is required');
  }

  if (!batchCode || batchCode.trim() === '') {
    throw new Error('Batch code is required');
  }

  // Fetch GRN
  const { data: grn, error: grnError } = await supabase
    .from('grns')
    .select('id, received_quantity_kg, quality_status')
    .eq('id', grnId)
    .single();

  if (grnError || !grn) {
    throw new Error('GRN does not exist');
  }

  if (grn.quality_status !== 'APPROVED') {
    throw new Error('Cannot create batch for rejected GRN');
  }

  // Check if batch already exists for this GRN
  const { data: existingBatch } = await supabase
    .from('batches')
    .select('id')
    .eq('grn_id', grnId)
    .limit(1);

  if (existingBatch && existingBatch.length > 0) {
    throw new Error('Batch already exists for this GRN');
  }

  // Create batch
  const { data: batch, error: batchError } = await supabase
    .from('batches')
    .insert({
      grn_id: grnId,
      batch_code: batchCode,
      initial_quantity: grn.received_quantity_kg
    })
    .select()
    .single();

  if (batchError) {
    throw new Error(batchError.message);
  }

  return batch;
}