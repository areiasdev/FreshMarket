import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import client from "../api/client";
import { useAuth } from "../features/auth/useAuth";
import { useCart } from "../features/cart/CartContext";
import { endpoints } from "../lib/endpoints";
import type { Product, Category } from "../types";
import CartDrawer from "../components/Cart/CartDrawer";
import Pagination from "../components/utils/Pagination";
import Navbar from "../components/layout/Navbar";
import Icon from "../components/ui/Icon";
import { IconCheck, IconLeaf, IconTruck, IconStar, IconShoppingCart } from "../components/ui/icons";

export default function HomePage() {
  const [products, setProducts]             = useState<Product[]>([]);
  const [categories, setCategories]         = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [page, setPage]                     = useState(1);
  const [total, setTotal]                   = useState(0);
  const [loading, setLoading]               = useState(true);
  const [cartOpen, setCartOpen]             = useState(false);
  const pageSize                            = 20;

  const { isAuthenticated } = useAuth();
  const { addItem }         = useCart();
  const navigate            = useNavigate();

  useEffect(() => {
    client.get(endpoints.categories.getAll).then(res => setCategories(res.data));
  }, []);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      try {
        const url = endpoints.products.getAll +
          `?page=${page}&pageSize=${pageSize}` +
          (activeCategory ? `&categoryId=${activeCategory}` : "");
        const res = await client.get(url);
        setProducts(res.data.items ?? res.data);
        setTotal(res.data.totalCount ?? 0);
      } finally { setLoading(false); }
    };
    load();
  }, [page, activeCategory]);

  const totalPages    = Math.ceil(total / pageSize);
  const hasOpenedCart = useRef(false);

  const handleAdd = (p: Product) => {
    if (!isAuthenticated) return navigate("/auth");
    addItem(p, p.minQuantity ?? 1);
    if (!hasOpenedCart.current) { hasOpenedCart.current = true; setCartOpen(true); }
  };

  return (
    <div className="min-h-screen bg-stone-50">
      <Navbar onCartOpen={() => setCartOpen(true)} />

      {/* ── Hero ──────────────────────────────────────────────────────────────── */}
      <section className="bg-stone-50 border-b border-stone-200">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-14 pb-12 md:pt-20 md:pb-16">
          <div className="grid md:grid-cols-[1fr_380px] gap-10 items-center">

            {/* Copy */}
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700
                               bg-emerald-50 border border-emerald-100
                               px-3 py-1 rounded-full uppercase tracking-widest mb-6">
                <Icon icon={IconLeaf} size={11} />
                Colhido fresco · Entrega ao domicílio
              </span>

              <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-stone-900
                             leading-[1.08] tracking-tight mb-5">
                Frescos da quinta<br />
                <span className="text-emerald-700">à sua mesa.</span>
              </h1>

              <p className="text-stone-500 text-base sm:text-lg leading-relaxed mb-8 max-w-lg">
                Frutas, legumes e hortaliças selecionados diretamente de produtores locais da região de Aveiro.
              </p>

              <div className="flex flex-wrap gap-3 mb-10">
                <a href="#produtos"
                  className="inline-flex items-center justify-center gap-2
                             bg-emerald-700 hover:bg-emerald-600 text-white
                             font-bold px-7 py-3.5 rounded-xl text-sm transition-colors shadow-sm">
                  <Icon icon={IconShoppingCart} size={15} />
                  Comprar agora
                </a>
                <a href="#como-funciona"
                  className="inline-flex items-center justify-center
                             bg-white hover:bg-stone-50 text-stone-700
                             font-semibold px-7 py-3.5 rounded-xl text-sm
                             border border-stone-200 transition-colors">
                  Como funciona
                </a>
              </div>

              {/* Trust strip */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 pt-6 border-t border-stone-200">
                {[
                  { icon: IconTruck, text: "Entrega em 48h" },
                  { icon: IconLeaf,  text: "100% local"     },
                  { icon: IconStar,  text: "+500 clientes"  },
                ].map(b => (
                  <div key={b.text} className="flex items-center gap-1.5">
                    <Icon icon={b.icon} size={14} className="text-emerald-600" />
                    <span className="text-xs font-semibold text-stone-600">{b.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Visual panel */}
            <div className="hidden md:flex items-center justify-center">
              <div className="relative w-full aspect-square max-w-sm rounded-[2.5rem]
                              bg-gradient-to-br from-amber-50 via-stone-100 to-emerald-50
                              border border-stone-200 overflow-hidden shadow-sm">
                {/* Decorative circles */}
                <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full bg-amber-100/70" />
                <div className="absolute -bottom-10 -left-10 w-56 h-56 rounded-full bg-emerald-100/60" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2
                                w-44 h-44 rounded-full bg-amber-50/80" />
                <div className="relative z-10 h-full flex flex-col items-center justify-center gap-3 p-8">
                  <div className="w-20 h-20 rounded-2xl bg-white shadow-md flex items-center justify-center border border-stone-100">
                    <Icon icon={IconLeaf} size={40} className="text-emerald-600" />
                  </div>
                  <div className="text-center mt-2">
                    <p className="text-xl font-extrabold text-stone-800 tracking-tight">Horto Píncaro</p>
                    <p className="text-sm text-stone-500 font-medium mt-0.5">Da quinta à sua porta</p>
                  </div>
                  <div className="mt-4 flex flex-col gap-2 w-full">
                    {["Frutas frescas", "Legumes da época", "Entrega rápida"].map(tag => (
                      <div key={tag} className="flex items-center gap-2 bg-white/80 rounded-lg px-3 py-2 border border-stone-100">
                        <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center flex-shrink-0">
                          <Icon icon={IconCheck} size={9} className="text-white" stroke={3} />
                        </div>
                        <span className="text-xs font-semibold text-stone-700">{tag}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Como funciona ─────────────────────────────────────────────────────── */}
      <section id="como-funciona" className="bg-amber-50 border-b border-amber-100">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              { step: "01", icon: IconShoppingCart, title: "Escolha os seus frescos",  desc: "Navegue pelo catálogo e adicione ao cesto o que precisa." },
              { step: "02", icon: IconCheck,        title: "Finalize a encomenda",     desc: "Pagamento seguro e escolha do horário de entrega preferido." },
              { step: "03", icon: IconTruck,        title: "Receba em casa",           desc: "Entregamos na sua porta em 48 horas, no horário combinado." },
            ].map(s => (
              <div key={s.step} className="flex gap-4 items-start">
                <span className="text-4xl font-black text-amber-200 leading-none select-none flex-shrink-0 mt-0.5">
                  {s.step}
                </span>
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <Icon icon={s.icon} size={15} className="text-emerald-600" />
                    <p className="text-sm font-bold text-stone-800">{s.title}</p>
                  </div>
                  <p className="text-xs text-stone-500 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Produtos ──────────────────────────────────────────────────────────── */}
      <section id="produtos" className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12">

        {/* Section header */}
        <div className="flex items-end justify-between mb-5">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-1">Catálogo</p>
            <h2 className="text-2xl font-extrabold text-stone-900 tracking-tight">Os nossos produtos</h2>
          </div>
          <span className="text-sm text-stone-400 tabular-nums">{total} disponíveis</span>
        </div>

        {/* Category filter */}
        <div className="flex flex-wrap gap-2 mb-8 pb-6 border-b border-stone-200">
          <button
            onClick={() => { setActiveCategory(null); setPage(1); }}
            className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              !activeCategory
                ? "bg-emerald-700 text-white"
                : "bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700"
            }`}
          >
            Todos
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => { setActiveCategory(c.id); setPage(1); }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                activeCategory === c.id
                  ? "bg-emerald-700 text-white"
                  : "bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-stone-200 animate-pulse aspect-[3/4]" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 text-stone-400 text-sm">
            Sem produtos nesta categoria.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map(p => (
              <ProductCard key={p.id} product={p} onAdd={handleAdd} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-10 bg-white rounded-xl border border-stone-100 shadow-sm">
            <Pagination
              page={page} totalPages={totalPages} totalCount={total}
              pageSize={pageSize} onPageChange={setPage}
              onPageSizeChange={() => {}} pageSizeOptions={[20]}
            />
          </div>
        )}
      </section>

      {/* ── Stats bar ─────────────────────────────────────────────────────────── */}
      <section className="bg-emerald-700">
        <div className="max-w-screen-xl mx-auto px-4 py-10
                        grid grid-cols-3 divide-x divide-emerald-600">
          {[
            { value: "+500", label: "Clientes satisfeitos" },
            { value: "+20",  label: "Produtos frescos"     },
            { value: "48h",  label: "Entrega garantida"    },
          ].map(s => (
            <div key={s.label} className="text-center px-4">
              <p className="text-3xl font-extrabold text-white tabular-nums">{s.value}</p>
              <p className="text-sm text-emerald-200 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Sobre nós ─────────────────────────────────────────────────────────── */}
      <section id="sobre" className="bg-stone-50">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-16
                        grid md:grid-cols-2 gap-14 items-center">

          {/* Left: text */}
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">
              Quem somos
            </p>
            <h2 className="text-3xl font-extrabold text-stone-900 leading-snug tracking-tight mb-4">
              Empresa familiar.<br />Qualidade que se sente.
            </h2>
            <p className="text-stone-500 leading-relaxed mb-3 text-sm">
              Somos uma empresa familiar dedicada à produção e distribuição de hortofrutícolas frescos,
              com origem na região de Aveiro.
            </p>
            <p className="text-stone-500 leading-relaxed mb-7 text-sm">
              Trabalhamos diretamente com produtores locais para eliminar intermediários e garantir
              que recebe sempre o que há de mais fresco, ao melhor preço.
            </p>
            <a href="#produtos"
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700
                         bg-emerald-50 border border-emerald-100 hover:bg-emerald-100
                         px-5 py-2.5 rounded-xl transition-colors">
              <Icon icon={IconShoppingCart} size={14} />
              Ver os produtos
            </a>
          </div>

          {/* Right: feature cards */}
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { icon: IconLeaf,  title: "Produção local",      desc: "Parceria direta com agricultores da região" },
              { icon: IconCheck, title: "Sem intermediários",  desc: "Do campo à sua porta, sem perdas de qualidade" },
              { icon: IconTruck, title: "Entrega em 48h",      desc: "Processamos e enviamos no dia seguinte" },
              { icon: IconStar,  title: "Qualidade garantida", desc: "Selecionamos cada produto antes de enviar" },
            ].map(item => (
              <li key={item.title}
                className="flex gap-3 items-start bg-white rounded-2xl p-4 border border-stone-200 shadow-sm">
                <div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-xl bg-emerald-50
                                flex items-center justify-center border border-emerald-100">
                  <Icon icon={item.icon} size={14} className="text-emerald-700" stroke={2} />
                </div>
                <div>
                  <p className="text-sm font-bold text-stone-800">{item.title}</p>
                  <p className="text-xs text-stone-400 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ── CTA final ─────────────────────────────────────────────────────────── */}
      <section className="bg-amber-50 border-t border-amber-100">
        <div className="max-w-screen-xl mx-auto px-4 py-14 text-center">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">
            Pronto para experimentar?
          </p>
          <h3 className="text-2xl font-extrabold text-stone-900 mb-4 tracking-tight">
            Receba os melhores frescos em casa
          </h3>
          <p className="text-stone-500 text-sm mb-7 max-w-sm mx-auto">
            Primeira encomenda? Veja o nosso catálogo e surpreenda-se com a qualidade.
          </p>
          <a href="#produtos"
            className="inline-flex items-center gap-2
                       bg-emerald-700 hover:bg-emerald-600 text-white
                       font-bold px-8 py-3.5 rounded-xl text-sm transition-colors shadow-sm">
            <Icon icon={IconShoppingCart} size={15} />
            Ver o catálogo
          </a>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────────── */}
      <footer className="bg-stone-900 border-t border-stone-800">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-10">

            {/* Brand */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Icon icon={IconLeaf} size={18} className="text-emerald-400" />
                <span className="font-extrabold text-white tracking-tight">Horto Píncaro</span>
              </div>
              <p className="text-xs text-stone-400 leading-relaxed max-w-[200px]">
                Produtos hortofrutícolas frescos da região de Aveiro, entregues em sua casa.
              </p>
            </div>

            {/* Links */}
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Loja</p>
              <ul className="space-y-2.5">
                {[
                  { label: "Ver produtos",  href: "#produtos"      },
                  { label: "Como funciona", href: "#como-funciona" },
                  { label: "Sobre nós",     href: "#sobre"         },
                  { label: "A minha conta", href: "/account"       },
                ].map(l => (
                  <li key={l.label}>
                    <a href={l.href}
                      className="text-sm text-stone-400 hover:text-white transition-colors">
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Contacto</p>
              <ul className="space-y-2.5 text-sm text-stone-400">
                <li>Aveiro, Portugal</li>
                <li>
                  <a href="mailto:geral@hortopincaro.pt" className="hover:text-white transition-colors">
                    geral@hortopincaro.pt
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-stone-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-stone-600">
              © 2026 Horto Píncaro · Todos os direitos reservados
            </p>
            <p className="text-xs text-stone-700">Desenvolvido por AreiasDev</p>
          </div>
        </div>
      </footer>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({
  product: p,
  onAdd,
}: {
  product: Product;
  onAdd: (p: Product) => void;
}) {
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    onAdd(p);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group flex flex-col bg-white rounded-2xl overflow-hidden
                    border border-stone-100 hover:border-emerald-200
                    shadow-sm hover:shadow-lg transition-all duration-300">

      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3] bg-stone-50">
        <img
          src={p.imageUrl} alt={p.name}
          className="w-full h-full object-cover
                     group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={e => (e.currentTarget.src = "https://placehold.co/400x300/fafaf9/a8a29e?text=—")}
          loading="lazy"
        />
        {p.isSeasonal && (
          <span className="absolute top-2.5 left-2.5
                           bg-amber-500 text-white
                           text-[10px] font-bold px-2.5 py-0.5 rounded-full
                           uppercase tracking-wide shadow-sm">
            Da época
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3.5">
        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mb-1">
          {p.categoryName}
        </p>
        <p className="text-sm font-semibold text-stone-900 leading-snug flex-1 mb-3">
          {p.name}
        </p>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-0.5">
            <span className="text-base font-extrabold text-stone-900 tabular-nums">
              {p.pricePerUnit.toFixed(2)}€
            </span>
            <span className="text-[11px] text-stone-400 font-medium">
              /{p.unitType === 1 ? "kg" : "un"}
            </span>
          </div>

          <button
            onClick={handleClick}
            className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg
                        transition-all duration-200 ${
              added
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                : "bg-emerald-700 hover:bg-emerald-600 text-white active:scale-95"
            }`}
          >
            {added ? "✓ Adicionado" : "Adicionar"}
          </button>
        </div>
      </div>
    </div>
  );
}
