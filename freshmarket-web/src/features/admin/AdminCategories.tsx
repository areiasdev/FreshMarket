import { useEffect, useState } from "react";
import client from "../../api/client";
import Modal from "../../components/admin/Modal";
import { endpoints } from "../../lib/endpoints";
import Pagination from "../../components/utils/Pagination";
import axios from "axios";
import { badge } from "../../lib/color";

interface CategoryDto {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<CategoryDto[]>([]);
  const [total, setTotal]           = useState(0);
  const [page, setPage]             = useState(1);
  const [pageSize, setPageSize]     = useState(10);
  const [loading, setLoading]       = useState(true);
  const [showModal, setShowModal]   = useState(false);
  const [editItem, setEditItem] = useState<CategoryDto | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", isActive: true });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await client.get(
          endpoints.admin.categories.getAll + `?page=${page}&pageSize=${pageSize}`
        );
        setCategories(res.data.items ?? res.data);
        setTotal(res.data.totalCount ?? 0);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, pageSize]);

  const reload = async () => {
    const res = await client.get(
      endpoints.admin.categories.getAll + `?page=${page}&pageSize=${pageSize}`
    );
    setCategories(res.data.items ?? res.data);
    setTotal(res.data.totalCount ?? 0);
  };

  const handleSubmit = async () => {
  try {
    if (editItem) {
      await client.put(endpoints.admin.categories.update(editItem.id), form);
    } else {
      await client.post(endpoints.admin.categories.create, form);
    }
    setShowModal(false);
    await reload();
  } catch (err) {
    const msg = axios.isAxiosError(err)
      ? (err.response?.data?.title ?? err.message)
      : "Erro ao guardar categoria.";
    alert(msg);
  }
};

  const toggleActive = async (id: number) => {
    await client.patch(endpoints.admin.categories.toggleActive(id));
    await reload();
  };

  const openCreate = () => {
    setEditItem(null);
    setForm({ name: "", slug: "", isActive: true });
    setShowModal(true);
  };

  const openEdit = (c: CategoryDto) => {
    setEditItem(c);
    setForm({ name: c.name, slug: c.slug, isActive: c.isActive });
    setShowModal(true);
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Categorias</h1>
          <p className="text-sm text-gray-400 mt-1">{total} categorias no total</p>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary text-white px-4 py-2 rounded-lg text-sm font-semibold"
        >
          + Nova Categoria
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="table-header">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Nome</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Slug</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Estado</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-gray-400">A carregar...</td>
              </tr>
            ) : categories.map((c) => (
              <tr key={c.id} className="table-row">
                <td className="px-4 py-3 font-medium">{c.name}</td>
                <td className="px-4 py-3 text-gray-400 font-mono text-xs">{c.slug}</td>
                <td className="px-4 py-3">
                  <span className={c.isActive ? badge.active : badge.inactive}>
                    {c.isActive ? "Ativa" : "Inativa"}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-3">
                  <button onClick={() => openEdit(c)} className="text-xs text-blue-600 hover:underline">
                    Editar
                  </button>
                  <button onClick={() => toggleActive(c.id)} className="text-xs text-gray-500 hover:underline">
                    {c.isActive ? "Desativar" : "Ativar"}
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
          title={editItem ? "Editar Categoria" : "Nova Categoria"}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        >
          <label className="block mb-4">
            <span className="text-sm text-gray-600">Nome</span>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              value={form.name}
              onChange={(e) => setForm({
                ...form,
                name: e.target.value,
                slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
              })}
            />
          </label>
          <label className="block mb-4">
            <span className="text-sm text-gray-600">Slug</span>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm font-mono"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </label>
          <label className="flex items-center gap-2 mt-3">
            <input type="checkbox" checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            <span className="text-sm text-gray-600">Ativa</span>
          </label>
        </Modal>
      )}
    </div>
  );
}