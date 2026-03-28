import { useEffect, useState } from "react";
import client from "../../api/client";
import Modal from "../../components/admin/Modal";
import { endpoints } from "../../lib/endpoints";
import Pagination from "../../components/utils/Pagination";
import { parseDateOnly } from "../../lib/dates";
import { orderStatusBadge, orderStatusLabel } from "../../lib/color";
import axios from "axios";

interface DeliverySlotDto {
  id: number;
  deliveryDate: string;
  startTime: string;
  endTime: string;
  maxOrders: number;
  currentOrders: number;
  shippingFee: number;
  isActive: boolean;
  availableSpots: number;
}

interface SlotOrder {
  id: number;
  orderNumber: string;
  userFullName: string;
  totalAmount: number;
  status: number;
  itemCount: number;
  deliveryCity: string;
  deliveryPostalCode: string;
}

export default function AdminDeliverySlots() {
  const [slots, setSlots]         = useState<DeliverySlotDto[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [pageSize, setPageSize]   = useState(10);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [expandedSlot, setExpandedSlot] = useState<number | null>(null);
  const [slotOrders, setSlotOrders]     = useState<Record<number, SlotOrder[] | "loading">>({});
  const [form, setForm] = useState({
    deliveryDate: "", startTime: "", endTime: "", maxOrders: 10, shippingfee: 0,
  });

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await client.get(
          endpoints.admin.slots.getAll + `?page=${page}&pageSize=${pageSize}`
        );
        setSlots(res.data.items ?? res.data);
        setTotal(res.data.totalCount ?? 0);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, pageSize]);

  const reload = async () => {
    const res = await client.get(
      endpoints.admin.slots.getAll + `?page=${page}&pageSize=${pageSize}`
    );
    setSlots(res.data.items ?? res.data);
    setTotal(res.data.totalCount ?? 0);
  };

  const handleSubmit = async () => {
    try {
      await client.post(endpoints.admin.slots.create, {
        deliveryDate: form.deliveryDate,
        startTime:    form.startTime + ":00",
        endTime:      form.endTime   + ":00",
        maxOrders:    form.maxOrders,
        shippingfee:  form.shippingfee,
      });
      setShowModal(false);
      await reload();
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.title ?? err.message)
        : "Erro ao guardar janela de entrega.";
      alert(msg);
    }
  };

  const toggleActive = async (id: number) => {
    await client.patch(endpoints.admin.slots.toggleActive(id));
    await reload();
  };

  const openCreate = () => {
    setForm({ deliveryDate: today, startTime: "", endTime: "", maxOrders: 10, shippingfee: 0 });
    setShowModal(true);
  };

  const toggleSlotOrders = async (slotId: number) => {
    if (expandedSlot === slotId) { setExpandedSlot(null); return; }
    setExpandedSlot(slotId);
    if (slotOrders[slotId]) return; // already loaded
    setSlotOrders(prev => ({ ...prev, [slotId]: "loading" }));
    try {
      const res = await client.get(endpoints.admin.orders.bySlot(slotId));
      setSlotOrders(prev => ({ ...prev, [slotId]: Array.isArray(res.data) ? res.data : [] }));
    } catch {
      setSlotOrders(prev => ({ ...prev, [slotId]: [] }));
    }
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Janelas de Entrega</h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Janelas horárias para organização interna das entregas
          </p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          + Nova Janela
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr>
              {["Data", "Horário", "Frete", "Capacidade", "Estado", "Ações"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide bg-slate-50 border-b border-slate-100 dark:bg-slate-700/50 dark:border-slate-700">
                  {h}
                </th>
              ))}
              <th className="text-left px-4 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide bg-slate-50 border-b border-slate-100 dark:bg-slate-700/50 dark:border-slate-700" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-sm text-slate-400">
                  A carregar...
                </td>
              </tr>
            ) : slots.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-sm text-slate-400">
                  Sem janelas de entrega configuradas.
                </td>
              </tr>
            ) : slots.map((s) => {
              const pct = s.maxOrders > 0
                ? Math.round((s.currentOrders / s.maxOrders) * 100)
                : 0;
              const dateLabel = parseDateOnly(s.deliveryDate)?.toLocaleDateString("pt-PT", {
                weekday: "short", day: "numeric", month: "short",
              }) ?? s.deliveryDate;
              const isExpanded = expandedSlot === s.id;
              const orders = slotOrders[s.id];
              return (
                <>
                  <tr key={s.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors dark:border-slate-700/40 dark:hover:bg-slate-700/30">
                    <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-200">
                      {dateLabel}
                    </td>
                    <td className="px-4 py-3 text-slate-600 tabular-nums dark:text-slate-400">
                      {s.startTime.slice(0, 5)} – {s.endTime.slice(0, 5)}
                    </td>
                    <td className="px-4 py-3 text-slate-600 tabular-nums dark:text-slate-400">
                      {s.shippingFee.toLocaleString("pt-PT", { minimumFractionDigits: 2 })}€
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-slate-600 tabular-nums text-xs dark:text-slate-400">
                          {s.currentOrders}/{s.maxOrders}
                        </span>
                        <div className="w-16 h-1.5 rounded-full bg-slate-100 overflow-hidden dark:bg-slate-600">
                          <div
                            className={`h-full rounded-full transition-all ${
                              pct >= 90 ? "bg-red-400" :
                              pct >= 60 ? "bg-amber-400" :
                                          "bg-emerald-500"
                            }`}
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={s.isActive ? "badge badge-green" : "badge badge-slate"}>
                        {s.isActive ? "Ativo" : "Inativo"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleActive(s.id)}
                        className="text-xs text-slate-500 hover:text-slate-700 transition-colors dark:text-slate-400 dark:hover:text-slate-200"
                      >
                        {s.isActive ? "Desativar" : "Ativar"}
                      </button>
                    </td>
                    <td className="px-4 py-3">
                      {s.currentOrders > 0 && (
                        <button
                          onClick={() => toggleSlotOrders(s.id)}
                          className="text-xs text-emerald-700 hover:text-emerald-600 dark:text-emerald-400 font-semibold transition-colors"
                        >
                          {isExpanded ? "Fechar ▲" : `Ver encomendas (${s.currentOrders}) ▼`}
                        </button>
                      )}
                    </td>
                  </tr>

                  {isExpanded && (
                    <tr key={`${s.id}-orders`} className="bg-slate-50 dark:bg-slate-800/50">
                      <td colSpan={7} className="px-6 py-4">
                        {orders === "loading" ? (
                          <p className="text-xs text-slate-400">A carregar encomendas...</p>
                        ) : orders == null || orders.length === 0 ? (
                          <p className="text-xs text-slate-400">Sem encomendas neste slot.</p>
                        ) : (
                          <table className="w-full text-xs">
                            <thead>
                              <tr className="text-slate-400 border-b border-slate-200 dark:border-slate-600">
                                <th className="text-left pb-2 font-semibold">#</th>
                                <th className="text-left pb-2 font-semibold">Cliente</th>
                                <th className="text-left pb-2 font-semibold">Morada</th>
                                <th className="text-left pb-2 font-semibold">Artigos</th>
                                <th className="text-right pb-2 font-semibold">Total</th>
                                <th className="text-left pb-2 font-semibold">Estado</th>
                              </tr>
                            </thead>
                            <tbody>
                              {orders.map(o => (
                                <tr key={o.id} className="border-b border-slate-100 dark:border-slate-700/50 last:border-0">
                                  <td className="py-2 font-mono text-slate-400">{o.orderNumber ?? `#${o.id}`}</td>
                                  <td className="py-2 font-medium text-slate-700 dark:text-slate-200">{o.userFullName}</td>
                                  <td className="py-2 text-slate-500 dark:text-slate-400">{o.deliveryPostalCode} {o.deliveryCity}</td>
                                  <td className="py-2 text-slate-500 dark:text-slate-400">{o.itemCount} art.</td>
                                  <td className="py-2 text-right font-semibold text-emerald-700 dark:text-emerald-400 tabular-nums">{o.totalAmount.toFixed(2)}€</td>
                                  <td className="py-2">
                                    <span className={orderStatusBadge[o.status] ?? "badge badge-slate"}>
                                      {orderStatusLabel[o.status] ?? "—"}
                                    </span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        )}
                      </td>
                    </tr>
                  )}
                </>
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
          pageSizeOptions={[5, 10, 20]}
        />
      </div>

      {showModal && (
        <Modal
          title="Nova Janela de Entrega"
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        >
          <div className="space-y-4">
            <div>
              <label className="label">Data de Entrega</label>
              <input
                type="date"
                className="input"
                min={today}
                value={form.deliveryDate}
                onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Início</label>
                <input
                  type="time"
                  className="input"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                />
              </div>
              <div>
                <label className="label">Fim</label>
                <input
                  type="time"
                  className="input"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Máx. Encomendas</label>
                <input
                  type="text"
                  inputMode="numeric"
                  className="input"
                  value={form.maxOrders}
                  onChange={(e) => setForm({ ...form, maxOrders: parseInt(e.target.value) || form.maxOrders })}
                />
              </div>
              <div>
                <label className="label">Frete (€)</label>
                <input
                  type="text"
                  inputMode="decimal"
                  className="input"
                  value={form.shippingfee}
                  onChange={(e) => {
                    const v = e.target.value.replace(",", ".");
                    setForm({ ...form, shippingfee: v === "" ? 0 : parseFloat(v) || form.shippingfee });
                  }}
                />
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
