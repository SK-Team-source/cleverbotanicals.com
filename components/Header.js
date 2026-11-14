'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { locales, t } from '../lib/i18n';
import { useBag } from './BagProvider';

const LOCALE_PATH_PATTERN = /^\/(en|fr|de|es|pt|pl)(?=\/|$)/;

export default function Header({ locale }) {
  const pathname = usePathname();
  const d = t(locale);
  const { items, openBag } = useBag();
  const itemCount = items.reduce((count, item) => count + item.quantity, 0);

  const languagePath = (language) => {
    const localizedPath = pathname?.replace(LOCALE_PATH_PATTERN, `/${language}`);
    return localizedPath && localizedPath !== pathname
      ? localizedPath
      : pathname?.startsWith(`/${locale}`)
        ? `/${language}${pathname.slice(locale.length + 1)}`
        : `/${language}`;
  };

  return (
    <>
      <div className="announcement">
        <span>{d.announcement}</span>
        <span aria-hidden="true">·</span>
        <span>{d.announcementPromo}</span>
      </div>
      <header className="site-header">
        <div className="container header-inner">
          <Link className="brand" href={`/${locale}`} aria-label="Clever Botanics home">
            <img
              src="https://cleverbotanics.com/cdn/shop/files/Logo_V1_5c690010-a4e8-4841-8086-c67ff47d044d_215x@2x.png?v=1613713064"
              alt="Clever Botanics"
            />
          </Link>
          <nav className="nav" aria-label={d.primaryNavigation}>
            <Link href={`/${locale}/collections/most-popular`}>{d.mostPopular}</Link>
            <Link href={`/${locale}/products#catalogue`}>{d.navCatalogue}</Link>
            <Link href={`/${locale}/about`}>{d.navEthos}</Link>
            <Link href={`/${locale}/contact`}>{d.contact}</Link>
          </nav>
          <div className="header-actions">
            <div className="lang-links" role="group" aria-label={d.languageSwitcher}>
              {locales.map((language) => (
                <Link
                  key={language}
                  href={languagePath(language)}
                  aria-label={`${d.switchLanguage} ${language.toUpperCase()}`}
                  aria-current={language === locale ? 'page' : undefined}
                  className={`lang-btn${language === locale ? ' active' : ''}`}
                >
                  {language.toUpperCase()}
                </Link>
              ))}
            </div>
            <button
              type="button"
              className="header-bag-btn"
              aria-label={`${d.bagLabel}: ${itemCount}`}
              aria-haspopup="dialog"
              onClick={openBag}
            >
              <span>{d.bagLabel}</span>
              <span className="bag-count-pill" aria-live="polite">{itemCount}</span>
            </button>
            <Link className="header-shop" href={`/${locale}/products`}>{d.shopAll}</Link>
          </div>
        </div>
      </header>
    </>
  );
}
