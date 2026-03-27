import Icon from "../ui/Icon";
import { IconArrowLeft, IconArrowRight } from "../ui/icons";

interface Props {
  page: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange: (size: number) => void;
  pageSizeOptions?: number[];
}

export default function Pagination({
  page,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [5, 10, 20, 50],
}: Props) {
  if (totalCount === 0) return null;

  const from = (page - 1) * pageSize + 1;
  const to   = Math.min(page * pageSize, totalCount);

  return (
    // RUI: divider em vez de margin — integra naturalmente na tabela acima
    <div className="flex items-center justify-between gap-4 px-4 py-3 border-t border-slate-100">

      {/* Esquerda: contagem + page size */}
      <div className="flex items-center gap-3">
        {/* RUI: texto secundário discreto, tabular para não saltar */}
        <span className="text-xs text-slate-400 tabular-nums whitespace-nowrap">
          {from}–{to} de {totalCount}
        </span>

        {/* RUI: select sem border, sublinhado discreto */}
        <select
          value={pageSize}
          onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
          className="text-xs text-slate-500 bg-transparent cursor-pointer
                     focus:outline-none hover:text-slate-700 transition-colors"
        >
          {pageSizeOptions.map((s) => (
            <option key={s} value={s}>{s} / pág.</option>
          ))}
        </select>
      </div>

      {/* Direita: navegação — só aparece se há mais de 1 página */}
      {totalPages > 1 && (
        <div className="flex items-center gap-1">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className="flex items-center justify-center w-7 h-7 rounded-md text-slate-400
                       hover:bg-slate-100 hover:text-slate-700
                       disabled:opacity-30 disabled:cursor-not-allowed
                       transition-colors"
            aria-label="Página anterior"
          >
            <Icon icon={IconArrowLeft} size={13} />
          </button>

          {/* RUI: números de página visíveis, página atual com peso visual */}
          <div className="flex items-center gap-0.5">
            {getPageNumbers(page, totalPages).map((p, i) =>
              p === "…" ? (
                <span key={`ellipsis-${i}`} className="w-7 text-center text-xs text-slate-300 select-none">
                  …
                </span>
              ) : (
                <button
                  key={p}
                  onClick={() => onPageChange(p as number)}
                  className={`w-7 h-7 rounded-md text-xs font-medium transition-colors ${
                    p === page
                      ? "bg-emerald-700 text-white"
                      : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
                  }`}
                >
                  {p}
                </button>
              )
            )}
          </div>

          <button
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            className="flex items-center justify-center w-7 h-7 rounded-md text-slate-400
                       hover:bg-slate-100 hover:text-slate-700
                       disabled:opacity-30 disabled:cursor-not-allowed
                       transition-colors"
            aria-label="Próxima página"
          >
            <Icon icon={IconArrowRight} size={13} />
          </button>
        </div>
      )}
    </div>
  );
}

/** Gera array de páginas com ellipsis — ex: [1, "…", 4, 5, 6, "…", 12] */
function getPageNumbers(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages: (number | "…")[] = [1];

  if (current > 3) pages.push("…");

  const start = Math.max(2, current - 1);
  const end   = Math.min(total - 1, current + 1);

  for (let i = start; i <= end; i++) pages.push(i);

  if (current < total - 2) pages.push("…");

  pages.push(total);

  return pages;
}