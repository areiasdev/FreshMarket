import { useCallback, useEffect, useRef, useState } from "react";
import client from "../../api/client";
import { endpoints } from "../../lib/endpoints";
import { parseDateTime } from "../../lib/dates";
import Pagination from "../../components/utils/Pagination";
import { useAuth } from "../auth/useAuth";
import { badge as badgeClass, roleBadge } from "../../lib/color";

interface UserAdmin {
  id: number;
  fullName: string;
  email: string;
  phone?: string;
  role: string;
  isActive: boolean;
  orderCount: number;
  createdAt: string;
}

export default function AdminUsers({ dark }: { dark?: boolean }) {
  const { user: currentUser } = useAuth();
  const isSuperAdmin = currentUser?.role === "SuperAdmin";

  const [users, setUsers]     = useState<UserAdmin[]>([]);
  const [total, setTotal]     = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage]       = useState(1);
  const [pageSize]            = useState(15);
  const [search, setSearch]   = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [acting, setActing]   = useState<number | null>(null);

  // Search is applied only on explicit submit, not live-as-you-type — read it via a
  // ref so `load` doesn't need `search` as a reactive dependency.
  const searchRef = useRef(search);
  searchRef.current = search;

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await client.get(endpoints.admin.users.getAll, {
        params: { search: searchRef.current || undefined, role: roleFilter || undefined, page, pageSize },
      });
      setUsers(res.data.items);
      setTotal(res.data.totalCount);
    } catch {
      alert("Erro ao carregar utilizadores.");
    } finally {
      setLoading(false);
    }
  }, [roleFilter, page, pageSize]);

  useEffect(() => { load(); }, [load]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    load();
  };

  const toggleActive = async (id: number) => {
    setActing(id);
    try {
      const res = await client.put(endpoints.admin.users.toggleActive(id));
      setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: res.data.isActive } : u));
    } catch {
      alert("Erro ao atualizar estado do utilizador.");
    } finally {
      setActing(null);
    }
  };

  const updateRole = async (id: number, role: string) => {
    setActing(id);
    try {
      const res = await client.put(endpoints.admin.users.updateRole(id), { role });
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: res.data.role } : u));
    } catch {
      alert("Erro ao atualizar o role do utilizador.");
    } finally {
      setActing(null);
    }
  };

  const d = dark ?? false;
  const th = `${d ? "bg-slate-900 border-slate-700 text-slate-400" : "bg-slate-50 border-slate-100 text-slate-400"} px-4 py-3 text-xs font-semibold uppercase tracking-wide text-left`;
  const td = `${d ? "border-slate-700" : "border-slate-100"} px-4 py-3 text-sm border-b`;

  return (
    <div>
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6`}>
        <div>
          <h2 className={`text-2xl font-bold ${d ? "text-slate-100" : "text-slate-800"}`}>Utilizadores</h2>
          <p className={`text-sm mt-0.5 ${d ? "text-slate-400" : "text-slate-500"}`}>{total} registados</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <form onSubmit={handleSearch} className="flex gap-2">
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Pesquisar nome ou email..."
              className={`text-sm px-3 py-1.5 rounded-lg border focus:outline-none focus:ring-2 focus:ring-emerald-500 ${
                d ? "bg-slate-800 border-slate-600 text-slate-100 placeholder-slate-500"
                  : "bg-white border-slate-200 text-slate-800"
              }`}
            />
            <button type="submit" className="text-sm px-3 py-1.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 transition-colors">
              Pesquisar
            </button>
          </form>
          <select
            value={roleFilter}
            onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
            className={`text-sm px-3 py-1.5 rounded-lg border focus:outline-none ${
              d ? "bg-slate-800 border-slate-600 text-slate-100"
                : "bg-white border-slate-200 text-slate-800"
            }`}
          >
            <option value="">Todos os roles</option>
            <option value="Customer">Customer</option>
            <option value="Admin">Admin</option>
            <option value="SuperAdmin">SuperAdmin</option>
          </select>
        </div>
      </div>

      <div className={`rounded-xl border overflow-hidden ${d ? "border-slate-700" : "border-slate-200"}`}>
        <table className="w-full text-left">
          <thead>
            <tr className={d ? "bg-slate-800" : "bg-slate-50"}>
              <th className={th}>Utilizador</th>
              <th className={th}>Role</th>
              <th className={`${th} text-center`}>Encomendas</th>
              <th className={th}>Registado</th>
              <th className={`${th} text-center`}>Estado</th>
              <th className={th}></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className={td}>
                      <div className={`h-4 rounded animate-pulse ${d ? "bg-slate-700" : "bg-slate-100"}`} />
                    </td>
                  ))}
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className={`${td} text-center py-10 ${d ? "text-slate-500" : "text-slate-400"}`}>
                  Nenhum utilizador encontrado
                </td>
              </tr>
            ) : (
              users.map(u => (
                <tr key={u.id} className={`transition-colors ${d ? "hover:bg-slate-800/60" : "hover:bg-slate-50"}`}>
                  <td className={td}>
                    <p className={`font-medium ${d ? "text-slate-100" : "text-slate-800"}`}>{u.fullName}</p>
                    <p className={`text-xs ${d ? "text-slate-400" : "text-slate-500"}`}>{u.email}</p>
                  </td>
                  <td className={td}>
                    {isSuperAdmin ? (
                      <select
                        value={u.role}
                        onChange={e => updateRole(u.id, e.target.value)}
                        disabled={acting === u.id || u.role === "SuperAdmin"}
                        className={`text-xs px-2 py-1 rounded-lg border focus:outline-none disabled:opacity-50 ${
                          d ? "bg-slate-700 border-slate-600 text-slate-200"
                            : "bg-white border-slate-200 text-slate-700"
                        } ${u.role === "Admin" ? "font-bold text-emerald-600" : ""} ${u.role === "SuperAdmin" ? "font-bold text-purple-600" : ""}`}
                      >
                        <option value="Customer">Customer</option>
                        <option value="Admin">Admin</option>
                        <option value="SuperAdmin">SuperAdmin</option>
                      </select>
                    ) : (
                      <span className={roleBadge[u.role] ?? "badge badge-slate"}>
                        {u.role}
                      </span>
                    )}
                  </td>
                  <td className={`${td} text-center ${d ? "text-slate-300" : "text-slate-700"}`}>
                    {u.orderCount}
                  </td>
                  <td className={`${td} ${d ? "text-slate-400" : "text-slate-500"} text-xs tabular-nums`}>
                    {parseDateTime(u.createdAt)?.toLocaleDateString("pt-PT")}
                  </td>
                  <td className={`${td} text-center`}>
                    <span className={u.isActive ? badgeClass.active : badgeClass.inactive}>
                      {u.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className={td}>
                    <button
                      onClick={() => toggleActive(u.id)}
                      disabled={acting === u.id}
                      className={`text-xs px-2.5 py-1 rounded-lg border transition-colors disabled:opacity-50 ${
                        u.isActive
                          ? d ? "border-red-800 text-red-400 hover:bg-red-900/20"
                               : "border-red-200 text-red-500 hover:bg-red-50"
                          : d ? "border-emerald-800 text-emerald-400 hover:bg-emerald-900/20"
                               : "border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                      }`}
                    >
                      {acting === u.id ? "..." : u.isActive ? "Desativar" : "Ativar"}
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {Math.ceil(total / pageSize) > 1 && (
          <Pagination
            page={page}
            totalPages={Math.ceil(total / pageSize)}
            totalCount={total}
            pageSize={pageSize}
            onPageChange={setPage}
            onPageSizeChange={() => {}}
            pageSizeOptions={[15]}
          />
        )}
      </div>
    </div>
  );
}
