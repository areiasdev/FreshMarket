import { useEffect, useState } from "react";
import client from "../api/client";
import { useAuth } from "../features/auth/useAuth";
import { useNavigate } from "react-router-dom";

interface Product {
  id: number;
  name: string;
  pricePerUnit: number;
  unitType: number;
  stockQuantity: number;
  imageUrl: string;
  isSeasonal: boolean;
  categoryName: string;
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [activeCategory, setActiveCategory] = useState("Todos");
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    client.get("/Products").then((res) => setProducts(res.data.items ?? res.data));
  }, []);

  const categories = ["Todos", ...Array.from(new Set(products.map((p) => p.categoryName)))];
  const filtered = activeCategory === "Todos" ? products : products.filter((p) => p.categoryName === activeCategory);
  const unitLabel = (unitType: number) => unitType === 1 ? "/kg" : "/un";

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Navbar */}
      <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🌿</span>
            <span className="text-xl font-bold text-green-700">Horto Píncaro</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated && user?.role === "Admin" && (
              <button
                onClick={() => navigate("/admin")}
                className="text-sm text-green-700 font-semibold border border-green-600 px-3 py-1.5 rounded-lg hover:bg-green-50 transition">
                Dashboard
              </button>
            )}
            {isAuthenticated ? (
              <>
                <span className="text-sm text-gray-600">Olá, {user?.fullName.split(" ")[0]}</span>
                <button onClick={logout} className="text-sm text-red-500 hover:underline">Sair</button>
              </>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
                Entrar
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="bg-gradient-to-br from-green-50 to-green-100 py-20 px-4 text-center">
        <h1 className="text-4xl md:text-5xl font-bold text-green-800 mb-4">
          Frescos direto ao seu domicílio 🥦
        </h1>
        <p className="text-lg text-green-700 mb-8 max-w-xl mx-auto">
          Frutas, legumes e hortaliças selecionadas entregues em casa com qualidade garantida.
        </p>
        <button
          onClick={() => navigate(isAuthenticated ? "/shop" : "/auth")}
          className="bg-green-600 hover:bg-green-700 text-white font-bold px-8 py-3 rounded-full text-lg transition shadow-md">
          Encomendar agora
        </button>
      </section>

      {/* Produtos com Tabs */}
      <section className="py-14 px-4 max-w-6xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-6">🛒 Os nossos produtos</h2>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-semibold transition border ${
                activeCategory === cat
                  ? "bg-green-600 text-white border-green-600"
                  : "bg-white text-gray-600 border-gray-300 hover:border-green-500 hover:text-green-600"
              }`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filtered.map((p) => (
            <div key={p.id} className="bg-white rounded-2xl shadow-sm border hover:shadow-md transition cursor-pointer group">
              <div className="relative overflow-hidden rounded-t-2xl">
                <img
                  src={p.imageUrl}
                  alt={p.name}
                  className="w-full h-40 object-cover group-hover:scale-105 transition duration-300"
                  onError={(e) => (e.currentTarget.src = "https://placehold.co/200x160?text=Produto")}
                />
                {p.isSeasonal && (
                  <span className="absolute top-2 left-2 text-xs bg-yellow-400 text-yellow-900 px-2 py-0.5 rounded-full font-semibold">
                    Sazonal
                  </span>
                )}
              </div>
              <div className="p-3">
                <p className="text-xs text-gray-400 mb-0.5">{p.categoryName}</p>
                <p className="text-sm font-semibold text-gray-800 leading-tight">{p.name}</p>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-green-700 font-bold">
                    {p.pricePerUnit.toFixed(2)}€
                    <span className="text-xs font-normal text-gray-400">{unitLabel(p.unitType)}</span>
                  </p>
                  <button
                    onClick={() => navigate(isAuthenticated ? "/shop" : "/auth")}
                    className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded-lg transition">
                    + Adicionar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Sobre */}
      <section className="bg-green-700 text-white py-16 px-4 text-center">
        <h2 className="text-3xl font-bold mb-4">Sobre o Horto Píncaro</h2>
        <p className="max-w-2xl mx-auto text-green-100 text-lg mb-6">
          Somos uma empresa familiar dedicada à produção e distribuição de hortofrutícolas frescos.
          Trabalhamos diretamente com produtores locais para garantir qualidade e frescura em cada entrega.
        </p>
        <div className="flex justify-center gap-12 mt-8">
          <div>
            <p className="text-4xl font-bold">+500</p>
            <p className="text-green-200 text-sm mt-1">Clientes satisfeitos</p>
          </div>
          <div>
            <p className="text-4xl font-bold">+20</p>
            <p className="text-green-200 text-sm mt-1">Produtos frescos</p>
          </div>
          <div>
            <p className="text-4xl font-bold">48h</p>
            <p className="text-green-200 text-sm mt-1">Entrega garantida</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-gray-400 text-center py-6 text-sm">
        © 2026 Horto Píncaro · Todos os direitos reservados
      </footer>

    </div>
  );
}