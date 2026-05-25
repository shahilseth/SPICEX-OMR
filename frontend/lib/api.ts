export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3001';

// Re-export for backward compatibility
export const NEXT_PUBLIC_API_BASE_URL = API_BASE;

// ============ Generic helpers ============

async function get(path: string) {
  const res = await fetch(`${API_BASE}${path}`);
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `GET ${path} failed (${res.status})`);
  }
  return res.json();
}

async function post(path: string, data: any) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `POST ${path} failed (${res.status})`);
  }
  return res.json();
}

async function put(path: string, data: any) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `PUT ${path} failed (${res.status})`);
  }
  return res.json();
}

// ============ Suppliers ============
export const fetchSuppliers = () => get('/api/suppliers');
export const createSupplier = (data: any) => post('/api/suppliers', data);

// ============ Purchase Orders ============
export const fetchPurchaseOrders = () => get('/api/purchase-orders');
export const createPurchaseOrder = (data: any) => post('/api/purchase-orders', data);

// ============ GRNs ============
export const fetchGRNs = () => get('/api/grns');
export const createGRN = (data: any) => post('/api/grns', data);
export const updateGRN = (id: string, data: any) => put(`/api/grns/${id}`, data);
export const approveQC = (id: string) => post('/api/qc/approve', { id });
export const rejectQC = (id: string) => post('/api/qc/reject', { id });

// ============ SKUs ============
export const fetchSKUs = () => get('/api/skus');
export const createSKU = (data: any) => post('/api/skus', data);

// ============ Users ============
export const fetchUsers = () => get('/api/users');
export const createUser = (data: any) => post('/api/users', data);

// ============ B2B Customers ============
export const fetchB2BCustomers = () => get('/api/b2b-customers');
export const createB2BCustomer = (data: any) => post('/api/b2b-customers', data);

// ============ Distribution Partners ============
export const fetchPartners = () => get('/api/partners');
export const createPartner = (data: any) => post('/api/partners', data);
export const updatePartner = (id: string, data: any) => put(`/api/partners/${id}`, data);

// ============ Batches ============
export const fetchBatches = () => get('/api/batches');
export const createBatch = (data: any) => post('/api/batches', data);
export const updateBatch = (id: string, data: any) => put(`/api/batches/${id}`, data);

// ============ Raw Material Inventory ============
export const fetchRawInventory = () => get('/api/raw-inventory');
export const createRawInventory = (data: any) => post('/api/raw-inventory', data);
export const updateRawInventory = (id: string, data: any) => put(`/api/raw-inventory/${id}`, data);

// ============ Processing Runs ============
export const fetchProcessingRuns = () => get('/api/processing-runs');
export const createProcessingRun = (data: any) => post('/api/processing-runs', data);
export const updateProcessingRun = (id: string, data: any) => put(`/api/processing-runs/${id}`, data);
export const completeProcessingRun = (id: string, data: any) => post(`/api/processing-runs/${id}/complete`, data);

// ============ Finished Goods Inventory ============
export const fetchFinishedGoods = () => get('/api/finished-goods');
export const createFinishedGood = (data: any) => post('/api/finished-goods', data);
export const updateFinishedGood = (id: string, data: any) => put(`/api/finished-goods/${id}`, data);

// ============ B2B Orders ============
export const fetchB2BOrders = () => get('/api/b2b-orders');
export const createB2BOrder = (data: any) => post('/api/b2b-orders', data);
export const updateB2BOrder = (id: string, data: any) => put(`/api/b2b-orders/${id}`, data);
export const fetchB2BOrderItems = (orderId: string) => get(`/api/b2b-orders/${orderId}/items`);
export const fulfillB2BOrder = (id: string) => post(`/api/b2b-orders/${id}/fulfill`, {});
export const dispatchB2BOrder = (id: string, data: any) => post(`/api/b2b-orders/${id}/dispatch`, data);

// ============ Partner Orders ============
export const fetchPartnerOrders = () => get('/api/partner-orders');
export const createPartnerOrder = (data: any) => post('/api/partner-orders', data);
export const updatePartnerOrder = (id: string, data: any) => put(`/api/partner-orders/${id}`, data);
export const fetchPartnerOrderItems = (orderId: string) => get(`/api/partner-orders/${orderId}/items`);
export const fulfillPartnerOrder = (id: string) => post(`/api/partner-orders/${id}/fulfill`, {});
export const dispatchPartnerOrder = (id: string, data: any) => post(`/api/partner-orders/${id}/dispatch`, data);

// ============ Dispatch Register ============
export const fetchDispatches = () => get('/api/dispatch-register');
export const createDispatch = (data: any) => post('/api/dispatch-register', data);

// ============ Monthly Packing ============
export const fetchMonthlyPacking = () => get('/api/monthly-packing');
export const createMonthlyPacking = (data: any) => post('/api/monthly-packing', data);
export const updateMonthlyPacking = (id: string, data: any) => put(`/api/monthly-packing/${id}`, data);

// ============ Traceability ============
export const fetchTraceability = (fgId: string) => get(`/api/traceability/${fgId}`);

// ============ Partner Pricing Calculator ============
export const calculatePartnerPrice = (data: { partner_id: string; sku_id: string }) =>
  post('/api/calculate-partner-price', data);
