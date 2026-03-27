import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import { endpoints } from "../lib/endpoints";
import { useCart } from "../features/cart/CartContext";
import PaymentSelector from "../features/payments/PaymentSelector";
import { PaymentMethod } from "../types/payment";
import Navbar from "../components/layout/Navbar";
import Breadcrumb from "../components/layout/BreadCrumb";
import Icon from "../components/ui/Icon";
import { IconCheck, IconArrowLeft, IconArrowRight, IconCalendar, IconNotes, IconAlertTriangle } from "../components/ui/icons";

type Step = "address" | "payment";

const STEPS = [
  { key: "address" as Step, label: "Morada" },
  { key: "payment" as Step, label: "Pagamento" },
];

function StepIndicator({ current }: { current: Step }) {
  const idx = STEPS.findIndex(s => s.key === current);
  return (
    <div className="flex items-center gap-2 mb-7">
      {STEPS.map((s, i) => {
        const done   = i < idx;
        const active = i === idx;
        return (
          <div key={s.key} className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold transition-colors ${
                done   ? "bg-emerald-700 text-white" :
                active ? "bg-emerald-700 text-white ring-2 ring-emerald-200" :
                         "bg-slate-200 text-slate-400"
              }`}>
                {done ? <Icon icon={IconCheck} size={10} /> : i + 1}
              </div>
              <span className={`text-xs font-medium ${active ? "text-slate-900" : "text-slate-400"}`}>
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div className={`w-10 h-px ${done ? "bg-emerald-400" : "bg-slate-200"}`} />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function CheckoutPage() {
  const { items, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();

  const [step, setStep]   = useState<Step>("address");
  const [form, setForm]   = useState({ deliveryAddress: "", deliveryPostalCode: "", preferredDate: "", notes: "" });
  const [addressError, setAddressError] = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [orderError, setOrderError]     = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.Card);

  useEffect(() => { if (items.length === 0) navigate("/cart"); }, [items, navigate]);

  const validateAddress = () => {
    setAddressError("");
    if (!form.deliveryAddress.trim()) { setAddressError("Insere a morada."); return; }
    if (!/^\d{4}-\d{3}$/.test(form.deliveryPostalCode)) {
      setAddressError("Código postal inválido (ex: 3750-123)");
      return;
    }
    setStep("payment");
  };

  const getCityFromPostal = (p: string) => {
    const n = parseInt(p.slice(0, 4));
    if (n >= 3000 && n <= 3999) return "Coimbra";
    if (n >= 4000 && n <= 4999) return "Porto";
    if (n >= 1000 && n <= 1999) return "Lisboa";
    return "Portugal";
  };

  const handlePlaceOrder = async () => {
    setSubmitting(true); setOrderError("");
    try {
      const orderRes = await client.post(endpoints.orders.place, {
        deliveryStreet: form.deliveryAddress,
        deliveryPostalCode: form.deliveryPostalCode,
        deliveryCity: getCityFromPostal(form.deliveryPostalCode),
        deliveryCountry: "PT",
        preferredDeliveryDate: form.preferredDate || undefined,
        notes: form.notes || undefined,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      });
      const order = orderRes.data;
      const payRes = await client.post(endpoints.payments.create, { orderId: order.id, method: paymentMethod });
      clearCart();
      if (payRes.data.redirectUrl) { window.location.href = payRes.data.redirectUrl; return; }
      navigate(`/orders/${order.id}`);
    } catch {
      setOrderError("Erro ao finalizar encomenda. Por favor tenta novamente.");
    } finally { setSubmitting(false); }
  };

  const shippingFee = 2.50;
  const total = totalAmount + shippingFee;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-screen-md mx-auto px-4 sm:px-6 py-8">
        <Breadcrumb items={[
          { label: "Loja", path: "/" },
          { label: "Carrinho", path: "/cart" },
          { label: "Checkout" },
        ]} />

        <StepIndicator current={step} />

        <div className="grid md:grid-cols-[1fr_260px] gap-6 items-start">
          <div className="space-y-4">
            {step === "address" && (
              <div className="card overflow-hidden">
                <div className="card-header">Morada de entrega</div>
                <div className="p-5 space-y-4">
                  <div>
                    <label className="label">Morada</label>
                    <input className="input" placeholder="Rua, número, andar..."
                      value={form.deliveryAddress}
                      onChange={e => setForm({ ...form, deliveryAddress: e.target.value })} />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="label">Código Postal</label>
                      <input className="input font-mono" placeholder="3750-123" maxLength={8}
                        value={form.deliveryPostalCode}
                        onChange={e => setForm({ ...form, deliveryPostalCode: e.target.value })} />
                    </div>
                    <div>
                      <label className="label">
                        Data preferida
                        <span className="ml-1 normal-case tracking-normal font-normal text-slate-400">— opcional</span>
                      </label>
                      <input type="date" className="input"
                        min={new Date().toISOString().split("T")[0]}
                        value={form.preferredDate}
                        onChange={e => setForm({ ...form, preferredDate: e.target.value })} />
                    </div>
                  </div>

                  <div>
                    <label className="label">
                      Notas
                      <span className="ml-1 normal-case tracking-normal font-normal text-slate-400">— opcional</span>
                    </label>
                    <textarea className="input resize-none" rows={2}
                      placeholder="Ex: deixar na portaria, campainha avariada..."
                      value={form.notes}
                      onChange={e => setForm({ ...form, notes: e.target.value })} />
                  </div>

                  {addressError && (
                    <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                      {addressError}
                    </p>
                  )}

                  <div className="flex justify-end gap-2 pt-1">
                    <button onClick={() => navigate("/cart")} className="btn-secondary flex items-center gap-1.5">
                      <Icon icon={IconArrowLeft} size={14} /> Voltar
                    </button>
                    <button onClick={validateAddress} className="btn-primary bg-emerald-700 flex items-center gap-1.5">
                      Continuar <Icon icon={IconArrowRight} size={14} />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {step === "payment" && (
              <>
                <div className="card overflow-hidden">
                  <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Entrega</span>
                    <button onClick={() => setStep("address")}
                      className="text-xs text-emerald-700 hover:text-emerald-900 font-medium transition-colors">
                      Editar
                    </button>
                  </div>
                  <div className="px-5 py-4 text-sm text-slate-600 space-y-1">
                    <p className="font-medium text-slate-800">{form.deliveryAddress}</p>
                    <p className="text-xs text-slate-400 font-mono">{form.deliveryPostalCode} · {getCityFromPostal(form.deliveryPostalCode)}</p>
                    {form.preferredDate && (
                      <p className="text-xs text-emerald-700 mt-1 flex items-center gap-1.5">
                        <Icon icon={IconCalendar} size={12} />
                        Data preferida: {new Date(form.preferredDate).toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" })}
                      </p>
                    )}
                    {form.notes && (
                      <p className="text-xs text-slate-400 italic mt-1 flex items-center gap-1.5">
                        <Icon icon={IconNotes} size={12} />
                        {form.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div className="card overflow-hidden">
                  <div className="card-header">Método de Pagamento</div>
                  <div className="p-5">
                    <PaymentSelector value={paymentMethod} onChange={setPaymentMethod} />
                  </div>
                </div>

                {orderError && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 flex items-center gap-2">
                    <Icon icon={IconAlertTriangle} size={14} />
                    {orderError}
                  </p>
                )}

                <div className="flex gap-2">
                  <button onClick={() => setStep("address")} className="btn-secondary flex-1 justify-center flex items-center gap-1.5">
                    <Icon icon={IconArrowLeft} size={14} /> Voltar
                  </button>
                  <button onClick={handlePlaceOrder} disabled={submitting}
                    className="btn-primary flex-[2] justify-center bg-amber-500 hover:bg-amber-400 font-bold disabled:opacity-50">
                    {submitting ? "A processar..." : `Pagar ${total.toFixed(2)}€`}
                  </button>
                </div>
              </>
            )}
          </div>

          <div className="card overflow-hidden md:sticky md:top-20">
            <div className="card-header">
              Resumo · <span className="tabular">{items.length} {items.length === 1 ? "produto" : "produtos"}</span>
            </div>
            <div className="divide-y divide-slate-50">
              {items.map(item => (
                <div key={item.productId} className="flex justify-between gap-2 px-4 py-2.5">
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-slate-800 truncate">{item.name}</p>
                    <p className="text-xs text-slate-400 tabular mt-0.5">
                      {item.unitType === 1 ? `${item.quantity.toFixed(1)} kg` : `${item.quantity} un`}
                    </p>
                  </div>
                  <span className="text-xs font-semibold text-slate-800 tabular flex-shrink-0">
                    {item.subtotal.toFixed(2)}€
                  </span>
                </div>
              ))}
            </div>
            <div className="px-4 py-4 space-y-2 border-t border-slate-100">
              <div className="flex justify-between text-xs text-slate-500">
                <span>Subtotal</span>
                <span className="tabular">{totalAmount.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between text-xs text-slate-500">
                <span>Envio</span>
                <span className="tabular">{shippingFee.toFixed(2)}€</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-slate-100">
                <span className="text-sm font-bold text-slate-900">Total</span>
                <span className="text-sm font-bold text-emerald-700 tabular">{total.toFixed(2)}€</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
