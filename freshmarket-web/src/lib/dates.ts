/** Para campos DateTime completos do backend (createdAt, updatedAt, etc.) */
export function parseDateTime(d?: string | null): Date | null {
  if (!d) return null;
  return new Date(d);
}

/** Para campos DateOnly do backend (preferredDeliveryDate, deliveryDate, etc.) */
export function parseDateOnly(d?: string | null): Date | null {
  if (!d) return null;
  // Força parse como hora local evitando o offset UTC
  return new Date(d + "T12:00:00");
}

/** Formata uma data curta para pt-PT: "31 mar." */
export function formatShortDate(d?: string | null, isDateOnly = false): string {
  const date = isDateOnly ? parseDateOnly(d) : parseDateTime(d);
  if (!date) return "—";
  return date.toLocaleDateString("pt-PT", { day: "numeric", month: "short" });
}

/** Formata uma data longa para pt-PT: "segunda-feira, 31 de março" */
export function formatLongDate(d?: string | null, isDateOnly = false): string {
  const date = isDateOnly ? parseDateOnly(d) : parseDateTime(d);
  if (!date) return "—";
  return date.toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" });
}

/** Formata datetime completo: "31 de março de 2026, 14:23" */
export function formatDateTime(d?: string | null): string {
  const date = parseDateTime(d);
  if (!date) return "—";
  return date.toLocaleDateString("pt-PT", {
    day: "numeric", month: "long", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}