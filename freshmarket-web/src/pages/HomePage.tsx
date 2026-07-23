import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import client from "../api/client";
import { useAuth } from "../features/auth/useAuth";
import { useCart } from "../features/cart/CartContext";
import { endpoints } from "../lib/endpoints";
import type { Product, Category } from "../types";
import CartDrawer from "../components/Cart/CartDrawer";
import Footer from "../components/layout/Footer";
import Pagination from "../components/utils/Pagination";
import Navbar from "../components/layout/Navbar";
import Icon from "../components/ui/Icon";
import {
  IconLeaf, IconTruck, IconStar, IconShoppingCart,
  IconCheck, IconArrowRight, IconClock, IconPackage, IconSearch,
} from "../components/ui/icons";

// ─── Static content types ─────────────────────────────────────────────────────

interface TrustSignal {
  readonly icon: typeof IconLeaf;
  readonly label: string;
  readonly sublabel: string;
}

interface Step {
  readonly number: string;
  readonly title: string;
  readonly description: string;
  readonly icon: typeof IconLeaf;
}

interface Stat {
  readonly value: string;
  readonly label: string;
}

// Static data is now built inside each component using useTranslation

// ─── HomePage ─────────────────────────────────────────────────────────────────

export default function HomePage() {
  const [products, setProducts]             = useState<Product[]>([]);
  const [categories, setCategories]         = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [searchInput, setSearchInput]       = useState("");
  const [search, setSearch]                 = useState("");
  const [seasonalOnly, setSeasonalOnly]     = useState(false);
  const [page, setPage]                     = useState(1);
  const [total, setTotal]                   = useState(0);
  const [loading, setLoading]               = useState(true);
  const [cartOpen, setCartOpen]             = useState(false);
  const pageSize                            = 20;
  const searchDebounceRef                   = useRef<ReturnType<typeof setTimeout> | null>(null);

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
        const params = new URLSearchParams({ page: String(page), pageSize: String(pageSize) });
        if (activeCategory) params.set("categoryId", String(activeCategory));
        if (search) params.set("search", search);
        if (seasonalOnly) params.set("isSeasonal", "true");
        const res = await client.get(`${endpoints.products.getAll}?${params}`);
        setProducts(res.data.items ?? res.data);
        setTotal(res.data.totalCount ?? 0);
      } finally { setLoading(false); }
    };
    load();
  }, [page, activeCategory, search, seasonalOnly]);

  const totalPages    = Math.ceil(total / pageSize);
  const hasOpenedCart = useRef(false);

  const handleAdd = (p: Product) => {
    if (!isAuthenticated) return navigate("/auth");
    addItem(p, p.minQuantity ?? 1);
    if (!hasOpenedCart.current) { hasOpenedCart.current = true; setCartOpen(true); }
  };

  const handleCategoryChange = (id: number | null) => {
    setActiveCategory(id);
    setPage(1);
  };

  const handleSearchChange = (value: string) => {
    setSearchInput(value);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(() => {
      setSearch(value.trim());
      setPage(1);
    }, 300);
  };

  return (
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <Navbar onCartOpen={() => setCartOpen(true)} />

      <HeroSection
        isAuthenticated={isAuthenticated}
        onShop={() => document.getElementById("produtos")?.scrollIntoView({ behavior: "smooth" })}
        featuredProducts={products}
      />
      <TrustBar />
      <ProductsSection
        products={products}
        categories={categories}
        activeCategory={activeCategory}
        searchInput={searchInput}
        search={search}
        seasonalOnly={seasonalOnly}
        total={total}
        page={page}
        totalPages={totalPages}
        pageSize={pageSize}
        loading={loading}
        onCategoryChange={handleCategoryChange}
        onSearchChange={handleSearchChange}
        onSeasonalToggle={() => { setSeasonalOnly(v => !v); setPage(1); }}
        onPageChange={setPage}
        onAdd={handleAdd}
      />
      <HowItWorksSection />
      <SocialProofSection />
      <AboutSection />
      <FarmGallerySection />
      <CtaSection isAuthenticated={isAuthenticated} />
      <Footer />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </div>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function HeroSection({
  isAuthenticated,
  onShop,
  featuredProducts,
}: {
  isAuthenticated: boolean;
  onShop: () => void;
  featuredProducts: Product[];
}) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="relative overflow-hidden bg-slate-950">
      {/* Background texture */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(16,85,50,0.35),transparent)]" />
      <div className="absolute inset-0 opacity-[0.03] bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiPjxwYXRoIGQ9Ik0zNiAxOGMwLTkuOTQtOC4wNi0xOC0xOC0xOFMwIDguMDYgMCAxOHM4LjA2IDE4IDE4IDE4IDE4LTguMDYgMTgtMTh6bS0yIDBoLTRWMTRoLTR2LTRoLTR2NGgtNHY0SDEwdjRoNHY0aDR2LTRoNHYtNGg0di00eiIvPjwvZz48L2c+PC9zdmc+')]" />

      <div className="relative max-w-screen-xl mx-auto px-4 sm:px-6 pt-20 pb-20 md:pt-28 md:pb-28">
        <div className="grid md:grid-cols-[1fr_420px] gap-12 items-center">

          {/* ── Copy ── */}
          <div>
            {/* Eyebrow */}
            <div className="inline-flex items-center gap-2 bg-emerald-950/60 border border-emerald-700/40 rounded-full px-4 py-1.5 mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-emerald-400 tracking-wide">
                {t("home.eyebrow")}
              </span>
            </div>

            {/* Headline — desire-first, not product-first (Breakthrough Advertising) */}
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-white leading-[1.0] tracking-tight mb-6">
              {t("home.heroTitle")}<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-emerald-300">
                {t("home.heroGradient")}
              </span>
            </h1>

            {/* Subheadline — concrete, emotional (Made to Stick) */}
            <p className="text-slate-400 text-lg leading-relaxed mb-8 max-w-lg">
              {t("home.heroSub")}
            </p>

            {/* CTAs — primary + secondary (Don't Make Me Think: one main action) */}
            <div className="flex flex-wrap gap-3 mb-10">
              <button
                onClick={onShop}
                className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400
                           text-white font-bold px-7 py-3.5 rounded-xl text-sm
                           transition-colors shadow-lg shadow-emerald-900/40"
              >
                <Icon icon={IconShoppingCart} size={15} />
                {t("home.heroShop")}
              </button>
              {!isAuthenticated && (
                <button
                  onClick={() => navigate("/auth")}
                  className="inline-flex items-center gap-2
                             bg-white/5 hover:bg-white/10 text-white
                             font-semibold px-7 py-3.5 rounded-xl text-sm
                             border border-white/10 transition-colors"
                >
                  {t("home.heroRegister")}
                  <Icon icon={IconArrowRight} size={14} />
                </button>
              )}
            </div>

            {/* Micro-proof (Cialdini: Social Proof) */}
            <div className="flex items-center gap-3 pt-6 border-t border-white/10">
              <div className="flex-shrink-0 w-9 h-9 rounded-full bg-emerald-800 border-2 border-slate-950
                             flex items-center justify-center">
                <Icon icon={IconLeaf} size={16} className="text-emerald-300" />
              </div>
              <div>
                <div className="flex gap-0.5 mb-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Icon key={i} icon={IconStar} size={11} className="text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-slate-400">
                  <span className="text-white font-semibold">{t("home.heroSocialProofCount")}</span>{t("home.heroSocialProofText")}
                </p>
              </div>
            </div>
          </div>

          {/* ── Visual panel ── */}
          <div className="hidden md:block">
            <div className="relative">
              {/* Main card */}
              <div className="rounded-3xl bg-gradient-to-br from-emerald-900/60 to-slate-900/80
                              border border-white/10 p-6 backdrop-blur-sm">

                {/* Header */}
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-500/20 border border-emerald-500/30
                                    flex items-center justify-center">
                      <Icon icon={IconLeaf} size={16} className="text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">FreshMarket</p>
                      <p className="text-[10px] text-slate-400">{t("home.heroOpen")}</p>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#34d399]" />
                </div>

                {/* Featured products preview — real, live catalog data */}
                <div className="space-y-2.5 mb-5">
                  {featuredProducts.slice(0, 3).map(p => (
                    <div key={p.id}
                      className="flex items-center justify-between bg-white/5 rounded-xl px-3.5 py-2.5 border border-white/5">
                      <div>
                        <p className="text-sm font-semibold text-white">{p.name}</p>
                        <p className="text-xs text-slate-400 tabular-nums">
                          {p.pricePerUnit.toFixed(2)}€/{p.unitType === 1 ? "kg" : "un"}
                        </p>
                      </div>
                      {p.isSeasonal && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-amber-500/15 text-amber-300 border-amber-500/20">
                          {t("home.heroProdTagSeasonal")}
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* CTA in card */}
                <button
                  onClick={onShop}
                  className="w-full flex items-center justify-center gap-2
                             bg-emerald-500 hover:bg-emerald-400 text-white
                             font-semibold text-sm py-2.5 rounded-xl transition-colors">
                  <Icon icon={IconShoppingCart} size={14} />
                  {t("home.heroCatalog")}
                </button>
              </div>

              {/* Floating badge — Cialdini: Authority */}
              <div className="absolute -top-4 -right-4 bg-amber-500 text-white rounded-2xl px-3.5 py-2 shadow-xl">
                <p className="text-[10px] font-bold uppercase tracking-wide">Entrega</p>
                <p className="text-lg font-extrabold leading-none">48h</p>
              </div>

              {/* Floating badge — Social Proof */}
              <div className="absolute -bottom-4 -left-4 bg-white rounded-2xl px-3.5 py-2.5 shadow-xl">
                <div className="flex gap-0.5 mb-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Icon key={i} icon={IconStar} size={10} className="text-amber-400" />
                  ))}
                </div>
                <p className="text-xs font-bold text-slate-800">{t("home.heroClientsCount")}</p>
                <p className="text-[10px] text-slate-400">{t("home.heroClientsSub")}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Trust Bar ────────────────────────────────────────────────────────────────

function TrustBar() {
  const { t } = useTranslation();
  const TRUST_SIGNALS: readonly TrustSignal[] = [
    { icon: IconLeaf,  label: t("home.trustLocal"),    sublabel: t("home.trustLocalSub")    },
    { icon: IconTruck, label: t("home.trustDelivery"), sublabel: t("home.trustDeliverySub") },
    { icon: IconStar,  label: t("home.trustFamilies"), sublabel: t("home.trustFamiliesSub") },
    { icon: IconCheck, label: t("home.trustQuality"),  sublabel: t("home.trustQualitySub")  },
  ];
  return (
    <section className="bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-slate-100 dark:divide-slate-800">
          {TRUST_SIGNALS.map(signal => (
            <div key={signal.label}
              className="flex items-center gap-3 px-6 py-5">
              <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                <Icon icon={signal.icon} size={16} className="text-emerald-700" />
              </div>
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{signal.label}</p>
                <p className="text-xs text-slate-400 dark:text-slate-400">{signal.sublabel}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── How It Works ─────────────────────────────────────────────────────────────

function HowItWorksSection() {
  const { t } = useTranslation();
  const STEPS: readonly Step[] = [
    { number: "01", icon: IconShoppingCart, title: t("home.step1Title"), description: t("home.step1Desc") },
    { number: "02", icon: IconClock,        title: t("home.step2Title"), description: t("home.step2Desc") },
    { number: "03", icon: IconTruck,        title: t("home.step3Title"), description: t("home.step3Desc") },
  ];
  return (
    <section id="como-funciona" className="bg-slate-50 dark:bg-slate-800">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-20">

        {/* Section header */}
        <div className="text-center max-w-xl mx-auto mb-14">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">
            {t("home.howEyebrow")}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            {t("home.howTitle")}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            {t("home.howSub")}
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 relative">
          {/* Connector line (desktop) */}
          <div className="hidden sm:block absolute top-10 left-[calc(16.67%+1.5rem)] right-[calc(16.67%+1.5rem)] h-px bg-slate-200 dark:bg-slate-600" />

          {STEPS.map(step => (
            <div key={step.number} className="relative flex flex-col items-center text-center">
              {/* Step number circle */}
              <div className="relative mb-5">
                <div className="w-20 h-20 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-sm
                                flex items-center justify-center">
                  <Icon icon={step.icon} size={28} className="text-emerald-700" />
                </div>
                <span className="absolute -top-2.5 -right-2.5 w-6 h-6 rounded-full
                                 bg-emerald-700 text-white text-[10px] font-extrabold
                                 flex items-center justify-center">
                  {step.number}
                </span>
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white mb-2">{step.title}</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed max-w-[240px]">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Products Section ─────────────────────────────────────────────────────────

interface ProductsSectionProps {
  products: Product[];
  categories: Category[];
  activeCategory: number | null;
  searchInput: string;
  search: string;
  seasonalOnly: boolean;
  total: number;
  page: number;
  totalPages: number;
  pageSize: number;
  loading: boolean;
  onCategoryChange: (id: number | null) => void;
  onSearchChange: (value: string) => void;
  onSeasonalToggle: () => void;
  onPageChange: (page: number) => void;
  onAdd: (p: Product) => void;
}

function ProductsSection({
  products, categories, activeCategory, searchInput, search, seasonalOnly, total,
  page, totalPages, pageSize, loading,
  onCategoryChange, onSearchChange, onSeasonalToggle, onPageChange, onAdd,
}: ProductsSectionProps) {
  const { t } = useTranslation();
  return (
    <section id="produtos" className="bg-white dark:bg-slate-900">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-20">

        {/* Section header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-2">
              {t("home.catalogEyebrow")}
            </p>
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {t("home.catalogTitle")}
            </h2>
          </div>
          <p className="text-sm text-slate-400 dark:text-slate-400 tabular-nums">
            {total} {t("home.productAvailable", { count: total })}
          </p>
        </div>

        {/* Search bar */}
        <div className="relative mb-6">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 pointer-events-none">
            <Icon icon={IconSearch} size={16} />
          </span>
          <input
            type="search"
            value={searchInput}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={t("home.searchPlaceholder")}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-sm text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent shadow-sm"
          />
        </div>

        {/* Category filter + seasonal toggle */}
        <div className="flex flex-wrap gap-2 mb-10">
          <CategoryPill
            label={t("home.filterAll")}
            active={activeCategory === null && !seasonalOnly}
            onClick={() => { onCategoryChange(null); if (seasonalOnly) onSeasonalToggle(); }}
          />
          {categories.map(c => (
            <CategoryPill
              key={c.id}
              label={c.name}
              active={activeCategory === c.id}
              onClick={() => onCategoryChange(c.id)}
            />
          ))}
          <button
            onClick={onSeasonalToggle}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              seasonalOnly
                ? "bg-amber-500 border-amber-500 text-white"
                : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
            }`}
          >
            {t("home.filterSeasonal")}
          </button>
        </div>

        {/* Product grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="rounded-2xl bg-slate-100 dark:bg-slate-700 animate-pulse aspect-[3/4]" />
            ))}
          </div>
        ) : products.length === 0 ? (
          search ? (
            <div className="text-center py-20">
              <Icon icon={IconSearch} size={40} className="mx-auto mb-3 text-slate-300 dark:text-slate-600" />
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">{t("home.noResults", { search })}</p>
              <p className="text-xs text-slate-400">{t("home.noResultsHint")}</p>
            </div>
          ) : (
            <EmptyProducts />
          )
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {products.map(p => (
              <ProductCard key={p.id} product={p} onAdd={onAdd} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="mt-10 border border-slate-100 dark:border-slate-700 rounded-xl overflow-hidden">
            <Pagination
              page={page} totalPages={totalPages} totalCount={total}
              pageSize={pageSize} onPageChange={onPageChange}
              onPageSizeChange={() => {}} pageSizeOptions={[20]}
            />
          </div>
        )}
      </div>
    </section>
  );
}

function CategoryPill({
  label, active, onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
        active
          ? "bg-slate-900 text-white shadow-sm dark:bg-slate-100 dark:text-slate-900"
          : "bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 dark:hover:text-white"
      }`}
    >
      {label}
    </button>
  );
}

function EmptyProducts() {
  const { t } = useTranslation();
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-700 flex items-center justify-center mb-4">
        <Icon icon={IconPackage} size={24} className="text-slate-400 dark:text-slate-400" />
      </div>
      <p className="text-sm font-semibold text-slate-600 dark:text-slate-300 mb-1">{t("home.noCategory")}</p>
      <p className="text-xs text-slate-400 dark:text-slate-400">{t("home.noCategoryHint")}</p>
    </div>
  );
}

// ─── Social Proof ─────────────────────────────────────────────────────────────

function SocialProofSection() {
  const { t } = useTranslation();
  const STATS: readonly Stat[] = [
    { value: "+500", label: t("home.statFamilies") },
    { value: "+30",  label: t("home.statProducts") },
    { value: "48h",  label: t("home.statFarm")     },
    { value: "100%", label: t("home.statLocal")    },
  ];
  return (
    <section className="bg-slate-950">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-20">

        <div className="text-center mb-12">
          <p className="text-xs font-bold text-emerald-500 uppercase tracking-widest mb-3">
            {t("home.statsEyebrow")}
          </p>
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            {t("home.statsTitle")}
          </h2>
        </div>

        {/* Stats — Cialdini: Social Proof with numbers */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {STATS.map(stat => (
            <div key={stat.label} className="text-center">
              <p className="text-4xl font-extrabold text-white tabular-nums mb-1">{stat.value}</p>
              <p className="text-sm text-slate-500">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── About Section ────────────────────────────────────────────────────────────

function AboutSection() {
  const { t } = useTranslation();
  return (
    <section id="sobre" className="bg-white dark:bg-slate-900">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-20">
        <div className="grid md:grid-cols-2 gap-16 items-center">

          {/* Left: story (Cialdini: Unity + Liking) */}
          <div>
            <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">
              {t("home.aboutEyebrow")}
            </p>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-snug tracking-tight mb-5">
              {t("home.aboutTitle")}<br />
              <span className="text-emerald-700">{t("home.aboutTitleGreen")}</span>
            </h2>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-4 text-sm">
              {t("home.aboutP1")}
            </p>
            <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-8 text-sm">
              {t("home.aboutP2")}
            </p>
            <a href="#produtos"
              className="inline-flex items-center gap-2 text-sm font-bold text-emerald-700
                         hover:text-emerald-900 transition-colors group">
              {t("home.aboutCta")}
              <Icon icon={IconArrowRight} size={14}
                className="transition-transform group-hover:translate-x-1" />
            </a>
          </div>

          {/* Right: value pillars */}
          <div className="grid grid-cols-2 gap-4">
            {[
              {
                icon: IconLeaf,
                title: t("home.pillar1"),
                desc: t("home.pillar1Desc"),
                bg: "bg-emerald-50",
                iconBg: "bg-emerald-100",
                iconColor: "text-emerald-700 dark:text-emerald-400",
              },
              {
                icon: IconCheck,
                title: t("home.pillar2"),
                desc: t("home.pillar2Desc"),
                bg: "bg-slate-50",
                iconBg: "bg-slate-200",
                iconColor: "text-slate-700 dark:text-slate-300",
              },
              {
                icon: IconTruck,
                title: t("home.pillar3"),
                desc: t("home.pillar3Desc"),
                bg: "bg-amber-50",
                iconBg: "bg-amber-100",
                iconColor: "text-amber-700 dark:text-amber-400",
              },
              {
                icon: IconStar,
                title: t("home.pillar4"),
                desc: t("home.pillar4Desc"),
                bg: "bg-slate-50",
                iconBg: "bg-slate-200",
                iconColor: "text-slate-700 dark:text-slate-300",
              },
            ].map(item => (
              <div key={item.title}
                className={`${item.bg} rounded-2xl p-5 border border-slate-100 dark:border-slate-700 dark:bg-slate-800`}>
                <div className={`w-9 h-9 rounded-xl ${item.iconBg} flex items-center justify-center mb-3 dark:bg-slate-700`}>
                  <Icon icon={item.icon} size={16} className={item.iconColor} />
                </div>
                <p className="text-sm font-bold text-slate-900 dark:text-white mb-1">{item.title}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Farm Gallery ─────────────────────────────────────────────────────────────

interface GalleryPhoto {
  readonly src: string;
  readonly alt: string;
  readonly caption: string;
}

// Coloca as tuas fotos em: freshmarket-web/public/images/farm/
// Referencia-as como /images/farm/nome-do-ficheiro.jpg
const PLACEHOLDER = "/images/placeholder.svg";

function FarmGallerySection() {
  const { t } = useTranslation();
  const GALLERY_PHOTOS: readonly GalleryPhoto[] = [
    { src: "/images/farm/foto-1.avif", alt: t("home.galleryAlt1"), caption: t("home.galleryCaption1") },
    { src: "/images/farm/foto-2.webp", alt: t("home.galleryAlt2"), caption: t("home.galleryCaption2") },
    { src: "/images/farm/foto-3.avif", alt: t("home.galleryAlt3"), caption: t("home.galleryCaption3") },
    { src: "/images/farm/foto-4.jpg",  alt: t("home.galleryAlt4"), caption: t("home.galleryCaption4") },
    { src: "/images/farm/foto-5.avif", alt: t("home.galleryAlt5"), caption: t("home.galleryCaption5") },
  ];
  return (
    <section className="bg-slate-50 dark:bg-slate-800">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-20">

        {/* Header */}
        <div className="text-center max-w-xl mx-auto mb-12">
          <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mb-3">
            {t("home.galleryEyebrow")}
          </p>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight mb-4">
            {t("home.galleryTitle")}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
            {t("home.gallerySub")}
          </p>
        </div>

        {/* Magazine-style grid: large left + 2 right stacked, then 2 bottom */}
        <div className="grid grid-cols-2 sm:grid-cols-3 grid-rows-2 gap-3 h-[480px] sm:h-[560px]">

          {/* Photo 1 — large, spans 2 rows on the left */}
          <GalleryPhoto photo={GALLERY_PHOTOS[0]} className="row-span-2" />

          {/* Photo 2 — top right */}
          <GalleryPhoto photo={GALLERY_PHOTOS[1]} />

          {/* Photo 3 — top far-right (hidden on mobile) */}
          <GalleryPhoto photo={GALLERY_PHOTOS[2]} className="hidden sm:block" />

          {/* Photo 4 — bottom middle */}
          <GalleryPhoto photo={GALLERY_PHOTOS[3]} />

          {/* Photo 5 — bottom far-right (hidden on mobile) */}
          <GalleryPhoto photo={GALLERY_PHOTOS[4]} className="hidden sm:block" />
        </div>
      </div>
    </section>
  );
}

function GalleryPhoto({
  photo,
  className = "",
}: {
  photo: GalleryPhoto;
  className?: string;
}) {
  return (
    <div className={`group relative overflow-hidden rounded-2xl bg-slate-200 dark:bg-slate-700 ${className}`}>
      <img
        src={photo.src}
        alt={photo.alt}
        onError={e => (e.currentTarget.src = PLACEHOLDER)}
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        loading="lazy"
      />
      {/* Caption overlay on hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/70 via-transparent to-transparent
                      opacity-0 group-hover:opacity-100 transition-opacity duration-300
                      flex items-end p-4">
        <p className="text-white text-sm font-semibold translate-y-2 group-hover:translate-y-0
                      transition-transform duration-300">
          {photo.caption}
        </p>
      </div>
    </div>
  );
}

// ─── CTA Section ──────────────────────────────────────────────────────────────

function CtaSection({ isAuthenticated }: { isAuthenticated: boolean }) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <section className="bg-emerald-700">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-20 text-center">
        <div className="max-w-xl mx-auto">
          <div className="inline-flex items-center gap-2 bg-emerald-600 rounded-full
                          px-4 py-1.5 mb-6">
            <Icon icon={IconLeaf} size={12} className="text-emerald-200" />
            <span className="text-xs font-semibold text-emerald-100 tracking-wide">
              {t("home.ctaEyebrow")}
            </span>
          </div>

          <h2 className="text-4xl font-extrabold text-white tracking-tight mb-4 leading-tight">
            {t("home.ctaTitle").split("\n").map((line, i) => (
              <span key={i}>{i > 0 && <br />}{line}</span>
            ))}
          </h2>
          <p className="text-emerald-200 text-base leading-relaxed mb-8">
            {t("home.ctaSub")}
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <a href="#produtos"
              className="inline-flex items-center gap-2
                         bg-white hover:bg-slate-50 text-emerald-800
                         font-bold px-8 py-3.5 rounded-xl text-sm
                         transition-colors shadow-lg shadow-emerald-900/20">
              <Icon icon={IconShoppingCart} size={15} />
              {t("home.ctaShop")}
            </a>
            {!isAuthenticated && (
              <button
                onClick={() => navigate("/auth")}
                className="inline-flex items-center gap-2
                           bg-emerald-600 hover:bg-emerald-500 text-white
                           font-semibold px-8 py-3.5 rounded-xl text-sm
                           border border-emerald-500 transition-colors">
                {t("home.ctaRegister")}
                <Icon icon={IconArrowRight} size={14} />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
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
  const { t } = useTranslation();
  const [added, setAdded] = useState(false);

  const handleClick = () => {
    onAdd(p);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="group flex flex-col bg-white dark:bg-slate-800 rounded-2xl overflow-hidden
                    border border-slate-100 dark:border-slate-700 hover:border-slate-200 dark:hover:border-slate-600
                    hover:shadow-lg transition-all duration-300">

      {/* Image */}
      <div className="relative overflow-hidden aspect-[4/3] bg-slate-50 dark:bg-slate-700">
        <img
          src={p.imageUrl} alt={p.name}
          className="w-full h-full object-cover
                     group-hover:scale-105 transition-transform duration-500 ease-out"
          onError={e => (e.currentTarget.src = "/images/placeholder.svg")}
          loading="lazy"
        />
        {/* Seasonal badge — Cialdini: Scarcity */}
        {p.isSeasonal && (
          <span className="absolute top-2.5 left-2.5
                           bg-amber-500 text-white
                           text-[10px] font-bold px-2.5 py-0.5 rounded-full
                           uppercase tracking-wide shadow-sm">
            {t("home.seasonalBadge")}
          </span>
        )}
        {/* Stock scarcity signal */}
        {p.stockQuantity <= 5 && p.stockQuantity > 0 && (
          <span className="absolute top-2.5 right-2.5
                           bg-red-500/90 text-white
                           text-[10px] font-bold px-2 py-0.5 rounded-full">
            {p.unitType === 1
              ? t("home.kgRemaining", { count: p.stockQuantity % 1 === 0 ? p.stockQuantity : p.stockQuantity.toFixed(1) })
              : t("home.unitsRemaining", { count: p.stockQuantity })}
          </span>
        )}
      </div>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3.5">
        <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest mb-1">
          {p.categoryName}
        </p>
        <p className="text-sm font-semibold text-slate-900 dark:text-white leading-snug flex-1 mb-1">
          {p.name}
        </p>

        <div className="flex items-center gap-1 h-4 mb-2">
          {p.reviewCount > 0 && (
            <>
              <Icon icon={IconStar} size={11} className="text-amber-400" />
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 tabular-nums">
                {p.averageRating.toFixed(1)}
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">
                ({p.reviewCount})
              </span>
            </>
          )}
        </div>

        <div className="flex items-center justify-between gap-2">
          <div className="flex items-baseline gap-0.5">
            <span className="text-base font-extrabold text-slate-900 dark:text-white tabular-nums">
              {p.pricePerUnit.toFixed(2)}€
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500 font-medium">
              /{p.unitType === 1 ? "kg" : "un"}
            </span>
          </div>

          <button
            onClick={handleClick}
            data-testid="add-to-cart"
            className={`flex-shrink-0 w-[92px] text-center text-xs font-bold px-3 py-1.5 rounded-lg
                        whitespace-nowrap transition-all duration-200 ${
              added
                ? "bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-700"
                : "bg-slate-900 hover:bg-slate-700 text-white active:scale-95 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
            }`}
          >
            {added ? t("home.added") : t("home.addToCart")}
          </button>
        </div>
      </div>
    </div>
  );
}
