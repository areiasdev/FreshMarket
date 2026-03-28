import { useState, useEffect, useRef } from "react";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";
import AdminProducts from "./AdminProducts";
import AdminCategories from "./AdminCategories";
import AdminOrders from "./AdminOrders";
import AdminDeliverySlots from "./AdminDeliverySlots";
import AdminHarvestList from "./AdminHarvestList";
import {
  IconLeaf, IconChartBar, IconChartLine, IconBox, IconFolder,
  IconClipboardList, IconClock, IconSun, IconMoon, IconMenu2, IconUsers, IconPackage,
  type TablerIcon,
} from "../../components/ui/icons";
import DashboardOverview from "./DashboardOverview";
import AdminMetrics from "./AdminMetrics";
import AdminUsers from "./AdminUsers";
import client from "../../api/client";
import { endpoints } from "../../lib/endpoints";

const POLL_MS = 60_000;

type Section = "dashboard" | "metrics" | "products" | "categories" | "orders" | "slots" | "harvest" | "users";

const NAV_ITEMS: { key: Section; label: string; icon: TablerIcon }[] = [
  { key: "dashboard",  label: "Dashboard",       icon: IconChartBar },
  { key: "metrics",    label: "Métricas",         icon: IconChartLine },
  { key: "products",   label: "Produtos",         icon: IconBox },
  { key: "categories", label: "Categorias",       icon: IconFolder },
  { key: "orders",     label: "Encomendas",       icon: IconClipboardList },
  { key: "slots",      label: "Slots de Entrega", icon: IconClock },
  { key: "harvest",    label: "Colheita",         icon: IconPackage },
  { key: "users",      label: "Utilizadores",     icon: IconUsers },
];

export default function AdminPage() {
  const [active, setActive] = useState<Section>("metrics");
  const { user, logout }    = useAuth();
  const navigate            = useNavigate();

  const [dark, setDark] = useState<boolean>(() => {
    return localStorage.getItem("admin-theme") === "dark";
  });

  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    localStorage.setItem("admin-theme", dark ? "dark" : "light");
  }, [dark]);

  useEffect(() => {
    const fetchPending = async () => {
      try {
        const res = await client.get(endpoints.admin.orders.byStatus("0"), { params: { page: 1, pageSize: 1 } });
        setPendingCount(res.data.totalCount ?? 0);
      } catch { /* silently ignore */ }
    };
    fetchPending();
    pollRef.current = setInterval(fetchPending, POLL_MS);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, []);

  const renderContent = () => {
    switch (active) {
      case "metrics":    return <AdminMetrics dark={dark} />;
      case "products":   return <AdminProducts />;
      case "categories": return <AdminCategories />;
      case "orders":     return <AdminOrders />;
      case "slots":      return <AdminDeliverySlots />;
      case "harvest":    return <AdminHarvestList />;
      case "users":      return <AdminUsers dark={dark} />;
      default:           return <DashboardOverview />;
    }
  };

  return (
    <div className={`flex min-h-screen font-sans ${dark ? "dark bg-slate-900" : "bg-gray-100"}`}>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-10 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────────────── */}
      <aside className={`w-64 flex flex-col fixed h-full z-20 border-r shadow-sm transition-all duration-300
        ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>

        {/* Logo */}
        <div className={`p-5 border-b ${dark ? "border-slate-700" : "border-gray-200"}`}>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <IconLeaf size={20} className={dark ? "text-green-400" : "text-green-600"} />
            <span className={`font-bold text-lg ${dark ? "text-green-400" : "text-green-700"}`}>Horto Píncaro</span>
          </div>
          <p className={`text-xs mt-1 ${dark ? "text-slate-500" : "text-gray-400"}`}>Painel de Administração</p>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const I = item.icon;
            const showBadge = item.key === "orders" && pendingCount > 0 && active !== "orders";
            return (
              <button
                key={item.key}
                onClick={() => {
                  setActive(item.key);
                  if (item.key === "orders") setPendingCount(0);
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active === item.key
                    ? "bg-green-600 text-white"
                    : dark
                      ? "text-slate-300 hover:bg-slate-700"
                      : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <I size={16} stroke={2} />
                <span className="flex-1 text-left">{item.label}</span>
                {showBadge && (
                  <span className="bg-amber-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1">
                    {pendingCount > 99 ? "99+" : pendingCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`p-4 border-t space-y-2 ${dark ? "border-slate-700" : "border-gray-200"}`}>
          {/* Dark / Light toggle */}
          <button
            onClick={() => setDark(d => !d)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${dark
                ? "text-slate-300 hover:bg-slate-700"
                : "text-gray-600 hover:bg-gray-100"}`}
          >
            {dark
              ? <IconSun size={16} stroke={2} className="text-amber-400" />
              : <IconMoon size={16} stroke={2} className="text-slate-500" />}
            {dark ? "Modo claro" : "Modo escuro"}
          </button>

          <p className={`text-xs truncate px-1 ${dark ? "text-slate-500" : "text-gray-500"}`}>{user?.fullName}</p>
          <button
            onClick={() => { logout(); navigate("/"); }}
            className={`w-full text-sm py-2 rounded-lg transition-colors
              ${dark ? "text-red-400 hover:bg-slate-700" : "text-red-500 hover:bg-red-50"}`}
          >
            Sair
          </button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────────── */}
      <main className={`ml-0 md:ml-64 flex-1 min-h-screen transition-colors ${dark ? "text-slate-100" : ""}`}>
        {/* Mobile top bar */}
        <div className={`flex items-center gap-3 px-4 py-3 border-b md:hidden
          ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}>
          <button
            onClick={() => setMobileOpen(o => !o)}
            className={`p-1.5 rounded-lg transition-colors
              ${dark ? "text-slate-300 hover:bg-slate-700" : "text-gray-600 hover:bg-gray-100"}`}
          >
            <IconMenu2 size={20} stroke={2} />
          </button>
          <span className={`font-semibold text-sm ${dark ? "text-slate-200" : "text-gray-700"}`}>
            Painel de Administração
          </span>
        </div>
        <div className="p-4 md:p-8">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
