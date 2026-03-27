import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import { endpoints } from "../lib/endpoints";
import type { OrderSummaryDto } from "../types";
import Navbar from "../components/layout/Navbar";
import StatusBadge from "../components/layout/StatusBadge";
import Icon from "../components/ui/Icon";
import { IconPackage } from "../components/ui/icons";

export default function OrdersPage() {
  const [orders, setOrders] = useState<OrderSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    client.get(endpoints.orders.my)
      .then(res => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <div className="max-w-screen-md mx-auto px-4 sm:px-6 py-8">

        <div className="flex items-baseline justify-between mb-6">
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Encomendas</h1>
          <button onClick={() => navigate("/")} className="btn-primary text-xs py-2 px-3 bg-emerald-700">
            + Nova encomenda
          </button>
        </div>

        {loading ? (
          <p className="text-center py-20 text-sm text-slate-400">A carregar...</p>
        ) : orders.length === 0 ? (
          <div className="card flex flex-col items-center py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
              <Icon icon={IconPackage} size={22} className="text-slate-400" stroke={1.5} />
            </div>
            <p className="text-sm font-semibold text-slate-900 mb-1">Nenhuma encomenda</p>
            <p className="text-sm text-slate-400 mb-6">As tuas encomendas aparecerão aqui.</p>
            <button onClick={() => navigate("/")} className="btn-primary bg-emerald-700">Ir para a loja</button>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="grid grid-cols-[64px_1fr_90px_100px_80px] gap-3 px-5 py-3
                            text-xs font-semibold text-slate-400 uppercase tracking-wide
                            bg-slate-50 border-b border-slate-100">
              <span>#</span>
              <span>Data</span>
              <span className="text-right">Total</span>
              <span>Estado</span>
              <span className="text-right">Entrega</span>
            </div>

            <div className="divide-y divide-slate-50">
              {orders.map(o => (
                <button
                  key={o.id}
                  onClick={() => navigate(`/orders/${o.id}`)}
                  className="w-full grid grid-cols-[64px_1fr_90px_100px_80px] gap-3 items-center
                             px-5 py-3.5 text-left hover:bg-slate-50 transition-colors group"
                >
                  <span className="text-xs font-mono text-slate-400 tabular">#{o.id}</span>

                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {new Date(o.createdAt).toLocaleDateString("pt-PT", { day: "numeric", month: "short", year: "numeric" })}
                    </p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {o.itemCount} {o.itemCount === 1 ? "produto" : "produtos"}
                    </p>
                  </div>

                  <span className="text-sm font-bold text-emerald-700 tabular text-right">{o.totalAmount.toFixed(2)}€</span>

                  <StatusBadge status={o.status} />

                  <span className="text-xs text-slate-400 tabular text-right">
                    {o.deliveryDate
                      ? new Date(o.deliveryDate).toLocaleDateString("pt-PT", { day: "numeric", month: "short" })
                      : "—"}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
