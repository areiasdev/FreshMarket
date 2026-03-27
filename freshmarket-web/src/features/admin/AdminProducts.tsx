import { useEffect, useState } from "react";
import client from "../../api/client";
import Modal from "../../components/admin/Modal";
import { endpoints } from "../../lib/endpoints";
import Pagination from "../../components/utils/Pagination";
import axios from "axios";
import ImageInput from "../../components/admin/ImageInput";
import { badge } from "../../lib/color";

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
  const [products, setProducts]   = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [total, setTotal]         = useState(0);
  const [page, setPage]           = useState(1);
  const [pageSize, setPageSize]   = useState(10);
  const [loading, setLoading]     = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem]   = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: "", description: "", slug: "",
    pricePerUnit: 0, unitType: 1,
    minQuantity: 0.1, stockQuantity: 0, imageUrl: "",
    isSeasonal: false, isActive: true, categoryId: 0,
    trackStock: true, lowStockAlert: 0,
  });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await client.get(
          endpoints.admin.products.getAll + `?page=${page}&pageSize=${pageSize}`
        );
        setProducts(res.data.items ?? res.data);
        setTotal(res.data.totalCount ?? 0);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, pageSize]);

  const reload = async () => {
    const res = await client.get(
      endpoints.admin.products.getAll + `?page=${page}&pageSize=${pageSize}`
    );
    setProducts(res.data.items ?? res.data);
    setTotal(res.data.totalCount ?? 0);
  };

  useEffect(() => {
    client.get(endpoints.categories.getAll).then((res) => setCategories(res.data));
  }, []);

  const openCreate = () => {
  if (categories.length === 0) return; // guard
  setEditItem(null);
  setForm({
    name: "", description: "", slug: "",
    pricePerUnit: 0, unitType: 1, minQuantity: 0.1,
    stockQuantity: 0, imageUrl: "", isSeasonal: false,
    isActive: true, categoryId: categories[0].id,
    trackStock: true, lowStockAlert: 0,
  });
  setShowModal(true);
};

  const openEdit = (p: Product) => {
    setEditItem(p);
    setForm({
      name: p.name, description: "", slug: p.name.toLowerCase().replace(/\s+/g, "-"),
      pricePerUnit: p.pricePerUnit, unitType: p.unitType, minQuantity: 0.1,
      stockQuantity: p.stockQuantity, imageUrl: p.imageUrl,
      isSeasonal: p.isSeasonal, isActive: p.isActive, categoryId: p.categoryId,
      trackStock: true, lowStockAlert: 0,
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editItem) {
        await client.put(endpoints.admin.products.update(editItem.id), form);
      } else {
        await client.post(endpoints.admin.products.create, form);
      }
      setShowModal(false);
      await reload();
    } catch (err) {
    const msg = axios.isAxiosError(err)
      ? (err.response?.data?.title ?? err.message)
      : "Erro ao guardar produto.";
    alert(msg);
    }
  };

  const toggleActive = async (id: number) => {
    await client.put(endpoints.admin.products.toggleActive(id));
    await reload();
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Produtos</h1>
          <p className="text-sm text-gray-400 mt-1">{total} produtos no total</p>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
        >
          + Novo Produto
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="table-header">
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
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400">A carregar...</td>
              </tr>
            ) : products.map((p) => (
              <tr key={p.id} className="table-row transition">
                <td className="px-4 py-3 flex items-center gap-3">
                  <img
                    src={p.imageUrl} alt={p.name}
                    className="w-10 h-10 rounded-lg object-cover"
                    onError={(e) => (e.currentTarget.src = "https://placehold.co/40?text=P")}
                  />
                  <span className="font-medium text-gray-800">{p.name}</span>
                </td>
                <td className="px-4 py-3 text-gray-500">{p.categoryName}</td>
                <td className="px-4 py-3 font-semibold text-green-700">
                  {p.pricePerUnit.toFixed(2)}€{p.unitType === 1 ? "/kg" : "/un"}
                </td>
                <td className="px-4 py-3 text-gray-600">{p.stockQuantity}</td>
                <td className="px-4 py-3">
                  <span className={p.isActive ? badge.active : badge.inactive}>
                    {p.isActive ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEdit(p)} className="text-xs text-blue-600 hover:underline">
                    Editar
                  </button>
                  <button onClick={() => toggleActive(p.id)} className="text-xs text-gray-500 hover:underline">
                    {p.isActive ? "Desativar" : "Ativar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <Pagination
          page={page}
          totalPages={totalPages}
          totalCount={total}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          pageSizeOptions={[5, 10, 20]}
        />
      </div>

      {showModal && (
        <Modal
          title={editItem ? "Editar Produto" : "Novo Produto"}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        >
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm text-gray-600">Nome</span>
              <input className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""), })} />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">Categoria</span>
              <select className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: +e.target.value })}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm text-gray-600">Preço (€)</span>
                <input type="text" step="0.01" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                   value={form.pricePerUnit}
                    onChange={(e) => {
                      const v = e.target.value.replace(",", ".");
                      setForm({ ...form, pricePerUnit: v === "" ? 0 : parseFloat(v) || form.pricePerUnit });
                    }} />
              </label>
              <label className="block">
                <span className="text-sm text-gray-600">Stock</span>
                <input type="number" step="0.1" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  value={form.stockQuantity}
                  onChange={(e) => setForm({ ...form, stockQuantity: +e.target.value })} />
              </label>
            </div>
            <label className="block">
              <span className="text-sm text-gray-600">Tipo</span>
              <select className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                value={form.unitType}
                onChange={(e) => setForm({ ...form, unitType: +e.target.value })}>
                <option value={1}>Kg</option>
                <option value={2}>Unidade</option>
              </select>
            </label>
            <ImageInput
              value={form.imageUrl}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
            />
            <label className="block">
              <span className="text-sm text-gray-600">Slug</span>
              <input className="mt-1 w-full border rounded-lg px-3 py-2 text-sm font-mono"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </label>

            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm text-gray-600">Alerta stock baixo</span>
                <input type="number" step="0.1" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  value={form.lowStockAlert}
                  onChange={(e) => setForm({ ...form, lowStockAlert: +e.target.value })} />
              </label>

              <label className="flex items-center gap-2 mt-5">
                <input type="checkbox" checked={form.trackStock}
                  onChange={(e) => setForm({ ...form, trackStock: e.target.checked })} />
                <span className="text-sm text-gray-600">Controlar stock</span>
              </label>
            </div>
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