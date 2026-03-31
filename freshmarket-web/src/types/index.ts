// ─── Auth ─────────────────────────────────────────
export interface User {
  id: number;
  fullName: string;
  email: string;
  phone: string | null;
  address: string | null;
  postalCode: string | null;
  role: "Customer" | "Admin" | "SuperAdmin";
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  password: string;
  phone?: string;
}

// ─── Products ─────────────────────────────────────
export interface Product {
  id: number;
  name: string;
  description?: string;
  pricePerUnit: number;
  unitType: UnitType;
  minQuantity: number;
  stockQuantity: number;
  imageUrl?: string;
  isSeasonal: boolean;
  isActive: boolean;
  categoryId: number;
  categoryName: string;
}

export type UnitType = 0 | 1; // 0 = Unidade, 1 = Kg (por peso)

// ─── Categories ───────────────────────────────────
export interface Category {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
}

// ─── Cart ─────────────────────────────────────────
export interface CartItem {
  productId: number;
  name: string;
  imageUrl?: string;
  pricePerUnit: number;
  unitType: UnitType;
  quantity: number;
  subtotal: number;
}

// ─── Delivery ─────────────────────────────────────
export interface DeliverySlot {
  id: number;
  dayOfWeek: number;
  deliveryDate: string;   // DateOnly → string "yyyy-MM-dd"
  startTime: string;      // TimeOnly → string "HH:mm"
  endTime: string;
  maxOrders: number;
  currentOrders: number;
  isActive: boolean;
}

export interface ShippingZone {
  id: number;
  name: string;
  country: string;
  city: string;
  postalCodePrefix: string;
  shippingFee: number;
  minOrderValue: number;
  isActive: boolean;
}

// ─── Orders ───────────────────────────────────────
export type OrderStatus = 0 | 1 | 2 | 3 | 4 | 5;
// 0=Pendente, 1=Pago, 2=Em Preparo, 3=Enviado, 4=Entregue, 5=Cancelado

export type PaymentStatus = 0 | 1 | 2 | 3;
// 0=Pendente, 1=Pago, 2=Falhado, 3=Reembolsado

export interface OrderItemDto {
  productId: number;
  productName: string;
  quantity: number;
  unitType: UnitType;
  unitPrice: number;
  subtotal: number;
}

export interface DeliverySlotInfo {
  deliveryDate: string;
  startTime: string;
  endTime: string;
}

export interface OrderDto {
  id: number;
  userId: number;
  status: OrderStatus;
  totalAmount: number;
  shippingFee: number;
  paymentMethod?: string;
  paymentStatus: PaymentStatus;
  externalTransactionId?: string;
  notes?: string;
  deliveryStreet: string;
  deliveryPostalCode: string;
  deliveryCity: string;
  deliveryCountry: string;
  createdAt: string;
  deliverySlot?: DeliverySlotInfo;
  preferredDeliveryDate?: string;
  items: OrderItemDto[];
}

export interface OrderSummaryDto {
  id: number;
  status: OrderStatus;
  totalAmount: number;
  shippingFee: number;
  paymentMethod?: string;
  paymentStatus: PaymentStatus;
  createdAt: string;
  deliveryDate?: string;
  itemCount: number;
  deliverySlot?: DeliverySlotInfo;
  preferredDeliveryDate?: string;
}

// ─── Checkout ─────────────────────────────────────
export interface PlaceOrderRequest {
  deliverySlotId?: number;
  deliveryStreet: string;
  deliveryPostalCode: string;
  deliveryCity: string;
  deliveryCountry: string;
  preferredDeliveryDate?: string;
  notes?: string;
  items: { productId: number; quantity: number }[];
}

// ─── Notifications ────────────────────────────────
export type NotificationType = 0 | 1 | 2 | 3 | 4 | 5 | 6;
// 0=OrderPlaced, 1=OrderPaid, 2=OrderPreparing, 3=OrderShipped, 4=OrderDelivered, 5=OrderCancelled, 6=PaymentFailed

export interface Notification {
  id: number;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  orderId?: number;
  createdAt: string;
}