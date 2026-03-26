const STATUS_MAP: Record<number, { label: string; className: string }> = {
  0: { label: "Pendente",   className: "badge badge-yellow"  },
  1: { label: "Confirmada", className: "badge badge-blue"    },
  2: { label: "Em entrega", className: "badge badge-purple"  },
  3: { label: "Entregue",   className: "badge badge-green"   },
  4: { label: "Cancelada",  className: "badge badge-red"     },
};

export default function StatusBadge({ status }: { status: number }) {
  const s = STATUS_MAP[status] ?? { label: "—", className: "badge badge-slate" };
  return <span className={s.className}>{s.label}</span>;
}