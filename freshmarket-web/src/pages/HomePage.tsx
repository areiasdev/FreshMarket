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
import { IconCheck, IconLeaf, IconTruck, IconStar } from "../components/ui/icons";

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

  const totalPages      = Math.ceil(total / pageSize);
  const hasOpenedCart   = useRef(false);

  const handleAdd = (p: Product) => {
    if (!isAuthenticated) return navigate("/auth");
    addItem(p, p.minQuantity ?? 1);
    if (!hasOpenedCart.current) { hasOpenedCart.current = true; setCartOpen(true); }
  };

  return (
    <div className="min-h-screen bg-white">
      <Navbar onCartOpen={() => setCartOpen(true)} />

      {/* ── Hero ─────────────────────────────────────────────────────────────
          Fundo escuro simples, tipografia forte, sem imagens de fundo.
          O produto é a estrela — o hero só contextualiza.                    */}
      <section className="bg-emerald-950 px-4 py-20">
        <div className="max-w-screen-xl mx-auto flex flex-col md:flex-row items-center gap-12">

          {/* Copy */}
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-emerald-900 text-emerald-400
                            text-xs font-semibold px-3 py-1.5 rounded-full mb-6 uppercase tracking-widest">
              <Icon icon={IconLeaf} size={12} />
              Produção local · Entrega ao domicílio
            </div>
            <h1 className="text-4xl sm:text-5xl font-bold text-white leading-[1.15] tracking-tight mb-5">
              Frescos da quinta<br />
              <span className="text-emerald-400">à sua porta</span>
            </h1>
            <p className="text-slate-400 text-base max-w-md mx-auto md:mx-0 mb-8 leading-relaxed">
              Frutas, legumes e hortaliças selecionadas, colhidas e entregues com qualidade garantida.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
              <a href="#produtos"
                className="inline-flex items-center justify-center gap-2
                           bg-emerald-500 hover:bg-emerald-400 text-white
                           font-bold px-6 py-3 rounded-lg text-sm transition-colors">
                Ver produtos
              </a>
              <a href="#sobre"
                className="inline-flex items-center justify-center gap-2
                           bg-emerald-900 hover:bg-emerald-800 text-emerald-300
                           font-semibold px-6 py-3 rounded-lg text-sm transition-colors">
                Saber mais
              </a>
            </div>
          </div>

          {/* Trust badges — lado direito no desktop */}
          <div className="hidden md:flex flex-col gap-3 flex-shrink-0">
            {[
              { icon: IconLeaf,  title: "Produção local",  desc: "Parceria com agricultores da região" },
              { icon: IconTruck, title: "Entrega em 48h",  desc: "Direto do campo para a sua porta"    },
              { icon: IconStar,  title: "+500 clientes",   desc: "Qualidade reconhecida pela comunidade" },
            ].map(b => (
              <div key={b.title}
                className="flex items-center gap-3 bg-emerald-900/50 rounded-xl px-4 py-3 min-w-[240px]">
                <div className="w-8 h-8 rounded-lg bg-emerald-800 flex items-center justify-center flex-shrink-0">
                  <Icon icon={b.icon} size={15} className="text-emerald-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{b.title}</p>
                  <p className="text-xs text-slate-400">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Produtos ─────────────────────────────────────────────────────────
          Fundo branco — o produto destaca sem competição visual.
          Cards com imagem grande, nome claro, preço em destaque.            */}
      <section id="produtos" className="max-w-screen-xl mx-auto px-4 sm:px-6 py-12">

        {/* Cabeçalho da secção */}
        <div className="flex items-baseline justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Os nossos produtos</h2>
            <p className="text-sm text-slate-400 mt-1">{total} produtos disponíveis</p>
          </div>
        </div>

        {/* Filtro de categorias */}
        <div className="flex flex-wrap gap-2 mb-8">
          <button
            onClick={() => { setActiveCategory(null); setPage(1); }}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              !activeCategory
                ? "bg-emerald-700 text-white border-emerald-700"
                : "bg-white text-slate-500 border-slate-200 hover:border-emerald-400 hover:text-emerald-700"
            }`}
          >
            Todos
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => { setActiveCategory(c.id); setPage(1); }}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                activeCategory === c.id
                  ? "bg-emerald-700 text-white border-emerald-700"
                  : "bg-white text-slate-500 border-slate-200 hover:border-emerald-400 hover:text-emerald-700"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Grid de produtos */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-xl bg-slate-100 animate-pulse aspect-[3/4]" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-24 text-slate-400 text-sm">
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
          <div className="mt-10">
            <Pagination
              page={page} totalPages={totalPages} totalCount={total}
              pageSize={pageSize} onPageChange={setPage}
              onPageSizeChange={() => {}} pageSizeOptions={[20]}
            />
          </div>
        )}
      </section>

      {/* ── Stats ────────────────────────────────────────────────────────────
          Divider visual entre produtos e sobre, usando o verde escuro.      */}
      <section className="border-y border-slate-100 bg-slate-50">
        <div className="max-w-screen-xl mx-auto px-4 py-10
                        grid grid-cols-3 divide-x divide-slate-200">
          {[
            { value: "+500", label: "Clientes satisfeitos" },
            { value: "+20",  label: "Produtos frescos"     },
            { value: "48h",  label: "Entrega garantida"    },
          ].map(s => (
            <div key={s.label} className="text-center px-6">
              <p className="text-3xl font-bold text-emerald-800 tabular-nums">{s.value}</p>
              <p className="text-sm text-slate-500 mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Sobre ────────────────────────────────────────────────────────────*/}
      <section id="sobre" className="bg-white">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-16
                        grid md:grid-cols-2 gap-12 items-center">
          <div>
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-widest mb-3">
              Sobre nós
            </p>
            <h2 className="text-3xl font-bold text-slate-900 leading-snug tracking-tight mb-5">
              Empresa familiar,<br />qualidade garantida
            </h2>
            <p className="text-slate-500 leading-relaxed mb-6 text-sm">
              Somos uma empresa familiar dedicada à produção e distribuição de hortofrutícolas frescos.
              Trabalhamos diretamente com produtores locais para garantir qualidade e frescura em cada entrega.
            </p>
            <a href="#produtos"
              className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-700
                         hover:text-emerald-900 transition-colors">
              Ver os nossos produtos →
            </a>
          </div>

          <ul className="space-y-4">
            {[
              { title: "Produção local",     desc: "Parceria direta com agricultores da região de Aveiro" },
              { title: "Sem intermediários", desc: "Do campo à sua porta, frescura garantida em cada entrega" },
              { title: "Entrega em 48h",     desc: "Processamos e enviamos rapidamente após a sua encomenda" },
              { title: "Qualidade garantida",desc: "Selecionamos cuidadosamente cada produto antes de enviar" },
            ].map(item => (
              <li key={item.title} className="flex gap-4 items-start">
                <div className="mt-0.5 flex-shrink-0 w-6 h-6 rounded-full bg-emerald-100
                                flex items-center justify-center">
                  <Icon icon={IconCheck} size={12} className="text-emerald-700" stroke={2.5} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                  <p className="text-sm text-slate-400 mt-0.5">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-emerald-950 border-t border-emerald-900 py-8 px-4">
        <div className="max-w-screen-xl mx-auto flex flex-col sm:flex-row
                        items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white">
            <Icon icon={IconLeaf} size={16} className="text-emerald-400" />
            <span className="font-bold text-sm">Horto Píncaro</span>
          </div>
          <p className="text-xs text-slate-500">
            © 2026 Horto Píncaro · Todos os direitos reservados
          </p>
          <p className="text-xs text-slate-600">Desenvolvido por AreiasDev</p>
        </div>
      </footer>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
// Separado para clareza. Imagem grande, informação focada, CTA claro.
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
    setTimeout(() => setAdded(false), 1200);
  };

  return (
    <div className="group flex flex-col bg-white rounded-2xl overflow-hidden
                    border border-slate-100 hover:border-slate-200
                    shadow-sm hover:shadow-md transition-all duration-200">

      {/* Imagem — proporção 1:1, object-cover, zoom suave no hover */}
      <div className="relative overflow-hidden aspect-square bg-slate-50">
        <img
          src={p.imageUrl} alt={p.name}
          className="w-full h-full object-cover
                     group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={e => (e.currentTarget.src = "https://placehold.co/300x300/f8fafc/94a3b8?text=—")}
          loading="lazy"
        />

        {/* Badge sazonal */}
        {p.isSeasonal && (
          <span className="absolute top-2.5 left-2.5
                           bg-amber-500 text-white
                           text-[10px] font-bold px-2 py-0.5 rounded-full
                           uppercase tracking-wide shadow-sm">
            Sazonal
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3.5">
        {/* Categoria — metadado discreto */}
        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-1">
          {p.categoryName}
        </p>

        {/* Nome — peso visual principal */}
        <p className="text-sm font-semibold text-slate-900 leading-snug flex-1 mb-3">
          {p.name}
        </p>

        {/* Footer do card: preço + botão */}
        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-base font-bold text-emerald-700 tabular-nums">
              {p.pricePerUnit.toFixed(2)}€
            </span>
            <span className="text-[11px] text-slate-400 ml-0.5">
              {p.unitType === 1 ? "/kg" : "/un"}
            </span>
          </div>

          <button
            onClick={handleClick}
            className={`flex-shrink-0 text-xs font-bold px-3 py-1.5 rounded-lg
                        transition-all duration-200 ${
              added
                ? "bg-emerald-100 text-emerald-700"
                : "bg-emerald-700 hover:bg-emerald-800 text-white active:scale-95"
            }`}
          >
            {added ? "✓" : "+ Add"}
          </button>
        </div>
      </div>
    </div>
  );
}