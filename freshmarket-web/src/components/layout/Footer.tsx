import { useTranslation } from "react-i18next";
import Icon from "../ui/Icon";
import { IconLeaf, IconCheck } from "../ui/icons";

export default function Footer() {
  const { t } = useTranslation();
  const navLinks = [
    { label: t("home.footerViewProducts"), href: "/#produtos"      },
    { label: t("home.footerHowItWorks"),   href: "/#como-funciona" },
    { label: t("home.footerAbout"),        href: "/#sobre"         },
    { label: t("home.footerMyAccount"),    href: "/account"        },
  ];
  return (
    <footer className="bg-slate-950 border-t border-slate-800">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 pt-14 pb-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-10 mb-12">

          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-7 h-7 rounded-lg bg-emerald-900 border border-emerald-700/50
                              flex items-center justify-center">
                <Icon icon={IconLeaf} size={14} className="text-emerald-400" />
              </div>
              <span className="font-extrabold text-white tracking-tight">FreshMarket</span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed max-w-[200px]">
              {t("home.footerDesc")}
            </p>
          </div>

          {/* Nav links */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5">{t("home.footerNav")}</p>
            <ul className="space-y-3">
              {navLinks.map(l => (
                <li key={l.href}>
                  <a href={l.href}
                    className="text-sm text-slate-500 hover:text-white transition-colors">
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-5">{t("home.footerContact")}</p>
            <ul className="space-y-3 text-sm text-slate-500">
              <li className="flex items-center gap-2">
                <Icon icon={IconLeaf} size={12} className="text-emerald-600 flex-shrink-0" />
                Aveiro, Portugal
              </li>
              <li>
                <a href="mailto:geral@freshmarketprod.com"
                  className="hover:text-white transition-colors">
                  geral@freshmarketprod.com
                </a>
              </li>
            </ul>

            {/* Trust seal */}
            <div className="mt-6 inline-flex items-center gap-2 bg-slate-900 rounded-lg
                            px-3 py-2 border border-slate-800">
              <Icon icon={IconCheck} size={12} className="text-emerald-500" />
              <span className="text-xs text-slate-400">{t("home.footerNational")}</span>
            </div>
          </div>
        </div>

        <div className="border-t border-slate-800 pt-6 flex flex-col sm:flex-row
                        items-center justify-between gap-2">
          <p className="text-xs text-slate-600">
            {t("home.footerCopyright")}
          </p>
          <div className="flex items-center gap-4">
            <a href="/privacidade" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
              {t("home.footerPrivacy")}
            </a>
            <a href="/termos" className="text-xs text-slate-600 hover:text-slate-400 transition-colors">
              {t("home.footerTerms")}
            </a>
            <p className="text-xs text-slate-700">{t("home.footerDev")}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
