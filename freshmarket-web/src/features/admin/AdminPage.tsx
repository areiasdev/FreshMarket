import { useState } from "react";
import { useAuth } from "../auth/useAuth";
import { useNavigate } from "react-router-dom";
import AdminProducts from "./AdminProducts";
import AdminCategories from "./AdminCategories";
import AdminOrders from "./AdminOrders";
import AdminDeliverySlots from "./AdminDeliverySlots";

type Section = "dashboard" | "products" | "categories" | "orders" | "slots";

const NAV_ITEMS: { key: Section; label: string; icon: string }[] = [
  { key: "dashboard",  label: "Dashboard",       icon: "📊" },
  { key: "products",   label: "Produtos",         icon: "📦" },
  { key: "categories", label: "Categorias",       icon: "🗂️" },
  { key: "orders",     label: "Encomendas",       icon: "📋" },
  { key: "slots",      label: "Slots de Entrega", icon: "🕒" },
];

export default function AdminPage() {
  const [active, setActive] = useState<Section>("dashboard");
  const { user, logout }    = useAuth();
  const navigate            = useNavigate();

  // ✅ CORRIGIDO: renderizar condicionalmente em vez de instanciar no objeto
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
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm flex flex-col fixed h-full z-20">
        <div className="p-5 border-b">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <span className="text-xl">🌿</span>
            <span className="font-bold text-green-700 text-lg">Horto Píncaro</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Painel de Administração</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.key}
              onClick={() => setActive(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                active === item.key
                  ? "bg-green-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}
            >
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
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

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8 min-h-screen">
        {renderContent()}
      </main>
    </div>
  );
}

function DashboardOverview() {
  const stats = [
    { label: "Produtos",   value: "—", icon: "📦", color: "bg-green-50 text-green-700",  border: "border-green-100" },
    { label: "Encomendas", value: "—", icon: "📋", color: "bg-blue-50 text-blue-700",    border: "border-blue-100"  },
    { label: "Clientes",   value: "—", icon: "👤", color: "bg-purple-50 text-purple-700", border: "border-purple-100" },
    { label: "Receita",    value: "—", icon: "💶", color: "bg-yellow-50 text-yellow-700", border: "border-yellow-100" },
  ];

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard</h1>
        <p className="text-sm text-gray-400 mt-1">Bem-vindo ao painel de administração.</p>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className={`rounded-2xl p-5 ${stat.color} border ${stat.border}`}>
            <p className="text-2xl mb-1">{stat.icon}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm font-medium mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
      <div className="bg-white rounded-2xl border shadow-sm p-6 text-center text-gray-400">
        <p className="text-sm">Seleciona uma secção no menu para começar.</p>
      </div>
    </div>
  );
}