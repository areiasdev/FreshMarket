import { useNavigate } from "react-router-dom";

interface BreadcrumbItem { label: string; path?: string }

export default function Breadcrumb({ items }: { items: BreadcrumbItem[] }) {
  const navigate = useNavigate();
  return (
    <nav className="flex items-center gap-1.5 text-sm mb-5">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <span key={idx} className="flex items-center gap-1.5">
            {item.path && !isLast ? (
              <button
                onClick={() => navigate(item.path!)}
                className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 dark:hover:text-emerald-300 font-medium transition-colors"
              >
                {item.label}
              </button>
            ) : (
              <span className={isLast ? "text-slate-900 dark:text-slate-100 font-semibold" : "text-slate-400 dark:text-slate-500"}>
                {item.label}
              </span>
            )}
            {!isLast && <span className="text-slate-300 dark:text-slate-600 select-none">/</span>}
          </span>
        );
      })}
    </nav>
  );
}