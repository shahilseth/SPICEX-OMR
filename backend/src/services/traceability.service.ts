import { supabase } from "../db/supabaseClient";

export async function getFinishedGoodTrace(fgiId: string) {
  // 1. Finished Goods Inventory
  const { data: fgi, error: fgiError } = await supabase
    .from("finished_goods_inventory")
    .select("*")
    .eq("id", fgiId)
    .single();

  if (fgiError || !fgi) {
    throw new Error("Finished Goods Inventory not found");
  }

  // 2. SKU (product details)
  const { data: sku, error: skuError } = await supabase
    .from("skus")
    .select("product_name, weight_grams, mrp")
    .eq("id", fgi.sku_id)
    .single();

  if (skuError || !sku) {
    throw new Error("SKU not found");
  }

  // 3. Batch
  const { data: batch, error: batchError } = await supabase
    .from("batches")
    .select("*")
    .eq("id", fgi.batch_id)
    .single();

  if (batchError || !batch) {
    throw new Error("Batch not found");
  }

  // 4. GRN
  const { data: grn, error: grnError } = await supabase
    .from("grns")
    .select("*")
    .eq("id", batch.grn_id)
    .single();

  if (grnError || !grn) {
    throw new Error("GRN not found");
  }

  // 5. Purchase Order
  const { data: po, error: poError } = await supabase
    .from("purchase_orders")
    .select("*")
    .eq("id", grn.po_id)
    .single();

  if (poError || !po) {
    throw new Error("Purchase Order not found");
  }

  // 6. Supplier
  const { data: supplier, error: supplierError } = await supabase
    .from("suppliers")
    .select("name, supplier_type, state, area")
    .eq("id", po.supplier_id)
    .single();

  if (supplierError || !supplier) {
    throw new Error("Supplier not found");
  }

  // 7. Final Traceability View (Mentor-ready)
  return {
    finished_good: {
      id: fgi.id,
      quantity_kg: fgi.quantity_kg,
      location: fgi.location,
      created_at: fgi.created_at
    },
    sku: {
      product_name: sku.product_name,
      pack_size_grams: sku.weight_grams,
      mrp: sku.mrp
    },
    batch: {
      id: batch.id,
      batch_code: batch.batch_code,
      status: batch.status
    },
    grn: {
      id: grn.id,
      received_quantity_kg: grn.received_quantity_kg,
      quality_status: grn.quality_status
    },
    purchase_order: {
      id: po.id,
      product: po.product,
      ordered_quantity_kg: po.quantity_kg,
      material_type: po.material_type
    },
    supplier
  };
}