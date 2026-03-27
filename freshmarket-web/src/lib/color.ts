/**
 * Dicionário de cores da aplicação.
 * Usar sempre estas constantes em vez de classes Tailwind avulsas.
 * Baseado em Tailwind slate + emerald — coerente com o index.css.
 */

// ─── Texto ────────────────────────────────────────────────────────────────────
export const text = {
  primary:   "text-slate-900",
  secondary: "text-slate-600",
  muted:     "text-slate-400",
  disabled:  "text-slate-300",
  accent:    "text-emerald-700",
  danger:    "text-red-600",
  warning:   "text-amber-600",
  link:      "text-emerald-700 hover:text-emerald-900",
} as const;

// ─── Fundo ────────────────────────────────────────────────────────────────────
export const bg = {
  page:     "bg-slate-50",
  surface:  "bg-white",
  subtle:   "bg-slate-50",
  active:   "bg-emerald-700",
  hover:    "hover:bg-slate-50",
  danger:   "hover:bg-red-50",
} as const;

// ─── Dividers (em vez de borders coloridas) ───────────────────────────────────
export const divider = {
  default: "border-slate-100",   // entre rows de tabela, card internos
  strong:  "border-slate-200",   // contorno de card, input
  section: "border-t border-slate-100",
} as const;

// ─── Badges de estado — alinhados com index.css ───────────────────────────────
export const badge = {
  pending:    "badge badge-yellow",   // Pendente
  paid:       "badge badge-blue",     // Pago / Confirmada
  preparing:  "badge badge-purple",   // Em preparo
  shipped:    "badge badge-blue",     // Enviado
  delivered:  "badge badge-green",    // Entregue
  cancelled:  "badge badge-red",      // Cancelado
  active:     "badge badge-green",    // Ativo
  inactive:   "badge badge-red",      // Inativo
  seasonal:   "bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase",
} as const;

// ─── Mapeamento status de encomenda ──────────────────────────────────────────
export const orderStatusBadge: Record<number, string> = {
  0: badge.pending,
  1: badge.paid,
  2: badge.preparing,
  3: badge.shipped,
  4: badge.delivered,
  5: badge.cancelled,
};

export const orderStatusLabel: Record<number, string> = {
  0: "Pendente",
  1: "Pago",
  2: "Em preparo",
  3: "Enviado",
  4: "Entregue",
  5: "Cancelado",
};

// ─── Botões ───────────────────────────────────────────────────────────────────
export const btn = {
  primary:   "btn-primary",
  secondary: "btn-secondary",
  danger:    "btn-danger",
  ghost:     "btn-ghost",
} as const;

// ─── Inputs / Forms ───────────────────────────────────────────────────────────
export const input = {
  base:  "input",
  label: "label",
} as const;

// ─── Cards ────────────────────────────────────────────────────────────────────
export const card = {
  base:   "card",
  header: "card-header",
} as const;