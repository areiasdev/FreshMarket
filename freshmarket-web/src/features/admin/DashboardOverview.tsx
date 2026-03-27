import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../../api/client";
import { endpoints } from "../../lib/endpoints";
import {
  IconBox, IconClipboardList, IconUser, IconCurrencyEuro,
  IconAlertTriangle, IconTrendingUpDown,
  type TablerIcon,
} from "../../components/ui/icons";
import Icon from "../../components/ui/Icon";
import { orderStatusBadge, orderStatusLabel } from "../../lib/color";

// ─── Tipos ────────────────────────────────────────────────────────────────────
interface DashboardStats {
  ordersToday:       number;
  ordersThisWeek:    number;
  ordersThisMonth:   number;
  ordersPending:     number;
  ordersProcessing:  number;
  ordersDelivered:   number;
  ordersCancelled:   number;
  revenueToday:      number;
  revenueThisWeek:   number;
  revenueThisMonth:  number;
  productsTotal:     number;
  productsActive:    number;
  productsLowStock:  number;
  customersTotal:    number;
  customersNewMonth: number;
  recentOrders: {
    id:           number;
    userFullName: string;
    totalAmount:  number;
    status:       number;
    createdAt:    string;
  }[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function fmt(n: number) {
  return n.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function relativeTime(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return "agora";
  if (m < 60) return `${m}m atrás`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h atrás`;
  return `${Math.floor(h / 24)}d atrás`;
}

// ─── Sub-componentes ──────────────────────────────────────────────────────────
function StatCard({
  label, value, sub, icon, accent = false, alert = false,
}: {
  label: string; value: string | number; sub?: string;
  icon: TablerIcon; accent?: boolean; alert?: boolean;
}) {
  return (
    <div className={`card p-4 flex flex-col gap-3 ${alert ? "border-amber-200" : ""}`}>
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
          alert   ? "bg-amber-50"    :
          accent  ? "bg-emerald-50"  :
                    "bg-slate-50"
        }`}>
          <Icon icon={icon} size={15} className={
            alert  ? "text-amber-600"   :
            accent ? "text-emerald-700" :
                     "text-slate-500"
          } />
        </div>
      </div>
      <div>
        <p className={`text-2xl font-bold tabular-nums ${
          alert ? "text-amber-600" : "text-slate-900"
        }`}>
          {value}
        </p>
        {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
      </div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-3">
      {children}
    </h2>
  );
}

// ─── Dashboard principal ──────────────────────────────────────────────────────
export default function DashboardOverview() {
  const [stats, setStats]   = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate            = useNavigate();

  useEffect(() => {
    client.get(endpoints.admin.dashboard)
      .then(res => setStats(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-sm text-slate-400">
      A carregar métricas...
    </div>
  );

  if (!stats) return (
    <div className="flex items-center justify-center h-64 text-sm text-slate-400">
      Erro ao carregar dashboard.
    </div>
  );

  return (
    <div className="space-y-8 max-w-screen-xl">

      {/* ── Cabeçalho ──────────────────────────────────────────── */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-sm text-slate-400 mt-0.5">
          {new Date().toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" })}
        </p>
      </div>

      {/* ── Receita ────────────────────────────────────────────── */}
      <div>
        <SectionTitle>Receita</SectionTitle>
        <div className="grid grid-cols-3 gap-3">
          <StatCard label="Hoje"       value={`${fmt(stats.revenueToday)}€`}     icon={IconCurrencyEuro} accent sub={`${stats.ordersToday} encomenda${stats.ordersToday !== 1 ? "s" : ""}`} />
          <StatCard label="Esta semana" value={`${fmt(stats.revenueThisWeek)}€`}  icon={IconTrendingUpDown}   sub={`${stats.ordersThisWeek} encomendas`} />
          <StatCard label="Este mês"   value={`${fmt(stats.revenueThisMonth)}€`} icon={IconTrendingUpDown}   sub={`${stats.ordersThisMonth} encomendas`} />
        </div>
      </div>

      {/* ── Encomendas por estado ───────────────────────────────── */}
      <div>
        <SectionTitle>Encomendas por estado</SectionTitle>
        <div className="grid grid-cols-4 gap-3">
          <StatCard label="Pendentes"    value={stats.ordersPending}    icon={IconClipboardList} alert={stats.ordersPending > 0} />
          <StatCard label="Em processo"  value={stats.ordersProcessing} icon={IconClipboardList} />
          <StatCard label="Entregues"    value={stats.ordersDelivered}  icon={IconClipboardList} accent />
          <StatCard label="Canceladas"   value={stats.ordersCancelled}  icon={IconClipboardList} />
        </div>
      </div>

      {/* ── Linha: Produtos + Clientes ──────────────────────────── */}
      <div className="grid grid-cols-2 gap-6">

        {/* Produtos */}
        <div>
          <SectionTitle>Produtos</SectionTitle>
          <div className="grid grid-cols-3 gap-3">
            <StatCard label="Total"      value={stats.productsTotal}    icon={IconBox} />
            <StatCard label="Ativos"     value={stats.productsActive}   icon={IconBox} accent />
            <StatCard label="Stock baixo" value={stats.productsLowStock} icon={IconAlertTriangle}
              alert={stats.productsLowStock > 0} />
          </div>
          {stats.productsLowStock > 0 && (
            <button
              onClick={() => navigate("/admin?section=products")}
              className="mt-2 text-xs text-amber-600 hover:text-amber-800 font-medium transition-colors"
            >
              Ver produtos com stock baixo →
            </button>
          )}
        </div>

        {/* Clientes */}
        <div>
          <SectionTitle>Clientes</SectionTitle>
          <div className="grid grid-cols-2 gap-3">
            <StatCard label="Total"         value={stats.customersTotal}    icon={IconUser} />
            <StatCard label="Novos este mês" value={stats.customersNewMonth} icon={IconUser} accent />
          </div>
        </div>
      </div>

      {/* ── Últimas encomendas ──────────────────────────────────── */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <SectionTitle>Últimas encomendas</SectionTitle>
          <button
            onClick={() => navigate("/admin?section=orders")}
            className="text-xs text-emerald-700 hover:text-emerald-900 font-medium transition-colors"
          >
            Ver todas →
          </button>
        </div>

        <div className="card overflow-hidden">
          {/* Header */}
          <div className="grid grid-cols-[60px_1fr_100px_110px_80px] gap-3 px-4 py-2.5
                          text-xs font-semibold text-slate-400 uppercase tracking-wide
                          bg-slate-50 border-b border-slate-100">
            <span>#</span>
            <span>Cliente</span>
            <span className="text-right">Total</span>
            <span>Estado</span>
            <span className="text-right">Há quanto tempo</span>
          </div>

          {stats.recentOrders.length === 0 ? (
            <p className="text-sm text-slate-400 text-center py-8">Sem encomendas.</p>
          ) : stats.recentOrders.map((o, idx) => (
            <div
              key={o.id}
              className={`grid grid-cols-[60px_1fr_100px_110px_80px] gap-3 items-center
                          px-4 py-3 text-sm
                          ${idx < stats.recentOrders.length - 1 ? "border-b border-slate-50" : ""}`}
            >
              <span className="font-mono text-xs text-slate-400 tabular-nums">#{o.id}</span>
              <span className="font-medium text-slate-800 truncate">{o.userFullName}</span>
              <span className="font-semibold text-emerald-700 tabular-nums text-right">
                {fmt(o.totalAmount)}€
              </span>
              <span className={orderStatusBadge[o.status] ?? "badge badge-slate"}>
                {orderStatusLabel[o.status] ?? "—"}
              </span>
              <span className="text-xs text-slate-400 text-right tabular-nums">
                {relativeTime(o.createdAt)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}