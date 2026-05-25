import { supabase } from "../db/supabaseClient";

export async function assertFinishedGoodsAvailable(fgInventoryId: string) {
  const { data: fg, error } = await supabase
    .from("finished_goods_inventory")
    .select("*")
    .eq("id", fgInventoryId)
    .single();

  if (error || !fg) {
    throw new Error("Finished goods inventory not found");
  }

  if (fg.is_blocked) {
    throw new Error("Finished goods are blocked due to QC rejection");
  }

  if (fg.quantity_kg <= 0) {
    throw new Error("No available quantity to dispatch");
  }

  console.log("✅ Finished goods are available for dispatch");
  return fg;
}