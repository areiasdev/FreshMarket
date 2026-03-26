import { PaymentMethod } from "../../types/payment";

type Props = {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
};

export default function PaymentSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-gray-700">Método de Pagamento</h3>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onChange(PaymentMethod.Card)}
          className={`border rounded-xl p-3 text-sm ${
            value === PaymentMethod.Card
              ? "border-green-600 bg-green-50"
              : ""
          }`}
        >
          💳 Cartão (Stripe)
        </button>

        <button
          onClick={() => onChange(PaymentMethod.MBWay)}
          className={`border rounded-xl p-3 text-sm ${
            value === PaymentMethod.MBWay
              ? "border-green-600 bg-green-50"
              : ""
          }`}
        >
          📱 MBWay
        </button>

        <button
          onClick={() => onChange(PaymentMethod.Cash)}
          className={`border rounded-xl p-3 text-sm col-span-2 ${
            value === PaymentMethod.Cash
              ? "border-green-600 bg-green-50"
              : ""
          }`}
        >
          💵 Pagar na entrega
        </button>
      </div>
    </div>
  );
}