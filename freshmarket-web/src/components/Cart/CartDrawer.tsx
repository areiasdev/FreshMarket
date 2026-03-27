import { useNavigate } from "react-router-dom";
import { useCart } from "../../features/cart/CartContext";
import Icon from "../ui/Icon";
import { IconShoppingCart, IconX, IconArrowRight } from "../ui/icons";

interface Props {
  open: boolean;
  onClose: () => void;
}

export default function CartDrawer({ open, onClose }: Props) {
  const { items, removeItem, updateQuantity, totalAmount } = useCart();
  const navigate = useNavigate();

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/30 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      <div className={`fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ${
        open ? "translate-x-0" : "translate-x-full"
      }`}>
        <div className="flex items-center justify-between px-5 py-4 border-b">
          <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Icon icon={IconShoppingCart} size={18} />
            Carrinho
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <Icon icon={IconX} size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto divide-y px-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-2">
              <Icon icon={IconShoppingCart} size={40} stroke={1.5} />
              <p className="text-sm">O carrinho está vazio</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.productId} className="flex items-center gap-3 py-4">
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                  onError={(e) => (e.currentTarget.src = "https://placehold.co/48?text=P")}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{item.name}</p>
                  <p className="text-xs text-gray-400">{item.pricePerUnit.toFixed(2)}€{item.unitType === 1 ? "/kg" : "/un"}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      onClick={() => updateQuantity(item.productId, Math.max(0, +(item.quantity - (item.unitType === 1 ? 0.1 : 1)).toFixed(1)))}
                      className="w-6 h-6 rounded-full border text-gray-600 hover:bg-gray-100 text-xs font-bold flex items-center justify-center"
                    >−</button>
                    <span className="text-xs font-semibold w-8 text-center">
                      {item.unitType === 1 ? item.quantity.toFixed(1) : item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.productId, +(item.quantity + (item.unitType === 1 ? 0.1 : 1)).toFixed(1))}
                      className="w-6 h-6 rounded-full border text-gray-600 hover:bg-gray-100 text-xs font-bold flex items-center justify-center"
                    >+</button>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <p className="text-sm font-bold text-green-700">{item.subtotal.toFixed(2)}€</p>
                  <button
                    onClick={() => removeItem(item.productId)}
                    className="text-gray-300 hover:text-red-400 transition"
                  >
                    <Icon icon={IconX} size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {items.length > 0 && (
          <div className="border-t px-5 py-4 space-y-3">
            <div className="flex justify-between text-sm text-gray-500">
              <span>Subtotal</span>
              <span className="font-bold text-gray-800 text-base">{totalAmount.toFixed(2)}€</span>
            </div>
            <p className="text-xs text-gray-400">+ taxa de envio calculada no checkout</p>
            <button
              onClick={() => { onClose(); navigate("/checkout"); }}
              className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition flex items-center justify-center gap-2"
            >
              Finalizar encomenda
              <Icon icon={IconArrowRight} size={16} />
            </button>
            <button
              onClick={() => { onClose(); navigate("/cart"); }}
              className="w-full text-sm text-gray-500 hover:underline text-center"
            >
              Ver carrinho completo
            </button>
          </div>
        )}
      </div>
    </>
  );
}
