import { PaymentMethod } from "../../types/payment";
import Icon from "../../components/ui/Icon";
import { IconCreditCard, IconDeviceMobile, IconCoin } from "../../components/ui/icons";

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
          className={`border rounded-xl p-3 text-sm flex items-center gap-2 justify-center ${
            value === PaymentMethod.Card ? "border-green-600 bg-green-50" : ""
          }`}
        >
          <Icon icon={IconCreditCard} size={16} />
          Cartão (Stripe)
        </button>

        <button
          onClick={() => onChange(PaymentMethod.MBWay)}
          className={`border rounded-xl p-3 text-sm flex items-center gap-2 justify-center ${
            value === PaymentMethod.MBWay ? "border-green-600 bg-green-50" : ""
          }`}
        >
          <Icon icon={IconDeviceMobile} size={16} />
          MBWay
        </button>

        <button
          onClick={() => onChange(PaymentMethod.Cash)}
          className={`border rounded-xl p-3 text-sm col-span-2 flex items-center gap-2 justify-center ${
            value === PaymentMethod.Cash ? "border-green-600 bg-green-50" : ""
          }`}
        >
          <Icon icon={IconCoin} size={16} />
          Pagar na entrega
        </button>
      </div>
    </div>
  );
}
