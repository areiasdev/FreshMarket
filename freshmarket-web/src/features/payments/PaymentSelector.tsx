import { PaymentMethod } from "../../types/payment";
import Icon from "../../components/ui/Icon";
import { IconCreditCard, IconDeviceMobile, IconCoin } from "../../components/ui/icons";
import type { ReactNode } from "react";

type Props = {
  value: PaymentMethod;
  onChange: (method: PaymentMethod) => void;
};

function ComingSoon({ children }: { children: ReactNode }) {
  return (
    <div className="relative group cursor-not-allowed">
      <div className="opacity-40 pointer-events-none select-none">
        {children}
      </div>
      <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 bg-slate-700 text-white text-xs rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
        Será adicionado em breve
      </span>
    </div>
  );
}

export default function PaymentSelector({ value, onChange }: Props) {
  return (
    <div className="space-y-2">
      <h3 className="font-semibold text-gray-700">Método de Pagamento</h3>

      <div className="grid grid-cols-2 gap-2">
        <ComingSoon>
          <button className="border rounded-xl p-3 text-sm flex items-center gap-2 justify-center w-full border-slate-200 text-slate-600">
            <Icon icon={IconCreditCard} size={16} />
            Cartão (Stripe)
          </button>
        </ComingSoon>

        <ComingSoon>
          <button className="border rounded-xl p-3 text-sm flex items-center gap-2 justify-center w-full border-slate-200 text-slate-600">
            <Icon icon={IconDeviceMobile} size={16} />
            MBWay
          </button>
        </ComingSoon>

        <button
          onClick={() => onChange(PaymentMethod.Cash)}
          className={`border rounded-xl p-3 text-sm col-span-2 flex items-center gap-2 justify-center transition-colors ${
            value === PaymentMethod.Cash
              ? "border-emerald-700 bg-emerald-50 text-emerald-700"
              : "border-slate-200 text-slate-600 hover:border-emerald-300"
          }`}
        >
          <Icon icon={IconCoin} size={16} />
          Pagar na entrega
        </button>
      </div>
    </div>
  );
}
