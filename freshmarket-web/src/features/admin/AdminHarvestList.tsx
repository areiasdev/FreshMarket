import { useEffect, useRef, useState } from "react";
import client from "../../api/client";
import { endpoints } from "../../lib/endpoints";
import Icon from "../../components/ui/Icon";
import { IconPackage, IconCheck } from "../../components/ui/icons";

interface HarvestItem {
  productId: number;
  productName: string;
  unitType: number; // 0=Unit, 1=Weight
  totalQuantity: number;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function formatQty(item: HarvestItem) {
  return item.unitType === 1
    ? `${item.totalQuantity.toFixed(2)} kg`
    : `${item.totalQuantity} un`;
}

export default function AdminHarvestList() {
  const [dateFrom, setDateFrom] = useState(todayIso());
  const [dateTo,   setDateTo]   = useState(todayIso());
  const [items, setItems]       = useState<HarvestItem[] | null>(null);
  const [loading, setLoading]   = useState(false);
  const [picked, setPicked]     = useState<Set<number>>(new Set());
  const printRef                = useRef<HTMLDivElement>(null);

  const load = async (from: string, to: string) => {
    if (!from || !to || from > to) return;
    setLoading(true);
    setPicked(new Set());
    try {
      const res = await client.get(endpoints.admin.orders.harvestList(from, to));
      setItems(Array.isArray(res.data) ? res.data : []);
    } finally {
      setLoading(false);
    }
  };

  // Auto-load on mount and whenever dates change
  useEffect(() => {
    load(dateFrom, dateTo);
  }, [dateFrom, dateTo]);

  const togglePicked = (id: number) => {
    setPicked(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handlePrint = () => window.print();

  const totalWeight = items?.filter(i => i.unitType === 1).reduce((s, i) => s + i.totalQuantity, 0) ?? 0;
  const totalUnits  = items?.filter(i => i.unitType === 0).reduce((s, i) => s + i.totalQuantity, 0) ?? 0;
  const pickedCount = picked.size;
  const doneAll     = items != null && items.length > 0 && pickedCount === items.length;

  const isRange = dateFrom !== dateTo;
  const rangeLabel = isRange
    ? `${new Date(dateFrom + "T12:00:00").toLocaleDateString("pt-PT")} – ${new Date(dateTo + "T12:00:00").toLocaleDateString("pt-PT")}`
    : new Date(dateFrom + "T12:00:00").toLocaleDateString("pt-PT", {
        weekday: "long", day: "numeric", month: "long", year: "numeric",
      });

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Lista de Colheita</h2>
        <p className="text-sm text-slate-400 dark:text-slate-500 mt-1">
          Produtos a colher para as encomendas de um dia ou intervalo
        </p>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap items-end gap-3">
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            De
          </label>
          <input
            type="date"
            value={dateFrom}
            max={dateTo}
            onChange={e => setDateFrom(e.target.value)}
            className="border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Até
          </label>
          <input
            type="date"
            value={dateTo}
            min={dateFrom}
            onChange={e => setDateTo(e.target.value)}
            className="border border-slate-200 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        {items != null && items.length > 0 && (
          <button
            onClick={handlePrint}
            className="border border-slate-200 dark:border-slate-600 text-sm font-semibold px-4 py-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-slate-700 dark:text-slate-300 print:hidden"
          >
            Imprimir
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="card p-12 text-center text-slate-400 dark:text-slate-500 text-sm">
          A carregar...
        </div>
      )}

      {/* Empty */}
      {!loading && items !== null && items.length === 0 && (
        <div className="card p-12 text-center text-slate-400 dark:text-slate-500 text-sm">
          Sem encomendas para {isRange ? "este intervalo" : "esta data"}.
        </div>
      )}

      {!loading && items !== null && items.length > 0 && (
        <div ref={printRef}>
          {/* Summary bar */}
          <div className="flex flex-wrap gap-3 mb-4 print:hidden">
            <div className="card px-4 py-3 flex items-center gap-2 flex-1 min-w-[120px]">
              <Icon icon={IconPackage} size={18} className="text-emerald-600" />
              <div>
                <p className="text-xs text-slate-400 dark:text-slate-500">Produtos</p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{items.length}</p>
              </div>
            </div>
            {totalWeight > 0 && (
              <div className="card px-4 py-3 flex-1 min-w-[120px]">
                <p className="text-xs text-slate-400 dark:text-slate-500">Total peso</p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{totalWeight.toFixed(2)} kg</p>
              </div>
            )}
            {totalUnits > 0 && (
              <div className="card px-4 py-3 flex-1 min-w-[120px]">
                <p className="text-xs text-slate-400 dark:text-slate-500">Total unidades</p>
                <p className="text-lg font-bold text-slate-800 dark:text-slate-100">{totalUnits} un</p>
              </div>
            )}
            <div className="card px-4 py-3 flex-1 min-w-[120px]">
              <p className="text-xs text-slate-400 dark:text-slate-500">Colhidos</p>
              <p className={`text-lg font-bold ${doneAll ? "text-emerald-600" : "text-slate-800 dark:text-slate-100"}`}>
                {pickedCount} / {items.length}
              </p>
            </div>
          </div>

          {/* Print header */}
          <div className="hidden print:block mb-6">
            <h1 className="text-2xl font-bold">FreshMarket — Lista de Colheita</h1>
            <p className="text-sm text-slate-600 mt-1">{rangeLabel}</p>
          </div>

          {/* Item list */}
          <div className="card overflow-hidden">
            <table className="w-full text-sm">
              <thead className="table-header print:bg-slate-100">
                <tr>
                  <th className="px-4 py-3 text-left font-medium print:hidden w-10" />
                  <th className="px-4 py-3 text-left font-medium">Produto</th>
                  <th className="px-4 py-3 text-right font-medium">Quantidade</th>
                  <th className="px-4 py-3 text-center font-medium print:hidden">Estado</th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => {
                  const isDone = picked.has(item.productId);
                  return (
                    <tr
                      key={item.productId}
                      onClick={() => togglePicked(item.productId)}
                      className={`table-row cursor-pointer transition-colors select-none print:cursor-default ${
                        isDone ? "opacity-50 line-through" : ""
                      }`}
                    >
                      <td className="px-4 py-3 print:hidden">
                        <div className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          isDone
                            ? "bg-emerald-600 border-emerald-600"
                            : "border-slate-300 dark:border-slate-600"
                        }`}>
                          {isDone && <Icon icon={IconCheck} size={11} className="text-white" />}
                        </div>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800 dark:text-slate-100">
                        {item.productName}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-emerald-700 dark:text-emerald-400 tabular-nums text-base">
                        {formatQty(item)}
                      </td>
                      <td className="px-4 py-3 text-center print:hidden">
                        {isDone ? (
                          <span className="text-xs bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-2 py-0.5 rounded-full font-semibold">
                            Colhido
                          </span>
                        ) : (
                          <span className="text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 px-2 py-0.5 rounded-full font-semibold">
                            Por colher
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {doneAll && (
            <div className="mt-4 flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-sm font-semibold print:hidden">
              <Icon icon={IconCheck} size={16} />
              Todos os produtos foram colhidos!
            </div>
          )}
        </div>
      )}

      <style>{`
        @media print {
          body > *:not(#root) { display: none; }
          .dark { background: white !important; color: black !important; }
        }
      `}</style>
    </div>
  );
}
