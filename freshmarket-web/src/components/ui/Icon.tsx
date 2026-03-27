import type { TablerIcon } from "./icons";

interface Props {
  icon: TablerIcon;
  size?: number;
  className?: string;
  stroke?: number;
}

export default function Icon({ icon: I, size = 18, className, stroke = 2 }: Props) {
  return <I size={size} className={className} stroke={stroke} />;
}
