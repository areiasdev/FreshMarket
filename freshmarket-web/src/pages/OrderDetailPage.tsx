import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import client from "../api/client";
import { endpoints } from "../lib/endpoints";
import type { OrderDto } from "../types";
import Navbar from "../components/layout/Navbar";
import StatusBadge from "../components/layout/StatusBadge";
import Breadcrumb from "../components/layout/BreadCrumb";

const TIMELINE = [
  { status: 0, label: "Pendente"    },
  { status: 1, label: "Confirmada"  },
  { status: 2, label: "Em entrega"  },
  { status: 3, label: "Entregue"    },
];

export default function OrderDetailPage() {
  const { id }    = useParams<{ id: string }>();
  // const navigate  = useNavigate();
  const [order, setOrder]         = useState<OrderDto | null>(null);
  const [loading, setLoading]     = useState(true);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    client.get(endpoints.orders.getById(Number(id)))
      .then(res => setOrder(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!order || !confirm("Tens a certeza?")) return;
    setCancelling(true);
    try {
      await client.put(endpoints.orders.cancel(order.id));
      setOrder({ ...order, status: 4 });
    } finally { setCancelling(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <p className="text-center py-20 text-sm text-slate-400">A carregar...</p>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <p className="text-center py-20 text-sm text-slate-400">Encomenda não encontrada.</p>
    </div>
  );

  const canCancel = order.status === 0 || order.status === 1;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-screen-md mx-auto px-4 sm:px-6 py-8">
        <Breadcrumb items={[
          { label: "Encomendas", path: "/orders" },
          { label: `Encomenda #${order.id}` },
        ]} />

        {/* Header — RUI: título + badge de estado na mesma linha */}
        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight mb-1">
              Encomenda #{order.id}
            </h1>
            <p className="text-xs text-slate-400">
              {new Date(order.createdAt).toLocaleDateString("pt-PT", {
                day: "numeric", month: "long", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="grid md:grid-cols-[1fr_240px] gap-5 items-start">
          {/* Coluna principal */}
          <div className="space-y-4">

            {/* Timeline — RUI: visual progress sem ser excessivo */}
            {order.status !== 4 && (
              <div className="card overflow-hidden">
                <div className="card-header">Estado</div>
                <div className="px-5 py-5">
                  <div className="flex items-start gap-0">
                    {TIMELINE.map((t, idx) => {
                      const done   = order.status > t.status;
                      const active = order.status === t.status;
                      return (
                        <div key={t.status} className="flex items-start flex-1">
                          <div className="flex flex-col items-center flex-shrink-0">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                              done   ? "bg-emerald-700 text-white" :
                              active ? "bg-emerald-700 text-white ring-2 ring-emerald-200 ring-offset-1" :
                                       "bg-slate-100 text-slate-400"
                            }`}>
                              {done ? "✓" : idx + 1}
                            </div>
                            <span className={`text-[10px] mt-1.5 font-medium text-center leading-tight max-w-[52px] ${
                              active ? "text-slate-900" : "text-slate-400"
                            }`}>
                              {t.label}
                            </span>
                          </div>
                          {idx < TIMELINE.length - 1 && (
                            <div className={`flex-1 h-px mt-3.5 mx-1 ${done ? "bg-emerald-500" : "bg-slate-200"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Produtos */}
            <div className="card overflow-hidden">
              <div className="card-header">Produtos</div>
              <div className="divide-y divide-slate-50">
                {order.items.map(item => (
                  <div key={item.productId} className="flex justify-between items-center px-5 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-slate-800">{item.productName}</p>
                      <p className="text-xs text-slate-400 tabular mt-0.5">
                        {item.unitType === 1 ? `${item.quantity.toFixed(1)} kg` : `${item.quantity} un`}
                        {" × "}{item.unitPrice.toFixed(2)}€
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900 tabular">
                      {item.subtotal.toFixed(2)}€
                    </span>
                  </div>
                ))}
              </div>

              {/* Totais */}
              <div className="px-5 py-4 space-y-2 bg-slate-50 border-t border-slate-100">
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Subtotal</span>
                  <span className="tabular">{(order.totalAmount - order.shippingFee).toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500">
                  <span>Envio</span>
                  <span className="tabular">{order.shippingFee.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200">
                  <span className="text-sm font-bold text-slate-900">Total</span>
                  <span className="text-sm font-bold text-emerald-700 tabular">{order.totalAmount.toFixed(2)}€</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar — RUI: informação de suporte, não principal */}
          <div className="space-y-4 md:sticky md:top-20">
            <div className="card overflow-hidden">
              <div className="card-header">Entrega</div>
              <div className="px-5 py-4 space-y-2 text-sm text-slate-600">
                <p className="font-medium text-slate-800">{order.deliveryAddress}</p>
                <p className="text-xs text-slate-400 font-mono">{order.deliveryPostalCode}</p>
                {order.deliverySlot && (
                  <>
                    <p className="text-xs text-slate-500">
                      📅 {new Date(order.deliverySlot.deliveryDate).toLocaleDateString("pt-PT", {
                        weekday: "long", day: "numeric", month: "long",
                      })}
                    </p>
                    <p className="text-xs text-slate-500">
                      🕐 {order.deliverySlot.startTime} – {order.deliverySlot.endTime}
                    </p>
                  </>
                )}
                {order.notes && (
                  <p className="text-xs text-slate-400 italic border-t border-slate-100 pt-2 mt-2">
                    📝 {order.notes}
                  </p>
                )}
              </div>
            </div>

            {order.paymentMethod && (
              <div className="card overflow-hidden">
                <div className="card-header">Pagamento</div>
                <div className="px-5 py-4">
                  <p className="text-sm text-slate-600">{order.paymentMethod}</p>
                </div>
              </div>
            )}

            {/* RUI: ação destrutiva visualmente separada, não misturada */}
            {canCancel && (
              <button onClick={handleCancel} disabled={cancelling}
                className="btn-danger w-full justify-center disabled:opacity-50">
                {cancelling ? "A cancelar..." : "Cancelar encomenda"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}