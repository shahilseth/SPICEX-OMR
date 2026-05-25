import { supabase } from '../db/supabaseClient';

export interface ReceiveGRNInput {
  purchaseOrderId: number;
  receivedQuantity: number;
  qualityStatus: 'APPROVED' | 'REJECTED';
  remarks?: string;
}

export async function receiveGRN(input: ReceiveGRNInput) {
  const { purchaseOrderId, receivedQuantity, qualityStatus, remarks } = input;

  if (!purchaseOrderId) {
    throw new Error('Purchase Order ID is required');
  }

  if (receivedQuantity <= 0) {
    throw new Error('Received quantity must be greater than zero');
  }

  if (!qualityStatus) {
    throw new Error('Quality status is required');
  }

  // Fetch PO
  const { data: po, error: poError } = await supabase
    .from('purchase_orders')
    .select('id, ordered_quantity, status')
    .eq('id', purchaseOrderId)
    .single();

  if (poError || !po) {
    throw new Error('Purchase Order does not exist');
  }

  if (po.status !== 'OPEN') {
    throw new Error('Cannot receive GRN for a closed PO');
  }

  if (receivedQuantity > po.ordered_quantity) {
    throw new Error('Received quantity cannot exceed ordered quantity');
  }

  // Create GRN
  const { data: grn, error: grnError } = await supabase
    .from('grns')
    .insert({
      purchase_order_id: purchaseOrderId,
      received_quantity: receivedQuantity,
      quality_status: qualityStatus,
      remarks: remarks ?? null
    })
    .select()
    .single();

  if (grnError) {
    throw new Error(grnError.message);
  }

  return grn;
}