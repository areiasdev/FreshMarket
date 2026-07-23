import { useEffect, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import client from "../api/client";
import { endpoints } from "../lib/endpoints";
import { useCart } from "../features/cart/CartContext";
import type { OrderDto } from "../types";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/layout/Footer";
import StatusBadge from "../components/layout/StatusBadge";
import Breadcrumb from "../components/layout/BreadCrumb";
import Icon from "../components/ui/Icon";
import { IconCheck, IconCalendar, IconClock, IconNotes, IconStar } from "../components/ui/icons";
import { parseDateOnly, parseDateTime, format72hEstimate } from "../lib/dates";

// ─── Review Section ──────────────────────────────────────────────────────────

function StarPicker({ value, onChange }: { value: number; onChange: (n: number) => void }) {
  const [hover, setHover] = useState(0);
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(n => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          onMouseEnter={() => setHover(n)}
          onMouseLeave={() => setHover(0)}
          className="transition-transform active:scale-110"
        >
          <Icon
            icon={IconStar}
            size={22}
            className={n <= (hover || value) ? "text-amber-400" : "text-slate-200 dark:text-slate-600"}
          />
        </button>
      ))}
    </div>
  );
}

interface ProductReview { productId: number; rating: number; comment: string; submitted: boolean; }

function ReviewSection({ items }: { items: OrderDto["items"] }) {
  const { t } = useTranslation();
  const [reviews, setReviews] = useState<Record<number, ProductReview>>(() =>
    Object.fromEntries(items.map(i => [i.productId, { productId: i.productId, rating: 0, comment: "", submitted: false }]))
  );
  const [saving, setSaving] = useState<number | null>(null);

  const submit = async (productId: number) => {
    const r = reviews[productId];
    if (!r || r.rating === 0) return;
    setSaving(productId);
    try {
      await client.post(endpoints.reviews.create, { productId, rating: r.rating, comment: r.comment || null });
      setReviews(prev => ({ ...prev, [productId]: { ...prev[productId], submitted: true } }));
    } catch {
      alert(t("orderDetail.reviewError"));
    } finally {
      setSaving(null);
    }
  };

  return (
    <div className="card overflow-hidden">
      <div className="card-header">{t("orderDetail.reviewTitle")}</div>
      <div className="divide-y divide-slate-100 dark:divide-slate-700">
        {items.map(item => {
          const r = reviews[item.productId];
          return (
            <div key={item.productId} className="px-5 py-4">
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100 mb-2">{item.productName}</p>
              {r.submitted ? (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                  <Icon icon={IconCheck} size={13} /> {t("orderDetail.reviewThankYou")}
                </p>
              ) : (
                <div className="space-y-2">
                  <StarPicker value={r.rating} onChange={val => setReviews(prev => ({ ...prev, [item.productId]: { ...prev[item.productId], rating: val } }))} />
                  {r.rating > 0 && (
                    <>
                      <textarea
                        rows={2}
                        placeholder={t("orderDetail.reviewPlaceholder")}
                        value={r.comment}
                        onChange={e => setReviews(prev => ({ ...prev, [item.productId]: { ...prev[item.productId], comment: e.target.value } }))}
                        className="w-full text-xs border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400"
                      />
                      <button
                        onClick={() => submit(item.productId)}
                        disabled={saving === item.productId}
                        className="text-xs bg-emerald-700 hover:bg-emerald-600 text-white px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {saving === item.productId ? t("orderDetail.reviewSaving") : t("orderDetail.reviewSubmit")}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────

export default function OrderDetailPage() {
  const { id }    = useParams<{ id: string }>();
  const [order, setOrder]         = useState<OrderDto | null>(null);
  const [loading, setLoading]     = useState(true);
  const [cancelling, setCancelling] = useState(false);
  const [searchParams] = useSearchParams();
  const paymentFailed = searchParams.get("payment") === "failed";
  const orderConfirmed = searchParams.get("confirmed") === "true";
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "en" ? "en-GB" : "pt-PT";
  const { clearCart } = useCart();

  // Clearing the cart here (once the order is safely confirmed and its own page has
  // mounted) instead of on CheckoutPage avoids a race with CheckoutPage's own
  // "redirect to /cart when items is empty" effect while the route transition is in flight.
  useEffect(() => {
    if (orderConfirmed) clearCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderConfirmed]);

  // Timelines built here so labels react to language changes
  const statusLabel = (s: number) => t(`orderStatus.${s}`);
  const TIMELINE_UPFRONT = [0, 1, 2, 3, 4].map(s => ({ status: s, label: statusLabel(s) }));
  const TIMELINE_CASH    = [0, 2, 3, 4, 1].map(s => ({ status: s, label: statusLabel(s) }));

  useEffect(() => {
    client.get(endpoints.orders.getById(Number(id)))
      .then(res => setOrder(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  const handleCancel = async () => {
    if (!order || !confirm(t("orderDetail.cancelConfirm"))) return;
    setCancelling(true);
    try {
      await client.put(endpoints.orders.cancel(order.id));
      setOrder({ ...order, status: 5 });
    } finally { setCancelling(false); }
  };

  if (loading) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />
      <p className="text-center py-20 text-sm text-slate-400">{t("orderDetail.loading")}</p>
    </div>
  );

  if (!order) return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />
      <p className="text-center py-20 text-sm text-slate-400">{t("orderDetail.notFound")}</p>
    </div>
  );

  const isCash = Number(order.paymentMethod) === 0;
  const timeline = isCash ? TIMELINE_CASH : TIMELINE_UPFRONT;
  const currentPos = timeline.findIndex(t => t.status === order.status);

  // Matches the backend guard: Pending/Paid/Preparing can still be cancelled,
  // Shipped/Delivered/Cancelled cannot. Cash orders jump straight to Preparing
  // (skip Paid), so without status 2 here a cash order could never be self-cancelled.
  const canCancel = order.status === 0 || order.status === 1 || order.status === 2;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <div className="max-w-screen-md mx-auto px-4 sm:px-6 py-8">
        <Breadcrumb items={[
          { label: t("orderDetail.breadcrumbOrders"), path: "/orders" },
          { label: t("orderDetail.breadcrumbOrder", { id: order.id }) },
        ]} />

        {orderConfirmed && (
          <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 mb-5 dark:bg-emerald-900/20 dark:border-emerald-800">
            <div className="w-7 h-7 rounded-full bg-emerald-700 flex items-center justify-center flex-shrink-0">
              <Icon icon={IconCheck} size={14} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">{t("orderDetail.confirmedTitle")}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">{t("orderDetail.confirmedDesc")}</p>
            </div>
          </div>
        )}

        <div className="flex items-start justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-1">
              {t("orderDetail.title", { id: order.id })}
            </h1>
            <p className="text-xs text-slate-400">
              {parseDateTime(order.createdAt)?.toLocaleDateString(locale, {
                day: "numeric", month: "long", year: "numeric",
                hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
          <StatusBadge status={order.status} />
        </div>

        <div className="grid md:grid-cols-[1fr_240px] gap-5 items-start">
          <div className="space-y-4">

            {order.status !== 5 && (
              <div className="card overflow-hidden">
                <div className="card-header">{t("orderDetail.sectionStatus")}</div>
                <div className="px-5 py-5">
                  <div className="flex items-start gap-0">
                    {timeline.map((t, idx) => {
                      const stepPos = timeline.findIndex(x => x.status === t.status);
                      const done    = currentPos >= 0 && stepPos < currentPos;
                      const active  = stepPos === currentPos;
                      return (
                        <div key={t.status} className="flex items-start flex-1">
                          <div className="flex flex-col items-center flex-shrink-0">
                            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${
                              done   ? "bg-emerald-700 text-white" :
                              active ? "bg-emerald-700 text-white ring-2 ring-emerald-200 ring-offset-1" :
                                       "bg-slate-100 text-slate-400 dark:bg-slate-700 dark:text-slate-500"
                            }`}>
                              {done ? <Icon icon={IconCheck} size={12} /> : idx + 1}
                            </div>
                            <span className={`text-[10px] mt-1.5 font-medium text-center leading-tight max-w-[52px] ${
                              active ? "text-slate-900 dark:text-slate-100" : "text-slate-400"
                            }`}>
                              {t.label}
                            </span>
                          </div>
                          {idx < timeline.length - 1 && (
                            <div className={`flex-1 h-px mt-3.5 mx-1 ${done ? "bg-emerald-500" : "bg-slate-200"}`} />
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}

            <div className="card overflow-hidden">
              <div className="card-header">{t("orderDetail.sectionProducts")}</div>
              <div className="divide-y divide-slate-50 dark:divide-slate-700">
                {order.items.map(item => (
                  <div key={item.productId} className="flex justify-between items-center px-5 py-3.5">
                    <div>
                      <p className="text-sm font-medium text-slate-800 dark:text-slate-100">{item.productName}</p>
                      <p className="text-xs text-slate-400 tabular mt-0.5">
                        {item.unitType === 1 ? `${item.quantity.toFixed(1)} kg` : `${item.quantity} un`}
                        {" × "}{item.unitPrice.toFixed(2)}€
                      </p>
                    </div>
                    <span className="text-sm font-semibold text-slate-900 dark:text-slate-100 tabular">
                      {item.subtotal.toFixed(2)}€
                    </span>
                  </div>
                ))}
              </div>

              <div className="px-5 py-4 space-y-2 bg-slate-50 border-t border-slate-100 dark:bg-slate-800 dark:border-slate-700">
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{t("orderDetail.subtotal")}</span>
                  <span className="tabular">{(order.totalAmount - order.shippingFee).toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400">
                  <span>{t("orderDetail.shipping")}</span>
                  <span className="tabular">{order.shippingFee.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-slate-200 dark:border-slate-600">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100">{t("orderDetail.total")}</span>
                  <span className="text-sm font-bold text-emerald-700 tabular">{order.totalAmount.toFixed(2)}€</span>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-4 md:sticky md:top-20">
            <div className="card overflow-hidden">
              <div className="card-header">{t("orderDetail.sectionDelivery")}</div>
              <div className="px-5 py-4 space-y-2 text-sm text-slate-600 dark:text-slate-400">
                <p className="font-medium text-slate-800 dark:text-slate-100">{order.deliveryStreet}, {order.deliveryCity}</p>
                <p className="text-xs text-slate-400 font-mono">{order.deliveryPostalCode}</p>
                {order.deliverySlot && (
                  <>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Icon icon={IconCalendar} size={12} />
                      {parseDateOnly(order.deliverySlot.deliveryDate)?.toLocaleDateString(locale, {
                        weekday: "long", day: "numeric", month: "long",
                      })}
                    </p>
                    <p className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Icon icon={IconClock} size={12} />
                      {order.deliverySlot.startTime} – {order.deliverySlot.endTime}
                    </p>
                  </>
                )}
                {!order.deliverySlot && !order.preferredDeliveryDate && (
                  <div className="border-t border-slate-100 dark:border-slate-700 pt-2 mt-2">
                    <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2.5 py-2 flex items-start gap-1.5 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400">
                      <Icon icon={IconCalendar} size={12} className="mt-0.5 flex-shrink-0" />
                      <span dangerouslySetInnerHTML={{ __html: t("orderDetail.estimatedDelivery", { date: format72hEstimate() }) }} />
                    </p>
                  </div>
                )}
                {order.notes && (
                  <p className="text-xs text-slate-400 italic border-t border-slate-100 dark:border-slate-700 pt-2 mt-2 flex items-center gap-1.5">
                    <Icon icon={IconNotes} size={12} />
                    {order.notes}
                  </p>
                )}
              </div>
            </div>

            {order.paymentMethod != null && (
              <div className="card overflow-hidden">
                <div className="card-header">{t("orderDetail.sectionPayment")}</div>
                <div className="px-5 py-4">
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    {order.paymentMethod != null ? (t(`paymentMethod.${order.paymentMethod}`) ?? "—") : "—"}
                  </p>
                </div>
              </div>
            )}

            {paymentFailed && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg px-4 py-3 text-sm text-amber-700 dark:bg-amber-900/20 dark:border-amber-800 dark:text-amber-400">
                ⚠️ {t("orderDetail.paymentFailed")}
                <button onClick={() => navigate("/checkout")} className="ml-2 font-semibold underline">
                  {t("orderDetail.retryPayment")}
                </button>
              </div>
            )}

            {canCancel && (
              <button onClick={handleCancel} disabled={cancelling} data-testid="cancel-order"
                className="btn-danger w-full justify-center disabled:opacity-50">
                {cancelling ? t("orderDetail.cancelling") : t("orderDetail.cancelOrder")}
              </button>
            )}
          </div>
        </div>

        {order.status === 4 && order.items.length > 0 && (
          <div className="mt-5">
            <ReviewSection items={order.items} />
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
