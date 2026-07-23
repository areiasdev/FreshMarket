import { useState, useEffect, useRef } from "react";
import { useAuth } from "../auth/useAuth";
import { useTheme } from "../theme/useTheme";
import { useNavigate, useSearchParams } from "react-router-dom";
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
  const [searchParams] = useSearchParams();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate         = useNavigate();
  const dark = theme === "dark";

  const [active, setActive] = useState<Section>(() => {
    const s = searchParams.get("section") as Section;
    return NAV_ITEMS.some(n => n.key === s) ? s : "dashboard";
  });

  // Keep `active` in sync with ?section= without an effect: adjust state during
  // render (React's documented pattern) instead of setState-in-effect.
  const [syncedSection, setSyncedSection] = useState<string | null>(searchParams.get("section"));
  const urlSection = searchParams.get("section");
  if (urlSection !== syncedSection) {
    setSyncedSection(urlSection);
    if (urlSection && NAV_ITEMS.some(n => n.key === urlSection)) setActive(urlSection as Section);
  }

  const [mobileOpen, setMobileOpen] = useState(false);
  const [pendingCount, setPendingCount] = useState(0);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
    <div className={`flex min-h-screen font-sans ${dark ? "dark bg-slate-900" : "bg-slate-100"}`}>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-10 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ── Sidebar ────────────────────────────────────────────────── */}
      <aside className={`w-64 flex flex-col fixed h-full z-20 border-r shadow-sm transition-all duration-300
        ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}
        ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>

        {/* Logo */}
        <div className={`p-5 border-b ${dark ? "border-slate-700" : "border-slate-200"}`}>
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <IconLeaf size={20} className={dark ? "text-emerald-400" : "text-emerald-600"} />
            <span className={`font-bold text-lg ${dark ? "text-emerald-400" : "text-emerald-700"}`}>FreshMarket</span>
          </div>
          <p className={`text-xs mt-1 ${dark ? "text-slate-500" : "text-slate-400"}`}>Painel de Administração</p>
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
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active === item.key
                    ? "bg-emerald-700 text-white font-semibold shadow-sm shadow-emerald-900/20"
                    : dark
                      ? "text-slate-300 hover:bg-slate-700"
                      : "text-slate-600 hover:bg-slate-100"
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
        <div className={`p-4 border-t space-y-2 ${dark ? "border-slate-700" : "border-slate-200"}`}>
          {/* Dark / Light toggle */}
          <button
            onClick={toggleTheme}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm font-medium transition-colors
              ${dark
                ? "text-slate-300 hover:bg-slate-700"
                : "text-slate-600 hover:bg-slate-100"}`}
          >
            {dark
              ? <IconSun size={16} stroke={2} className="text-amber-400" />
              : <IconMoon size={16} stroke={2} className="text-slate-500" />}
            {dark ? "Modo claro" : "Modo escuro"}
          </button>

          <p className={`text-xs truncate px-1 ${dark ? "text-slate-500" : "text-slate-500"}`}>{user?.fullName}</p>
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
          ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}`}>
          <button
            onClick={() => setMobileOpen(o => !o)}
            className={`p-1.5 rounded-lg transition-colors
              ${dark ? "text-slate-300 hover:bg-slate-700" : "text-slate-600 hover:bg-slate-100"}`}
          >
            <IconMenu2 size={20} stroke={2} />
          </button>
          <span className={`font-semibold text-sm ${dark ? "text-slate-200" : "text-slate-700"}`}>
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
