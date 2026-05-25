import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { supabase } from "./db/supabaseClient";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "Backend running successfully" });
});

// ================= SOURCING & PROCUREMENT ROUTES =================

app.get("/api/suppliers", async (req, res) => {
  const { data, error } = await supabase.from("suppliers").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/suppliers", async (req, res) => {
  const { name, supplier_type, state, block, area, phone, location } = req.body;
  const { data, error } = await supabase
    .from("suppliers")
    .insert([{ name, supplier_type, state, block, area, phone, location }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

app.get("/api/purchase-orders", async (req, res) => {
  const { data, error } = await supabase
    .from("purchase_orders")
    .select("*, suppliers(name)");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/purchase-orders", async (req, res) => {
  const { supplier_id, product, quantity_kg, rate_per_kg, material_type, expected_delivery_date, notes, po_number } = req.body;
  const { data, error } = await supabase
    .from("purchase_orders")
    .insert([{ 
      supplier_id, 
      product, 
      quantity_kg, 
      rate_per_kg, 
      material_type, 
      expected_delivery_date,
      notes,
      po_number
    }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

app.get("/api/grns", async (req, res) => {
  const { data, error } = await supabase
    .from("grns")
    .select("*, purchase_orders(product, supplier_id, suppliers(name))");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/grns", async (req, res) => {
  const { po_id, received_quantity_kg } = req.body;
  const { data, error } = await supabase
    .from("grns")
    .insert([{ po_id, received_quantity_kg }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// ===== QC: Actually update GRN quality_status in the database =====
app.put("/api/grns/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const { data, error } = await supabase
    .from("grns")
    .update(updates)
    .eq("id", id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/qc/approve", async (req, res) => {
  const { id } = req.body;
  const { data, error } = await supabase
    .from("grns")
    .update({ quality_status: "APPROVED" })
    .eq("id", id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/qc/reject", async (req, res) => {
  const { id } = req.body;
  const { data, error } = await supabase
    .from("grns")
    .update({ quality_status: "REJECTED" })
    .eq("id", id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ================= MASTER DATA ROUTES =================

app.get("/api/skus", async (req, res) => {
  const { data, error } = await supabase.from("skus").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/skus", async (req, res) => {
  const { product_name, weight_grams, mrp, is_active } = req.body;
  const { data, error } = await supabase
    .from("skus")
    .insert([{ product_name, weight_grams, mrp, is_active }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// Users
app.get("/api/users", async (req, res) => {
  const { data, error } = await supabase.from("users").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/users", async (req, res) => {
  const { name, email, phone, role, location } = req.body;
  const { data, error } = await supabase
    .from("users")
    .insert([{ name, email, phone, role, location }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// B2B Customers
app.get("/api/b2b-customers", async (req, res) => {
  const { data, error } = await supabase.from("b2b_customers").select("*");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/b2b-customers", async (req, res) => {
  const { company_name, contact_person, phone, email, gst_number, billing_address, shipping_address, payment_terms } = req.body;
  const { data, error } = await supabase
    .from("b2b_customers")
    .insert([{ company_name, contact_person, phone, email, gst_number, billing_address, shipping_address, payment_terms }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// Distribution Partners
app.get("/api/partners", async (req, res) => {
  const { data, error } = await supabase
    .from("distribution_partners")
    .select("*, assigned_salesperson:users!assigned_salesperson_id(id, name)");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/partners", async (req, res) => {
  const { partner_type, business_name, contact_person, phone, email, gst_number, address, margin_percentage, assigned_salesperson_id } = req.body;
  const { data, error } = await supabase
    .from("distribution_partners")
    .insert([{ partner_type, business_name, contact_person, phone, email, gst_number, address, margin_percentage, assigned_salesperson_id }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

app.put("/api/partners/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const { data, error } = await supabase
    .from("distribution_partners")
    .update(updates)
    .eq("id", id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ================= BATCH ROUTES =================

app.get("/api/batches", async (req, res) => {
  const { data, error } = await supabase
    .from("batches")
    .select("*, grns(po_id, received_quantity_kg, quality_status)")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/batches", async (req, res) => {
  const { batch_code, status, grn_id } = req.body;
  const { data, error } = await supabase
    .from("batches")
    .insert([{ batch_code, status, grn_id }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

app.put("/api/batches/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const { data, error } = await supabase
    .from("batches")
    .update(updates)
    .eq("id", id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ================= RAW INVENTORY ROUTES =================

app.get("/api/raw-inventory", async (req, res) => {
  const { data, error } = await supabase
    .from("raw_material_inventory")
    .select("*, batches(batch_code, grn_id)");
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/raw-inventory", async (req, res) => {
  const { batch_id, quantity_kg, location } = req.body;
  const { data, error } = await supabase
    .from("raw_material_inventory")
    .insert([{ batch_id, quantity_kg: Number(quantity_kg), location }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

app.put("/api/raw-inventory/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  if (updates.quantity_kg !== undefined) updates.quantity_kg = Number(updates.quantity_kg);
  const { data, error } = await supabase
    .from("raw_material_inventory")
    .update(updates)
    .eq("id", id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ================= FACTORY PROCESSING RUNS (processing_runs table) =================

app.get("/api/processing-runs", async (req, res) => {
  const { data, error } = await supabase
    .from("processing_runs")
    .select("*, batches(batch_code)")
    .order("started_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/processing-runs", async (req, res) => {
  const { batch_id, machine_type, fresh_weight_kg, slice_weight_kg, dry_weight_kg, drying_time_hours, recorded_by } = req.body;
  
  // Update the associated batch status to IN_PROCESS
  await supabase
    .from("batches")
    .update({ status: "IN_PROCESS" })
    .eq("id", batch_id);

  const { data, error } = await supabase
    .from("processing_runs")
    .insert([{ batch_id, machine_type, fresh_weight_kg, slice_weight_kg, dry_weight_kg, drying_time_hours, recorded_by }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

app.put("/api/processing-runs/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const { data, error } = await supabase
    .from("processing_runs")
    .update(updates)
    .eq("id", id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Complete a processing run — sets completed_at and creates FG inventory
app.post("/api/processing-runs/:id/complete", async (req, res) => {
  const { id } = req.params;
  const { dry_weight_kg, sku_id, location } = req.body;

  // 1. Update the processing run with dry weight and completion time
  const { data: runData, error: runError } = await supabase
    .from("processing_runs")
    .update({ dry_weight_kg, completed_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();

  if (runError) return res.status(500).json({ error: runError.message });

  // 2. Deduct from raw material inventory
  const { data: rmStock, error: rmFetchErr } = await supabase
    .from("raw_material_inventory")
    .select("*")
    .eq("batch_id", runData.batch_id)
    .single();

  if (!rmFetchErr && rmStock) {
    const remaining = Math.max(0, rmStock.quantity_kg - runData.fresh_weight_kg);
    await supabase
      .from("raw_material_inventory")
      .update({ quantity_kg: remaining })
      .eq("id", rmStock.id);
  }

  // 3. Create finished goods inventory entry
  const { data: fgData, error: fgError } = await supabase
    .from("finished_goods_inventory")
    .insert([{
      batch_id: runData.batch_id,
      sku_id: sku_id || null,
      quantity_kg: dry_weight_kg,
      location: location || "FG Warehouse"
    }])
    .select();

  if (fgError) return res.status(500).json({ error: fgError.message });

  // 4. Update batch status to CONVERTED
  await supabase
    .from("batches")
    .update({ status: "CONVERTED" })
    .eq("id", runData.batch_id);

  res.json({ processing_run: runData, finished_goods: fgData });
});

// ================= FINISHED GOODS INVENTORY =================

app.get("/api/finished-goods", async (req, res) => {
  const { data, error } = await supabase
    .from("finished_goods_inventory")
    .select("*, batches(batch_code), skus(product_name, weight_grams, mrp)")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/finished-goods", async (req, res) => {
  const { batch_id, sku_id, quantity_kg, location, product } = req.body;
  const { data, error } = await supabase
    .from("finished_goods_inventory")
    .insert([{ batch_id, sku_id, quantity_kg: Number(quantity_kg), location, product }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

app.put("/api/finished-goods/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  if (updates.quantity_kg !== undefined) updates.quantity_kg = Number(updates.quantity_kg);
  const { data, error } = await supabase
    .from("finished_goods_inventory")
    .update(updates)
    .eq("id", id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ================= B2B SALES ORDERS =================

app.get("/api/b2b-orders", async (req, res) => {
  const { data, error } = await supabase
    .from("b2b_orders")
    .select("*, b2b_customers(company_name, billing_address, shipping_address, gst_number)")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/b2b-orders", async (req, res) => {
  const { b2b_customer_id, order_source, total_amount, tracking_notes, courier_details, created_by, items } = req.body;
  
  // 1. Create the order
  const { data: orderData, error: orderError } = await supabase
    .from("b2b_orders")
    .insert([{ b2b_customer_id, order_source, total_amount, tracking_notes, courier_details, created_by }])
    .select()
    .single();

  if (orderError) return res.status(500).json({ error: orderError.message });

  // 2. Insert order items if provided
  if (items && Array.isArray(items) && items.length > 0) {
    const orderItems = items.map((item: any) => ({
      order_id: orderData.id,
      sku_id: item.sku_id,
      quantity: item.quantity,
      unit_price: item.unit_price,
    }));

    const { error: itemsError } = await supabase
      .from("b2b_order_items")
      .insert(orderItems);

    if (itemsError) return res.status(500).json({ error: itemsError.message });
  }

  res.status(201).json(orderData);
});

app.put("/api/b2b-orders/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const { data, error } = await supabase
    .from("b2b_orders")
    .update(updates)
    .eq("id", id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// B2B Order Items
app.get("/api/b2b-orders/:orderId/items", async (req, res) => {
  const { orderId } = req.params;
  const { data, error } = await supabase
    .from("b2b_order_items")
    .select("*, skus(product_name, weight_grams, mrp)")
    .eq("order_id", orderId);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ===== Fulfill a B2B Order — deducts from FG inventory =====
app.post("/api/b2b-orders/:id/fulfill", async (req, res) => {
  const { id } = req.params;

  // 1. Get the order items
  const { data: items, error: itemsErr } = await supabase
    .from("b2b_order_items")
    .select("*, skus(product_name)")
    .eq("order_id", id);

  if (itemsErr) return res.status(500).json({ error: itemsErr.message });

  if (!items || items.length === 0) {
    return res.status(400).json({ error: "No items found for this order. Add items first." });
  }

  // 2. For each item, deduct from finished_goods_inventory
  for (const item of items) {
    // Find available FG stock for this SKU
    const { data: fgStocks, error: fgErr } = await supabase
      .from("finished_goods_inventory")
      .select("*")
      .eq("sku_id", item.sku_id)
      .gt("quantity_kg", 0)
      .order("created_at", { ascending: true });

    if (fgErr) return res.status(500).json({ error: fgErr.message });

    let remainingQty = item.quantity;
    for (const fg of (fgStocks || [])) {
      if (remainingQty <= 0) break;
      const deduct = Math.min(fg.quantity_kg, remainingQty);
      await supabase
        .from("finished_goods_inventory")
        .update({ quantity_kg: fg.quantity_kg - deduct })
        .eq("id", fg.id);
      remainingQty -= deduct;
    }
  }

  // 3. Update order status
  const { data, error } = await supabase
    .from("b2b_orders")
    .update({ order_status: "FULFILLED" })
    .eq("id", id)
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ================= PARTNER ORDERS (Distribution) =================

app.get("/api/partner-orders", async (req, res) => {
  const { data, error } = await supabase
    .from("partner_orders")
    .select("*, distribution_partners(business_name, partner_type, margin_percentage)")
    .order("created_at", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/partner-orders", async (req, res) => {
  const { partner_id, created_by, total_amount, tracking_notes, courier_details, items } = req.body;

  // 1. Get partner's margin
  const { data: partner, error: partnerErr } = await supabase
    .from("distribution_partners")
    .select("margin_percentage")
    .eq("id", partner_id)
    .single();

  if (partnerErr || !partner) return res.status(400).json({ error: "Partner not found" });

  // 2. Calculate total from items with margin-adjusted pricing
  let calcTotal = 0;
  const processedItems: any[] = [];
  if (items && Array.isArray(items)) {
    for (const item of items) {
      // Get SKU MRP
      const { data: sku } = await supabase
        .from("skus")
        .select("mrp")
        .eq("id", item.sku_id)
        .single();

      const mrp = sku?.mrp || item.mrp || 0;
      const margin = partner.margin_percentage;
      const sellingPrice = mrp - (mrp * margin / 100);

      processedItems.push({
        sku_id: item.sku_id,
        quantity: item.quantity,
        mrp,
        applied_margin_percentage: margin,
        selling_price: sellingPrice,
      });

      calcTotal += sellingPrice * item.quantity;
    }
  }

  // 3. Create order
  const { data: orderData, error: orderError } = await supabase
    .from("partner_orders")
    .insert([{ partner_id, created_by, total_amount: total_amount || calcTotal, tracking_notes, courier_details }])
    .select()
    .single();

  if (orderError) return res.status(500).json({ error: orderError.message });

  // 4. Insert line items
  if (processedItems.length > 0) {
    const orderItems = processedItems.map(pi => ({
      ...pi,
      order_id: orderData.id,
    }));

    const { error: itemsError } = await supabase
      .from("partner_order_items")
      .insert(orderItems);

    if (itemsError) return res.status(500).json({ error: itemsError.message });
  }

  res.status(201).json(orderData);
});

app.put("/api/partner-orders/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const { data, error } = await supabase
    .from("partner_orders")
    .update(updates)
    .eq("id", id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Partner Order Items
app.get("/api/partner-orders/:orderId/items", async (req, res) => {
  const { orderId } = req.params;
  const { data, error } = await supabase
    .from("partner_order_items")
    .select("*, skus(product_name, weight_grams, mrp)")
    .eq("order_id", orderId);
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// Fulfill partner order (deduct from FG inventory)
app.post("/api/partner-orders/:id/fulfill", async (req, res) => {
  const { id } = req.params;

  const { data: items, error: itemsErr } = await supabase
    .from("partner_order_items")
    .select("*")
    .eq("order_id", id);

  if (itemsErr) return res.status(500).json({ error: itemsErr.message });
  if (!items || items.length === 0) {
    return res.status(400).json({ error: "No items found for this order." });
  }

  for (const item of items) {
    const { data: fgStocks } = await supabase
      .from("finished_goods_inventory")
      .select("*")
      .eq("sku_id", item.sku_id)
      .gt("quantity_kg", 0)
      .order("created_at", { ascending: true });

    let remainingQty = item.quantity;
    for (const fg of (fgStocks || [])) {
      if (remainingQty <= 0) break;
      const deduct = Math.min(fg.quantity_kg, remainingQty);
      await supabase
        .from("finished_goods_inventory")
        .update({ quantity_kg: fg.quantity_kg - deduct })
        .eq("id", fg.id);
      remainingQty -= deduct;
    }
  }

  const { data, error } = await supabase
    .from("partner_orders")
    .update({ order_status: "FULFILLED" })
    .eq("id", id)
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ================= DISPATCH REGISTER =================

app.get("/api/dispatch-register", async (req, res) => {
  const { data, error } = await supabase
    .from("dispatch_register")
    .select("*")
    .order("dispatch_date", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/dispatch-register", async (req, res) => {
  const { channel, reference_order_id, destination, transport_details, dispatched_by } = req.body;
  const { data, error } = await supabase
    .from("dispatch_register")
    .insert([{ channel, reference_order_id, destination, transport_details, dispatched_by }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

// Dispatch an order — creates dispatch record and updates order status to DISPATCHED
app.post("/api/b2b-orders/:id/dispatch", async (req, res) => {
  const { id } = req.params;
  const { destination, transport_details, dispatched_by } = req.body;

  // 1. Create dispatch register entry
  const { error: dispatchErr } = await supabase
    .from("dispatch_register")
    .insert([{
      channel: "B2B",
      reference_order_id: id,
      destination: destination || "Client Address",
      transport_details: transport_details || "",
      dispatched_by,
    }]);

  if (dispatchErr) return res.status(500).json({ error: dispatchErr.message });

  // 2. Update order status
  const { data, error } = await supabase
    .from("b2b_orders")
    .update({ order_status: "DISPATCHED", courier_details: transport_details })
    .eq("id", id)
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/partner-orders/:id/dispatch", async (req, res) => {
  const { id } = req.params;
  const { destination, transport_details, dispatched_by, partner_type } = req.body;

  const { error: dispatchErr } = await supabase
    .from("dispatch_register")
    .insert([{
      channel: partner_type === "FRANCHISEE" ? "FRANCHISEE" : "DISTRIBUTOR",
      reference_order_id: id,
      destination: destination || "Partner Address",
      transport_details: transport_details || "",
      dispatched_by,
    }]);

  if (dispatchErr) return res.status(500).json({ error: dispatchErr.message });

  const { data, error } = await supabase
    .from("partner_orders")
    .update({ order_status: "DISPATCHED", courier_details: transport_details })
    .eq("id", id)
    .select();

  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ================= MONTHLY PACKING SUMMARY =================

app.get("/api/monthly-packing", async (req, res) => {
  const { data, error } = await supabase
    .from("monthly_packing_summary")
    .select("*, skus(product_name, weight_grams)")
    .order("month_year", { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

app.post("/api/monthly-packing", async (req, res) => {
  const { month_year, sku_id, packed_quantity, dispatched_quantity } = req.body;
  const { data, error } = await supabase
    .from("monthly_packing_summary")
    .insert([{ month_year, sku_id, packed_quantity, dispatched_quantity }])
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json(data);
});

app.put("/api/monthly-packing/:id", async (req, res) => {
  const { id } = req.params;
  const updates = req.body;
  const { data, error } = await supabase
    .from("monthly_packing_summary")
    .update(updates)
    .eq("id", id)
    .select();
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// ================= TRACEABILITY =================

app.get("/api/traceability/:fgId", async (req, res) => {
  const { fgId } = req.params;

  // 1. Get FG record
  const { data: fg, error: fgErr } = await supabase
    .from("finished_goods_inventory")
    .select("*, skus(product_name, weight_grams)")
    .eq("id", fgId)
    .single();
  if (fgErr) return res.status(500).json({ error: fgErr.message });

  // 2. Get batch
  const { data: batch } = await supabase
    .from("batches")
    .select("*")
    .eq("id", fg.batch_id)
    .single();

  // 3. Get GRN
  const { data: grn } = await supabase
    .from("grns")
    .select("*, purchase_orders(*, suppliers(*))")
    .eq("id", batch?.grn_id)
    .single();

  // 4. Get processing runs
  const { data: runs } = await supabase
    .from("processing_runs")
    .select("*")
    .eq("batch_id", fg.batch_id);

  res.json({
    finished_good: fg,
    batch,
    grn,
    processing_runs: runs,
  });
});

// ================= PRICE CALCULATOR (for partner pricing) =================

app.post("/api/calculate-partner-price", async (req, res) => {
  const { partner_id, sku_id } = req.body;

  const { data: partner } = await supabase
    .from("distribution_partners")
    .select("margin_percentage")
    .eq("id", partner_id)
    .single();

  const { data: sku } = await supabase
    .from("skus")
    .select("mrp, product_name, weight_grams")
    .eq("id", sku_id)
    .single();

  if (!partner || !sku) return res.status(404).json({ error: "Partner or SKU not found" });

  const sellingPrice = sku.mrp - (sku.mrp * partner.margin_percentage / 100);

  res.json({
    sku,
    margin_percentage: partner.margin_percentage,
    mrp: sku.mrp,
    selling_price: Number(sellingPrice.toFixed(2)),
  });
});

app.listen(PORT, () => {
  console.log(`
====================================
     SPICEX OMS Backend Running
====================================
Server running on port ${PORT}
REST API is ready.
`);
});