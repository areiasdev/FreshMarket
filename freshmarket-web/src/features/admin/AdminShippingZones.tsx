import { useEffect, useState } from "react";
import client from "../../api/client";
import Pagination from "../../components/admin/Pagination";
import Modal from "../../components/admin/Modal";
import { endpoints } from "../../lib/endpoints";

interface ShippingZoneDto {
  id: number;
  city: string;
  postalCodePrefix: string;
  shippingFee: number;
  minOrderValue: number;
  isActive: boolean;
}

export default function AdminShippingZones() {
    const [zones, setZones] = useState<ShippingZoneDto[]>([]);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize] = useState(10);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editItem, setEditItem] = useState<ShippingZoneDto | null>(null);

    const emptyForm = { city: "", postalCodePrefix: "", shippingFee: 0.0, minOrderValue: 0.0 };
    const [form, setForm] = useState(emptyForm);

    const load = async () => {
    setLoading(true);
    const res = await client.get(endpoints.admin.shippingZones.getAll + `?page=${page}&pageSize=${pageSize}`);
        setZones(res.data.items);
        setTotal(res.data.totalCount);
        setLoading(false);
    };

    useEffect(() => { load(); }, [page]);

    const openCreate = () => { setEditItem(null); setForm(emptyForm); setShowModal(true); };
        const openEdit = (z: ShippingZoneDto) => {
        setEditItem(z);
        setForm({ city: z.city, postalCodePrefix: z.postalCodePrefix, shippingFee: z.shippingFee, minOrderValue: z.minOrderValue });
        setShowModal(true);
    };

  const handleSubmit = async () => {
    if (editItem) {
        await client.put(endpoints.admin.shippingZones.update(editItem.id), {
        city: form.city,
        postalCodePrefix: form.postalCodePrefix,
        shippingFee: form.shippingFee,
        minOrderValue: form.minOrderValue,
        isActive: editItem.isActive,
        });
    } else {
        await client.post(endpoints.admin.shippingZones.create, form);
    }
    setShowModal(false);
    load();
    };

  const toggleActive = async (id: number) => {
    await client.patch(endpoints.admin.shippingZones.toggleActive(id));
    load();
  };

  const totalPages = Math.ceil(total / pageSize);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Zonas de Envio</h1>
          <p className="text-sm text-gray-400 mt-1">{total} zonas no total</p>
        </div>
        <button onClick={openCreate} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold">
          + Nova Zona
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr className="text-left px-4 py-3 font-medium text-gray-500">
                <th>Cidade</th>
                <th>Prefixo Postal</th>
                <th>Taxa Envio</th>
                <th>Mín. Encomenda</th>
                <th>Estado</th>
                <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="text-center py-8 text-gray-400">A carregar...</td></tr>
            ) : zones.map((z) => (
              <tr key={z.id} className="border-t hover:bg-gray-50">
                <td>{z.city}</td>
                <td>{z.postalCodePrefix}</td>
                <td>{z.shippingFee.toFixed(2)}€</td>
                <td>{z.minOrderValue.toFixed(2)}€</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${z.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-600"}`}>
                    {z.isActive ? "Ativa" : "Inativa"}
                  </span>
                </td>
                <td className="px-4 py-3 flex gap-3">
                  <button onClick={() => openEdit(z)} className="text-xs text-blue-600 hover:underline">Editar</button>
                  <button onClick={() => toggleActive(z.id)} className="text-xs text-gray-500 hover:underline">
                    {z.isActive ? "Desativar" : "Ativar"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
      </div>

      {showModal && (
        <Modal title={editItem ? "Editar Zona" : "Nova Zona de Envio"} onClose={() => setShowModal(false)} onSubmit={handleSubmit}>
          <label className="block mb-3">
            <span className="text-sm text-gray-600">Cidade</span>
            <input className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
            </label>
            <label className="block mb-3">
            <span className="text-sm text-gray-600">Prefixo Postal (ex: 3750)</span>
            <input className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                value={form.postalCodePrefix} onChange={(e) => setForm({ ...form, postalCodePrefix: e.target.value })} />
            </label>
            <label className="block mb-3">
            <span className="text-sm text-gray-600">Taxa de Envio (€)</span>
            <input type="number" step="0.01" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                value={form.shippingFee} onChange={(e) => setForm({ ...form, shippingFee: +e.target.value })} />
            </label>
            <label className="block">
            <span className="text-sm text-gray-600">Valor Mínimo de Encomenda (€)</span>
            <input type="number" step="0.01" className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                value={form.minOrderValue} onChange={(e) => setForm({ ...form, minOrderValue: +e.target.value })} />
            </label>
        </Modal>
      )}
    </div>
  );
}