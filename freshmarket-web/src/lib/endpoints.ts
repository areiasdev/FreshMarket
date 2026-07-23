const BASE = "/api";
const ADMIN = `${BASE}/admin`;

export const endpoints = {
  // ─── Auth ───────────────────────────────────────
  auth: {
    login:    `${BASE}/auth/login`,
    register: `${BASE}/auth/register`,
    refresh:  `${BASE}/auth/refresh-token`,
    logout:   `${BASE}/auth/logout`,
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
    available: `${BASE}/deliveryslots/available`,
    byDate:    (date: string) => `${BASE}/deliveryslots/date/${date}`,
  },
  users: {
    me: `${BASE}/users/me`,
  },
  addresses: {
    byUser:           (userId: number) => `${BASE}/addresses/user/${userId}`,
    create:           `${BASE}/addresses`,
    update:           (id: number)     => `${BASE}/addresses/${id}`,
    delete:           (id: number)     => `${BASE}/addresses/${id}`,
    setDefault:       (id: number)     => `${BASE}/addresses/${id}/default`,
    validatePostalCode: `${BASE}/addresses/validate-postal-code`,
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
  notifications: {
    getAll:      `${BASE}/notifications`,
    unreadCount: `${BASE}/notifications/unread-count`,
    markRead:    (id: number) => `${BASE}/notifications/${id}/read`,
    markAllRead: `${BASE}/notifications/read-all`,
  },
  shipping: {
    options: `${BASE}/shipping/options`,
  },
  reviews: {
    byProduct: (productId: number) => `${BASE}/reviews/product/${productId}`,
    summary:   (productId: number) => `${BASE}/reviews/product/${productId}/summary`,
    create:    `${BASE}/reviews`,
    delete:    (id: number)        => `${BASE}/reviews/${id}`,
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
      getAll:          `${ADMIN}/products`,
      create:          `${ADMIN}/products`,
      update:          (id: number) => `${ADMIN}/products/${id}`,
      toggleActive:    (id: number) => `${ADMIN}/products/${id}/toggle-active`,
      bulkUpdatePrice: `${ADMIN}/products/bulk-price`,
    },
    orders: {
      byStatus:    (status: string) => `${ADMIN}/orders/status/${status}`,
      bySlot:      (slotId: number) => `${ADMIN}/orders/slot/${slotId}`,
      harvestList: (from: string, to: string) => `${ADMIN}/orders/harvest?from=${from}&to=${to}`,
      updateStatus:(id: number)     => `${ADMIN}/orders/${id}/status`,
      cancel:      (id: number)     => `${ADMIN}/orders/${id}/cancel`,
    },
    slots: {
      getAll:       `${ADMIN}/slots`,
      byDate:       (date: string) => `${ADMIN}/slots/date/${date}`,
      create:       `${ADMIN}/slots`,
      toggleActive: (id: number)   => `${ADMIN}/slots/${id}/toggle-active`,
    },
    users: {
      getAll:       `${ADMIN}/users`,
      getById:      (id: number) => `${ADMIN}/users/${id}`,
      updateRole:   (id: number) => `${ADMIN}/users/${id}/role`,
      toggleActive: (id: number) => `${ADMIN}/users/${id}/toggle-active`,
    },
    dashboard: `${ADMIN}/dashboard`,
    metrics:   `${ADMIN}/metrics`,
    uploads: {
      image: `${ADMIN}/uploads/image`,
    },
  },
} as const;
