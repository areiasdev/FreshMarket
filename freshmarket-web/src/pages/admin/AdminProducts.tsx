import { useEffect, useState } from "react";
import client from "../../api/client";

interface Product {
  id: number;
  name: string;
  pricePerUnit: number;
  unitType: number;
  stockQuantity: number;
  imageUrl: string;
  isSeasonal: boolean;
  isActive: boolean;
  categoryName: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    client.get("/AdminProducts")
      .then((res) => setProducts(res.data.items ?? res.data))
      .finally(() => setLoading(false));
  }, []);

  const toggleActive = async (id: number, current: boolean) => {
    await client.patch(`/AdminProducts/${id}/toggle-active`);
    setProducts((prev) => prev.map((p) => p.id === id ? { ...p, isActive: !current } : p));
  };

  if (loading) return <p className="text-gray-400">A carregar produtos...</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Produtos</h1>
        <button className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
          + Novo Produto
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Produto</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Categoria</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Preço</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Stock</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Estado</th>
              <th className="text-left px-4 py-3 text-gray-500 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b hover:bg-gray-50 transition">
                <td className="px-4 py-3 flex items-center gap-3">
                  <img src={p.imageUrl} alt={p.name}
                    className="w-10 h-10 rounded-lg object-cover"
                    onError={(e) => (e.currentTarget.src = "https://placehold.co/40?text=P")} />
                  <span className="font-medium text-gray-800">{p.name}</span>
                </td>
                <td className="px-4 py-3 text-gray-500">{p.categoryName}</td>
                <td className="px-4 py-3 font-semibold text-green-700">
                  {p.pricePerUnit.toFixed(2)}€{p.unitType === 1 ? "/kg" : "/un"}
                </td>
                <td className="px-4 py-3 text-gray-600">{p.stockQuantity}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    p.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"
                  }`}>
                    {p.isActive ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button className="text-xs text-blue-600 hover:underline">Editar</button>
                  <button
                    onClick={() => toggleActive(p.id, p.isActive)}
                    className="text-xs text-gray-500 hover:underline">
                    {p.isActive ? "Desativar" : "Ativar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
