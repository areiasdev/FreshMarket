// Canonical display labels and styling for order and payment enums.
// Single source of truth — import from here instead of duplicating in components.

export const ORDER_STATUS_LABELS: Record<number, string> = {
  0: "Pendente",
  1: "Pago",
  2: "Em preparo",
  3: "Enviado",
  4: "Entregue",
  5: "Cancelado",
};

export const ORDER_STATUS_BADGE_CLASS: Record<number, string> = {
  0: "badge badge-yellow",
  1: "badge badge-blue",
  2: "badge badge-purple",
  3: "badge badge-blue",
  4: "badge badge-green",
  5: "badge badge-red",
};

export const ORDER_STATUS_PILL_CLASS: Record<number, string> = {
  0: "bg-yellow-100 text-yellow-700",
  1: "bg-blue-100 text-blue-700",
  2: "bg-purple-100 text-purple-700",
  3: "bg-indigo-100 text-indigo-700",
  4: "bg-green-100 text-green-700",
  5: "bg-red-100 text-red-600",
};

export const PAYMENT_METHOD_LABELS: Record<number, string> = {
  0: "Pagar na entrega",
  1: "Cartão de crédito",
  2: "MB Way",
  3: "Transferência bancária",
};

export const PAYMENT_STATUS_LABELS: Record<number, string> = {
  0: "Pendente",
  1: "Pago",
  2: "Falhou",
  3: "Reembolsado",
};
