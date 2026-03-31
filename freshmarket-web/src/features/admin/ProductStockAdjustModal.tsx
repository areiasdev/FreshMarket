import { useState } from "react";
import client from "../../api/client";
import Modal from "../../components/admin/Modal";
import { endpoints } from "../../lib/endpoints";
import axios from "axios";
import type { Product } from "./ProductFormModal";

interface Props {
  product: Product;
  onClose: () => void;
  reload: () => Promise<void>;
}

export default function ProductStockAdjustModal({ product, onClose, reload }: Props) {
  const [stockDelta, setStockDelta] = useState("");
  const [saving, setSaving]         = useState(false);

  const parsedDelta = parseFloat(stockDelta.replace(",", "."));
  const isValid = stockDelta !== "" && !isNaN(parsedDelta) && parsedDelta !== 0;
  const newStock = isValid ? Math.max(0, product.stockQuantity + parsedDelta) : null;

  const handleSubmit = async () => {
    if (!isValid || newStock === null) return;
    setSaving(true);
    try {
      await client.put(endpoints.admin.products.update(product.id), {
        ...product,
        description: product.description ?? "",
        slug: product.name.toLowerCase().replace(/\s+/g, "-"),
        minQuantity: product.minQuantity ?? 0.5,
        trackStock: product.trackStock ?? true,
        lowStockAlert: product.lowStockAlert ?? 0,
        stockQuantity: newStock,
      });
      onClose();
      await reload();
    } catch (err) {
      const msg = axios.isAxiosError(err)
        ? (err.response?.data?.title ?? err.message)
        : "Erro ao ajustar stock.";
      alert(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={`Ajustar Stock — ${product.name}`}
      onClose={onClose}
      onSubmit={handleSubmit}
      submitLabel={saving ? "A guardar..." : "Aplicar"}
      submitDisabled={saving || !isValid}
    >
      <div className="space-y-4">
        <div className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-700/50">
          <img
            src={product.imageUrl} alt={product.name}
            className="w-10 h-10 rounded-lg object-cover flex-shrink-0"
            onError={e => (e.currentTarget.src = "https://placehold.co/40?text=P")}
          />
          <div>
            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{product.name}</p>
            <p className="text-xs text-slate-400">Stock atual: <span className="font-semibold">{product.stockQuantity}</span></p>
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
          {newStock !== null && (
            <p className="text-xs text-slate-400 mt-1">
              Novo stock:{" "}
              <span className="font-semibold text-slate-700 dark:text-slate-200">{newStock}</span>
            </p>
          )}
        </div>
      </div>
    </Modal>
  );
}
