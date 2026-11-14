import Link from 'next/link';
import { t } from '../lib/i18n';

export default function Footer({ locale }) {
  const d = t(locale);

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link href={`/${locale}`} className="footer-logo">
              <img
                className="footer-brand-logo"
                src="/clever-botanics-footer-logo.webp"
                alt="Clever Botanics"
              />
            </Link>
            <p>{d.footerDescription}</p>
          </div>
          <div>
            <h2>{d.explore}</h2>
            <Link href={`/${locale}/products`}>{d.all}</Link>
            <Link href={`/${locale}/collections/most-popular`}>{d.mostPopular}</Link>
            <Link href={`/${locale}/about`}>{d.about}</Link>
            <Link href={`/${locale}/contact`}>{d.contact}</Link>
          </div>
          <div>
            <h2>{d.store}</h2>
            <a href="https://cleverbotanics.com/" target="_blank" rel="noopener noreferrer">
              {d.shopifyStore} ↗
            </a>
            <a
              href="https://cleverbotanics.com/policies/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
            >
              {d.privacyPolicy} ↗
            </a>
            <p className="footer-legal">{d.footerNotice}</p>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Clever Botanics</span>
          <span>{d.footerAgeNotice}</span>
        </div>
      </div>
    </footer>
  );
}
