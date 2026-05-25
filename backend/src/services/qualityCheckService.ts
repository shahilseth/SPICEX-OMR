import { supabase } from "../db/supabaseClient";

export async function performQualityCheck({
  batchId,
  fgInventoryId,
  status,
  remarks,
}: {
  batchId: string;
  fgInventoryId: string;
  status: "APPROVED" | "REJECTED";
  remarks?: string;
}) {
  // 1. Validate FG inventory
  const { data: fg, error: fgError } = await supabase
    .from("finished_goods_inventory")
    .select("*")
    .eq("id", fgInventoryId)
    .single();

  if (fgError || !fg) {
    throw new Error("Finished goods inventory not found");
  }

  // 2. Record QC decision
  const { error: qcError } = await supabase
    .from("quality_checks")
    .insert({
      batch_id: batchId,
      fg_inventory_id: fgInventoryId,
      status,
      remarks,
    });

  if (qcError) {
    throw new Error("Failed to record quality check");
  }

  // 3. Block or unblock FG
  const { error: blockError } = await supabase
    .from("finished_goods_inventory")
    .update({
      is_blocked: status === "REJECTED",
    })
    .eq("id", fgInventoryId);

  if (blockError) {
    throw new Error("Failed to update FG block status");
  }

  console.log(
    status === "REJECTED"
      ? "🚫 Finished goods blocked due to QC rejection"
      : "✅ Finished goods approved and unblocked"
  );
}