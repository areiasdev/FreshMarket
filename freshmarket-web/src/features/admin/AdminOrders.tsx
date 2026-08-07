import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import client from "../../api/client";
import { endpoints } from "../../lib/endpoints";
import Pagination from "../../components/utils/Pagination";
import { orderStatusBadge, orderStatusLabel } from "../../lib/color";
import { parseDateOnly, parseDateTime } from "../../lib/dates";
import {
  ORDER_STATUS_LABELS,
  ORDER_STATUS_PILL_CLASS,
  PAYMENT_METHOD_LABELS,
  PAYMENT_STATUS_LABELS,
} from "../../lib/labels";
import Icon from "../../components/ui/Icon";
import { IconX, IconNotes } from "../../components/ui/icons";

interface OrderDetail {
  id: number;
  orderNumber: string;
  userFullName?: string;
  status: number;
  totalAmount: number;
  shippingFee: number;
  createdAt: string;
  deliveryStreet: string;
  deliveryPostalCode: string;
  deliveryCity: string;
  deliveryCountry: string;
  notes?: string;
  paymentMethod?: number | null;
  paymentStatus?: number | null;
  preferredDeliveryDate?: string;
  deliverySlot?: { deliveryDate: string; startTime: string; endTime: string };
  items: { productId: number; productName: string; quantity: number; unitType: number; unitPrice: number; subtotal: number }[];
}

interface Order {
  id: number;
  orderNumber: string;
  userFullName: string;
  userIsGuest?: boolean;
  totalAmount: number;
  status: number;
  paymentMethod?: number | null;
  notes?: string | null;
  createdAt: string;
  deliverySlot?: { deliveryDate: string; startTime: string; endTime: string };
}

const STATUS_OPTIONS = Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({
  value: Number(value),
  label,
  color: ORDER_STATUS_PILL_CLASS[Number(value)] ?? "",
}));

// Cash orders (paymentMethod=0) skip "Pago" until after delivery
function getNextStatus(order: Order): { value: number; label: string } | null {
  const isCash = order.paymentMethod === 0;
  switch (order.status) {
    case 0: return isCash
      ? { value: 2, label: "Marcar Em Preparo" }
      : { value: 1, label: "Marcar Pago" };
    case 1: return { value: 2, label: "Marcar Em Preparo" };
    case 2: return { value: 3, label: "Marcar Enviado"    };
    case 3: return isCash
      ? { value: 4, label: "Marcar Entregue (e Pago)" }
      : { value: 4, label: "Marcar Entregue"   };
    default: return null;
  }
}

export default function AdminOrders() {
  const [orders, setOrders]         = useState<Order[]>([]);
  const [total, setTotal]           = useState(0);
  const [loading, setLoading]       = useState(true);
  const [page, setPage]             = useState(1);
  const [pageSize, setPageSize]     = useState(10);
  const [selectedStatus, setSelectedStatus] = useState(0);
  const [searchInput, setSearchInput]   = useState("");
  const [search, setSearch]             = useState("");
  const [updating, setUpdating]         = useState<number | null>(null);
  const [detail, setDetail]             = useState<OrderDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [refundOpen, setRefundOpen]     = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refunding, setRefunding]       = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await client.get(
        endpoints.admin.orders.byStatus(selectedStatus.toString()),
        { params: { page, pageSize, search: search || undefined } }
      );
      setOrders(res.data.items);
      setTotal(res.data.totalCount);
    } finally {
      setLoading(false);
    }
  }, [selectedStatus, page, pageSize, search]);

  useEffect(() => { load(); }, [load]);

  const handleUpdateStatus = async (id: number, newStatus: number) => {
    setUpdating(id);
    try {
      await client.put(endpoints.admin.orders.updateStatus(id), { status: newStatus });
      await load();
      if (detail?.id === id) setDetail(d => d ? { ...d, status: newStatus } : null);
    } catch {
      alert("Erro ao atualizar o estado da encomenda.");
    } finally {
      setUpdating(null);
    }
  };

  const handleCancel = async (id: number) => {
    if (!confirm("Tens a certeza que queres cancelar esta encomenda?")) return;
    setUpdating(id);
    try {
      await client.put(endpoints.admin.orders.cancel(id));
      await load();
      if (detail?.id === id) setDetail(d => d ? { ...d, status: 5 } : null);
    } catch {
      alert("Erro ao cancelar a encomenda.");
    } finally {
      setUpdating(null);
    }
  };

  const handleStatusChange = (status: number) => {
    setSelectedStatus(status);
    setPage(1);
    setSearch("");
    setSearchInput("");
  };

  const openDetail = async (id: number) => {
    setLoadingDetail(true);
    setDetail(null);
    setRefundOpen(false);
    setRefundAmount("");
    try {
      const res = await client.get(endpoints.orders.getById(id));
      setDetail(res.data);
    } catch {
      alert("Erro ao carregar detalhe da encomenda.");
    } finally {
      setLoadingDetail(false);
    }
  };

  const handleRefund = async () => {
    if (!detail) return;
    setRefunding(true);
    try {
      const amount = refundAmount.trim() === "" ? undefined : parseFloat(refundAmount.replace(",", "."));
      await client.post(endpoints.admin.orders.refund(detail.id), { amount });
      setDetail(d => d ? { ...d, paymentStatus: 3 } : null);
      setRefundOpen(false);
      setRefundAmount("");
      await load();
    } catch (err) {
      const msg = axios.isAxiosError(err) ? err.response?.data?.detail : undefined;
      alert(msg || "Erro ao processar o reembolso.");
    } finally {
      setRefunding(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const res = await client.get(
        endpoints.admin.orders.byStatus(selectedStatus.toString()),
        { params: { page: 1, pageSize: 1000 } }
      );
      const rows: Order[] = res.data.items ?? [];
      const header = ["#", "Cliente", "Total", "Estado", "Método pagamento", "Criada em", "Entrega", "Notas"];
      const statusLabel = (s: number) => ORDER_STATUS_LABELS[s] ?? String(s);
      const payLabel = (m: number | null | undefined) => m == null ? "" : (PAYMENT_METHOD_LABELS[m] ?? String(m));
      const lines = rows.map(o => [
        o.orderNumber,
        o.userFullName,
        o.totalAmount.toFixed(2),
        statusLabel(o.status),
        payLabel(o.paymentMethod),
        o.createdAt,
        o.deliverySlot ? `${o.deliverySlot.deliveryDate} ${o.deliverySlot.startTime}` : "",
        o.notes ?? "",
      ].map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
      const csv = [header.join(","), ...lines].join("\n");
      const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `encomendas-${STATUS_OPTIONS[selectedStatus]?.label ?? selectedStatus}-${new Date().toISOString().slice(0,10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert("Erro ao exportar encomendas.");
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Encomendas</h2>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">{total} encomendas neste estado</p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <form
            onSubmit={e => { e.preventDefault(); setPage(1); setSearch(searchInput); }}
            className="flex gap-2"
          >
            <input
              value={searchInput}
              onChange={e => { setSearchInput(e.target.value); if (e.target.value === "") { setSearch(""); setPage(1); } }}
              placeholder="Nº encomenda, cliente ou email..."
              className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button type="submit" className="text-sm px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors">
              Pesquisar
            </button>
          </form>
          <button
            onClick={handleExportCsv}
            disabled={total === 0}
            className="text-sm px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors disabled:opacity-40"
          >
            Exportar CSV
          </button>
        </div>
      </div>

      {/* Tabs de status */}
      <div className="flex gap-1 border-b border-slate-200 dark:border-slate-700 overflow-x-auto">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s.value}
            onClick={() => handleStatusChange(s.value)}
            className={`px-4 py-2.5 text-sm font-medium border-b-2 whitespace-nowrap transition-colors ${
              selectedStatus === s.value
                ? "border-emerald-700 text-emerald-700 dark:text-emerald-400 dark:border-emerald-400"
                : "border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="card p-12 text-center text-slate-400 text-sm">
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
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    Sem encomendas neste estado.
                  </td>
                </tr>
              ) : orders.map((order) => {
                const nextStatus = getNextStatus(order);
                const isUpdating = updating === order.id;
                return (
                  <tr key={order.id} className="table-row transition">
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-slate-500 dark:text-slate-500">#{order.orderNumber}</span>
                      {order.notes && (
                        <span title={order.notes} className="ml-1.5 text-amber-500 cursor-help inline-flex align-middle">
                          <Icon icon={IconNotes} size={13} />
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                      {order.userFullName}
                      {order.userIsGuest && (
                        <span className="ml-1.5 text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-amber-50 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                          Convidado
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-emerald-700 dark:text-emerald-400">{order.totalAmount.toFixed(2)}€</td>
                    <td className="px-4 py-3">
                     <span className={orderStatusBadge[order.status] ?? "badge badge-slate"}>
                        {orderStatusLabel[order.status] ?? "—"}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {parseDateTime(order.createdAt)?.toLocaleString("pt-PT", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                      {order.deliverySlot
                        ? `${parseDateOnly(order.deliverySlot.deliveryDate)?.toLocaleDateString("pt-PT")} ${order.deliverySlot.startTime}–${order.deliverySlot.endTime}`
                        : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 flex-wrap">
                        <button
                          onClick={() => openDetail(order.id)}
                          className="text-xs text-slate-500 hover:underline dark:text-slate-400"
                        >
                          Ver
                        </button>
                        {nextStatus && (
                          <button
                            disabled={isUpdating}
                            onClick={() => handleUpdateStatus(order.id, nextStatus.value)}
                            className="text-xs text-blue-600 hover:underline disabled:opacity-50"
                          >
                            {isUpdating ? "..." : nextStatus.label}
                          </button>
                        )}
                        {order.status !== 5 && order.status !== 4 && order.status !== 3 && (
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

      {/* Order detail slide-over */}
      {(loadingDetail || detail) && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="fixed inset-0 bg-black/40" onClick={() => setDetail(null)} />
          <div className="relative w-full max-w-lg bg-white dark:bg-slate-800 h-full shadow-2xl overflow-y-auto flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-slate-700">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                {detail ? `Encomenda ${detail.orderNumber ?? `#${detail.id}`}` : "A carregar..."}
              </h2>
              <button onClick={() => setDetail(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <Icon icon={IconX} size={20} />
              </button>
            </div>

            {loadingDetail && !detail && (
              <p className="text-sm text-slate-400 text-center py-16">A carregar...</p>
            )}

            {detail && (
              <div className="flex-1 overflow-y-auto p-5 space-y-5">
                {/* Status + dates */}
                <div className="flex items-center justify-between">
                  <span className={orderStatusBadge[detail.status] ?? "badge badge-slate"}>
                    {orderStatusLabel[detail.status] ?? "—"}
                  </span>
                  <span className="text-xs text-slate-400">
                    {parseDateTime(detail.createdAt)?.toLocaleString("pt-PT", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </span>
                </div>

                {/* Delivery address */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Morada de entrega</p>
                  <p className="text-sm text-slate-800 dark:text-slate-100">{detail.deliveryStreet}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">{detail.deliveryPostalCode} {detail.deliveryCity} · {detail.deliveryCountry}</p>
                  {detail.deliverySlot && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Slot: {parseDateOnly(detail.deliverySlot.deliveryDate)?.toLocaleDateString("pt-PT")} {detail.deliverySlot.startTime}–{detail.deliverySlot.endTime}
                    </p>
                  )}
                  {!detail.deliverySlot && detail.preferredDeliveryDate && (
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Data preferida: {parseDateOnly(detail.preferredDeliveryDate)?.toLocaleDateString("pt-PT")}
                    </p>
                  )}
                  {detail.notes && (
                    <p className="text-xs italic text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded px-2.5 py-1.5 mt-1 flex items-start gap-1.5">
                      <Icon icon={IconNotes} size={13} className="flex-shrink-0 mt-0.5" />
                      {detail.notes}
                    </p>
                  )}
                </div>

                {/* Payment */}
                <div className="space-y-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide">Pagamento</p>
                  <p className="text-sm text-slate-700 dark:text-slate-300">
                    {detail.paymentMethod != null ? PAYMENT_METHOD_LABELS[detail.paymentMethod] ?? "—" : "—"}
                    {detail.paymentStatus != null && (
                      <span className={`ml-2 text-xs font-semibold ${detail.paymentStatus === 1 ? "text-emerald-600" : "text-slate-400"}`}>
                        ({PAYMENT_STATUS_LABELS[detail.paymentStatus] ?? "—"})
                      </span>
                    )}
                  </p>

                  {detail.paymentStatus === 1 && !refundOpen && (
                    <button
                      onClick={() => { setRefundOpen(true); setRefundAmount(detail.totalAmount.toFixed(2)); }}
                      className="text-xs text-red-500 hover:underline mt-1"
                    >
                      Reembolsar
                    </button>
                  )}

                  {refundOpen && (
                    <div className="mt-2 p-3 rounded-lg border border-slate-200 dark:border-slate-600 space-y-2">
                      <label className="block">
                        <span className="text-xs text-slate-500 dark:text-slate-400">Valor a reembolsar (€)</span>
                        <input
                          type="text" inputMode="decimal"
                          className="input mt-1 text-sm"
                          value={refundAmount}
                          onChange={e => setRefundAmount(e.target.value)}
                        />
                      </label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setRefundOpen(false)}
                          disabled={refunding}
                          className="btn-secondary flex-1 justify-center text-xs py-1.5"
                        >
                          Cancelar
                        </button>
                        <button
                          onClick={handleRefund}
                          disabled={refunding}
                          className="flex-1 justify-center text-xs py-1.5 rounded-lg bg-red-600 text-white hover:bg-red-500 transition-colors disabled:opacity-50"
                        >
                          {refunding ? "A processar..." : "Confirmar reembolso"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Items */}
                <div>
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">Produtos</p>
                  <div className="divide-y divide-slate-100 dark:divide-slate-700 border border-slate-100 dark:border-slate-700 rounded-lg overflow-hidden">
                    {detail.items.map(item => (
                      <div key={item.productId} className="flex justify-between items-center px-3 py-2.5">
                        <div>
                          <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{item.productName}</p>
                          <p className="text-xs text-slate-400 tabular-nums">
                            {item.unitType === 1 ? `${item.quantity.toFixed(2)} kg` : `${item.quantity} un`}
                            {" × "}{item.unitPrice.toFixed(2)}€
                          </p>
                        </div>
                        <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 tabular-nums">
                          {item.subtotal.toFixed(2)}€
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Totals */}
                <div className="bg-slate-50 dark:bg-slate-700/40 rounded-lg px-4 py-3 space-y-1.5">
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Subtotal</span>
                    <span className="tabular-nums">{(detail.totalAmount - detail.shippingFee).toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                    <span>Envio</span>
                    <span className="tabular-nums">{detail.shippingFee.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-sm font-bold text-slate-900 dark:text-slate-100 pt-1 border-t border-slate-200 dark:border-slate-600">
                    <span>Total</span>
                    <span className="tabular-nums text-emerald-700 dark:text-emerald-400">{detail.totalAmount.toFixed(2)}€</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}