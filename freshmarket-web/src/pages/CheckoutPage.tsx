import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import { endpoints } from "../lib/endpoints";
import { useCart } from "../features/cart/CartContext";
import { useAuth } from "../features/auth/useAuth";
import PaymentSelector from "../features/payments/PaymentSelector";
import { PaymentMethod } from "../types/payment";
import Navbar from "../components/layout/Navbar";
import Breadcrumb from "../components/layout/BreadCrumb";
import Icon from "../components/ui/Icon";
import { IconCheck, IconArrowLeft, IconArrowRight, IconCalendar, IconNotes, IconAlertTriangle, IconX, IconClock } from "../components/ui/icons";
import { parseDateOnly, format72hEstimate } from "../lib/dates";

interface SavedAddress {
  id: number;
  label: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  isDefault: boolean;
}

interface AvailableSlot {
  id: number;
  deliveryDate: string;
  startTime: string;
  endTime: string;
  availableSpots: number;
  shippingFee?: number;
}

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
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep]   = useState<Step>("address");
  const [form, setForm]   = useState({ deliveryAddress: "", deliveryPostalCode: "", preferredDate: "", notes: "" });
  const [addressError, setAddressError] = useState("");
  const [submitting, setSubmitting]     = useState(false);
  const [orderError, setOrderError]     = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(PaymentMethod.Card);
  const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<number | null>(null);

  // Delivery slots
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>([]);
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [loadingSlots, setLoadingSlots]     = useState(false);

  useEffect(() => { if (items.length === 0) navigate("/cart"); }, [items, navigate]);

  useEffect(() => {
    if (!user) return;
    client.get(endpoints.addresses.byUser(user.id)).then(res => {
      const addrs: SavedAddress[] = res.data;
      setSavedAddresses(addrs);
      const def = addrs.find(a => a.isDefault) ?? addrs[0];
      if (def) applyAddress(def);
    }).catch(() => {});
  }, [user?.id]);

  // Fetch slots when postal code + date are ready
  useEffect(() => {
    const postal = form.deliveryPostalCode;
    const date = form.preferredDate;
    if (!date || !/^\d{4}-\d{3}$/.test(postal)) {
      setAvailableSlots([]);
      setSelectedSlotId(null);
      return;
    }
    const prefix = postal.slice(0, 4);
    setLoadingSlots(true);
    setSelectedSlotId(null);
    client.get(endpoints.deliverySlots.available, { params: { date, postalCodePrefix: prefix } })
      .then(res => setAvailableSlots(Array.isArray(res.data) ? res.data : []))
      .catch(() => setAvailableSlots([]))
      .finally(() => setLoadingSlots(false));
  }, [form.preferredDate, form.deliveryPostalCode]);

  const applyAddress = (a: SavedAddress) => {
    setForm(f => ({ ...f, deliveryAddress: a.street, deliveryPostalCode: a.postalCode }));
    setSelectedAddressId(a.id);
  };

  const validateAddress = () => {
    setAddressError("");
    if (!form.deliveryAddress.trim()) { setAddressError("Insere a morada."); return; }
    if (!form.deliveryPostalCode.trim()) { setAddressError("Insere o código postal."); return; }
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

  const selectedSlot = availableSlots.find(s => s.id === selectedSlotId);
  const shippingFee = selectedSlot?.shippingFee ?? 2.50;
  const total = totalAmount + shippingFee;

  const handlePlaceOrder = async () => {
    setSubmitting(true); setOrderError("");
    try {
      const selectedAddr = savedAddresses.find(a => a.id === selectedAddressId);
      const deliveryCity = selectedAddr?.city || getCityFromPostal(form.deliveryPostalCode);
      const deliveryCountry = selectedAddr?.country || "PT";
      const orderRes = await client.post(endpoints.orders.place, {
        deliveryStreet: form.deliveryAddress,
        deliveryPostalCode: form.deliveryPostalCode,
        deliveryCity,
        deliveryCountry,
        preferredDeliveryDate: form.preferredDate || undefined,
        deliverySlotId: selectedSlotId || undefined,
        notes: form.notes || undefined,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity })),
      });
      const order = orderRes.data;
      const payRes = await client.post(endpoints.payments.create, { orderId: order.id, method: paymentMethod });
      clearCart();
      if (payRes.data.redirectUrl) { window.location.href = payRes.data.redirectUrl; return; }
      navigate(`/orders/${order.id}?confirmed=true`);
    } catch {
      setOrderError("Erro ao finalizar encomenda. Por favor tenta novamente.");
    } finally { setSubmitting(false); }
  };

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

                  {savedAddresses.length > 0 && (
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wide mb-2">As tuas moradas guardadas</p>
                      <div className="space-y-2">
                        {savedAddresses.map(a => (
                          <button
                            key={a.id}
                            type="button"
                            onClick={() => applyAddress(a)}
                            className={`w-full text-left px-3.5 py-3 rounded-lg border text-sm transition-colors ${
                              selectedAddressId === a.id
                                ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                                : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium">{a.label || a.street}</span>
                              {a.isDefault && <span className="text-[10px] font-bold uppercase text-emerald-600 bg-emerald-100 px-1.5 py-0.5 rounded">Predefinida</span>}
                            </div>
                            <p className="text-xs text-slate-400 mt-0.5">{a.street} · {a.postalCode} {a.city}</p>
                          </button>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 my-4">
                        <div className="flex-1 h-px bg-slate-100" />
                        <span className="text-xs text-slate-400">ou introduz manualmente</span>
                        <div className="flex-1 h-px bg-slate-100" />
                      </div>
                    </div>
                  )}

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

                  {/* Delivery slot picker */}
                  {loadingSlots && (
                    <p className="text-xs text-slate-400 flex items-center gap-1.5">
                      <Icon icon={IconClock} size={12} /> A carregar horários disponíveis...
                    </p>
                  )}
                  {!loadingSlots && availableSlots.length > 0 && (
                    <div>
                      <label className="label">Horário de entrega</label>
                      <div className="space-y-2">
                        {availableSlots.map(s => (
                          <button
                            key={s.id}
                            type="button"
                            onClick={() => setSelectedSlotId(s.id)}
                            className={`w-full text-left px-3.5 py-3 rounded-lg border text-sm transition-colors ${
                              selectedSlotId === s.id
                                ? "border-emerald-500 bg-emerald-50 text-emerald-900"
                                : "border-slate-200 hover:border-emerald-300 hover:bg-slate-50 text-slate-700"
                            }`}
                          >
                            <div className="flex items-center justify-between gap-2">
                              <span className="font-medium">
                                {parseDateOnly(s.deliveryDate)?.toLocaleDateString("pt-PT", { weekday: "short", day: "numeric", month: "short" })}
                                {" · "}{s.startTime}–{s.endTime}
                              </span>
                              {s.shippingFee !== undefined && (
                                <span className="font-semibold text-emerald-700">{s.shippingFee.toFixed(2)}€ envio</span>
                              )}
                            </div>
                            {s.availableSpots !== undefined && (
                              <p className="text-xs text-slate-400 mt-0.5">{s.availableSpots} vagas disponíveis</p>
                            )}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  {!loadingSlots && form.preferredDate && /^\d{4}-\d{3}$/.test(form.deliveryPostalCode) && availableSlots.length === 0 && (
                    <p className="text-xs text-slate-400 bg-slate-50 border border-slate-100 rounded-lg px-3 py-2">
                      Sem horários disponíveis para esta data. Escolhe outra data ou prossegue sem horário específico.
                    </p>
                  )}

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
                    {selectedSlot && (
                      <p className="text-xs text-emerald-700 mt-1 flex items-center gap-1.5">
                        <Icon icon={IconCalendar} size={12} />
                        {parseDateOnly(selectedSlot.deliveryDate)?.toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" })}
                        {" · "}{selectedSlot.startTime}–{selectedSlot.endTime}
                      </p>
                    )}
                    {!selectedSlot && form.preferredDate && (
                      <p className="text-xs text-emerald-700 mt-1 flex items-center gap-1.5">
                        <Icon icon={IconCalendar} size={12} />
                        Data preferida: {parseDateOnly(form.preferredDate)?.toLocaleDateString("pt-PT", { weekday: "long", day: "numeric", month: "long" })}
                      </p>
                    )}
                    {!selectedSlot && !form.preferredDate && (
                      <div className="mt-2 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2 text-xs text-amber-700 flex items-start gap-1.5">
                        <Icon icon={IconCalendar} size={12} className="mt-0.5 flex-shrink-0" />
                        <span>
                          Sem data de entrega escolhida. Estimamos a entrega até <strong>{format72hEstimate()}</strong> (72h úteis).
                        </span>
                      </div>
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
                  <div className="flex items-start gap-3 bg-red-50 border border-red-100 rounded-xl px-4 py-3">
                    <Icon icon={IconAlertTriangle} size={16} className="text-red-500 mt-0.5 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-red-700">Não foi possível concluir</p>
                      <p className="text-xs text-red-500 mt-0.5">{orderError}</p>
                    </div>
                    <button
                      onClick={() => setOrderError("")}
                      className="text-red-300 hover:text-red-500 transition-colors flex-shrink-0"
                    >
                      <Icon icon={IconX} size={14} />
                    </button>
                  </div>
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
                <span>Envio{selectedSlot && <span className="ml-1 text-slate-400">({selectedSlot.startTime}–{selectedSlot.endTime})</span>}</span>
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
