import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";
import AdminProducts from "./AdminProducts";
import AdminCategories from "./AdminCategories";
import AdminOrders from "./AdminOrders";
import AdminDeliverySlots from "./AdminDeliverySlots";
import {
  IconLeaf, IconChartBar, IconBox, IconFolder,
  IconClipboardList, IconClock,
  type TablerIcon,
} from "../../components/ui/icons";
import DashboardOverview from "./DashboardOverview";

type Section = "dashboard" | "products" | "categories" | "orders" | "slots";

const NAV_ITEMS: { key: Section; label: string; icon: TablerIcon }[] = [
  { key: "dashboard",  label: "Dashboard",       icon: IconChartBar },
  { key: "products",   label: "Produtos",         icon: IconBox },
  { key: "categories", label: "Categorias",       icon: IconFolder },
  { key: "orders",     label: "Encomendas",       icon: IconClipboardList },
  { key: "slots",      label: "Slots de Entrega", icon: IconClock },
];

export default function AdminPage() {
  const [active, setActive] = useState<Section>("dashboard");
  const { user, logout }    = useAuth();
  const navigate            = useNavigate();

  const renderContent = () => {
    switch (active) {
      case "products":   return <AdminProducts />;
      case "categories": return <AdminCategories />;
      case "orders":     return <AdminOrders />;
      case "slots":      return <AdminDeliverySlots />;
      default:           return <DashboardOverview />;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">
      <aside className="w-64 bg-white border-r shadow-sm flex flex-col fixed h-full z-20">
        <div className="p-5 border-b">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <IconLeaf size={20} className="text-green-700" />
            <span className="font-bold text-green-700 text-lg">Horto Píncaro</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Painel de Administração</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => {
            const I = item.icon;
            return (
              <button
                key={item.key}
                onClick={() => setActive(item.key)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  active === item.key
                    ? "bg-green-600 text-white"
                    : "text-gray-600 hover:bg-gray-100"
                }`}
              >
                <I size={16} stroke={2} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="p-4 border-t">
          <p className="text-xs text-gray-500 mb-2 truncate">{user?.fullName}</p>
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="w-full text-sm text-red-500 hover:bg-red-50 py-2 rounded-lg transition"
          >
            Sair
          </button>
        </div>
      </aside>

      <main className="ml-64 flex-1 p-8 min-h-screen">
        {renderContent()}
      </main>
    </div>
  );
}
