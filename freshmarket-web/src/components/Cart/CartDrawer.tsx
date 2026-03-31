import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../../features/cart/CartContext";
import Icon from "../ui/Icon";
import { IconShoppingCart, IconX, IconArrowRight } from "../ui/icons";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: Props) {
  const { items, removeItem, updateQuantity, totalAmount } = useCart();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/40 z-40 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />
      )}

      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-stone-50 dark:bg-slate-800 shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900">
          <h2 className="text-base font-bold text-stone-900 dark:text-slate-100 flex items-center gap-2">
            <Icon icon={IconShoppingCart} size={17} className="text-emerald-700" />
            {t("cart.title")}
            {items.length > 0 && (
              <span className="text-xs font-semibold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full">
                {items.length}
              </span>
            )}
          </h2>
          <button
            onClick={onClose}
            className="text-stone-400 hover:text-stone-600 hover:bg-stone-100 rounded-md p-1 transition-colors dark:text-slate-400 dark:hover:text-slate-200 dark:hover:bg-slate-700"
          >
            <Icon icon={IconX} size={18} />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-stone-400 dark:text-slate-400 gap-3 px-4">
              <div className="w-16 h-16 rounded-2xl bg-stone-100 dark:bg-slate-700 flex items-center justify-center">
                <Icon icon={IconShoppingCart} size={28} stroke={1.5} />
              </div>
              <p className="text-sm font-medium">{t("cart.empty")}</p>
              <p className="text-xs text-stone-400 dark:text-slate-400 text-center">{t("cart.emptyDrawerDesc")}</p>
            </div>
          ) : (
            <div className="divide-y divide-stone-100 dark:divide-slate-700 px-4">
              {items.map((item) => (
                <div key={item.productId} className="flex items-center gap-3 py-4">
                  <img
                    src={item.imageUrl}
                    alt={item.name}
                    className="w-14 h-14 rounded-xl object-cover flex-shrink-0 bg-stone-100 dark:bg-slate-700"
                    onError={(e) => (e.currentTarget.src = "https://placehold.co/56?text=P")}
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-stone-800 dark:text-slate-100 truncate">{item.name}</p>
                    <p className="text-xs text-stone-400 dark:text-slate-400 mt-0.5">
                      {item.pricePerUnit.toFixed(2)}€{item.unitType === 1 ? "/kg" : "/un"}
                    </p>
                    <div className="flex items-center gap-1.5 mt-2">
                      <button
                        onClick={() => updateQuantity(item.productId, Math.max(0, +(item.quantity - (item.minQuantity ?? 1)).toFixed(2)))}
                        className="w-6 h-6 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-100 text-sm font-bold flex items-center justify-center transition-colors dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                      >−</button>
                      <span className="text-xs font-semibold w-8 text-center text-stone-700 dark:text-slate-300">
                        {(item.minQuantity ?? 1) % 1 !== 0
                          ? `${item.quantity.toFixed(1)}${item.unitType === 1 ? "kg" : ""}`
                          : item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, +(item.quantity + (item.minQuantity ?? 1)).toFixed(2))}
                        className="w-6 h-6 rounded-lg border border-stone-200 bg-white text-stone-600 hover:bg-stone-100 text-sm font-bold flex items-center justify-center transition-colors dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                      >+</button>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2 flex-shrink-0">
                    <p className="text-sm font-bold text-emerald-700">{item.subtotal.toFixed(2)}€</p>
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="text-stone-300 hover:text-red-400 transition-colors p-0.5"
                    >
                      <Icon icon={IconX} size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className="border-t border-stone-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-5 py-4 space-y-3">
            <div className="flex justify-between items-baseline">
              <span className="text-sm text-stone-500 dark:text-slate-400">{t("cart.subtotal")}</span>
              <span className="text-lg font-bold text-stone-900 dark:text-slate-100">{totalAmount.toFixed(2)}€</span>
            </div>
            <p className="text-xs text-stone-400 dark:text-slate-400">{t("cart.shippingNote")}</p>
            <button
              onClick={() => { onClose(); navigate("/checkout"); }}
              className="w-full bg-emerald-700 hover:bg-emerald-600 text-white font-semibold py-3 rounded-xl transition-colors flex items-center justify-center gap-2 text-sm"
            >
              {t("cart.checkout")}
              <Icon icon={IconArrowRight} size={15} />
            </button>
          </div>
        )}
      </div>
    </>
  );
}
