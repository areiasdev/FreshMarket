import { useEffect, useState } from "react";
import client from "../../api/client";
import Pagination from "../../components/admin/Pagination";
import Modal from "../../components/admin/Modal";
import { endpoints } from "../../lib/endpoints";

interface CategoryDto {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState<CategoryDto | null>(null);
  const [form, setForm] = useState({ name: "", slug: "" });

  const load = async () => {
    setLoading(true);
    const res = await client.get(endpoints.admin.categories.getAll + `?page=${page}&pageSize=${pageSize}`);
    setCategories(res.data.items);
    setTotal(res.data.totalCount);
    setLoading(false);
  };

  useEffect(() => { load(); }, [page]);

  const openCreate = () => { setEditItem(null); setForm({ name: "", slug: "" }); setShowModal(true); };
  const openEdit = (c: CategoryDto) => { setEditItem(c); setForm({ name: c.name, slug: c.slug }); setShowModal(true); };

  const handleSubmit = async () => {
    if (editItem) {
      await client.put(endpoints.admin.categories.update(editItem.id), {
        name: form.name,
        slug: form.slug,
        isActive: editItem.isActive,
        });
    } else {
      await client.post(endpoints.admin.categories.create, form);
    }
    setShowModal(false);
    load();
  };

  const toggleActive = async (id: number) => {
    await client.patch(endpoints.admin.categories.toggleActive(id));
    load();
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categorias</h1>
          <p className="text-sm text-gray-400 mt-1">{total} categorias no total</p>
        </div>
        <button onClick={openCreate} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
          + Nova Categoria
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Nome</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Slug</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Estado</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={4} className="text-center py-8 text-gray-400">A carregar...</td></tr>
            ) : categories.map((c) => (
              <tr key={c.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{c.slug}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${c.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    {c.isActive ? "Ativa" : "Inativa"}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-3">
                  <button onClick={() => openEdit(c)} className="text-xs text-blue-600 hover:underline">Editar</button>
                  <button onClick={() => toggleActive(c.id)} className="text-xs text-gray-500 hover:underline">
                    {c.isActive ? "Desativar" : "Ativar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {showModal && (
        <Modal title={editItem ? "Editar Categoria" : "Nova Categoria"} onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <label className="block mb-4">
            <span className="text-sm text-gray-600">Nome</span>
            <input className="mt-1 w-full border rounded-lg px-3 py-2 text-sm" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-") })} />
          </label>
          <label className="block">
            <span className="text-sm text-gray-600">Slug</span>
            <input className="mt-1 w-full border rounded-lg px-3 py-2 text-sm font-mono" value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })} />
          </label>
        </Modal>
      )}
    </div>
  );
}