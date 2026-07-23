import { useState } from "react";
import client from "../../api/client";
import Modal from "../../components/admin/Modal";
import { endpoints } from "../../lib/endpoints";
import Pagination from "../../components/utils/Pagination";
import axios from "axios";
import { badge } from "../../lib/color";
import { useAdminList } from "./useAdminList";

interface CategoryDto {
  id: number;
  name: string;
  slug: string;
  isActive: boolean;
}

export default function AdminCategories() {
  const [page, setPage]         = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [showModal, setShowModal]   = useState(false);
  const [editItem, setEditItem] = useState<CategoryDto | null>(null);
  const [form, setForm] = useState({ name: "", slug: "", isActive: true });

  const { data: categories, total, loading, reload } = useAdminList<CategoryDto>({
    url: endpoints.admin.categories.getAll,
    page,
    pageSize,
  });

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
    try {
      await client.patch(endpoints.admin.categories.toggleActive(id));
      await reload();
    } catch {
      alert("Erro ao atualizar o estado da categoria.");
    }
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
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Categorias</h1>
          <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">{total} categorias no total</p>
        </div>
        <button
          onClick={openCreate}
          className="btn-primary text-white px-4 py-2 rounded-lg text-sm font-semibold"
        >
          + Nova Categoria
        </button>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="table-header">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Nome</th>
              <th className="text-left px-4 py-3 font-medium">Slug</th>
              <th className="text-left px-4 py-3 font-medium">Estado</th>
              <th className="text-left px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} className="text-center py-8 text-slate-400">A carregar...</td>
              </tr>
            ) : categories.length === 0 ? (
              <tr>
                <td colSpan={4} className="text-center py-10 text-slate-400 dark:text-slate-500">Nenhuma categoria encontrada</td>
              </tr>
            ) : categories.map((c) => (
              <tr key={c.id} className="table-row">
                <td className="px-4 py-3 font-medium dark:text-slate-200">{c.name}</td>
                <td className="px-4 py-3 text-slate-400 dark:text-slate-500 font-mono text-xs">{c.slug}</td>
                <td className="px-4 py-3">
                  <span className={c.isActive ? badge.active : badge.inactive}>
                    {c.isActive ? "Ativa" : "Inativa"}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-3">
                  <button onClick={() => openEdit(c)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    Editar
                  </button>
                  <button onClick={() => toggleActive(c.id)} className="text-xs text-slate-500 dark:text-slate-400 hover:underline">
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
            <span className="text-sm text-slate-600 dark:text-slate-300">Nome</span>
            <input
              className="input mt-1"
              value={form.name}
              onChange={(e) => setForm({
                ...form,
                name: e.target.value,
                slug: e.target.value.toLowerCase().replace(/\s+/g, "-"),
              })}
            />
          </label>
          <label className="block mb-4">
            <span className="text-sm text-slate-600 dark:text-slate-300">Slug</span>
            <input
              className="input mt-1 font-mono"
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
            />
          </label>
          <label className="flex items-center gap-2 mt-3">
            <input type="checkbox" checked={form.isActive}
              onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
            <span className="text-sm text-slate-600 dark:text-slate-300">Ativa</span>
          </label>
        </Modal>
      )}
    </div>
  );
}