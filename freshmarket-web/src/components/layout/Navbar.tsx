import { useNavigate, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import i18n from "../../i18n";
import { useAuth } from "../../features/auth/useAuth";
import { useCart } from "../../features/cart/CartContext";
import { useTheme } from "../../features/theme/useTheme";
import NotificationBell from "../../features/notifications/NotificationBell";
import Icon from "../ui/Icon";
import { IconLeaf, IconShoppingCart, IconSun, IconMoon } from "../ui/icons";

interface NavbarProps {
  onCartOpen?: () => void;
}

export default function Navbar({ onCartOpen }: NavbarProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { t } = useTranslation();

  const currentLang = i18n.language === "en" ? "en" : "pt";
  const toggleLang = () => {
    const next = currentLang === "pt" ? "en" : "pt";
    i18n.changeLanguage(next);
    localStorage.setItem("lang", next);
  };

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  const navLinks = [
    { label: t("nav.store"),  path: "/",       show: true },
    { label: t("nav.orders"), path: "/orders", show: isAuthenticated },
    { label: t("nav.admin"),  path: "/admin",  show: user?.role === "Admin" || user?.role === "SuperAdmin" },
  ];

  return (
    <nav className="bg-emerald-900 sticky top-0 z-40">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-14">

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2.5 text-white hover:text-emerald-200 transition-colors"
          >
            <Icon icon={IconLeaf} size={20} className="text-emerald-300" />
            <span className="font-bold text-[15px] tracking-tight">
              FreshMarket
            </span>
          </button>

          <div className="hidden sm:flex items-center gap-0.5">
            {navLinks.filter(l => l.show).map(link => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`
                  px-3 py-1.5 rounded-md text-sm font-medium transition-colors
                  ${isActive(link.path)
                    ? "bg-emerald-800 text-white"
                    : "text-emerald-300 hover:bg-emerald-800/60 hover:text-white"}
                `}
              >
                {link.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <button
                  onClick={() => navigate("/account")}
                  className="hidden sm:block text-xs text-emerald-400 hover:text-white transition-colors font-medium mr-1"
                >
                  {user?.fullName.split(" ")[0]}
                </button>
                <NotificationBell />
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-center w-8 h-8 rounded-md text-emerald-300 hover:text-white hover:bg-emerald-800/60 transition-colors"
                >
                  <Icon icon={theme === "dark" ? IconSun : IconMoon} size={16} />
                </button>
                <button
                  onClick={() => { logout(); navigate("/"); }}
                  className="text-xs text-emerald-400 hover:text-red-300 transition-colors font-medium"
                >
                  {t("nav.signOut")}
                </button>
              </>
            ) : (
              <>
                <button
                  onClick={() => navigate("/auth")}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-3.5 py-1.5 rounded-md transition-colors"
                >
                  {t("nav.signIn")}
                </button>
                <button
                  onClick={toggleTheme}
                  className="flex items-center justify-center w-8 h-8 rounded-md text-emerald-300 hover:text-white hover:bg-emerald-800/60 transition-colors"
                >
                  <Icon icon={theme === "dark" ? IconSun : IconMoon} size={16} />
                </button>
              </>
            )}

            <button
              onClick={toggleLang}
              className="hidden sm:flex items-center justify-center h-8 px-2 rounded-md border border-emerald-700 text-xs font-bold text-emerald-300 hover:text-white hover:bg-emerald-800/60 transition-colors tracking-wide"
            >
              {currentLang === "pt" ? "EN" : "PT"}
            </button>

            <button
              onClick={onCartOpen ?? (() => navigate("/cart"))}
              className="relative flex items-center gap-1.5 bg-emerald-800 hover:bg-emerald-700 text-white text-sm font-medium px-3 py-1.5 rounded-md transition-colors ml-1"
            >
              <Icon icon={IconShoppingCart} size={16} />
              {totalItems > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] rounded-full flex items-center justify-center px-1 tabular">
                  {totalItems > 99 ? "99+" : totalItems}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
