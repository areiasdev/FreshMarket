import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import Icon from "../../components/ui/Icon";
import {
  IconBell,
  IconCheck,
  IconPackage,
  IconCurrencyEuro,
  IconTruck,
  IconX,
  IconShoppingCart,
} from "../../components/ui/icons";
import type { TablerIcon } from "../../components/ui/icons";
import type { Notification, NotificationType } from "../../types";
import { useNotifications } from "./useNotifications";
import { parseDateTime } from "../../lib/dates";

// ─── Tipo → ícone + cor ───────────────────────────────────────────────────────
const TYPE_META: Record<
  NotificationType,
  { icon: TablerIcon; bg: string; iconColor: string }
> = {
  0: { icon: IconShoppingCart, bg: "bg-emerald-100",  iconColor: "text-emerald-700" }, // OrderPlaced
  1: { icon: IconCurrencyEuro, bg: "bg-blue-100",     iconColor: "text-blue-700"    }, // OrderPaid
  2: { icon: IconPackage,      bg: "bg-purple-100",   iconColor: "text-purple-700"  }, // OrderPreparing
  3: { icon: IconTruck,        bg: "bg-indigo-100",   iconColor: "text-indigo-700"  }, // OrderShipped
  4: { icon: IconCheck,        bg: "bg-green-100",    iconColor: "text-green-700"   }, // OrderDelivered
  5: { icon: IconX,            bg: "bg-red-100",      iconColor: "text-red-600"     }, // OrderCancelled
  6: { icon: IconX,            bg: "bg-amber-100",    iconColor: "text-amber-700"   }, // PaymentFailed
};

function NotificationItem({
  notification,
  onRead,
}: {
  notification: Notification;
  onRead: (id: number) => void;
}) {
  const navigate = useNavigate();
  const meta = TYPE_META[notification.type] ?? { icon: IconBell, bg: "bg-slate-100", iconColor: "text-slate-500" };

  const handleClick = () => {
    if (!notification.isRead) onRead(notification.id);
    if (notification.orderId) navigate(`/orders/${notification.orderId}`);
  };

  return (
    <button
      onClick={handleClick}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-slate-50 ${
        !notification.isRead ? "bg-emerald-50/60" : ""
      }`}
    >
      <div className={`mt-0.5 flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${meta.bg}`}>
        <Icon icon={meta.icon} size={15} className={meta.iconColor} />
      </div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm leading-snug truncate ${!notification.isRead ? "font-semibold text-slate-900" : "font-medium text-slate-700"}`}>
          {notification.title}
        </p>
        <p className="text-xs text-slate-500 mt-0.5 leading-snug line-clamp-2">
          {notification.message}
        </p>
        <p className="text-[10px] text-slate-400 mt-1">
          {parseDateTime(notification.createdAt)?.toLocaleString("pt-PT", {
            day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
          })}
        </p>
      </div>
      {!notification.isRead && (
        <span className="mt-1.5 flex-shrink-0 w-2 h-2 rounded-full bg-emerald-600" />
      )}
    </button>
  );
}

export default function NotificationBell() {
  const {
    notifications, unreadCount, open, loading,
    setOpen, handleOpen, markAsRead, markAllAsRead,
  } = useNotifications();

  const ref = useRef<HTMLDivElement>(null);

  // Fecha o painel ao clicar fora
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, setOpen]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={open ? () => setOpen(false) : handleOpen}
        aria-label="Notificações"
        className="relative flex items-center justify-center w-9 h-9 rounded-md text-emerald-300 hover:bg-emerald-800/60 hover:text-white transition-colors"
      >
        <Icon icon={IconBell} size={18} />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold min-w-[16px] h-4 rounded-full flex items-center justify-center px-1 tabular">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-800">Notificações</h3>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-emerald-700 hover:text-emerald-900 font-medium transition-colors"
              >
                Marcar todas como lidas
              </button>
            )}
          </div>

          {/* Lista */}
          <div className="max-h-[400px] overflow-y-auto divide-y divide-slate-50">
            {loading ? (
              <p className="text-sm text-slate-400 text-center py-8">A carregar...</p>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 gap-2">
                <Icon icon={IconBell} size={28} className="text-slate-300" />
                <p className="text-sm text-slate-400">Sem notificações</p>
              </div>
            ) : (
              notifications.map(n => (
                <NotificationItem
                  key={n.id}
                  notification={n}
                  onRead={markAsRead}
                />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
