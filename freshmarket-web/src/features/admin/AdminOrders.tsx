import { useEffect, useState } from "react";
import client from "../../api/client";
import { endpoints } from "../../lib/endpoints";
import Pagination from "../../components/utils/Pagination";
import { orderStatusBadge, orderStatusLabel } from "../../lib/color";
import { parseDateOnly, parseDateTime } from "../../lib/dates";

interface Order {
  id: number;
  orderNumber: string;
  userFullName: string;
  totalAmount: number;
  status: number;
  createdAt: string;
  deliverySlot?: { deliveryDate: string; startTime: string; endTime: string };
}

const STATUS_OPTIONS = [
  { label: "Pendente",   value: 0, color: "bg-yellow-100 text-yellow-700" },
  { label: "Pago",       value: 1, color: "bg-blue-100 text-blue-700"    },
  { label: "Em preparo", value: 2, color: "bg-purple-100 text-purple-700" },
  { label: "Enviado",    value: 3, color: "bg-indigo-100 text-indigo-700" },
  { label: "Entregue",   value: 4, color: "bg-green-100 text-green-700"  },
  { label: "Cancelado",  value: 5, color: "bg-red-100 text-red-600"      },
];

// Estado seguinte possível (linear, exceto Cancelado)
const NEXT_STATUS: Record<number, { value: number; label: string } | null> = {
  0: { value: 1, label: "Marcar Pago" },
  1: { value: 2, label: "Marcar Em Preparo" },
  2: { value: 3, label: "Marcar Enviado"    },
  3: { value: 4, label: "Marcar Entregue"   },
  4: null,
  5: null,
};

export default function AdminOrders() {
  const [orders, setOrders]         = useState<Order[]>([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [pageSize, setPageSize]     = useState(10);
  const [selectedStatus, setSelectedStatus] = useState(0);
  const [updating, setUpdating]     = useState<number | null>(null);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await client.get(
          endpoints.admin.orders.byStatus(selectedStatus.toString()),
          { params: { page, pageSize } }
        );
        setOrders(res.data.items);
        setTotal(res.data.totalCount);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [selectedStatus, page, pageSize]);

  const removeOrder = (id: number) => {
    setOrders(prev => prev.filter(o => o.id !== id));
    setTotal(t => t - 1);
  };

  const handleUpdateStatus = async (id: number, newStatus: number) => {
    setUpdating(id);
    try {
      await client.put(endpoints.admin.orders.updateStatus(id), { status: newStatus });
      removeOrder(id);
    } finally {
      setUpdating(null);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("Tens a certeza que queres cancelar esta encomenda?")) return;
    setUpdating(id);
    try {
      await client.put(endpoints.admin.orders.cancel(id));
      removeOrder(id);
    } finally {
      setUpdating(null);
    }
  };

  const handleStatusChange = (status: number) => {
    setSelectedStatus(status);
    setPage(1);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Encomendas</h2>
          <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">{total} encomendas neste estado</p>
        </div>
      </div>

      {/* Tabs de status */}
      <div className="flex gap-1 border-b border-gray-200 dark:border-slate-700 overflow-x-auto">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s.value}
            onClick={() => handleStatusChange(s.value)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              selectedStatus === s.value
                ? "border-emerald-700 text-emerald-700 dark:text-emerald-400 dark:border-emerald-400"
                : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card p-12 text-center text-gray-400 text-sm">
          A carregar encomendas...
        </div>
      ) : (
        <div className="card overflow-hidden">
          <table className="w-full text-sm">
            <thead className="table-header">
              <tr>
                <th className="px-4 py-3 text-left font-medium">#</th>
                <th className="px-4 py-3 text-left font-medium">Cliente</th>
                <th className="px-4 py-3 text-left font-medium">Total</th>
                <th className="px-4 py-3 text-left font-medium">Estado</th>
                <th className="px-4 py-3 text-left font-medium">Criada em</th>
                <th className="px-4 py-3 text-left font-medium">Entrega</th>
                <th className="px-4 py-3 text-left font-medium">Ações</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-gray-400">
                    Sem encomendas neste estado.
                  </td>
                </tr>
              ) : orders.map((order) => {
                const nextStatus = NEXT_STATUS[order.status];
                const isUpdating = updating === order.id;
                return (
                  <tr key={order.id} className="table-row transition">
                    <td className="px-4 py-3 font-mono text-xs text-gray-500 dark:text-slate-500">#{order.orderNumber}</td>
                    <td className="px-4 py-3 font-medium text-gray-800 dark:text-slate-200">{order.userFullName}</td>
                    <td className="px-4 py-3 font-semibold text-green-700 dark:text-emerald-400">{order.totalAmount.toFixed(2)}€</td>
                    <td className="px-4 py-3">
                     <span className={orderStatusBadge[order.status] ?? "badge badge-slate"}>
                        {orderStatusLabel[order.status] ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-slate-400">
                      {parseDateTime(order.createdAt)?.toLocaleString("pt-PT", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-gray-500 dark:text-slate-400">
                      {order.deliverySlot
                        ? `${parseDateOnly(order.deliverySlot.deliveryDate)?.toLocaleDateString("pt-PT")} ${order.deliverySlot.startTime}–${order.deliverySlot.endTime}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        {nextStatus && (
                          <button
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(order.id, nextStatus.value)}
                            className="text-xs text-blue-600 hover:underline disabled:opacity-50"
                          >
                            {isUpdating ? "..." : nextStatus.label}
                          </button>
                        )}
                        {order.status !== 5 && order.status !== 4 && (
                          <button
                            disabled={isUpdating}
                            onClick={() => handleCancel(order.id)}
                            className="text-xs text-red-500 hover:underline disabled:opacity-50"
                          >
                            Cancelar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>

          <Pagination
            page={page}
            totalPages={totalPages}
            totalCount={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
            pageSizeOptions={[5, 10, 20, 30]}
          />
        </div>
      )}
    </div>
  );
}