const BASE = "/api";
const ADMIN = `${BASE}/admin`;

export const endpoints = {
  // ─── Auth ───────────────────────────────────────
  auth: {
    login:    `${BASE}/auth/login`,
    register: `${BASE}/auth/register`,
    refresh:  `${BASE}/auth/refresh`,
  },

  // ─── Public ─────────────────────────────────────
  products: {
    getAll: `${BASE}/products`,
    getById: (id: number) => `${BASE}/products/${id}`,
  },
  categories: {
    getAll: `${BASE}/categories`,
  },
  deliveryslots: {
    getAvailable: `${BASE}/deliveryslots`,
  },

  // ─── Admin ──────────────────────────────────────
  admin: {
    categories: {
      getAll:       `${ADMIN}/categories`,
      create:       `${ADMIN}/categories`,
      update:       (id: number) => `${ADMIN}/categories/${id}`,
      toggleActive: (id: number) => `${ADMIN}/categories/${id}/toggle-active`,
    },
      products: {
      getAll:       `${ADMIN}/products`,
      create:       `${ADMIN}/products`,
      update:       (id: number) => `${ADMIN}/products/${id}`,
      toggleActive: (id: number) => `${ADMIN}/products/${id}/toggle-active`,
      bulkUpdatePrice: `${ADMIN}/products/bulk-price`,
    },
    orders: {
      byStatus:    (status: string) => `${ADMIN}/orders/status/${status}`,
      bySlot:      (slotId: number) => `${ADMIN}/orders/slot/${slotId}`,
      harvestList: (date: string)   => `${ADMIN}/orders/harvest/${date}`,
      updateStatus:(id: number)     => `${ADMIN}/orders/${id}/status`,
      cancel:      (id: number)     => `${ADMIN}/orders/${id}/cancel`,
    },
    slots: {
      getAll:       `${ADMIN}/slots`,
      byDate:       (date: string)  => `${ADMIN}/slots/date/${date}`,
      create:       `${ADMIN}/slots`,
      toggleActive: (id: number)    => `${ADMIN}/slots/${id}/toggle-active`,
    },
    shippingZones: {
      getAll:       `${ADMIN}/shippingzones`,
      create:       `${ADMIN}/shippingzones`,
      update:       (id: number) => `${ADMIN}/shippingzones/${id}`,
      toggleActive: (id: number) => `${ADMIN}/shippingzones/${id}/toggle-active`,
    },
  },
} as const;