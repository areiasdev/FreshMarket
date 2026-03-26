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

export default function HomePage() {
  const [products, setProducts]               = useState<Product[]>([]);
  const [categories, setCategories]           = useState<Category[]>([]);
  const [activeCategory, setActiveCategory]   = useState<number | null>(null);
  const [page, setPage]                       = useState(1);
  const [total, setTotal]                     = useState(0);
  const [loading, setLoading]                 = useState(true);
  const [cartOpen, setCartOpen]               = useState(false);
  const pageSize                              = 20;

  const { isAuthenticated } = useAuth();
  const { addItem } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    client.get(endpoints.categories.getAll).then(res => setCategories(res.data));
  }, []);

  useEffect(() => {
    const fetch = async () => {
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
    fetch();
  }, [page, activeCategory]);

  const totalPages = Math.ceil(total / pageSize);
  const hasOpenedCart = useRef(false);

  const handleAdd = (p: Product) => {
    if (!isAuthenticated) return navigate("/auth");
    addItem(p, p.minQuantity ?? 1);
    if (!hasOpenedCart.current) { hasOpenedCart.current = true; setCartOpen(true); }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar onCartOpen={() => setCartOpen(true)} />

      {/* ── Hero ─────────────────────────────────────────────────────
          RUI: hero escuro cria separação clara. Titulo grande mas não exagerado.
          Subtítulo de suporte em cor mais clara. CTA único e óbvio.       */}
      <section className="bg-emerald-900 py-16 px-4 text-center">
        <p className="text-emerald-400 text-sm font-semibold tracking-widest uppercase mb-4">
          Produção local · Entrega ao domicílio
        </p>
        <h1 className="text-4xl sm:text-5xl font-bold text-white leading-tight tracking-tight mb-4 max-w-2xl mx-auto">
          Frescos da quinta<br />
          <span className="text-emerald-300">à sua porta</span>
        </h1>
        <p className="text-emerald-400 text-base max-w-md mx-auto mb-8 leading-relaxed">
          Frutas, legumes e hortaliças selecionadas, entregues com qualidade garantida.
        </p>
        <a
          href="#produtos"
          className="btn-primary bg-amber-500 hover:bg-amber-400 text-white font-bold px-6 py-3 rounded-lg text-[15px] inline-flex"
        >
          Ver produtos
        </a>
      </section>

      {/* ── Produtos ─────────────────────────────────────────────────
          RUI: categorias como pills discretas, não tabs enormes.
          Grid compacto — mais informação visível.                          */}
      <section id="produtos" className="max-w-screen-xl mx-auto px-4 sm:px-6 py-10">

        {/* Cabeçalho da secção — RUI: hierarquia subtil */}
        <div className="flex items-baseline justify-between mb-5">
          <h2 className="text-xl font-bold text-slate-900">Produtos</h2>
          <span className="text-sm text-slate-400 tabular">{total} disponíveis</span>
        </div>

        {/* Pills de categoria — RUI: pequenas, funcionais */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => { setActiveCategory(null); setPage(1); }}
            className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
              !activeCategory
                ? "bg-emerald-700 text-white border-emerald-700"
                : "bg-white text-slate-600 border-slate-200 hover:border-emerald-400 hover:text-emerald-700"
            }`}
          >
            Todos
          </button>
          {categories.map(c => (
            <button
              key={c.id}
              onClick={() => { setActiveCategory(c.id); setPage(1); }}
              className={`px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                activeCategory === c.id
                  ? "bg-emerald-700 text-white border-emerald-700"
                  : "bg-white text-slate-600 border-slate-200 hover:border-emerald-400 hover:text-emerald-700"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Grid — RUI: cards sem border quando background difere da página */}
        {loading ? (
          <div className="text-center py-20 text-slate-400 text-sm">
            A carregar produtos...
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20 text-slate-400 text-sm">
            Sem produtos nesta categoria.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
            {products.map(p => (
              <div
                key={p.id}
                className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden group hover:shadow-md transition-shadow"
              >
                {/* Imagem — RUI: aspect ratio fixo, nunca crop */}
                <div className="relative overflow-hidden aspect-[4/3]">
                  <img
                    src={p.imageUrl} alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    onError={e => (e.currentTarget.src = "https://placehold.co/200x150/f1f5f9/94a3b8?text=—")}
                  />
                  {p.isSeasonal && (
                    <span className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded tracking-wide uppercase">
                      Sazonal
                    </span>
                  )}
                </div>

                {/* Body — RUI: nome em destaque, preço com peso visual forte */}
                <div className="p-3">
                  {/* RUI: label de categoria como metadado discreto */}
                  <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide mb-0.5">
                    {p.categoryName}
                  </p>
                  <p className="text-sm font-semibold text-slate-800 leading-snug mb-2.5">
                    {p.name}
                  </p>
                  <div className="flex items-center justify-between gap-1">
                    {/* RUI: preço é a info mais importante — maior, mais cor */}
                    <span className="text-emerald-700 font-bold text-[15px] tabular">
                      {p.pricePerUnit.toFixed(2)}€
                      <span className="text-xs font-normal text-slate-400">
                        {p.unitType === 1 ? "/kg" : "/un"}
                      </span>
                    </span>
                    <button
                      onClick={() => handleAdd(p)}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold px-2 py-1 rounded-md transition-colors active:scale-95"
                    >
                      + Add
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-8">
            <Pagination
              page={page} totalPages={totalPages} totalCount={total}
              pageSize={pageSize} onPageChange={setPage}
              onPageSizeChange={() => {}} pageSizeOptions={[20]}
            />
          </div>
        )}
      </section>

      {/* ── Stats ────────────────────────────────────────────────────
          RUI: usar cor com propósito — a secção escura separa visualmente  */}
      <section className="bg-emerald-900 border-t border-emerald-800">
        <div className="max-w-screen-xl mx-auto px-4 py-12 grid grid-cols-3 divide-x divide-emerald-800">
          {[
            { value: "+500", label: "Clientes satisfeitos" },
            { value: "+20",  label: "Produtos frescos"     },
            { value: "48h",  label: "Entrega garantida"    },
          ].map(s => (
            <div key={s.label} className="text-center py-2 px-6">
              {/* RUI: número grande, label pequeno e discreto */}
              <p className="text-3xl font-bold text-white mb-1 tabular">{s.value}</p>
              <p className="text-sm text-emerald-400">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Sobre ───────────────────────────────────────────────────── */}
      <section className="bg-white border-t border-slate-100">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-14 grid md:grid-cols-2 gap-12 items-start">
          <div>
            <p className="text-xs font-semibold text-emerald-700 uppercase tracking-widest mb-3">Sobre nós</p>
            <h2 className="text-2xl font-bold text-slate-900 leading-snug tracking-tight mb-4">
              Empresa familiar,<br />qualidade garantida
            </h2>
            <p className="text-sm text-slate-500 leading-relaxed">
              Somos uma empresa familiar dedicada à produção e distribuição de hortofrutícolas frescos.
              Trabalhamos diretamente com produtores locais para garantir qualidade e frescura em cada entrega.
            </p>
          </div>
          {/* RUI: lista com ícone de check simples, não cards elaborados */}
          <ul className="space-y-4 pt-1">
            {[
              { title: "Produção local",    desc: "Parceria direta com agricultores da região" },
              { title: "Sem intermediários",desc: "Do campo à sua porta, frescura garantida"   },
              { title: "Entrega em 48h",    desc: "Processamos e enviamos com rapidez"          },
            ].map(item => (
              <li key={item.title} className="flex gap-3">
                <span className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-xs font-bold">
                  ✓
                </span>
                <div>
                  <p className="text-sm font-semibold text-slate-800">{item.title}</p>
                  <p className="text-sm text-slate-400">{item.desc}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 border-t border-slate-800 py-6 text-center text-xs text-slate-500">
        <p>© 2026 Horto Píncaro · Todos os direitos reservados</p>
        <p className="mt-1 text-slate-600">Desenvolvido por AreiasDev</p>
      </footer>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}