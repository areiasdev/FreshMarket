import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../features/auth/useAuth";
import { useCart } from "../../features/cart/CartContext";
import NotificationBell from "../../features/notifications/NotificationBell";
import Icon from "../ui/Icon";
import { IconLeaf, IconShoppingCart } from "../ui/icons";

interface NavbarProps {
  onCartOpen?: () => void;
}

export default function Navbar({ onCartOpen }: NavbarProps) {
  const { isAuthenticated, user, logout } = useAuth();
  const { totalItems } = useCart();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const isActive = (path: string) =>
    path === "/" ? pathname === "/" : pathname.startsWith(path);

  const navLinks = [
    { label: "Loja",       path: "/",        show: true },
    { label: "Encomendas", path: "/orders",  show: isAuthenticated },
    { label: "Conta",      path: "/account", show: isAuthenticated },
    { label: "Admin",      path: "/admin",   show: user?.role === "Admin" },
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
              Horto Píncaro
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
                  onClick={() => { logout(); navigate("/"); }}
                  className="text-xs text-emerald-400 hover:text-red-300 transition-colors font-medium"
                >
                  Sair
                </button>
              </>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold px-3.5 py-1.5 rounded-md transition-colors"
              >
                Entrar
              </button>
            )}

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
