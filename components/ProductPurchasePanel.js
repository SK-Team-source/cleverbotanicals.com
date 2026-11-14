'use client';

import { Fragment, useState } from 'react';
import { getCurrencyLocale, t } from '../lib/i18n';
import { getProductSpecs, getProductPrice, getVariantLabel, getVariantPrice } from '../lib/product-data';
import { useBag } from './BagProvider';

function formatPrice(price, locale) {
  if (!price) return '';
  return new Intl.NumberFormat(getCurrencyLocale(locale), {
    style: 'currency',
    currency: price.currencyCode,
  }).format(price.amount);
}

function DescriptionText({ text }) {
  const paragraphs = text.split(/\n{2,}/).map((paragraph) => paragraph.trim()).filter(Boolean);

  return (
    <div className="detail-desc">
      {paragraphs.map((paragraph, index) => (
        <p key={`${index}-${paragraph.slice(0, 24)}`}>
          {paragraph.split('\n').map((line, lineIndex) => (
            <Fragment key={lineIndex}>
              {lineIndex > 0 && <br />}
              {line}
            </Fragment>
          ))}
        </p>
      ))}
    </div>
  );
}

export default function ProductPurchasePanel({
  product,
  locale,
  descriptionExcerpt,
  remainingDescription,
  hasLongDescription,
}) {
  const d = t(locale);
  const { addToBag } = useBag();
  const variants = product.variants || [];
  const initialVariant = variants.find((variant) => variant.available) || variants[0] || null;
  const [selectedVariantId, setSelectedVariantId] = useState(initialVariant?.id || '');
  const selectedVariant = variants.find((variant) => variant.id === selectedVariantId) || null;
  const selectedPrice = getVariantPrice(selectedVariant);
  const price = selectedPrice || getProductPrice(product);
  const specs = getProductSpecs(product.tags);
  const labSpecs = [
    [d.specLabels.potency, specs.potency],
    [d.specLabels.extractType, specs.extractType],
    [d.specLabels.thc, specs.thc],
    [d.specLabels.batch, specs.batch],
  ].filter(([, value]) => value);
  const unitPrice = specs.cbdMgValue && price
    ? d.unitPrice(new Intl.NumberFormat(getCurrencyLocale(locale), {
      style: 'currency',
      currency: price.currencyCode,
      minimumFractionDigits: 3,
      maximumFractionDigits: 3,
    }).format(price.amount / specs.cbdMgValue))
    : '';

  return (
    <div className="product-purchase-panel">
      <span className="eyebrow">{d.productLabel}</span>
      <h1>{product.title}</h1>
      {product.description && (
        <div className="product-description">
          <DescriptionText text={descriptionExcerpt} />
          {hasLongDescription && (
            <details className="product-description-more">
              <summary>{d.readFullDescription}</summary>
              <DescriptionText text={remainingDescription} />
            </details>
          )}
        </div>
      )}
      {price && (
        <div className="detail-price-stack">
          <span className="price">{formatPrice(price, locale)}</span>
          {unitPrice && <span className="unit-value">{unitPrice}</span>}
        </div>
      )}
      {specs.terpenes && <p className="product-terpene-tag">{specs.terpenes}</p>}

      {variants.length > 0 && (
        <fieldset className="size-selector detail-size-selector">
          <legend>{d.selectSize}</legend>
          <div className="size-options">
            {variants.map((variant) => {
              const variantPrice = getVariantPrice(variant);
              const unavailable = variant.available === false;
              return (
                <button
                  type="button"
                  key={variant.id}
                  className={`size-btn${variant.id === selectedVariantId ? ' is-selected' : ''}`}
                  aria-pressed={variant.id === selectedVariantId}
                  disabled={unavailable}
                  onClick={() => setSelectedVariantId(variant.id)}
                >
                  <strong>{getVariantLabel(variant) || d.defaultVariant}</strong>
                  {variantPrice && <small>{formatPrice(variantPrice, locale)}</small>}
                  {unavailable && <small>{d.unavailable}</small>}
                </button>
              );
            })}
          </div>
        </fieldset>
      )}

      {labSpecs.length > 0 && (
        <div className="lab-spec-grid">
          {labSpecs.map(([label, value]) => (
            <div className="lab-spec-cell" key={label}>
              <span>{label}</span>
              <strong>{value}</strong>
            </div>
          ))}
        </div>
      )}

      <button
        type="button"
        className="btn btn-dark detail-add-button"
        disabled={!selectedVariant || selectedVariant.available === false || !selectedPrice}
        onClick={() => addToBag(product, selectedVariant)}
      >
        {d.addToBag}
      </button>
      {!selectedVariant && <p className="small-muted">{d.bagVariantUnavailable}</p>}
      {selectedVariant?.available === false && <p className="small-muted">{d.unavailable}</p>}
      <a className="detail-shopify-link" href={product.url} target="_blank" rel="noopener noreferrer">
        {d.purchase} ↗
      </a>
      <p className="small-muted">{d.variantNotice}</p>
    </div>
  );
}
