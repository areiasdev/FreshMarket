import { useTranslation } from "react-i18next";
import { ORDER_STATUS_BADGE_CLASS } from "../../lib/labels";

export default function StatusBadge({ status }: { status: number }) {
  const { t } = useTranslation();
  const className = ORDER_STATUS_BADGE_CLASS[status] ?? "badge badge-slate";
  return <span className={className}>{t(`orderStatus.${status}`, { defaultValue: "—" })}</span>;
}
