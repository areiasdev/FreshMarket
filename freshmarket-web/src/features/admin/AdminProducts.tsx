import { useEffect, useState } from "react";
import client from "../../api/client";
import Pagination from "../../components/admin/Pagination";
import Modal from "../../components/admin/Modal";
import { endpoints } from "../../lib/endpoints";

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
  categoryId: number;
}

interface Category {
  id: number;
  name: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", pricePerUnit: 0, unitType: 1,
    minQuantity: 0.1, stockQuantity: 0, imageUrl: "",
    isSeasonal: false, isActive: true, categoryId: 0
  });

  const load = async () => {
    setLoading(true);
    const res = await client.get(endpoints.admin.products.getAll + `?page=${page}&pageSize=${pageSize}`);
    setProducts(res.data.items ?? res.data);
    setTotal(res.data.totalCount ?? 0);
    setLoading(false);
  };

  useEffect(() => { load(); }, [page]);

  useEffect(() => {
   client.get(endpoints.categories.getAll).then((res) => setCategories(res.data));
  }, []);

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: "", description: "", pricePerUnit: 0, unitType: 1, minQuantity: 0.1, stockQuantity: 0, imageUrl: "", isSeasonal: false, isActive: true, categoryId: categories[0]?.id ?? 0 });
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditItem(p);
    setForm({ name: p.name, description: "", pricePerUnit: p.pricePerUnit, unitType: p.unitType, minQuantity: 0.1, stockQuantity: p.stockQuantity, imageUrl: p.imageUrl, isSeasonal: p.isSeasonal, isActive: p.isActive, categoryId: p.categoryId });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (editItem) {
      await client.put(endpoints.admin.products.update(editItem.id), form);
    } else {
      await client.post(endpoints.admin.products.create, form);
    }
    setShowModal(false);
    load();
  };

  const toggleActive = async (id: number) => {
    await client.patch(endpoints.admin.products.toggleActive(id));
    load();
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Produtos</h1>
          <p className="text-sm text-gray-400 mt-1">{total} produtos no total</p>
        </div>
        <button onClick={openCreate} className="bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-4 py-2 rounded-lg transition">
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
            {loading ? (
              <tr><td colSpan={6} className="text-center py-8 text-gray-400">A carregar...</td></tr>
            ) : products.map((p) => (
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
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${p.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    {p.isActive ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEdit(p)} className="text-xs text-blue-600 hover:underline">Editar</button>
                  <button onClick={() => toggleActive(p.id)} className="text-xs text-gray-500 hover:underline">
                    {p.isActive ? "Desativar" : "Ativar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {showModal && (
        <Modal title={editItem ? "Editar Produto" : "Novo Produto"} onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm text-gray-600">Nome</span>
              <input className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">Categoria</span>
              <select className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: +e.target.value })}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm text-gray-600">Preço (€)</span>
                <input type="number" step="0.01" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  value={form.pricePerUnit} onChange={(e) => setForm({ ...form, pricePerUnit: +e.target.value })} />
              </label>
              <label className="block">
                <span className="text-sm text-gray-600">Stock</span>
                <input type="number" step="0.1" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  value={form.stockQuantity} onChange={(e) => setForm({ ...form, stockQuantity: +e.target.value })} />
              </label>
            </div>
            <label className="block">
              <span className="text-sm text-gray-600">Tipo</span>
              <select className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={form.unitType}
                onChange={(e) => setForm({ ...form, unitType: +e.target.value })}>
                <option value={1}>Kg</option>
                <option value={2}>Unidade</option>
              </select>
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">URL da Imagem</span>
              <input className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={form.imageUrl}
                onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} />
            </label>
            <label className="flex items-center gap-2 mt-1">
              <input type="checkbox" checked={form.isSeasonal}
                onChange={(e) => setForm({ ...form, isSeasonal: e.target.checked })} />
              <span className="text-sm text-gray-600">Produto Sazonal</span>
            </label>
          </div>
        </Modal>
      )}
    </div>
  );
}