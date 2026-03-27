// features/cart/cartStorage.ts
// Separado do CartContext para satisfazer a regra react-refresh/only-export-components

export interface StoredCart {
  userId: number | null;
  savedAt: number;
  items: import("../../types").CartItem[];
}

const CART_KEY  = "freshmarket_cart";
export const TTL_HOURS = 24;

export function getCurrentUserId(): number | null {
  try {
    const raw = localStorage.getItem("user");
    if (!raw) return null;
    const u = JSON.parse(raw);
    return u?.id ?? null;
  } catch {
    return null;
  }
}

export function loadCart(): import("../../types").CartItem[] {
  try {
    const raw = localStorage.getItem(CART_KEY);
    if (!raw) return [];

    const stored: StoredCart = JSON.parse(raw);
    const currentUserId = getCurrentUserId();

    if (stored.userId !== currentUserId) return [];

    const ageHours = (Date.now() - stored.savedAt) / 1000 / 3600;
    if (ageHours > TTL_HOURS) return [];

    return stored.items;
  } catch {
    return [];
  }
}

export function saveCart(items: import("../../types").CartItem[]) {
  const stored: StoredCart = {
    userId:  getCurrentUserId(),
    savedAt: Date.now(),
    items,
  };
  localStorage.setItem(CART_KEY, JSON.stringify(stored));
}

export function clearCartStorage() {
  localStorage.removeItem(CART_KEY);
}