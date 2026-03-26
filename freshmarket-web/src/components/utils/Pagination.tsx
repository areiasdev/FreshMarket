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

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-8">
      {/* Info + seletor */}
      <div className="flex items-center gap-3 text-sm text-gray-500">
        <span>
          {(page - 1) * pageSize + 1}–{Math.min(page * pageSize, totalCount)} de {totalCount}
        </span>
        <select
          value={pageSize}
          onChange={(e) => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
          className="border rounded-lg px-2 py-1 text-sm text-gray-600 focus:ring-2 focus:ring-green-500 outline-none"
        >
          {pageSizeOptions.map((s) => (
            <option key={s} value={s}>{s} por página</option>
          ))}
        </select>
      </div>

      {/* Navegação */}
      {totalPages > 1 && (
        <div className="flex items-center gap-2">
          <button
            disabled={page === 1}
            onClick={() => onPageChange(page - 1)}
            className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-100 transition"
          >
            ← Anterior
          </button>
          <span className="px-3 py-2 text-sm text-gray-600 font-medium">
            {page} / {totalPages}
          </span>
          <button
            disabled={page === totalPages}
            onClick={() => onPageChange(page + 1)}
            className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40 hover:bg-gray-100 transition"
          >
            Seguinte →
          </button>
        </div>
      )}
    </div>
  );
}