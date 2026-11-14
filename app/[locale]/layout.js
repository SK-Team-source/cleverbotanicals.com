import { notFound } from 'next/navigation';
import { BagProvider } from '../../components/BagProvider';
import Footer from '../../components/Footer';
import Header from '../../components/Header';
import StorefrontEffects from '../../components/StorefrontEffects';
import StorefrontOverlays from '../../components/StorefrontOverlays';
import { locales } from '../../lib/i18n';

export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({ children, params }) {
  const { locale } = await params;
  if (!locales.includes(locale)) notFound();

  return (
    <StorefrontEffects locale={locale}>
      <BagProvider locale={locale}>
        <Header locale={locale} />
        <main>{children}</main>
        <Footer locale={locale} />
        <StorefrontOverlays locale={locale} />
      </BagProvider>
    </StorefrontEffects>
  );
}
