import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import { endpoints } from "../lib/endpoints";
import { useCart } from "../features/cart/CartContext";
import { useAuth } from "../features/auth/useAuth";
import type { Product, Category } from "../types";
import Icon from "../components/ui/Icon";
import { IconLeaf, IconShoppingCart, IconArrowLeft, IconArrowRight } from "../components/ui/icons";

export default function ShopPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const pageSize = 20;

  const { addItem } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    client.get(endpoints.categories.getAll)
      .then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    setLoading(true);
    const url = endpoints.products.getAll +
      `?page=${page}&pageSize=${pageSize}` +
      (activeCategory ? `&categoryId=${activeCategory}` : "");

    client.get(url).then((res) => {
      setProducts(res.data.items ?? res.data);
      setTotal(res.data.totalCount ?? 0);
    }).finally(() => setLoading(false));
  }, [page, activeCategory]);

  const totalPages = Math.ceil(total / pageSize);
  const unitLabel = (unitType: number) => unitType === 1 ? "/kg" : "/un";

  const handleAddToCart = (product: Product) => {
    if (!isAuthenticated) return navigate("/auth");
    addItem(product, product.minQuantity ?? 1);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b shadow-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate("/")} className="text-xl font-bold text-green-700 flex items-center gap-2">
            <Icon icon={IconLeaf} size={20} className="text-green-700" />
            Horto Píncaro
          </button>
          <button
            onClick={() => navigate("/cart")}
            className="relative bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2"
          >
            <Icon icon={IconShoppingCart} size={16} />
            Carrinho
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => { setActiveCategory(null); setPage(1); }}
            className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
              !activeCategory ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-300 hover:border-green-500"
            }`}
          >
            Todos
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => { setActiveCategory(c.id); setPage(1); }}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition ${
                activeCategory === c.id ? "bg-green-600 text-white border-green-600" : "bg-white text-gray-600 border-gray-300 hover:border-green-500"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-20 text-gray-400">A carregar produtos...</div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map((p) => (
              <div key={p.id} className="bg-white rounded-2xl shadow-sm border hover:shadow-md transition group">
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
                    <p className="text-green-700 font-bold text-sm">
                      {p.pricePerUnit.toFixed(2)}€
                      <span className="text-xs font-normal text-gray-400">{unitLabel(p.unitType)}</span>
                    </p>
                    <button
                      onClick={() => handleAddToCart(p)}
                      className="bg-green-600 hover:bg-green-700 text-white text-xs px-2 py-1 rounded-lg transition"
                    >
                      + Adicionar
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-8">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-100 flex items-center gap-1.5"
            >
              <Icon icon={IconArrowLeft} size={14} /> Anterior
            </button>
            <span className="px-4 py-2 text-sm text-gray-600">{page} / {totalPages}</span>
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-100 flex items-center gap-1.5"
            >
              Seguinte <Icon icon={IconArrowRight} size={14} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
