import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/layout/Navbar";
import StatusBadge from "../components/layout/StatusBadge";
import { useAuth } from "../features/auth/useAuth";
import client from "../api/client";
import { endpoints } from "../lib/endpoints";
import { parseDateTime, parseDateOnly } from "../lib/dates";
import type { OrderSummaryDto } from "../types";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AddressDto {
  id: number;
  label: string;
  street: string;
  postalCode: string;
  city: string;
  country: string;
  isDefault: boolean;
}

type Tab = "profile" | "addresses" | "orders";

// ─── Sub-components ───────────────────────────────────────────────────────────

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card overflow-hidden">
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50">
        <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      </div>
      <div className="px-5 py-5">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-xs font-semibold text-slate-500 mb-1">{label}</label>
      {children}
    </div>
  );
}

const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent";
const inputReadCls = "w-full border border-slate-100 rounded-lg px-3 py-2 text-sm text-slate-400 bg-slate-50 cursor-not-allowed";

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab() {
  const { user, updateUser } = useAuth();

  const [fullName, setFullName]     = useState(user?.fullName ?? "");
  const [phone, setPhone]           = useState(user?.phone ?? "");
  const [currentPw, setCurrentPw]   = useState("");
  const [newPw, setNewPw]           = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [saving, setSaving]         = useState(false);
  const [savingPw, setSavingPw]     = useState(false);
  const [msg, setMsg]               = useState<{ ok: boolean; text: string } | null>(null);
  const [pwMsg, setPwMsg]           = useState<{ ok: boolean; text: string } | null>(null);

  const saveProfile = async () => {
    setSaving(true);
    setMsg(null);
    try {
      const res = await client.put(endpoints.users.me, { fullName, phone: phone || null, newPassword: null });
      updateUser({ fullName: res.data.fullName, phone: res.data.phone });
      setMsg({ ok: true, text: "Perfil atualizado com sucesso." });
    } catch {
      setMsg({ ok: false, text: "Erro ao atualizar o perfil." });
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    if (!newPw || newPw !== confirmPw) {
      setPwMsg({ ok: false, text: "As palavras-passe não coincidem." });
      return;
    }
    if (newPw.length < 6) {
      setPwMsg({ ok: false, text: "A palavra-passe deve ter pelo menos 6 caracteres." });
      return;
    }
    setSavingPw(true);
    setPwMsg(null);
    try {
      await client.put(endpoints.users.me, {
        fullName: user?.fullName,
        phone: user?.phone ?? null,
        newPassword: newPw,
      });
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      setPwMsg({ ok: true, text: "Palavra-passe alterada com sucesso." });
    } catch {
      setPwMsg({ ok: false, text: "Erro ao alterar a palavra-passe." });
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="space-y-5">
      <SectionCard title="Informação pessoal">
        <div className="space-y-4">
          <Field label="Nome completo">
            <input className={inputCls} value={fullName} onChange={e => setFullName(e.target.value)} />
          </Field>
          <Field label="Email">
            <input className={inputReadCls} value={user?.email ?? ""} readOnly />
          </Field>
          <Field label="Telefone">
            <input className={inputCls} value={phone} onChange={e => setPhone(e.target.value)} placeholder="+351 9xx xxx xxx" />
          </Field>

          {msg && (
            <p className={`text-xs font-medium ${msg.ok ? "text-emerald-600" : "text-red-500"}`}>{msg.text}</p>
          )}

          <button
            onClick={saveProfile}
            disabled={saving}
            className="btn-primary bg-emerald-700 disabled:opacity-50"
          >
            {saving ? "A guardar..." : "Guardar alterações"}
          </button>
        </div>
      </SectionCard>

      <SectionCard title="Alterar palavra-passe">
        <div className="space-y-4">
          <Field label="Nova palavra-passe">
            <input className={inputCls} type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="Mínimo 6 caracteres" />
          </Field>
          <Field label="Confirmar nova palavra-passe">
            <input className={inputCls} type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
          </Field>

          {pwMsg && (
            <p className={`text-xs font-medium ${pwMsg.ok ? "text-emerald-600" : "text-red-500"}`}>{pwMsg.text}</p>
          )}

          <button
            onClick={savePassword}
            disabled={savingPw}
            className="btn-primary bg-emerald-700 disabled:opacity-50"
          >
            {savingPw ? "A alterar..." : "Alterar palavra-passe"}
          </button>
        </div>
      </SectionCard>
    </div>
  );
}

// ─── Addresses Tab ────────────────────────────────────────────────────────────

const EMPTY_FORM = { label: "", street: "", postalCode: "", city: "", country: "PT", isDefault: false };

function AddressesTab() {
  const { user } = useAuth();
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState<AddressDto | null>(null);
  const [adding, setAdding]       = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]       = useState(false);
  const [deleting, setDeleting]   = useState<number | null>(null);

  const load = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await client.get(endpoints.addresses.byUser(user.id));
      setAddresses(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [user?.id]);

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setEditing(null);
    setAdding(true);
  };

  const openEdit = (a: AddressDto) => {
    setForm({ label: a.label, street: a.street, postalCode: a.postalCode, city: a.city, country: a.country, isDefault: a.isDefault });
    setEditing(a);
    setAdding(true);
  };

  const closeForm = () => { setAdding(false); setEditing(null); };

  const save = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const payload = { request: { ...form, userId: user.id } };
      if (editing) {
        await client.put(endpoints.addresses.update(editing.id), payload);
      } else {
        await client.post(endpoints.addresses.create, payload);
      }
      closeForm();
      await load();
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: number) => {
    if (!confirm("Remover esta morada?")) return;
    setDeleting(id);
    try {
      await client.delete(endpoints.addresses.delete(id));
      setAddresses(prev => prev.filter(a => a.id !== id));
    } finally {
      setDeleting(null);
    }
  };

  const setDefault = async (id: number) => {
    if (!user) return;
    await client.put(endpoints.addresses.setDefault(id), {}, { params: { userId: user.id } });
    await load();
  };

  if (loading) return <p className="text-sm text-slate-400 py-8 text-center">A carregar moradas...</p>;

  return (
    <div className="space-y-4">
      {!adding && (
        <div className="flex justify-end">
          <button onClick={openAdd} className="btn-primary bg-emerald-700 text-sm">+ Nova morada</button>
        </div>
      )}

      {adding && (
        <SectionCard title={editing ? "Editar morada" : "Nova morada"}>
          <div className="space-y-3">
            <Field label="Etiqueta (ex: Casa, Trabalho)">
              <input className={inputCls} value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Casa" />
            </Field>
            <Field label="Rua / Morada">
              <input className={inputCls} value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} placeholder="Rua das Flores, 12" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Código postal">
                <input className={inputCls} value={form.postalCode} onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))} placeholder="3750-000" />
              </Field>
              <Field label="Cidade">
                <input className={inputCls} value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Aveiro" />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
              <input type="checkbox" checked={form.isDefault} onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))} className="rounded" />
              Definir como morada predefinida
            </label>
            <div className="flex gap-2 pt-1">
              <button onClick={save} disabled={saving} className="btn-primary bg-emerald-700 disabled:opacity-50">
                {saving ? "A guardar..." : "Guardar"}
              </button>
              <button onClick={closeForm} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </SectionCard>
      )}

      {addresses.length === 0 && !adding ? (
        <div className="card py-14 text-center">
          <p className="text-sm text-slate-400">Ainda não tens moradas guardadas.</p>
          <button onClick={openAdd} className="mt-4 btn-primary bg-emerald-700 text-sm">Adicionar morada</button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map(a => (
            <div key={a.id} className={`card p-4 flex items-start justify-between gap-4 ${a.isDefault ? "ring-1 ring-emerald-500" : ""}`}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-slate-800">{a.label || "Sem etiqueta"}</p>
                  {a.isDefault && <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">Predefinida</span>}
                </div>
                <p className="text-xs text-slate-500">{a.street}</p>
                <p className="text-xs text-slate-500">{a.postalCode} {a.city} · {a.country}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0">
                {!a.isDefault && (
                  <button onClick={() => setDefault(a.id)} className="text-xs text-slate-400 hover:text-emerald-700 transition-colors">
                    Predefinir
                  </button>
                )}
                <button onClick={() => openEdit(a)} className="text-xs text-blue-500 hover:text-blue-700 transition-colors">Editar</button>
                <button
                  onClick={() => remove(a.id)}
                  disabled={deleting === a.id}
                  className="text-xs text-red-400 hover:text-red-600 transition-colors disabled:opacity-50"
                >
                  {deleting === a.id ? "..." : "Remover"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Orders Tab ───────────────────────────────────────────────────────────────

function OrdersTab() {
  const [orders, setOrders] = useState<OrderSummaryDto[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    client.get(endpoints.orders.my)
      .then(res => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-slate-400 py-8 text-center">A carregar encomendas...</p>;

  if (orders.length === 0) return (
    <div className="card py-14 text-center">
      <p className="text-sm text-slate-400">Ainda não fizeste nenhuma encomenda.</p>
      <button onClick={() => navigate("/")} className="mt-4 btn-primary bg-emerald-700 text-sm">Ir para a loja</button>
    </div>
  );

  return (
    <div className="card overflow-hidden">
      <div className="grid grid-cols-[56px_1fr_88px_100px_72px] gap-3 px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide bg-slate-50 border-b border-slate-100">
        <span>#</span>
        <span>Data</span>
        <span className="text-right">Total</span>
        <span>Estado</span>
        <span className="text-right">Entrega</span>
      </div>
      <div className="divide-y divide-slate-50">
        {orders.map(o => (
          <button
            key={o.id}
            onClick={() => navigate(`/orders/${o.id}`)}
            className="w-full grid grid-cols-[56px_1fr_88px_100px_72px] gap-3 items-center px-5 py-3.5 text-left hover:bg-slate-50 transition-colors"
          >
            <span className="text-xs font-mono text-slate-400">#{o.id}</span>
            <div>
              <p className="text-sm font-medium text-slate-800">
                {parseDateTime(o.createdAt)?.toLocaleString("pt-PT", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{o.itemCount} {o.itemCount === 1 ? "produto" : "produtos"}</p>
            </div>
            <span className="text-sm font-bold text-emerald-700 text-right tabular">{o.totalAmount.toFixed(2)}€</span>
            <StatusBadge status={o.status} />
            <span className="text-xs text-slate-400 text-right tabular">
              {o.deliverySlot?.deliveryDate
                ? parseDateOnly(o.deliverySlot.deliveryDate)?.toLocaleDateString("pt-PT", { day: "numeric", month: "short" })
                : o.preferredDeliveryDate
                ? parseDateOnly(o.preferredDeliveryDate)?.toLocaleDateString("pt-PT", { day: "numeric", month: "short" })
                : "—"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

const TABS: { key: Tab; label: string }[] = [
  { key: "profile",   label: "Perfil"     },
  { key: "addresses", label: "Moradas"    },
  { key: "orders",    label: "Encomendas" },
];

export default function AccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("profile");

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-screen-md mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">A minha conta</h1>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
          </div>
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors border border-red-100 hover:border-red-200 px-3 py-1.5 rounded-lg"
          >
            Terminar sessão
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 border-b border-slate-200 mb-6">
          {TABS.map(t => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t.key
                  ? "border-emerald-700 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-700"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Content */}
        {tab === "profile"   && <ProfileTab key={`${user?.fullName}-${user?.phone}`} />}
        {tab === "addresses" && <AddressesTab />}
        {tab === "orders"    && <OrdersTab />}
      </div>
    </div>
  );
}
