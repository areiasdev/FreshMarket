const BASE = "/api";
const ADMIN = `${BASE}/admin`;

export const endpoints = {
  // ─── Auth ───────────────────────────────────────
  auth: {
    login:    `${BASE}/auth/login`,
    register: `${BASE}/auth/register`,
    refresh:  `${BASE}/auth/refresh-token`,   // ✅ FIX: era /refresh, backend espera /refresh-token
  },

  // ─── Public ─────────────────────────────────────
  products: {
    getAll:     `${BASE}/products`,
    getById:    (id: number) => `${BASE}/products/${id}`,
    byCategory: (categoryId: number) => `${BASE}/products/category/${categoryId}`,
  },
  categories: {
    getAll: `${BASE}/categories`,
  },
  deliverySlots: {
    available: `${BASE}/deliveryslots/available`,  // query: ?date=&postalCodePrefix=
    byDate:    (date: string) => `${BASE}/deliveryslots/date/${date}`,
  },
  orders: {
    my:     `${BASE}/orders/my`,
    getById:(id: number) => `${BASE}/orders/${id}`,
    place:  `${BASE}/orders`,
    cancel: (id: number) => `${BASE}/orders/${id}/cancel`,
  },
  payments: {
    create:     `${BASE}/payments`,
    confirm:    `${BASE}/payments/confirm`,
    getByOrder: (orderId: number) => `${BASE}/payments/order/${orderId}`,
  },

  // ─── Admin ──────────────────────────────────────
  admin: {
    categories: {
      getAll:       `${ADMIN}/categories`,
      create:       `${ADMIN}/categories`,
      // ⚠️  Nota: backend AdminCategories.cs não tem endpoint PUT de update.
      //     Se precisares de editar categorias, adiciona o endpoint no backend primeiro.
      update:       (id: number) => `${ADMIN}/categories/${id}`,
      toggleActive: (id: number) => `${ADMIN}/categories/${id}/toggle-active`, // PATCH (correto)
    },
    products: {
      getAll:          `${ADMIN}/products`,
      create:          `${ADMIN}/products`,
      update:          (id: number) => `${ADMIN}/products/${id}`,
      toggleActive:    (id: number) => `${ADMIN}/products/${id}/toggle-active`, // ← usar PUT (ver AdminProducts.tsx)
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
      byDate:       (date: string) => `${ADMIN}/slots/date/${date}`,
      create:       `${ADMIN}/slots`,
      toggleActive: (id: number)   => `${ADMIN}/slots/${id}/toggle-active`, // PATCH (correto)
    },
  },
} as const;