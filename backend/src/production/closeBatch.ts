import { supabase } from "../db/supabaseClient";

export async function closeBatch(batchId: string) {
  // 1. Fetch batch
  const { data: batch, error } = await supabase
    .from("batches")
    .select("*")
    .eq("id", batchId)
    .single();

  if (error || !batch) {
    throw new Error("Batch not found");
  }

  // 2. Prevent illegal closure
  if (batch.status === "COMPLETED") {
    throw new Error("Batch is already completed");
  }

  if (batch.status !== "CONVERTED") {
    throw new Error(
      `Batch must be CONVERTED before completion. Current status: ${batch.status}`
    );
  }

  // 3. Close batch
  const { error: updateError } = await supabase
    .from("batches")
    .update({ status: "COMPLETED" })
    .eq("id", batchId);

  if (updateError) {
    throw new Error("Failed to complete batch");
  }

  console.log("✅ Batch marked as COMPLETED");
}