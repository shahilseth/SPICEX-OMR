// ============ MASTER DATA ============

export interface SKU {
  id: string;
  product_name: string;
  weight_grams: number;
  mrp: number;
  is_active: boolean;
  created_at: string;
}

export interface Supplier {
  id: string;
  name: string;
  supplier_type: 'FPO' | 'FARMER' | 'VENDOR';
  state: string;
  block: string;
  area: string;
  phone: string;
  created_at: string;
}

export interface B2BCustomer {
  id: string;
  company_name: string;
  contact_person: string;
  phone: string;
  email: string;
  gst_number: string;
  billing_address: string;
  shipping_address: string;
  payment_terms: string;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'ADMIN' | 'SOURCING_MANAGER' | 'FACTORY_MANAGER' | 'SALES_MANAGER' | 'WAREHOUSE_MANAGER' | 'DISTRIBUTION_MANAGER' | 'SALES_PERSON';
  location: string;
  is_active: boolean;
  created_at: string;
}

export interface DistributionPartner {
  id: string;
  partner_type: 'DISTRIBUTOR' | 'FRANCHISEE';
  business_name: string;
  contact_person: string;
  phone: string;
  email: string;
  gst_number: string;
  address: string;
  margin_percentage: number;
  assigned_salesperson_id: string;
  assigned_salesperson?: { id: string; name: string };
  created_at: string;
}

// ============ SOURCING & PROCUREMENT ============

export interface PurchaseOrder {
  id: string;
  supplier_id: string;
  product: string;
  quantity_kg: number;
  rate_per_kg: number;
  material_type: 'FRESH' | 'DRY';
  expected_delivery_date: string;
  notes: string;
  po_number: string;
  status: string;
  created_at: string;
  suppliers?: { name: string };
}

export interface GRN {
  id: string;
  po_id: string;
  received_quantity_kg: number;
  quality_status: 'PENDING' | 'APPROVED' | 'REJECTED';
  received_at: string;
  purchase_orders?: {
    product: string;
    supplier_id: string;
    suppliers?: { name: string };
  };
}

// ============ FACTORY OPERATIONS ============

export interface Batch {
  id: string;
  grn_id: string;
  batch_code: string;
  status: 'CREATED' | 'IN_PROCESS' | 'CONVERTED';
  created_at: string;
  grns?: {
    po_id: string;
    received_quantity_kg: number;
    quality_status: string;
  };
}

export interface RawMaterialInventory {
  id: string;
  batch_id: string;
  quantity_kg: number;
  location: string;
  recorded_at: string;
  batches?: { batch_code: string; grn_id: string };
}

export interface ProcessingRun {
  id: string;
  batch_id: string;
  machine_type: 'DEHYDRATOR' | 'SOLAR_TUNNEL_DRYER';
  fresh_weight_kg: number;
  slice_weight_kg: number | null;
  dry_weight_kg: number | null;
  drying_time_hours: number | null;
  started_at: string;
  completed_at: string | null;
  recorded_by: string | null;
  batches?: { batch_code: string };
}

export interface FinishedGood {
  id: string;
  batch_id: string;
  product: string | null;
  sku_id: string | null;
  quantity_kg: number;
  location: string;
  created_at: string;
  batches?: { batch_code: string };
  skus?: { product_name: string; weight_grams: number; mrp: number };
}

// ============ SALES ============

export type OrderStatus = 'PENDING' | 'APPROVED' | 'FULFILLED' | 'DISPATCHED' | 'DELIVERED';
export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'COMPLETED';

export interface B2BOrder {
  id: string;
  b2b_customer_id: string;
  order_source: 'EMAIL' | 'PHONE_CALL' | 'WHATSAPP';
  total_amount: number;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  tracking_notes: string;
  courier_details: string;
  created_by: string;
  created_at: string;
  b2b_customers?: {
    company_name: string;
    billing_address: string;
    shipping_address: string;
    gst_number: string;
  };
}

export interface B2BOrderItem {
  id: string;
  order_id: string;
  sku_id: string;
  quantity: number;
  unit_price: number;
  created_at: string;
  skus?: { product_name: string; weight_grams: number; mrp: number };
}

// ============ DISTRIBUTION ============

export interface PartnerOrder {
  id: string;
  partner_id: string;
  created_by: string;
  total_amount: number;
  order_status: OrderStatus;
  payment_status: PaymentStatus;
  tracking_notes: string;
  courier_details: string;
  created_at: string;
  distribution_partners?: {
    business_name: string;
    partner_type: string;
    margin_percentage: number;
  };
}

export interface PartnerOrderItem {
  id: string;
  order_id: string;
  sku_id: string;
  quantity: number;
  mrp: number;
  applied_margin_percentage: number;
  selling_price: number;
  created_at: string;
  skus?: { product_name: string; weight_grams: number; mrp: number };
}

// ============ WAREHOUSE & DISPATCH ============

export type SaleChannel = 'B2B' | 'DISTRIBUTOR' | 'FRANCHISEE' | 'ONLINE';

export interface DispatchRecord {
  id: string;
  dispatch_date: string;
  channel: SaleChannel;
  reference_order_id: string;
  destination: string;
  transport_details: string;
  dispatched_by: string;
}

export interface MonthlyPackingSummary {
  id: string;
  month_year: string;
  sku_id: string;
  packed_quantity: number;
  dispatched_quantity: number;
  balance_in_stock: number; // GENERATED column
  updated_at: string;
  skus?: { product_name: string; weight_grams: number };
}