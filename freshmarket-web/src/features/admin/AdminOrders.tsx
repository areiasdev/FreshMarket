import { useEffect, useState } from "react";
import client from "../../api/client";
import { endpoints } from "../../lib/endpoints";

interface Order {
  id: number;
  orderNumber: string;
  userFullName: string;
  totalAmount: number;
  status: string;
  deliveryDate: string;
  createdAt: string;
}

const STATUS_OPTIONS = [
  { label: "Pending",   value: 0 },
  { label: "Paid", value: 1 },
  { label: "Preparing",  value: 2 },
  { label: "Shipped",   value: 3 },
  { label: "Delivered",  value: 4 },
  { label: "Cancelled",  value: 5 },
];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState(0);

  const load = async (status: number) => {
    setLoading(true);
    try {
      const res = await client.get(endpoints.admin.orders.byStatus(status.toString()));
      setOrders(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(selectedStatus); }, [selectedStatus]);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold text-gray-800">Encomendas</h2>

      {/* Tabs de status */}
      <div className="flex gap-2 border-b border-gray-200">
        {STATUS_OPTIONS.map((s) => (
          <button
            key={s.value}
            onClick={() => setSelectedStatus(s.value)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              selectedStatus === s.value
                ? "border-green-600 text-green-700"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">A carregar encomendas...</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-600">
            <tr>
              <th className="px-4 py-2 text-left">#</th>
              <th className="px-4 py-2 text-left">Cliente</th>
              <th className="px-4 py-2 text-left">Total</th>
              <th className="px-4 py-2 text-left">Estado</th>
              <th className="px-4 py-2 text-left">Entrega</th>
              <th className="px-4 py-2 text-left">Ações</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-gray-400">
                  Sem encomendas neste estado
                </td>
              </tr>
            ) : orders.map((order) => (
              <tr key={order.id} className="border-t border-gray-100 hover:bg-gray-50">
                <td className="px-4 py-2">#{order.orderNumber}</td>
                <td className="px-4 py-2">{order.userFullName}</td>
                <td className="px-4 py-2">{order.totalAmount.toFixed(2)}€</td>
                <td className="px-4 py-2">{order.status}</td>
                <td className="px-4 py-2">
                  {new Date(order.deliveryDate).toLocaleDateString("pt-PT")}
                </td>
                <td className="px-4 py-2 flex gap-2">
                  <button
                    onClick={() => client.put(endpoints.admin.orders.cancel(order.id))}
                    className="text-xs text-red-500 hover:underline"
                  >
                    Cancelar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}