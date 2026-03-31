import { useEffect, useState } from "react";
import client from "../../api/client";
import { endpoints } from "../../lib/endpoints";
import Pagination from "../../components/utils/Pagination";
import { badge } from "../../lib/color";
import { useAdminList } from "./useAdminList";
import type { Product, Category } from "./ProductFormModal";
import ProductFormModal from "./ProductFormModal";
import ProductStockAdjustModal from "./ProductStockAdjustModal";
import ProductBulkPriceModal from "./ProductBulkPriceModal";

export default function AdminProducts() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [page, setPage]             = useState(1);
  const [pageSize, setPageSize]     = useState(10);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]           = useState("");
  const [showModal, setShowModal]         = useState(false);
  const [showBulkModal, setShowBulkModal] = useState(false);
  const [editItem, setEditItem]           = useState<Product | null>(null);
  const [stockItem, setStockItem]         = useState<Product | null>(null);

  const { data: products, total, loading, reload } = useAdminList<Product>({
    url: endpoints.admin.products.getAll,
    page,
    pageSize,
    extraParams: search ? { search } : undefined,
    extraDeps: [search],
  });

  useEffect(() => {
    client.get(endpoints.categories.getAll).then((res) => setCategories(res.data));
  }, []);

  const openCreate = () => {
    if (categories.length === 0) return;
    setEditItem(null);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditItem(p);
    setShowModal(true);
  };

  const toggleActive = async (id: number) => {
    await client.patch(endpoints.admin.products.toggleActive(id));
    await reload();
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 dark:text-slate-100">Produtos</h1>
          <p className="text-sm text-gray-400 dark:text-slate-500 mt-1">{total} produtos no total</p>
        </div>
        <div className="flex gap-2 flex-wrap items-center">
          <form
            onSubmit={e => { e.preventDefault(); setPage(1); setSearch(searchInput); }}
            className="flex gap-2"
          >
            <input
              value={searchInput}
              onChange={e => { setSearchInput(e.target.value); if (e.target.value === "") { setSearch(""); setPage(1); } }}
              placeholder="Pesquisar produto..."
              className="text-sm px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            <button type="submit" className="text-sm px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors">
              Pesquisar
            </button>
          </form>
          <button
            onClick={() => setShowBulkModal(true)}
            disabled={products.length === 0}
            className="border border-gray-200 dark:border-slate-600 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-gray-700 dark:text-slate-300 disabled:opacity-40"
          >
            Atualizar Preços
          </button>
          <button
            onClick={openCreate}
            className="btn-primary text-white text-sm font-semibold px-4 py-2 rounded-lg transition"
          >
            + Novo Produto
          </button>
        </div>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm">
          <thead className="table-header">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Produto</th>
              <th className="text-left px-4 py-3 font-medium">Categoria</th>
              <th className="text-left px-4 py-3 font-medium">Preço</th>
              <th className="text-left px-4 py-3 font-medium">Stock</th>
              <th className="text-left px-4 py-3 font-medium">Estado</th>
              <th className="text-left px-4 py-3 font-medium">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-8 text-gray-400 dark:text-slate-500">A carregar...</td>
              </tr>
            ) : products.map((p) => (
              <tr key={p.id} className="table-row transition">
                <td className="px-4 py-3 flex items-center gap-3">
                  <img
                    src={p.imageUrl} alt={p.name}
                    className="w-10 h-10 rounded-lg object-cover"
                    onError={(e) => (e.currentTarget.src = "https://placehold.co/40?text=P")}
                  />
                  <span className="font-medium text-gray-800 dark:text-slate-200">{p.name}</span>
                </td>
                <td className="px-4 py-3 text-gray-500 dark:text-slate-400">{p.categoryName}</td>
                <td className="px-4 py-3 font-semibold text-green-700 dark:text-emerald-400">
                  {p.pricePerUnit.toFixed(2)}€{p.unitType === 1 ? "/kg" : "/un"}
                </td>
                <td className="px-4 py-3">
                  <span className="text-gray-600 dark:text-slate-400 tabular-nums">{p.stockQuantity}</span>
                  {p.trackStock && (p.lowStockAlert ?? 0) > 0 && p.stockQuantity <= (p.lowStockAlert ?? 0) && (
                    <span className="ml-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded">
                      baixo
                    </span>
                  )}
                </td>
                <td className="px-4 py-3">
                  <span className={p.isActive ? badge.active : badge.inactive}>
                    {p.isActive ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-2">
                  <button onClick={() => openEdit(p)} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">
                    Editar
                  </button>
                  <button onClick={() => setStockItem(p)} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
                    Stock
                  </button>
                  <button onClick={() => toggleActive(p.id)} className="text-xs text-gray-500 dark:text-slate-400 hover:underline">
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

      {showBulkModal && (
        <ProductBulkPriceModal
          products={products}
          onClose={() => setShowBulkModal(false)}
          reload={reload}
        />
      )}

      {stockItem && (
        <ProductStockAdjustModal
          product={stockItem}
          onClose={() => setStockItem(null)}
          reload={reload}
        />
      )}

      {showModal && (
        <ProductFormModal
          editItem={editItem}
          categories={categories}
          onClose={() => setShowModal(false)}
          reload={reload}
        />
      )}
    </div>
  );
}
