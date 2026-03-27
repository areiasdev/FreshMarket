export {
  IconLeaf,
  IconChartBar,
  IconBox,
  IconFolder,
  IconClipboardList,
  IconClock,
  IconUser,
  IconCurrencyEuro,
  IconShoppingCart,
  IconX,
  IconCheck,
  IconArrowLeft,
  IconArrowRight,
  IconTruck,
  IconStar,
  IconCreditCard,
  IconDeviceMobile,
  IconCoin,
  IconCalendar,
  IconNotes,
  IconAlertTriangle,
  IconPackage,
  IconTrendingUpDown
} from "@tabler/icons-react";

import type { ComponentType } from "react";

export type TablerIcon = ComponentType<{
  size?: number | string;
  stroke?: number | string;
  className?: string;
}>;
