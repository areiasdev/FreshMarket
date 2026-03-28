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
  description?: string;
  pricePerUnit: number;
  unitType: number;
  minQuantity?: number;
  stockQuantity: number;
  trackStock?: boolean;
  lowStockAlert?: number;
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
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch]           = useState("");
  const [showModal, setShowModal]             = useState(false);
  const [showBulkModal, setShowBulkModal]     = useState(false);
  const [bulkPrices, setBulkPrices]           = useState<Record<number, string>>({});
  const [bulkSaving, setBulkSaving]           = useState(false);
  const [editItem, setEditItem]               = useState<Product | null>(null);
  const [stockItem, setStockItem]             = useState<Product | null>(null);
  const [stockDelta, setStockDelta]           = useState("");
  const [stockSaving, setStockSaving]         = useState(false);
  const [form, setForm] = useState({
    name: "", description: "", slug: "",
    pricePerUnit: 0, unitType: 1,
    minQuantity: 0.5, stockQuantity: 0, imageUrl: "",
    isSeasonal: false, isActive: true, categoryId: 0,
    trackStock: true, lowStockAlert: 0,
  });

  const buildUrl = (p = page, ps = pageSize, s = search) => {
    const params = new URLSearchParams({ page: String(p), pageSize: String(ps) });
    if (s) params.set("search", s);
    return endpoints.admin.products.getAll + "?" + params.toString();
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const res = await client.get(buildUrl());
        setProducts(res.data.items ?? res.data);
        setTotal(res.data.totalCount ?? 0);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [page, pageSize, search]);

  const reload = async () => {
    const res = await client.get(buildUrl());
    setProducts(res.data.items ?? res.data);
    setTotal(res.data.totalCount ?? 0);
  };

  useEffect(() => {
    client.get(endpoints.categories.getAll).then((res) => setCategories(res.data));
  }, []);

  const openCreate = () => {
    if (categories.length === 0) return;
    setEditItem(null);
    setForm({
      name: "", description: "", slug: "",
      pricePerUnit: 0, unitType: 1, minQuantity: 0.5,
      stockQuantity: 0, imageUrl: "", isSeasonal: false,
      isActive: true, categoryId: categories[0].id,
      trackStock: true, lowStockAlert: 0,
    });
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditItem(p);
    setForm({
      name: p.name,
      description: p.description ?? "",
      slug: p.name.toLowerCase().replace(/\s+/g, "-"),
      pricePerUnit: p.pricePerUnit,
      unitType: p.unitType,
      minQuantity: p.minQuantity ?? 0.5,
      stockQuantity: p.stockQuantity,
      imageUrl: p.imageUrl,
      isSeasonal: p.isSeasonal,
      isActive: p.isActive,
      categoryId: p.categoryId,
      trackStock: p.trackStock ?? true,
      lowStockAlert: p.lowStockAlert ?? 0,
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

  const openStockAdjust = (p: Product) => {
    setStockItem(p);
    setStockDelta("");
  };

  const handleStockSave = async () => {
    if (!stockItem) return;
    const delta = parseFloat(stockDelta.replace(",", "."));
    if (isNaN(delta) || delta === 0) return;
    const newStock = Math.max(0, stockItem.stockQuantity + delta);
    setStockSaving(true);
    try {
      await client.put(endpoints.admin.products.update(stockItem.id), {
        ...stockItem,
        description: stockItem.description ?? "",
        slug: stockItem.name.toLowerCase().replace(/\s+/g, "-"),
        minQuantity: stockItem.minQuantity ?? 0.5,
        trackStock: stockItem.trackStock ?? true,
        lowStockAlert: stockItem.lowStockAlert ?? 0,
        stockQuantity: newStock,
      });
      setStockItem(null);
      await reload();
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.title ?? err.message)
        : "Erro ao ajustar stock.";
      alert(msg);
    } finally {
      setStockSaving(false);
    }
  };

  const openBulkPrices = () => {
    const init: Record<number, string> = {};
    products.forEach(p => { init[p.id] = p.pricePerUnit.toFixed(2); });
    setBulkPrices(init);
    setShowBulkModal(true);
  };

  const handleBulkSave = async () => {
    const items = Object.entries(bulkPrices)
      .map(([id, price]) => ({ productId: Number(id), newPrice: parseFloat(price.replace(",", ".")) }))
      .filter(i => !isNaN(i.newPrice) && i.newPrice > 0);
    if (items.length === 0) return;
    setBulkSaving(true);
    try {
      await client.put(endpoints.admin.products.bulkUpdatePrice, { items });
      setShowBulkModal(false);
      await reload();
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.title ?? err.message)
        : "Erro ao atualizar preços.";
      alert(msg);
    } finally {
      setBulkSaving(false);
    }
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
            onClick={openBulkPrices}
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
                  <button onClick={() => openStockAdjust(p)} className="text-xs text-emerald-600 dark:text-emerald-400 hover:underline">
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
        <Modal
          title="Atualizar Preços em Massa"
          onClose={() => setShowBulkModal(false)}
          onSubmit={handleBulkSave}
          submitLabel={bulkSaving ? "A guardar..." : "Guardar preços"}
          submitDisabled={bulkSaving}
        >
          <p className="text-xs text-gray-500 dark:text-slate-400 mb-4">
            Altera os preços dos produtos desta página. Deixa o valor igual para não alterar.
          </p>
          <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
            {products.map(p => (
              <div key={p.id} className="flex items-center gap-3">
                <img
                  src={p.imageUrl} alt={p.name}
                  className="w-8 h-8 rounded object-cover flex-shrink-0"
                  onError={e => (e.currentTarget.src = "https://placehold.co/32?text=P")}
                />
                <span className="flex-1 text-sm text-gray-800 dark:text-slate-200 truncate">{p.name}</span>
                <span className="text-xs text-gray-400">{p.unitType === 1 ? "€/kg" : "€/un"}</span>
                <input
                  type="text"
                  inputMode="decimal"
                  className="input w-24 text-right"
                  value={bulkPrices[p.id] ?? ""}
                  onChange={e => setBulkPrices(prev => ({ ...prev, [p.id]: e.target.value }))}
                />
              </div>
            ))}
          </div>
        </Modal>
      )}

      {stockItem && (
        <Modal
          title={`Ajustar Stock — ${stockItem.name}`}
          onClose={() => setStockItem(null)}
          onSubmit={handleStockSave}
          submitLabel={stockSaving ? "A guardar..." : "Aplicar"}
          submitDisabled={stockSaving || stockDelta === "" || parseFloat(stockDelta.replace(",", ".")) === 0 || isNaN(parseFloat(stockDelta.replace(",", ".")))}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
              <img
                src={stockItem.imageUrl} alt={stockItem.name}
                className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
                onError={e => (e.currentTarget.src = "https://placehold.co/40?text=P")}
              />
              <div>
                <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{stockItem.name}</p>
                <p className="text-xs text-slate-400">Stock atual: <span className="font-semibold">{stockItem.stockQuantity}</span></p>
              </div>
            </div>
            <div>
              <label className="label">Ajuste (ex: +5 ou -2)</label>
              <input
                type="text"
                inputMode="decimal"
                className="input"
                placeholder="+10 ou -3"
                value={stockDelta}
                onChange={e => setStockDelta(e.target.value)}
                autoFocus
              />
              {stockDelta !== "" && !isNaN(parseFloat(stockDelta.replace(",", "."))) && (
                <p className="text-xs text-slate-400 mt-1">
                  Novo stock:{" "}
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    {Math.max(0, stockItem.stockQuantity + parseFloat(stockDelta.replace(",", ".")))}
                  </span>
                </p>
              )}
            </div>
          </div>
        </Modal>
      )}

      {showModal && (
        <Modal
          title={editItem ? "Editar Produto" : "Novo Produto"}
          onClose={() => setShowModal(false)}
          onSubmit={handleSubmit}
        >
          <div className="space-y-3">
            <label className="block">
              <span className="text-sm text-gray-600 dark:text-slate-300">Nome</span>
              <input className="input mt-1"
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, ""), })} />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600 dark:text-slate-300">Descrição</span>
              <textarea
                className="input mt-1 resize-none"
                rows={3}
                placeholder="Descrição opcional do produto..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600 dark:text-slate-300">Categoria</span>
              <select className="input mt-1"
                value={form.categoryId}
                onChange={(e) => setForm({ ...form, categoryId: +e.target.value })}>
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm text-gray-600 dark:text-slate-300">Preço (€)</span>
                <input type="text" className="input mt-1"
                   value={form.pricePerUnit}
                    onChange={(e) => {
                      const v = e.target.value.replace(",", ".");
                      setForm({ ...form, pricePerUnit: v === "" ? 0 : parseFloat(v) || form.pricePerUnit });
                    }} />
              </label>
              <label className="block">
                <span className="text-sm text-gray-600 dark:text-slate-300">Stock</span>
                <input type="text" inputMode="decimal" className="input mt-1"
                  value={form.stockQuantity}
                  onChange={(e) => {
                    const v = e.target.value.replace(",", ".");
                    setForm({ ...form, stockQuantity: v === "" ? 0 : parseFloat(v) || form.stockQuantity });
                  }} />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <label className="block">
                <span className="text-sm text-gray-600 dark:text-slate-300">Qtd. mínima</span>
                <input type="text" inputMode="decimal" className="input mt-1"
                  value={form.minQuantity}
                  onChange={(e) => {
                    const v = e.target.value.replace(",", ".");
                    setForm({ ...form, minQuantity: v === "" ? 0 : parseFloat(v) || form.minQuantity });
                  }} />
              </label>
              <label className="block">
                <span className="text-sm text-gray-600 dark:text-slate-300">Alerta stock baixo</span>
                <input type="text" className="input mt-1"
                  value={form.lowStockAlert}
                  onChange={(e) => {
                    const v = e.target.value.replace(",", ".");
                    setForm({ ...form, lowStockAlert: v === "" ? 0 : parseFloat(v) || form.lowStockAlert });
                  }} />
              </label>
            </div>
            <label className="block">
              <span className="text-sm text-gray-600 dark:text-slate-300">Tipo</span>
              <select className="input mt-1"
                value={form.unitType}
                onChange={(e) => setForm({ ...form, unitType: +e.target.value })}>
                <option value={1}>Kg (por peso)</option>
                <option value={0}>Unidade</option>
              </select>
            </label>
            <ImageInput
              value={form.imageUrl}
              onChange={(url) => setForm({ ...form, imageUrl: url })}
            />
            <label className="block">
              <span className="text-sm text-gray-600 dark:text-slate-300">Slug</span>
              <input className="input mt-1 font-mono"
                value={form.slug}
                onChange={(e) => setForm({ ...form, slug: e.target.value })} />
            </label>

            <label className="flex items-center gap-2">
              <input type="checkbox" checked={form.trackStock}
                onChange={(e) => setForm({ ...form, trackStock: e.target.checked })} />
              <span className="text-sm text-gray-600 dark:text-slate-300">Controlar stock</span>
            </label>
            <label className="flex items-center gap-2 mt-1">
              <input type="checkbox" checked={form.isSeasonal}
                onChange={(e) => setForm({ ...form, isSeasonal: e.target.checked })} />
              <span className="text-sm text-gray-600 dark:text-slate-300">Produto Sazonal</span>
            </label>
          </div>
        </Modal>
      )}
    </div>
  );
}
