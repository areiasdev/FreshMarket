import { useState } from "react";
import client from "../../api/client";
import Modal from "../../components/admin/Modal";
import { endpoints } from "../../lib/endpoints";
import ImageInput from "../../components/admin/ImageInput";
import axios from "axios";

export interface Product {
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

export interface Category {
  id: number;
  name: string;
}

interface Props {
  editItem: Product | null;
  categories: Category[];
  onClose: () => void;
  reload: () => Promise<void>;
}

export default function ProductFormModal({ editItem, categories, onClose, reload }: Props) {
  const [form, setForm] = useState(() =>
    editItem
      ? {
          name: editItem.name,
          description: editItem.description ?? "",
          slug: editItem.name.toLowerCase().replace(/\s+/g, "-"),
          pricePerUnit: editItem.pricePerUnit,
          unitType: editItem.unitType,
          minQuantity: editItem.minQuantity ?? 0.5,
          stockQuantity: editItem.stockQuantity,
          imageUrl: editItem.imageUrl,
          isSeasonal: editItem.isSeasonal,
          isActive: editItem.isActive,
          categoryId: editItem.categoryId,
          trackStock: editItem.trackStock ?? true,
          lowStockAlert: editItem.lowStockAlert ?? 0,
        }
      : {
          name: "", description: "", slug: "",
          pricePerUnit: 0, unitType: 1, minQuantity: 0.5,
          stockQuantity: 0, imageUrl: "", isSeasonal: false,
          isActive: true, categoryId: categories[0]?.id ?? 0,
          trackStock: true, lowStockAlert: 0,
        }
  );

  const handleSubmit = async () => {
    try {
      if (editItem) {
        await client.put(endpoints.admin.products.update(editItem.id), form);
      } else {
        await client.post(endpoints.admin.products.create, form);
      }
      onClose();
      await reload();
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.title ?? err.message)
        : "Erro ao guardar produto.";
      alert(msg);
    }
  };

  return (
    <Modal
      title={editItem ? "Editar Produto" : "Novo Produto"}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <div className="space-y-3">
        <label className="block">
          <span className="text-sm text-slate-600 dark:text-slate-300">Nome</span>
          <input className="input mt-1"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value, slug: e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "") })} />
        </label>
        <label className="block">
          <span className="text-sm text-slate-600 dark:text-slate-300">Descrição</span>
          <textarea
            className="input mt-1 resize-none"
            rows={3}
            placeholder="Descrição opcional do produto..."
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </label>
        <label className="block">
          <span className="text-sm text-slate-600 dark:text-slate-300">Categoria</span>
          <select className="input mt-1"
            value={form.categoryId}
            onChange={(e) => setForm({ ...form, categoryId: +e.target.value })}>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </label>
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-sm text-slate-600 dark:text-slate-300">Preço (€)</span>
            <input type="text" className="input mt-1"
              value={form.pricePerUnit}
              onChange={(e) => {
                const v = e.target.value.replace(",", ".");
                setForm({ ...form, pricePerUnit: v === "" ? 0 : parseFloat(v) || form.pricePerUnit });
              }} />
          </label>
          <label className="block">
            <span className="text-sm text-slate-600 dark:text-slate-300">Stock</span>
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
            <span className="text-sm text-slate-600 dark:text-slate-300">Qtd. mínima</span>
            <input type="text" inputMode="decimal" className="input mt-1"
              value={form.minQuantity}
              onChange={(e) => {
                const v = e.target.value.replace(",", ".");
                setForm({ ...form, minQuantity: v === "" ? 0 : parseFloat(v) || form.minQuantity });
              }} />
          </label>
          <label className="block">
            <span className="text-sm text-slate-600 dark:text-slate-300">Alerta stock baixo</span>
            <input type="text" className="input mt-1"
              value={form.lowStockAlert}
              onChange={(e) => {
                const v = e.target.value.replace(",", ".");
                setForm({ ...form, lowStockAlert: v === "" ? 0 : parseFloat(v) || form.lowStockAlert });
              }} />
          </label>
        </div>
        <label className="block">
          <span className="text-sm text-slate-600 dark:text-slate-300">Tipo</span>
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
          <span className="text-sm text-slate-600 dark:text-slate-300">Slug</span>
          <input className="input mt-1 font-mono"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })} />
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.trackStock}
            onChange={(e) => setForm({ ...form, trackStock: e.target.checked })} />
          <span className="text-sm text-slate-600 dark:text-slate-300">Controlar stock</span>
        </label>
        <label className="flex items-center gap-2 mt-1">
          <input type="checkbox" checked={form.isSeasonal}
            onChange={(e) => setForm({ ...form, isSeasonal: e.target.checked })} />
          <span className="text-sm text-slate-600 dark:text-slate-300">Produto Sazonal</span>
        </label>
      </div>
    </Modal>
  );
}
