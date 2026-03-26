export const PaymentMethod = {
  Cash: 0,
  Card: 1,
  MBWay: 2,
  BankTransfer: 3,
} as const;

export type PaymentMethod =
  (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PaymentStatus = {
  Pending: 0,
  Succeeded: 1,
  Failed: 2,
  Refunded: 3,
} as const;

export type PaymentStatus =
  (typeof PaymentStatus)[keyof typeof PaymentStatus];

export type Payment = {
  id: number;
  orderId: number;
  method: PaymentMethod;
  status: PaymentStatus;
  amount: number;
  externalTransactionId?: string;
  provider?: string;
  paidAt?: string;
  createdAt: string;
};

export type CreatePaymentResponse = {
  payment: Payment;
  redirectUrl?: string;
};