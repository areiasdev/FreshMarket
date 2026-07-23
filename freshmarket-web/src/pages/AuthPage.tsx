import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { useAuth } from "../features/auth/useAuth";
import { useTheme } from "../features/theme/useTheme";
import client from "../api/client";
import type { AuthResponse } from "../types";
import { endpoints } from "../lib/endpoints";
import Icon from "../components/ui/Icon";
import { IconLeaf, IconTruck, IconStar, IconEye, IconEyeOff, IconSun, IconMoon } from "../components/ui/icons";
import i18n from "../i18n";

export default function AuthPage() {
  const { login } = useAuth();
  const navigate  = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { t } = useTranslation();
  const [tab, setTab]     = useState<"login" | "register">("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loginForm,    setLoginForm]    = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ fullName: "", email: "", password: "", phone: "" });
  const [showLoginPw,    setShowLoginPw]    = useState(false);
  const [showRegisterPw, setShowRegisterPw] = useState(false);

  const currentLang = i18n.language === "en" ? "en" : "pt";
  const toggleLang = () => {
    const next = currentLang === "pt" ? "en" : "pt";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const { data } = await client.post<AuthResponse>(endpoints.auth.login, loginForm);
      login(data); navigate("/");
    } catch { setError(t("auth.invalidCredentials")); }
    finally { setLoading(false); }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const { data } = await client.post<AuthResponse>(endpoints.auth.register, registerForm);
      login(data); navigate("/");
    } catch { setError(t("auth.registerError")); }
    finally { setLoading(false); }
  };

  const features = [
    { icon: IconLeaf,  title: t("auth.featureFresh"),     desc: t("auth.featureFreshDesc") },
    { icon: IconTruck, title: t("auth.featureDelivery"),  desc: t("auth.featureDeliveryDesc") },
    { icon: IconStar,  title: t("auth.featureCustomers"), desc: t("auth.featureCustomersDesc") },
  ];

  return (
    <div className="min-h-screen grid lg:grid-cols-2">

      <div className="hidden lg:flex flex-col justify-between bg-emerald-900 p-12">
        <div className="flex items-center gap-2.5 text-white">
          <Icon icon={IconLeaf} size={22} className="text-emerald-300" />
          <span className="font-bold text-lg tracking-tight">FreshMarket</span>
        </div>

        <div>
          <blockquote className="mb-12">
            <p className="text-2xl font-bold text-white leading-snug tracking-tight mb-2">
              {t("auth.tagline")}
            </p>
            <p className="text-emerald-400 text-sm leading-relaxed max-w-sm">
              {t("auth.taglineSub")}
            </p>
          </blockquote>

          <ul className="space-y-5">
            {features.map(f => (
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

        <p className="text-xs text-emerald-600">© 2026 FreshMarket</p>
      </div>

      <div className="auth-light flex min-h-screen items-center justify-center bg-white dark:bg-slate-900 px-8 py-12 relative">

        {/* Top-left controls: dark/light + language */}
        <div className="absolute top-4 left-4 flex items-center gap-1.5">
          <button
            onClick={toggleTheme}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title={theme === "dark" ? "Light mode" : "Dark mode"}
          >
            <Icon icon={theme === "dark" ? IconSun : IconMoon} size={15} />
          </button>
          <button
            onClick={toggleLang}
            className="flex items-center justify-center h-8 px-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors tracking-wide"
          >
            {currentLang === "pt" ? "EN" : "PT"}
          </button>
        </div>

        <div className="w-full max-w-sm">

          <div className="flex items-center gap-2 mb-8 lg:hidden">
            <Icon icon={IconLeaf} size={20} className="text-emerald-700" />
            <span className="font-bold text-slate-900 dark:text-slate-100">FreshMarket</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight mb-1">
            {tab === "login" ? t("auth.welcome") : t("auth.createAccount")}
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
            {tab === "login" ? t("auth.signInDesc") : t("auth.registerDesc")}
          </p>

          <div className="flex border-b border-slate-200 dark:border-slate-700 mb-7">
            {(["login", "register"] as const).map(t2 => (
              <button
                key={t2}
                onClick={() => { setTab(t2); setError(""); }}
                data-testid={`auth-tab-${t2}`}
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors border-b-2 -mb-px ${
                  tab === t2
                    ? "border-emerald-700 text-emerald-700"
                    : "border-transparent text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
                }`}
              >
                {t2 === "login" ? t("auth.tabSignIn") : t("auth.tabRegister")}
              </button>
            ))}
          </div>

          {tab === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="label">{t("auth.email")}</label>
                <input type="email" className="input" required
                  value={loginForm.email}
                  onChange={e => setLoginForm({ ...loginForm, email: e.target.value })} />
              </div>
              <div>
                <label className="label">{t("auth.password")}</label>
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
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading}
                className="btn-primary w-full justify-center bg-emerald-700 mt-2"
              >
                {loading ? t("auth.signingIn") : t("auth.tabSignIn")}
              </button>
            </form>
          )}

          {tab === "register" && (
            <form onSubmit={handleRegister} className="space-y-4">
              <div>
                <label className="label">{t("auth.fullName")}</label>
                <input type="text" className="input" required
                  value={registerForm.fullName}
                  onChange={e => setRegisterForm({ ...registerForm, fullName: e.target.value })} />
              </div>
              <div>
                <label className="label">{t("auth.email")}</label>
                <input type="email" className="input" required
                  value={registerForm.email}
                  onChange={e => setRegisterForm({ ...registerForm, email: e.target.value })} />
              </div>
              <div>
                <label className="label">{t("auth.password")}</label>
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
                  {t("auth.phone")}
                  <span className="ml-1 normal-case tracking-normal font-normal text-slate-400">{t("auth.optional")}</span>
                </label>
                <input type="tel" className="input"
                  value={registerForm.phone}
                  onChange={e => setRegisterForm({ ...registerForm, phone: e.target.value })} />
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2.5">
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading}
                className="btn-primary w-full justify-center bg-emerald-700 mt-2"
              >
                {loading ? t("auth.creatingAccount") : t("auth.tabRegister")}
              </button>
            </form>
          )}

          <p className="text-xs text-slate-400 text-center mt-6">
            {t("auth.terms")}
          </p>
        </div>
      </div>
    </div>
  );
}
