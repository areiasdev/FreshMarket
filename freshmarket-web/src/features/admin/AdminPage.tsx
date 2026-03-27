import { useState, useEffect } from "react";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";
import AdminProducts from "./AdminProducts";
import AdminCategories from "./AdminCategories";
import AdminOrders from "./AdminOrders";
import AdminDeliverySlots from "./AdminDeliverySlots";
import {
  IconLeaf, IconChartBar, IconChartLine, IconBox, IconFolder,
  IconClipboardList, IconClock, IconSun, IconMoon,
  type TablerIcon,
} from "../../components/ui/icons";
import DashboardOverview from "./DashboardOverview";
import AdminMetrics from "./AdminMetrics";

type Section = "dashboard" | "metrics" | "products" | "categories" | "orders" | "slots";

const NAV_ITEMS: { key: Section; label: string; icon: TablerIcon }[] = [
  { key: "dashboard",  label: "Dashboard",       icon: IconChartBar },
  { key: "metrics",    label: "Métricas",         icon: IconChartLine },
  { key: "products",   label: "Produtos",         icon: IconBox },
  { key: "categories", label: "Categorias",       icon: IconFolder },
  { key: "orders",     label: "Encomendas",       icon: IconClipboardList },
  { key: "slots",      label: "Slots de Entrega", icon: IconClock },
];

export default function AdminPage() {
  const [active, setActive] = useState<Section>("dashboard");
  const { user, logout }    = useAuth();
  const navigate            = useNavigate();

  const [dark, setDark] = useState<boolean>(() => {
    return localStorage.getItem("admin-theme") === "dark";
  });

  useEffect(() => {
    localStorage.setItem("admin-theme", dark ? "dark" : "light");
  }, [dark]);

  const renderContent = () => {
    switch (active) {
      case "metrics":    return <AdminMetrics dark={dark} />;
      case "products":   return <AdminProducts />;
      case "categories": return <AdminCategories />;
      case "orders":     return <AdminOrders />;
      case "slots":      return <AdminDeliverySlots />;
      default:           return <DashboardOverview />;
    }
  };

  return (
    <div className={`flex min-h-screen font-sans ${dark ? "dark bg-slate-900" : "bg-gray-100"}`}>

      {/* ── Sidebar ────────────────────────────────────────────────── */}
      <aside className={`w-64 flex flex-col fixed h-full z-20 border-r shadow-sm transition-colors
        ${dark ? "bg-slate-800 border-slate-700" : "bg-white border-gray-200"}`}>

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
            return (
              <button
                key={item.key}
                onClick={() => setActive(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  active === item.key
                    ? "bg-green-600 text-white"
                    : dark
                      ? "text-slate-300 hover:bg-slate-700"
                      : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <I size={16} stroke={2} />
                {item.label}
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
      <main className={`ml-64 flex-1 p-8 min-h-screen transition-colors ${dark ? "text-slate-100" : ""}`}>
        {renderContent()}
      </main>
    </div>
  );
}
