'use client';

import Link from 'next/link';
import { getCollectionText, getCurrencyLocale, t } from '../lib/i18n';
import { getProductPrice, getProductSpecs, getVariantLabel } from '../lib/product-data';
import { useBag } from './BagProvider';

export default function ProductCard({ product, locale }) {
  const d = t(locale);
  const { addToBag, openQuickView } = useBag();
  const productHref = `/${locale}/products/${product.handle}`;
  const category = getCollectionText(locale, product.collection, {
    title: product.collection?.replaceAll('-', ' ') || 'Clever Botanics',
  }).title;
  const specs = getProductSpecs(product.tags);
  const price = getProductPrice(product);
  const priceText = price
    ? new Intl.NumberFormat(getCurrencyLocale(locale), {
      style: 'currency',
      currency: price.currencyCode,
    }).format(price.amount)
    : '';
  const unitPrice = specs.cbdMgValue && price
    ? d.unitPrice(new Intl.NumberFormat(getCurrencyLocale(locale), {
      style: 'currency',
      currency: price.currencyCode,
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(price.amount / specs.cbdMgValue))
    : '';
  const specPill = specs.potency || getVariantLabel(product.variants?.[0]);
  const variants = product.variants || [];

  function handleQuickAdd() {
    const availableVariants = variants.filter((variant) => variant.available !== false);
    if (variants.length === 1 && availableVariants.length === 1) {
      addToBag(product, availableVariants[0]);
      return;
    }
    openQuickView(product);
  }

  return (
    <article className="product-card">
      <Link
        href={productHref}
        className={`product-image img-fallback-slot${product.image ? '' : ' is-missing'}`}
        data-fallback-label={d.productPlaceholder}
      >
        {product.image && (
          <img
            src={product.image}
            alt={product.alt || product.title}
            loading="lazy"
            onError={(event) => event.currentTarget.parentElement?.classList.add('is-missing')}
          />
        )}
        {specPill && <span className="product-spec-pill">{specPill}</span>}
        {specs.coa && <span className="product-coa-badge">{specs.coa}</span>}
      </Link>
      <div className="product-info">
        <span className="eyebrow">{category}</span>
        <h3>
          <button type="button" onClick={() => openQuickView(product)}>{product.title}</button>
        </h3>
        {specs.terpenes && <p className="product-terpene-tag">{specs.terpenes}</p>}
        <div className="product-footer-row">
          <div className="price-stack">
            {priceText && <span className="price">{priceText}</span>}
            {unitPrice && <span className="unit-value">{unitPrice}</span>}
          </div>
          <div className="product-quick-actions">
            <Link className="text-link" href={productHref}>{d.details}</Link>
            <button
              type="button"
              className="quick-add-btn"
              aria-label={`${d.quickAdd}: ${product.title}`}
              onClick={handleQuickAdd}
            >
              {d.quickAdd}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
