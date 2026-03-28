import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../features/auth/useAuth";
import client from "../api/client";
import type { AuthResponse } from "../types";
import { endpoints } from "../lib/endpoints";
import Icon from "../components/ui/Icon";
import { IconLeaf, IconTruck, IconStar, IconEye, IconEyeOff } from "../components/ui/icons";

export default function AuthPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const [tab, setTab]     = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginForm,    setLoginForm]    = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ fullName: "", email: "", password: "", phone: "" });
  const [showLoginPw,    setShowLoginPw]    = useState(false);
  const [showRegisterPw, setShowRegisterPw] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const { data } = await client.post<AuthResponse>(endpoints.auth.login, loginForm);
      login(data); navigate("/");
    } catch { setError("Email ou password incorretos."); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const { data } = await client.post<AuthResponse>(endpoints.auth.register, registerForm);
      login(data); navigate("/");
    } catch { setError("Erro ao criar conta. Tenta novamente."); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      <div className="hidden lg:flex flex-col justify-between bg-emerald-900 p-12">
        <div className="flex items-center gap-2.5 text-white">
          <Icon icon={IconLeaf} size={22} className="text-emerald-300" />
          <span className="font-bold text-lg tracking-tight">Horto Píncaro</span>
        </div>

        <div>
          <blockquote className="mb-12">
            <p className="text-2xl font-bold text-white leading-snug tracking-tight mb-2">
              "Frescos da quinta<br />à sua porta."
            </p>
            <p className="text-emerald-400 text-sm leading-relaxed max-w-sm">
              Hortofrutícolas de produção local, colhidos e entregues com qualidade garantida em cada encomenda.
            </p>
          </blockquote>

          <ul className="space-y-5">
            {[
              { icon: IconLeaf, title: "Produtos frescos",        desc: "Diretamente de produtores locais" },
              { icon: IconTruck, title: "Entrega em 48h",         desc: "Processado e enviado rapidamente" },
              { icon: IconStar, title: "+500 clientes satisfeitos", desc: "Qualidade reconhecida pela comunidade" },
            ].map(f => (
              <li key={f.title} className="flex items-start gap-3">
                <Icon icon={f.icon} size={16} className="text-emerald-400 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">{f.title}</p>
                  <p className="text-xs text-emerald-400 mt-0.5">{f.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <p className="text-xs text-emerald-600">© 2026 Horto Píncaro</p>
      </div>

      <div className="flex min-h-screen items-center justify-center bg-white dark:bg-slate-900 px-8 py-12">
        <div className="w-full max-w-sm">

          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Icon icon={IconLeaf} size={20} className="text-emerald-700" />
            <span className="font-bold text-slate-900">Horto Píncaro</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight mb-1">
            {tab === "login" ? "Bem-vindo de volta" : "Criar conta"}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
            {tab === "login"
              ? "Entra para ver as tuas encomendas."
              : "Regista-te para começar a encomendar."}
          </p>

          <div className="flex border-b border-slate-200 dark:border-slate-700 mb-7">
            {(["login", "register"] as const).map(t => (
              <button
                key={t}
                onClick={() => { setTab(t); setError(""); }}
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                  tab === t
                    ? "border-emerald-700 text-emerald-700"
                    : "border-transparent text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                }`}
              >
                {t === "login" ? "Entrar" : "Criar Conta"}
              </button>
            ))}
          </div>

          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" required
                  value={loginForm.email}
                  onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input type={showLoginPw ? "text" : "password"} className="input pr-10" required
                    value={loginForm.password}
                    onChange={e => setLoginForm({ ...loginForm, password: e.target.value })} />
                  <button
                    type="button"
                    onClick={() => setShowLoginPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <Icon icon={showLoginPw ? IconEyeOff : IconEye} size={16} />
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading}
                className="btn-primary w-full justify-center bg-emerald-700 mt-2"
              >
                {loading ? "A entrar..." : "Entrar"}
              </button>
            </form>
          )}

          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="label">Nome completo</label>
                <input type="text" className="input" required
                  value={registerForm.fullName}
                  onChange={e => setRegisterForm({ ...registerForm, fullName: e.target.value })} />
              </div>
              <div>
                <label className="label">Email</label>
                <input type="email" className="input" required
                  value={registerForm.email}
                  onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })} />
              </div>
              <div>
                <label className="label">Password</label>
                <div className="relative">
                  <input type={showRegisterPw ? "text" : "password"} className="input pr-10" required
                    value={registerForm.password}
                    onChange={e => setRegisterForm({ ...registerForm, password: e.target.value })} />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPw(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    <Icon icon={showRegisterPw ? IconEyeOff : IconEye} size={16} />
                  </button>
                </div>
              </div>
              <div>
                <label className="label">
                  Telefone
                  <span className="ml-1 normal-case tracking-normal font-normal text-slate-400">— opcional</span>
                </label>
                <input type="tel" className="input"
                  value={registerForm.phone}
                  onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })} />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5 dark:bg-red-900/20 dark:border-red-800 dark:text-red-400">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading}
                className="btn-primary w-full justify-center bg-emerald-700 mt-2"
              >
                {loading ? "A criar conta..." : "Criar Conta"}
              </button>
            </form>
          )}

          <p className="text-xs text-slate-400 text-center mt-6">
            Ao continuar aceitas os nossos termos e política de privacidade.
          </p>
        </div>
      </div>
    </div>
  );
}
