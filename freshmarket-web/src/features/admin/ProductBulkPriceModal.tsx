import { useState } from "react";
import client from "../../api/client";
import Modal from "../../components/admin/Modal";
import { endpoints } from "../../lib/endpoints";
import axios from "axios";
import type { Product } from "./ProductFormModal";

interface Props {
  products: Product[];
  onClose: () => void;
  reload: () => Promise<void>;
}

export default function ProductBulkPriceModal({ products, onClose, reload }: Props) {
  const [bulkPrices, setBulkPrices] = useState<Record<number, string>>(() => {
    const init: Record<number, string> = {};
    products.forEach(p => { init[p.id] = p.pricePerUnit.toFixed(2); });
    return init;
  });
  const [saving, setSaving] = useState(false);

  const handleSubmit = async () => {
    const items = Object.entries(bulkPrices)
      .map(([id, price]) => ({ productId: Number(id), newPrice: parseFloat(price.replace(",", ".")) }))
      .filter(i => !isNaN(i.newPrice) && i.newPrice > 0);
    if (items.length === 0) return;
    setSaving(true);
    try {
      await client.put(endpoints.admin.products.bulkUpdatePrice, { items });
      onClose();
      await reload();
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.title ?? err.message)
        : "Erro ao atualizar preços.";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title="Atualizar Preços em Massa"
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={saving ? "A guardar..." : "Guardar preços"}
      submitDisabled={saving}
    >
      <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
        Altera os preços dos produtos desta página. Deixa o valor igual para não alterar.
      </p>
      <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
        {products.map(p => (
          <div key={p.id} className="flex items-center gap-3">
            <img
              src={p.imageUrl} alt={p.name}
              className="w-8 h-8 rounded object-cover flex-shrink-0"
              onError={e => (e.currentTarget.src = "/images/placeholder.svg")}
            />
            <span className="flex-1 text-sm text-slate-800 dark:text-slate-200 truncate">{p.name}</span>
            <span className="text-xs text-slate-400">{p.unitType === 1 ? "€/kg" : "€/un"}</span>
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
  );
}
