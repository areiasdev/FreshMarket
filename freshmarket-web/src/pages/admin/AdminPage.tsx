import { useState } from "react";
import { useAuth } from "../../features/auth/useAuth";
import { useNavigate } from "react-router-dom";
import AdminProducts from "./AdminProducts";

type Section = "dashboard" | "products" | "categories" | "orders" | "slots" | "zones";

const menuItems: { id: Section; label: string; icon: string }[] = [
  { id: "dashboard", label: "Dashboard", icon: "📊" },
  { id: "products", label: "Produtos", icon: "📦" },
  { id: "categories", label: "Categorias", icon: "🗂️" },
  { id: "orders", label: "Encomendas", icon: "📋" },
  { id: "slots", label: "Slots de Entrega", icon: "🚚" },
  { id: "zones", label: "Zonas de Envio", icon: "🗺️" },
];

export default function AdminPage() {
  const [active, setActive] = useState<Section>("dashboard");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen bg-gray-100 font-sans">

      {/* Sidebar */}
      <aside className="w-64 bg-white border-r shadow-sm flex flex-col fixed h-full">
        <div className="p-5 border-b">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => navigate("/")}>
            <span className="text-xl">🌿</span>
            <span className="font-bold text-green-700 text-lg">Horto Píncaro</span>
          </div>
          <p className="text-xs text-gray-400 mt-1">Painel de Administração</p>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActive(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                active === item.id
                  ? "bg-green-600 text-white"
                  : "text-gray-600 hover:bg-gray-100"
              }`}>
              <span>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t">
          <p className="text-xs text-gray-500 mb-2 truncate">{user?.fullName}</p>
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="w-full text-sm text-red-500 hover:bg-red-50 py-2 rounded-lg transition">
            Sair
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="ml-64 flex-1 p-8">
        {active === "dashboard" && <DashboardOverview />}
        {active === "products" && <AdminProducts />}
        {active === "categories" && <ComingSoon label="Categorias" />}
        {active === "orders" && <ComingSoon label="Encomendas" />}
        {active === "slots" && <ComingSoon label="Slots de Entrega" />}
        {active === "zones" && <ComingSoon label="Zonas de Envio" />}
      </main>
    </div>
  );
}

function DashboardOverview() {
  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Produtos", value: "—", icon: "📦", color: "bg-green-50 text-green-700" },
          { label: "Encomendas", value: "—", icon: "📋", color: "bg-blue-50 text-blue-700" },
          { label: "Clientes", value: "—", icon: "👤", color: "bg-purple-50 text-purple-700" },
          { label: "Receita", value: "—", icon: "💶", color: "bg-yellow-50 text-yellow-700" },
        ].map((stat) => (
          <div key={stat.label} className={`rounded-2xl p-5 ${stat.color} border`}>
            <p className="text-2xl mb-1">{stat.icon}</p>
            <p className="text-2xl font-bold">{stat.value}</p>
            <p className="text-sm font-medium mt-1">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComingSoon({ label }: { label: string }) {
  return (
    <div className="flex flex-col items-center justify-center h-64 text-gray-400">
      <p className="text-4xl mb-3">🚧</p>
      <p className="text-lg font-medium">{label} — em breve</p>
    </div>
  );
}