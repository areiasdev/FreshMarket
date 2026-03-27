import { createContext, useContext, useEffect, useState } from "react";
import type { CartItem, Product } from "../../types";
import { clearCartStorage, loadCart, saveCart } from "./CartStorage";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, quantity: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>(loadCart);

  useEffect(() => {
    saveCart(items);
  }, [items]);

  const addItem = (product: Product, quantity: number) => {
    setItems(prev => {
      const existing = prev.find(i => i.productId === product.id);
      if (existing) {
        return prev.map(i =>
          i.productId === product.id
            ? {
                ...i,
                quantity: i.quantity + quantity,
                subtotal: Math.round((i.quantity + quantity) * i.pricePerUnit * 100) / 100,
              }
            : i
        );
      }
      return [
        ...prev,
        {
          productId:    product.id,
          name:         product.name,
          imageUrl:     product.imageUrl,
          pricePerUnit: product.pricePerUnit,
          unitType:     product.unitType,
          quantity,
          subtotal: Math.round(quantity * product.pricePerUnit * 100) / 100,
        },
      ];
    });
  };

  const removeItem = (productId: number) =>
    setItems(prev => prev.filter(i => i.productId !== productId));

  const updateQuantity = (productId: number, quantity: number) => {
    if (quantity <= 0) return removeItem(productId);
    setItems(prev =>
      prev.map(i =>
        i.productId === productId
          ? { ...i, quantity, subtotal: Math.round(quantity * i.pricePerUnit * 100) / 100 }
          : i
      )
    );
  };

  const clearCart = () => {
    setItems([]);
    clearCartStorage();
  };

  const totalItems  = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalAmount = Math.round(items.reduce((sum, i) => sum + i.subtotal, 0) * 100) / 100;

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, totalItems, totalAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
};