import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Navbar from "../components/layout/Navbar";
import StatusBadge from "../components/layout/StatusBadge";
import { useAuth } from "../features/auth/useAuth";
import client from "../api/client";
import { endpoints } from "../lib/endpoints";
import { parseDateTime, parseDateOnly } from "../lib/dates";
import type { OrderSummaryDto } from "../types";
import Icon from "../components/ui/Icon";
import { IconEye, IconEyeOff } from "../components/ui/icons";

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
      <div className="px-5 py-3.5 border-b border-slate-100 bg-slate-50 dark:bg-slate-800 dark:border-slate-700">
        <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-300">{title}</h2>
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

const inputCls = "w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent dark:bg-slate-800 dark:border-slate-600 dark:text-slate-100 dark:placeholder-slate-500";
const inputReadCls = "w-full border border-slate-100 rounded-lg px-3 py-2 text-sm text-slate-400 bg-slate-50 cursor-not-allowed dark:bg-slate-700 dark:border-slate-700 dark:text-slate-500";

// ─── Profile Tab ──────────────────────────────────────────────────────────────

function ProfileTab() {
  const { user, updateUser } = useAuth();
  const { t } = useTranslation();

  const [fullName, setFullName]     = useState(user?.fullName ?? "");
  const [phone, setPhone]           = useState(user?.phone ?? "");
  const [newPw, setNewPw]           = useState("");
  const [confirmPw, setConfirmPw]   = useState("");
  const [showNewPw, setShowNewPw]       = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
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
      setMsg({ ok: true, text: t("account.profileSaved") });
    } catch {
      setMsg({ ok: false, text: t("account.profileError") });
    } finally {
      setSaving(false);
    }
  };

  const savePassword = async () => {
    if (!newPw || newPw !== confirmPw) {
      setPwMsg({ ok: false, text: t("account.passwordMismatch") });
      return;
    }
    if (newPw.length < 6) {
      setPwMsg({ ok: false, text: t("account.passwordShort") });
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
      setNewPw(""); setConfirmPw("");
      setPwMsg({ ok: true, text: t("account.passwordChanged") });
    } catch {
      setPwMsg({ ok: false, text: t("account.passwordError") });
    } finally {
      setSavingPw(false);
    }
  };

  return (
    <div className="space-y-5">
      <SectionCard title={t("account.personalInfo")}>
        <div className="space-y-4">
          <Field label={t("account.fullName")}>
            <input className={inputCls} value={fullName} onChange={e => setFullName(e.target.value)} />
          </Field>
          <Field label={t("account.email")}>
            <input className={inputReadCls} value={user?.email ?? ""} readOnly />
          </Field>
          <Field label={t("account.phone")}>
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
            {saving ? t("account.saving") : t("account.saveChanges")}
          </button>
        </div>
      </SectionCard>

      <SectionCard title={t("account.changePassword")}>
        <div className="space-y-4">
          <Field label={t("account.newPassword")}>
            <div className="relative">
              <input className={inputCls + " pr-10"} type={showNewPw ? "text" : "password"}
                value={newPw} onChange={e => setNewPw(e.target.value)} placeholder={t("account.passwordMin")} />
              <button type="button" onClick={() => setShowNewPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                <Icon icon={showNewPw ? IconEyeOff : IconEye} size={15} />
              </button>
            </div>
          </Field>
          <Field label={t("account.confirmPassword")}>
            <div className="relative">
              <input className={inputCls + " pr-10"} type={showConfirmPw ? "text" : "password"}
                value={confirmPw} onChange={e => setConfirmPw(e.target.value)} />
              <button type="button" onClick={() => setShowConfirmPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors">
                <Icon icon={showConfirmPw ? IconEyeOff : IconEye} size={15} />
              </button>
            </div>
          </Field>

          {pwMsg && (
            <p className={`text-xs font-medium ${pwMsg.ok ? "text-emerald-600" : "text-red-500"}`}>{pwMsg.text}</p>
          )}

          <button
            onClick={savePassword}
            disabled={savingPw}
            className="btn-primary bg-emerald-700 disabled:opacity-50"
          >
            {savingPw ? t("account.changing") : t("account.changePasswordBtn")}
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
  const { t } = useTranslation();
  const [addresses, setAddresses] = useState<AddressDto[]>([]);
  const [loading, setLoading]     = useState(true);
  const [editing, setEditing]     = useState<AddressDto | null>(null);
  const [adding, setAdding]       = useState(false);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [saving, setSaving]         = useState(false);
  const [deleting, setDeleting]     = useState<number | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null);

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
    setDeleting(id);
    setConfirmDelete(null);
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

  if (loading) return <p className="text-sm text-slate-400 py-8 text-center">{t("account.loadingAddresses")}</p>;

  return (
    <div className="space-y-4">
      {!adding && (
        <div className="flex justify-end">
          <button onClick={openAdd} className="btn-primary bg-emerald-700 text-sm">{t("account.newAddress")}</button>
        </div>
      )}

      {adding && (
        <SectionCard title={editing ? t("account.editAddress") : t("account.addAddressTitle")}>
          <div className="space-y-3">
            <Field label={t("account.addressLabel")}>
              <input className={inputCls} value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} placeholder="Casa" />
            </Field>
            <Field label={t("account.street")}>
              <input className={inputCls} value={form.street} onChange={e => setForm(f => ({ ...f, street: e.target.value }))} placeholder="Rua das Flores, 12" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label={t("account.postalCode")}>
                <input className={inputCls} value={form.postalCode} onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))} placeholder="3750-000" />
              </Field>
              <Field label={t("account.city")}>
                <input className={inputCls} value={form.city} onChange={e => setForm(f => ({ ...f, city: e.target.value }))} placeholder="Aveiro" />
              </Field>
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-300 cursor-pointer">
              <input type="checkbox" checked={form.isDefault} onChange={e => setForm(f => ({ ...f, isDefault: e.target.checked }))} className="rounded" />
              {t("account.setDefault")}
            </label>
            <div className="flex gap-2 pt-1">
              <button onClick={save} disabled={saving} className="btn-primary bg-emerald-700 disabled:opacity-50">
                {saving ? t("account.saving") : t("account.save")}
              </button>
              <button onClick={closeForm} className="px-4 py-2 text-sm text-slate-600 hover:text-slate-800 border border-slate-200 rounded-lg transition-colors dark:text-slate-400 dark:border-slate-600 dark:hover:text-slate-200">
                {t("account.cancel")}
              </button>
            </div>
          </div>
        </SectionCard>
      )}

      {addresses.length === 0 && !adding ? (
        <div className="card py-14 text-center">
          <p className="text-sm text-slate-400">{t("account.noAddresses")}</p>
          <button onClick={openAdd} className="mt-4 btn-primary bg-emerald-700 text-sm">{t("account.addAddressBtn")}</button>
        </div>
      ) : (
        <div className="space-y-3">
          {addresses.map(a => (
            <div key={a.id} className={`card p-4 flex items-start justify-between gap-4 dark:border-slate-700 ${a.isDefault ? "ring-1 ring-emerald-500" : ""}`}>
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">{a.label || t("account.noLabel")}</p>
                  {a.isDefault && <span className="text-[10px] font-bold uppercase tracking-wide text-emerald-700 bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">{t("account.default")}</span>}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">{a.street}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{a.postalCode} {a.city} · {a.country}</p>
              </div>
              <div className="flex gap-2 flex-shrink-0 items-center">
                {confirmDelete === a.id ? (
                  <>
                    <span className="text-xs text-slate-500">{t("account.confirmDelete")}</span>
                    <button
                      onClick={() => remove(a.id)}
                      disabled={deleting === a.id}
                      className="text-xs font-semibold text-red-600 hover:text-red-800 transition-colors disabled:opacity-50"
                    >
                      {deleting === a.id ? "..." : t("account.yes")}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(null)}
                      className="text-xs text-slate-400 hover:text-slate-600 transition-colors"
                    >
                      {t("account.no")}
                    </button>
                  </>
                ) : (
                  <>
                    {!a.isDefault && (
                      <button onClick={() => setDefault(a.id)} className="text-xs text-slate-400 hover:text-emerald-700 transition-colors">
                        {t("account.makeDefault")}
                      </button>
                    )}
                    <button onClick={() => openEdit(a)} className="text-xs text-blue-500 hover:text-blue-700 transition-colors">{t("account.edit")}</button>
                    <button
                      onClick={() => setConfirmDelete(a.id)}
                      className="text-xs text-red-400 hover:text-red-600 transition-colors"
                    >
                      {t("account.remove")}
                    </button>
                  </>
                )}
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
  const { t, i18n } = useTranslation();
  const locale = i18n.language === "en" ? "en-GB" : "pt-PT";

  useEffect(() => {
    client.get(endpoints.orders.my)
      .then(res => setOrders(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p className="text-sm text-slate-400 py-8 text-center">{t("account.loadingOrders")}</p>;

  if (orders.length === 0) return (
    <div className="card py-14 text-center">
      <p className="text-sm text-slate-400">{t("account.noOrdersYet")}</p>
      <button onClick={() => navigate("/")} className="mt-4 btn-primary bg-emerald-700 text-sm">{t("orders.goToStore")}</button>
    </div>
  );

  return (
    <div className="card overflow-hidden">
      <div className="grid grid-cols-[56px_1fr_88px_100px_72px] gap-3 px-5 py-3 text-xs font-semibold text-slate-400 uppercase tracking-wide bg-slate-50 border-b border-slate-100 dark:bg-slate-800 dark:border-slate-700">
        <span>#</span>
        <span>{t("orders.date")}</span>
        <span className="text-right">{t("orders.total")}</span>
        <span>{t("orders.status")}</span>
        <span className="text-right">{t("orders.delivery")}</span>
      </div>
      <div className="divide-y divide-slate-50 dark:divide-slate-700">
        {orders.map(o => (
          <button
            key={o.id}
            onClick={() => navigate(`/orders/${o.id}`)}
            className="w-full grid grid-cols-[56px_1fr_88px_100px_72px] gap-3 items-center px-5 py-3.5 text-left hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors"
          >
            <span className="text-xs font-mono text-slate-400">#{o.id}</span>
            <div>
              <p className="text-sm font-medium text-slate-800 dark:text-slate-100">
                {parseDateTime(o.createdAt)?.toLocaleString(locale, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })}
              </p>
              <p className="text-xs text-slate-400 mt-0.5">{o.itemCount} {t("account.product", { count: o.itemCount })}</p>
            </div>
            <span className="text-sm font-bold text-emerald-700 text-right tabular">{o.totalAmount.toFixed(2)}€</span>
            <StatusBadge status={o.status} />
            <span className="text-xs text-slate-400 text-right tabular">
              {o.deliverySlot?.deliveryDate
                ? parseDateOnly(o.deliverySlot.deliveryDate)?.toLocaleDateString(locale, { day: "numeric", month: "short" })
                : o.preferredDeliveryDate
                ? parseDateOnly(o.preferredDeliveryDate)?.toLocaleDateString(locale, { day: "numeric", month: "short" })
                : "—"}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AccountPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tab, setTab] = useState<Tab>("profile");
  const { t } = useTranslation();

  const TABS: { key: Tab; label: string }[] = [
    { key: "profile",   label: t("account.tabProfile")   },
    { key: "addresses", label: t("account.tabAddresses") },
    { key: "orders",    label: t("account.tabOrders")    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <Navbar />

      <div className="max-w-screen-md mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{t("account.title")}</h1>
            <p className="text-xs text-slate-400 mt-0.5">{user?.email}</p>
          </div>
          <button
            onClick={() => { logout(); navigate("/"); }}
            className="text-xs text-red-400 hover:text-red-600 font-medium transition-colors border border-red-100 hover:border-red-200 px-3 py-1.5 rounded-lg dark:border-red-900/40"
          >
            {t("account.signOut")}
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-0.5 border-b border-slate-200 dark:border-slate-700 mb-6">
          {TABS.map(t2 => (
            <button
              key={t2.key}
              onClick={() => setTab(t2.key)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                tab === t2.key
                  ? "border-emerald-700 text-emerald-700"
                  : "border-transparent text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300"
              }`}
            >
              {t2.label}
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
