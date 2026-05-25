import { supabase } from "../db/supabaseClient";

export async function createFinishedGoods(
  batchId: string,
  quantity: number,
  loss: number
) {

  // 1️⃣ fetch batch
  const { data: batch, error } = await supabase
    .from("batches")
    .select("status")
    .eq("id", batchId)
    .single();

  if (error || !batch) {
    throw new Error("Batch not found");
  }

  // 🔒 ADD THIS GUARD
  if (batch.status === "COMPLETED") {
    throw new Error("Cannot create finished goods for a closed batch");
  }

  // 2️⃣ apply production loss
  const netQuantity = quantity - loss;

  // 3️⃣ insert FG
  const { error: fgError } = await supabase
    .from("finished_goods_inventory")
    .insert({
      batch_id: batchId,
      quantity: netQuantity,
      loss_quantity: loss
    });

  if (fgError) {
    throw fgError;
  }

  return { message: "Finished goods created successfully" };
}