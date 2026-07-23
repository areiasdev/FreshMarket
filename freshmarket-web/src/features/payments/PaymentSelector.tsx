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
      <h3 className="font-semibold text-slate-700 dark:text-slate-200">Método de Pagamento</h3>

      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => onChange(PaymentMethod.Card)}
          className={`border rounded-xl p-3 text-sm flex items-center gap-2 justify-center transition-colors ${
            value === PaymentMethod.Card
              ? "border-emerald-700 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
              : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-emerald-300"
          }`}
        >
          <Icon icon={IconCreditCard} size={16} />
          Cartão (Stripe)
        </button>

        <button
          onClick={() => onChange(PaymentMethod.MBWay)}
          className={`border rounded-xl p-3 text-sm flex items-center gap-2 justify-center transition-colors ${
            value === PaymentMethod.MBWay
              ? "border-emerald-700 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
              : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-emerald-300"
          }`}
        >
          <Icon icon={IconDeviceMobile} size={16} />
          MBWay
        </button>

        <button
          onClick={() => onChange(PaymentMethod.Cash)}
          className={`border rounded-xl p-3 text-sm col-span-2 flex items-center gap-2 justify-center transition-colors ${
            value === PaymentMethod.Cash
              ? "border-emerald-700 bg-emerald-50 text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400"
              : "border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:border-emerald-300"
          }`}
        >
          <Icon icon={IconCoin} size={16} />
          Pagar na entrega
        </button>
      </div>
    </div>
  );
}
