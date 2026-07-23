import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useCart } from "../features/cart/CartContext";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import Breadcrumb from "../components/layout/BreadCrumb";
import Icon from "../components/ui/Icon";
import { IconShoppingCart, IconX, IconArrowRight } from "../components/ui/icons";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 py-8">
        <Breadcrumb items={[{ label: t("checkout.breadcrumbStore"), path: "/" }, { label: t("cart.title") }]} />

        {items.length === 0 ? (
          <div className="card flex flex-col items-center py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
              <Icon icon={IconShoppingCart} size={22} className="text-slate-400" stroke={1.5} />
            </div>
            <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 mb-1">{t("cart.empty")}</p>
            <p className="text-sm text-slate-400 mb-6">{t("cart.emptyDesc")}</p>
            <button onClick={() => navigate("/")} className="btn-primary">
              {t("cart.viewProducts")}
            </button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">

            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100 dark:border-slate-700">
                <h1 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                  {t("cart.title")}
                  <span className="ml-2 text-slate-400 font-normal tabular">
                    ({items.length} {t("cart.product", { count: items.length })})
                  </span>
                </h1>
                <button onClick={clearCart} className="btn-ghost text-xs">
                  {t("cart.clearAll")}
                </button>
              </div>

              <div className="grid grid-cols-[1fr_112px_72px_32px] gap-3 px-5 py-2.5 bg-slate-50 border-b border-slate-100
                              text-xs font-semibold text-slate-400 uppercase tracking-wide dark:bg-slate-800 dark:border-slate-700">
                <span>{t("cart.product")}</span>
                <span className="text-center">{t("cart.quantity")}</span>
                <span className="text-right">{t("cart.subtotal")}</span>
                <span />
              </div>

              <div className="divide-y divide-slate-50 dark:divide-slate-700">
                {items.map(item => (
                  <div key={item.productId}
                    className="grid grid-cols-[1fr_112px_72px_32px] gap-3 items-center px-5 py-3.5">
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.imageUrl} alt={item.name}
                        className="w-11 h-11 rounded-lg object-cover border border-slate-100 dark:border-slate-700 flex-shrink-0"
                        onError={e => (e.currentTarget.src = "/images/placeholder.svg")}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-100 truncate">{item.name}</p>
                        <p className="text-xs text-slate-400 tabular mt-0.5">
                          {item.pricePerUnit.toFixed(2)}€{item.unitType === 1 ? "/kg" : "/un"}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.productId, Math.max(0, +(item.quantity - (item.minQuantity ?? 1)).toFixed(2)))}
                        className="w-6 h-6 rounded border border-slate-200 bg-white text-slate-600 text-sm
                                   flex items-center justify-center hover:bg-slate-50 transition-colors leading-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                      >−</button>
                      <span className="text-xs font-semibold tabular text-slate-800 dark:text-slate-100 min-w-[32px] text-center">
                        {(item.minQuantity ?? 1) % 1 !== 0 ? item.quantity.toFixed(1) : item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, +(item.quantity + (item.minQuantity ?? 1)).toFixed(2))}
                        className="w-6 h-6 rounded border border-slate-200 bg-white text-slate-600 text-sm
                                   flex items-center justify-center hover:bg-slate-50 transition-colors leading-none dark:border-slate-600 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600"
                      >+</button>
                    </div>

                    <p className="text-sm font-bold text-slate-900 dark:text-slate-100 text-right tabular">
                      {item.subtotal.toFixed(2)}€
                    </p>

                    <button
                      onClick={() => removeItem(item.productId)}
                      className="w-7 h-7 rounded flex items-center justify-center
                                 text-slate-300 hover:text-red-400 hover:bg-red-50
                                 transition-colors dark:hover:bg-red-900/20"
                    >
                      <Icon icon={IconX} size={14} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <div className="card overflow-hidden lg:sticky lg:top-20">
              <div className="card-header">{t("cart.orderSummary")}</div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{t("cart.subtotal")}</span>
                  <span className="font-medium tabular text-slate-800 dark:text-slate-100">{totalAmount.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500 dark:text-slate-400">{t("cart.shipping")}</span>
                  <span className="font-medium text-slate-400 dark:text-slate-500 italic">{t("cart.shippingAtCheckout")}</span>
                </div>
                <div className="flex justify-between pt-3 border-t border-slate-100 dark:border-slate-700">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{t("cart.subtotal")}</span>
                  <span className="text-base font-bold text-emerald-700 tabular">{totalAmount.toFixed(2)}€</span>
                </div>
              </div>

              <div className="px-5 pb-5 space-y-2">
                <button onClick={() => navigate("/checkout")}
                  className="btn-primary w-full justify-center font-bold flex items-center gap-2">
                  {t("cart.checkout")}
                  <Icon icon={IconArrowRight} size={14} />
                </button>
                <button onClick={() => navigate("/")}
                  className="w-full text-xs text-slate-400 hover:text-slate-600 py-1.5 transition-colors">
                  {t("cart.continueShopping")}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
