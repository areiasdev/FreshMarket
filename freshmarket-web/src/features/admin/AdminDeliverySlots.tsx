import { useEffect, useState } from "react";
import client from "../../api/client";
import Modal from "../../components/admin/Modal";
import { endpoints } from "../../lib/endpoints";
import Pagination from "../../components/utils/Pagination";

interface DeliverySlotDto {
  id: number;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  maxOrders: number;
  isActive: boolean;
}

const DAY_NAMES = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

export default function AdminDeliverySlots() {
  const [slots, setSlots] = useState<DeliverySlotDto[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ dayOfWeek: 1, startTime: "", endTime: "", maxOrders: 10 });

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const res = await client.get(endpoints.admin.slots.getAll + `?page=${page}&pageSize=${pageSize}`);
      setSlots(res.data.items);
      setTotal(res.data.totalCount);
      setLoading(false);
    };
      load(); 
    }, [page, pageSize]);

    const reload = async () => {
      const res = await client.get(endpoints.admin.slots.getAll + `?page=${page}&pageSize=${pageSize}`);
      setSlots(res.data.items);
      setTotal(res.data.totalCount);
      };

  const handleSubmit = async () => {
    await client.post(endpoints.admin.slots.create, form);
    setShowModal(false);
    await reload();
  };

  const toggleActive = async (id: number) => {
    await client.patch(endpoints.admin.slots.toggleActive(id));
    await reload();
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Slots de Entrega</h1>
          <p className="text-sm text-gray-400 mt-1">{total} slots no total</p>
        </div>
        <button onClick={() => setShowModal(true)} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
          + Novo Slot
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Dia</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Horário</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Máx. Encomendas</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Estado</th>
              <th className="text-left px-4 py-3 font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">A carregar...</td></tr>
            ) : slots.map((s) => (
              <tr key={s.id} className="border-t hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{DAY_NAMES[s.dayOfWeek]}</td>
                <td className="px-4 py-3">{s.startTime} - {s.endTime}</td>
                <td className="px-4 py-3">{s.maxOrders}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${s.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    {s.isActive ? "Ativo" : "Inativo"}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => toggleActive(s.id)} className="text-xs text-gray-500 hover:underline">
                    {s.isActive ? "Desativar" : "Ativar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination
          page={page}
          totalPages={totalPages}
          totalCount={total}
          pageSize={pageSize}
          onPageChange={setPage}
          onPageSizeChange={(size) => { setPageSize(size); setPage(1); }}
          pageSizeOptions={[5, 10, 20]}
        />
      </div>

      {showModal && (
        <Modal title="Novo Slot de Entrega" onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <label className="block mb-3">
            <span className="text-sm text-gray-600">Dia da Semana</span>
            <select className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              value={form.dayOfWeek} onChange={(e) => setForm({ ...form, dayOfWeek: +e.target.value })}>
              {DAY_NAMES.map((d, i) => <option key={i} value={i}>{d}</option>)}
            </select>
          </label>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <label className="block">
              <span className="text-sm text-gray-600">Início</span>
              <input type="time" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
            </label>
            <label className="block">
              <span className="text-sm text-gray-600">Fim</span>
              <input type="time" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
            </label>
          </div>
          <label className="block">
            <span className="text-sm text-gray-600">Máx. Encomendas</span>
            <input type="number" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              value={form.maxOrders} onChange={(e) => setForm({ ...form, maxOrders: +e.target.value })} />
          </label>
        </Modal>
      )}
    </div>
  );
}