import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  LineChart, Line,
  BarChart, Bar,
  PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid,
  Tooltip, Legend,
} from "recharts";
import client from "../../api/client";
import { endpoints } from "../../lib/endpoints";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MetricsDto {
  revenueByDay:     { date: string; revenue: number; orderCount: number }[];
  ordersByStatus:   { status: string; count: number }[];
  topProducts:      { productName: string; totalRevenue: number; totalQuantity: number }[];
  customersByMonth: { month: string; newCustomers: number }[];
  ordersByHour:     { hour: string; orderCount: number }[];
  productPriceStats:{ productName: string; bestPrice: number; salesCount: number }[];
}

// ─── Palette ─────────────────────────────────────────────────────────────────

const COLORS = ["#15803d", "#1d4ed8", "#b45309", "#7c3aed", "#be123c", "#0369a1"];

const STATUS_COLORS: Record<string, string> = {
  "Pendente":   "#d97706",
  "Pago":       "#1d4ed8",
  "Em preparo": "#7c3aed",
  "Enviado":    "#4338ca",
  "Entregue":   "#15803d",
  "Cancelado":  "#dc2626",
};

// ─── Small helpers ────────────────────────────────────────────────────────────

function fmt(n: number) {
  return n.toLocaleString("pt-PT", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function ChartCard({ title, children, full = false }: {
  title: string;
  children: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div className={`card p-5 ${full ? "col-span-2" : ""}`}>
      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-4">{title}</h3>
      <div>{children}</div>
    </div>
  );
}

// ─── Custom tooltip ───────────────────────────────────────────────────────────

function RevenueTooltip({ active, payload, label, dark }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className={`rounded-lg shadow-md px-3 py-2 text-xs border ${
      dark ? "bg-slate-800 border-slate-600 text-slate-200" : "bg-white border-slate-200 text-slate-700"
    }`}>
      <p className="font-semibold mb-1">{label}</p>
      {payload.map((p: any) => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {p.dataKey === "revenue" ? `${fmt(p.value)}€` : p.value}
        </p>
      ))}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function AdminMetrics({ dark = false }: { dark?: boolean }) {
  const [data, setData]       = useState<MetricsDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod]   = useState<7 | 30>(30);

  const grid   = dark ? "#334155" : "#f1f5f9";
  const tick   = dark ? "#94a3b8" : "#64748b";
  const legend = dark ? "#94a3b8" : "#64748b";
  const tip    = dark
    ? { backgroundColor: "#1e293b", border: "1px solid #334155", borderRadius: 8, fontSize: 12 }
    : { backgroundColor: "#fff",    border: "1px solid #e2e8f0",  borderRadius: 8, fontSize: 12 };

  useEffect(() => {
    client.get(endpoints.admin.metrics)
      .then(res => setData(res.data))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-sm text-slate-400">
      A carregar métricas...
    </div>
  );

  if (!data) return (
    <div className="flex items-center justify-center h-64 text-sm text-slate-400">
      Erro ao carregar métricas.
    </div>
  );

  const revenueData = period === 7 ? data.revenueByDay.slice(-7) : data.revenueByDay;

  const totalRevenue = revenueData.reduce((s, d) => s + d.revenue, 0);
  const totalOrders  = revenueData.reduce((s, d) => s + d.orderCount, 0);

  return (
    <div className="space-y-6 w-full">

      {/* ── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Métricas</h1>
          <p className="text-sm text-slate-400 mt-0.5">Análise detalhada do desempenho da loja</p>
        </div>
        <div className={`flex gap-1 p-1 rounded-lg ${dark ? "bg-slate-700" : "bg-slate-100"}`}>
          {([7, 30] as const).map(p => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors outline-none ${
                period === p
                  ? dark ? "bg-slate-500 text-white shadow-sm" : "bg-white text-slate-900 shadow-sm"
                  : dark ? "text-slate-300 hover:text-white"   : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {p}d
            </button>
          ))}
        </div>
      </div>

      {/* ── KPI strip ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Receita ({period}d)</p>
          <p className="text-2xl font-bold text-emerald-600 tabular-nums mt-1">{fmt(totalRevenue)}€</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-slate-400 font-semibold uppercase tracking-wide">Encomendas ({period}d)</p>
          <p className={`text-2xl font-bold tabular-nums mt-1 ${dark ? "text-slate-100" : "text-slate-900"}`}>{totalOrders}</p>
        </div>
      </div>

      {/* ── Revenue line chart ───────────────────────────────────────── */}
      <ChartCard title={`Receita & Encomendas — últimos ${period} dias`} full>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={revenueData} margin={{ top: 4, right: 16, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={grid} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: tick }}
              tickLine={false}
              interval={period === 30 ? 4 : 0}
            />
            <YAxis
              yAxisId="rev"
              orientation="left"
              tick={{ fontSize: 10, fill: tick }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `${v}€`}
              width={52}
            />
            <YAxis
              yAxisId="cnt"
              orientation="right"
              tick={{ fontSize: 10, fill: tick }}
              tickLine={false}
              axisLine={false}
              width={32}
            />
            <Tooltip content={<RevenueTooltip dark={dark} />} />
            <Legend
              wrapperStyle={{ fontSize: 11, color: legend }}
              formatter={v => v === "revenue" ? "Receita" : "Encomendas"}
            />
            <Line
              yAxisId="rev"
              type="monotone"
              dataKey="revenue"
              stroke="#15803d"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
            <Line
              yAxisId="cnt"
              type="monotone"
              dataKey="orderCount"
              stroke="#1d4ed8"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ── Row 2: Status pie + Customers bar ───────────────────────── */}
      <div className="grid grid-cols-2 gap-6">

        <ChartCard title="Encomendas por estado (total)">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={data.ordersByStatus}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={80}
                innerRadius={44}
                paddingAngle={2}
              >
                {data.ordersByStatus.map((entry, i) => (
                  <Cell
                    key={entry.status}
                    fill={STATUS_COLORS[entry.status] ?? COLORS[i % COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip
                formatter={(v: number, name: string) => [v, name]}
                contentStyle={tip}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 11, color: legend }}
                formatter={(v) => `${v}: ${data.ordersByStatus.find(s => s.status === v)?.count ?? 0}`}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Novos clientes por mês (12 meses)">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data.customersByMonth} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 9, fill: tick }}
                tickLine={false}
                interval={1}
              />
              <YAxis
                tick={{ fontSize: 10, fill: tick }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={28}
              />
              <Tooltip
                contentStyle={tip}
                formatter={(v: number) => [v, "Novos clientes"]}
              />
              <Bar dataKey="newCustomers" fill="#1d4ed8" radius={[4, 4, 0, 0]} maxBarSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* ── Top 10 products ──────────────────────────────────────────── */}
      <ChartCard title="Top 10 produtos por receita" full>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart
            data={[...data.topProducts].reverse()}
            layout="vertical"
            margin={{ top: 0, right: 60, left: 8, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={grid} horizontal={false} />
            <XAxis
              type="number"
              tick={{ fontSize: 10, fill: tick }}
              tickLine={false}
              axisLine={false}
              tickFormatter={v => `${v}€`}
            />
            <YAxis
              type="category"
              dataKey="productName"
              tick={{ fontSize: 11, fill: tick }}
              tickLine={false}
              axisLine={false}
              width={130}
            />
            <Tooltip
              contentStyle={tip}
              formatter={(v: number) => [`${fmt(v)}€`, "Receita"]}
            />
            <Bar dataKey="totalRevenue" fill="#15803d" radius={[0, 4, 4, 0]} maxBarSize={18} />
          </BarChart>
        </ResponsiveContainer>
      </ChartCard>

      {/* ── Row 4: Peak hours + Price stats ─────────────────────────── */}
      <div className="grid grid-cols-2 gap-6">

        <ChartCard title="Pico de encomendas por hora">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart
              data={data.ordersByHour}
              margin={{ top: 4, right: 8, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
              <XAxis
                dataKey="hour"
                tick={{ fontSize: 9, fill: tick }}
                tickLine={false}
                tickFormatter={h => `${h}h`}
                interval={2}
              />
              <YAxis
                tick={{ fontSize: 10, fill: tick }}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
                width={28}
              />
              <Tooltip
                contentStyle={tip}
                formatter={(v: number) => [v, "Encomendas"]}
                labelFormatter={h => `${h}h00`}
              />
              <Bar dataKey="orderCount" radius={[4, 4, 0, 0]} maxBarSize={20}>
                {data.ordersByHour.map((entry, i) => (
                  <Cell
                    key={i}
                    fill={entry.orderCount === Math.max(...data.ordersByHour.map(h => h.orderCount))
                      ? "#15803d" : (dark ? "#1e40af" : "#93c5fd")}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Preço com mais vendas por produto">
          <div className="overflow-auto max-h-[220px]">
            <table className="w-full text-xs">
              <thead>
                <tr className={`text-left text-slate-400 border-b ${dark ? "border-slate-600" : "border-slate-100"}`}>
                  <th className="pb-2 font-semibold">Produto</th>
                  <th className="pb-2 font-semibold text-right">Preço mais vendido</th>
                  <th className="pb-2 font-semibold text-right">Vendas</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${dark ? "divide-slate-700" : "divide-slate-50"}`}>
                {data.productPriceStats.map((p, i) => (
                  <tr key={i} className={dark ? "hover:bg-slate-700/40" : "hover:bg-slate-50"}>
                    <td className={`py-2 pr-3 font-medium truncate max-w-[140px] ${dark ? "text-slate-200" : "text-slate-700"}`}>{p.productName}</td>
                    <td className="py-2 text-right font-semibold text-emerald-600 dark:text-emerald-400 tabular-nums">{fmt(p.bestPrice)}€</td>
                    <td className={`py-2 text-right tabular-nums ${dark ? "text-slate-400" : "text-slate-500"}`}>{p.salesCount}</td>
                  </tr>
                ))}
                {data.productPriceStats.length === 0 && (
                  <tr>
                    <td colSpan={3} className="py-8 text-center text-slate-400">Sem dados</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
