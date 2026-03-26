import { useNavigate } from "react-router-dom";
import { useCart } from "../features/cart/CartContext";
import Navbar from "../components/layout/Navbar";
import Breadcrumb from "../components/layout/BreadCrumb";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalAmount, clearCart } = useCart();
  const navigate = useNavigate();
  const shippingFee = 2.50;

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="max-w-screen-lg mx-auto px-4 sm:px-6 py-8">
        <Breadcrumb items={[{ label: "Loja", path: "/" }, { label: "Carrinho" }]} />

        {items.length === 0 ? (
          // RUI: empty state com contexto claro e CTA único
          <div className="card flex flex-col items-center py-20 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xl mb-4">
              🛒
            </div>
            <p className="text-sm font-semibold text-slate-900 mb-1">O carrinho está vazio</p>
            <p className="text-sm text-slate-400 mb-6">Adiciona produtos para começar.</p>
            <button onClick={() => navigate("/")} className="btn-primary">
              Ver produtos
            </button>
          </div>
        ) : (
          // RUI: layout de duas colunas — conteúdo + resumo sticky
          <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">

            {/* ── Tabela de itens ───────────────────────────────────
                RUI: tabela com cabeçalho de colunas, números alinhados à direita */}
            <div className="card overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-100">
                <h1 className="text-sm font-semibold text-slate-900">
                  Carrinho
                  <span className="ml-2 text-slate-400 font-normal tabular">({items.length} {items.length === 1 ? "produto" : "produtos"})</span>
                </h1>
                <button onClick={clearCart} className="btn-ghost text-xs">
                  Limpar tudo
                </button>
              </div>

              {/* Cabeçalho das colunas */}
              <div className="grid grid-cols-[1fr_112px_72px_32px] gap-3 px-5 py-2.5 bg-slate-50 border-b border-slate-100
                              text-xs font-semibold text-slate-400 uppercase tracking-wide">
                <span>Produto</span>
                <span className="text-center">Quantidade</span>
                <span className="text-right">Subtotal</span>
                <span />
              </div>

              <div className="divide-y divide-slate-50">
                {items.map(item => (
                  <div key={item.productId}
                    className="grid grid-cols-[1fr_112px_72px_32px] gap-3 items-center px-5 py-3.5">
                    {/* Produto */}
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.imageUrl} alt={item.name}
                        className="w-11 h-11 rounded-lg object-cover border border-slate-100 flex-shrink-0"
                        onError={e => (e.currentTarget.src = "https://placehold.co/44/f1f5f9/94a3b8?text=—")}
                      />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">{item.name}</p>
                        {/* RUI: preço unitário como metadado secundário */}
                        <p className="text-xs text-slate-400 tabular mt-0.5">
                          {item.pricePerUnit.toFixed(2)}€{item.unitType === 1 ? "/kg" : "/un"}
                        </p>
                      </div>
                    </div>

                    {/* Quantidade */}
                    <div className="flex items-center justify-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(item.productId, Math.max(0, item.quantity - (item.unitType === 1 ? 0.1 : 1)))}
                        className="w-6 h-6 rounded border border-slate-200 bg-white text-slate-600 text-sm
                                   flex items-center justify-center hover:bg-slate-50 transition-colors leading-none"
                      >−</button>
                      <span className="text-xs font-semibold tabular text-slate-800 min-w-[32px] text-center">
                        {item.unitType === 1 ? item.quantity.toFixed(1) : item.quantity}
                      </span>
                      <button
                        onClick={() => updateQuantity(item.productId, item.quantity + (item.unitType === 1 ? 0.1 : 1))}
                        className="w-6 h-6 rounded border border-slate-200 bg-white text-slate-600 text-sm
                                   flex items-center justify-center hover:bg-slate-50 transition-colors leading-none"
                      >+</button>
                    </div>

                    {/* Subtotal — RUI: alinhado à direita, peso visual forte */}
                    <p className="text-sm font-bold text-slate-900 text-right tabular">
                      {item.subtotal.toFixed(2)}€
                    </p>

                    {/* Remover */}
                    <button
                      onClick={() => removeItem(item.productId)}
                      className="w-7 h-7 rounded flex items-center justify-center
                                 text-slate-300 hover:text-red-400 hover:bg-red-50
                                 transition-colors text-sm"
                    >✕</button>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Resumo sticky ─────────────────────────────────────
                RUI: card separado, sticky, sem informação redundante       */}
            <div className="card overflow-hidden lg:sticky lg:top-20">
              <div className="card-header">Resumo da encomenda</div>
              <div className="p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Subtotal</span>
                  <span className="font-medium tabular text-slate-800">{totalAmount.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Envio</span>
                  <span className="font-medium tabular text-slate-800">{shippingFee.toFixed(2)}€</span>
                </div>
                {/* RUI: linha de total com separador claro + peso visual máximo */}
                <div className="flex justify-between pt-3 border-t border-slate-100">
                  <span className="text-sm font-bold text-slate-900">Total</span>
                  <span className="text-base font-bold text-emerald-700 tabular">
                    {(totalAmount + shippingFee).toFixed(2)}€
                  </span>
                </div>
              </div>

              <div className="px-5 pb-5 space-y-2">
                {/* RUI: botão primário claramente o mais importante */}
                <button onClick={() => navigate("/checkout")}
                  className="btn-primary w-full justify-center bg-amber-500 hover:bg-amber-400 font-bold">
                  Finalizar encomenda →
                </button>
                {/* RUI: ação secundária como texto, não outro botão */}
                <button onClick={() => navigate("/")}
                  className="w-full text-xs text-slate-400 hover:text-slate-600 py-1.5 transition-colors">
                  Continuar a comprar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}