'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import { useBag } from './BagProvider';
import { getProductSpecs, getVariantLabel, getVariantPrice } from '../lib/product-data';
import { getCurrencyLocale, t } from '../lib/i18n';

const SHOPIFY_STORE = 'https://cleverbotanics.com';
const FREE_SHIPPING_THRESHOLD = 75;

function formatPrice(amount, currencyCode, locale) {
  return new Intl.NumberFormat(getCurrencyLocale(locale), {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
}

function LabSpecs({ product, labels }) {
  const specs = getProductSpecs(product.tags);
  const cells = [
    [labels.potency, specs.potency],
    [labels.extractType, specs.extractType],
    [labels.thc, specs.thc],
    [labels.batch, specs.batch],
  ].filter(([, value]) => value);

  if (!cells.length) return null;

  return (
    <div className="lab-spec-grid">
      {cells.map(([label, value]) => (
        <div className="lab-spec-cell" key={label}>
          <span>{label}</span>
          <strong>{value}</strong>
        </div>
      ))}
    </div>
  );
}

export default function StorefrontOverlays({ locale }) {
  const {
    items,
    drawer,
    quickViewProduct,
    selectedVariant,
    selectedVariantId,
    setSelectedVariantId,
    toast,
    closeDrawer,
    addToBag,
    changeQuantity,
    removeFromBag,
  } = useBag();
  const quickViewRef = useRef(null);
  const bagRef = useRef(null);
  const d = t(locale);
  const isQuickViewOpen = drawer === 'quick-view';
  const isBagOpen = drawer === 'bag';

  useEffect(() => {
    if (!isQuickViewOpen && !isBagOpen) return undefined;
    const panel = isQuickViewOpen ? quickViewRef.current : bagRef.current;
    if (!panel) return undefined;

    const focusable = () => [...panel.querySelectorAll(
      'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
    )].filter((element) => element.getAttribute('aria-hidden') !== 'true');

    focusable()[0]?.focus();

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeDrawer();
        return;
      }

      if (event.key !== 'Tab') return;
      const elements = focusable();
      if (!elements.length) {
        event.preventDefault();
        panel.focus();
        return;
      }

      const first = elements[0];
      const last = elements[elements.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [closeDrawer, isBagOpen, isQuickViewOpen]);

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const currencyCode = items[0]?.currencyCode || 'GBP';
  const shippingRemaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const shippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);
  const cartItems = items.map((item) => `${item.variantId}:${item.quantity}`).join(',');
  const cartPath = `/cart/${cartItems}`;
  const checkoutUrl = `${SHOPIFY_STORE}${cartPath}`;
  const variantOptions = quickViewProduct?.variants || [];
  const selectedPrice = getVariantPrice(selectedVariant);
  const quickSpecs = quickViewProduct ? getProductSpecs(quickViewProduct.tags) : {};
  const quickPrice = selectedPrice
    ? formatPrice(selectedPrice.amount, selectedPrice.currencyCode, locale)
    : '';

  return (
    <>
      <button
        className={`drawer-backdrop${drawer !== 'closed' ? ' is-open' : ''}`}
        type="button"
        aria-label={d.close}
        tabIndex={drawer !== 'closed' ? 0 : -1}
        onClick={closeDrawer}
      />

      <aside
        ref={quickViewRef}
        className={`drawer-panel quickview-drawer${isQuickViewOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal={isQuickViewOpen ? 'true' : undefined}
        aria-hidden={!isQuickViewOpen}
        aria-labelledby="quickview-title"
        tabIndex={-1}
        inert={!isQuickViewOpen}
      >
        <div className="drawer-top">
          <span className="eyebrow">{d.quickView}</span>
          <button type="button" className="drawer-close" onClick={closeDrawer}>{d.close} ×</button>
        </div>
        {quickViewProduct && (
          <>
            <div
              className={`drawer-pedestal img-fallback-slot${quickViewProduct.image ? '' : ' is-missing'}`}
              data-fallback-label={d.productPlaceholder}
            >
              {quickViewProduct.image && (
                <img
                  src={quickViewProduct.image}
                  alt={quickViewProduct.alt || quickViewProduct.title}
                  onError={(event) => event.currentTarget.parentElement?.classList.add('is-missing')}
                />
              )}
              {quickSpecs.potency && <span className="product-spec-pill">{quickSpecs.potency}</span>}
              {quickSpecs.coa && <span className="product-coa-badge">{quickSpecs.coa}</span>}
            </div>
            {quickSpecs.batch && <span className="eyebrow drawer-batch">{d.batch}: {quickSpecs.batch}</span>}
            <h2 className="drawer-title" id="quickview-title">{quickViewProduct.title}</h2>
            {quickPrice && <div className="drawer-price">{quickPrice}</div>}
            {quickSpecs.terpenes && <p className="product-terpene-tag">{quickSpecs.terpenes}</p>}
            {quickViewProduct.description && <p className="drawer-desc">{quickViewProduct.description}</p>}

            {variantOptions.length > 0 && (
              <fieldset className="size-selector">
                <legend>{d.selectSize}</legend>
                <div className="size-options">
                  {variantOptions.map((variant) => {
                    const price = getVariantPrice(variant);
                    const label = getVariantLabel(variant) || d.defaultVariant;
                    const unavailable = variant.available === false;
                    return (
                      <button
                        key={variant.id}
                        type="button"
                        className={`size-btn${variant.id === selectedVariantId ? ' is-selected' : ''}`}
                        aria-pressed={variant.id === selectedVariantId}
                        disabled={unavailable}
                        onClick={() => setSelectedVariantId(variant.id)}
                      >
                        <strong>{label}</strong>
                        {price && <small>{formatPrice(price.amount, price.currencyCode, locale)}</small>}
                        {unavailable && <small>{d.unavailable}</small>}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            )}

            <LabSpecs product={quickViewProduct} labels={d.specLabels} />
            <div className="drawer-actions">
              <button
                type="button"
                className="btn btn-dark drawer-add"
                disabled={!selectedVariant || selectedVariant.available === false || !selectedPrice}
                onClick={() => {
                  if (addToBag(quickViewProduct, selectedVariant)) closeDrawer();
                }}
              >
                <span>{d.addToBag}</span>
                <span>{quickPrice}</span>
              </button>
              <Link
                className="drawer-details-link"
                href={`/${locale}/products/${quickViewProduct.handle}`}
                onClick={closeDrawer}
              >
                {d.details}
              </Link>
            </div>
            {variantOptions.length === 0 && <p className="small-muted">{d.bagVariantUnavailable}</p>}
          </>
        )}
      </aside>

      <aside
        ref={bagRef}
        className={`drawer-panel bag-drawer${isBagOpen ? ' is-open' : ''}`}
        role="dialog"
        aria-modal={isBagOpen ? 'true' : undefined}
        aria-hidden={!isBagOpen}
        aria-labelledby="bag-title"
        tabIndex={-1}
        inert={!isBagOpen}
      >
        <div className="drawer-top">
          <h2 className="eyebrow" id="bag-title">{d.bagTitle}</h2>
          <button type="button" className="drawer-close" onClick={closeDrawer}>{d.close} ×</button>
        </div>

        <div className="shipping-meter">
          <p className="shipping-meter-text">
            {shippingRemaining === 0
              ? d.shippingUnlocked
              : d.shippingRemaining(formatPrice(shippingRemaining, currencyCode, locale))}
          </p>
          <div
            className="shipping-track"
            role="progressbar"
            aria-label={d.shippingProgress}
            aria-valuemin="0"
            aria-valuemax={FREE_SHIPPING_THRESHOLD}
            aria-valuenow={Math.min(FREE_SHIPPING_THRESHOLD, subtotal)}
          >
            <div className="shipping-fill" style={{ width: `${shippingProgress}%` }} />
          </div>
        </div>

        <div className="bag-items-list">
          {items.length ? items.map((item) => (
            <article className="bag-item" key={item.variantId}>
              <div
                className={`bag-item-thumb img-fallback-slot${item.image ? '' : ' is-missing'}`}
                data-fallback-label={d.productPlaceholder}
              >
                {item.image && (
                  <img
                    src={item.image}
                    alt=""
                    onError={(event) => event.currentTarget.parentElement?.classList.add('is-missing')}
                  />
                )}
              </div>
              <div className="bag-item-meta">
                <h3>{item.title}</h3>
                {item.variantLabel && <small>{item.variantLabel}</small>}
                <div className="qty-stepper">
                  <button
                    type="button"
                    aria-label={`${d.decreaseQuantity}: ${item.title}`}
                    onClick={() => changeQuantity(item.variantId, -1)}
                  >−</button>
                  <span aria-live="polite">{item.quantity}</span>
                  <button
                    type="button"
                    aria-label={`${d.increaseQuantity}: ${item.title}`}
                    onClick={() => changeQuantity(item.variantId, 1)}
                  >+</button>
                </div>
                <button
                  type="button"
                  className="bag-remove"
                  onClick={() => removeFromBag(item.variantId)}
                >{d.remove}</button>
              </div>
              <strong className="bag-item-total">
                {formatPrice(item.price * item.quantity, item.currencyCode, locale)}
              </strong>
            </article>
          )) : <p className="bag-empty">{d.emptyBag}</p>}
        </div>

        <div className="bag-summary">
          <div className="bag-total-row">
            <span>{d.subtotal}</span>
            <span>{formatPrice(subtotal, currencyCode, locale)}</span>
          </div>
          <div className="bag-total-row is-grand">
            <span>{d.total}</span>
            <span>{formatPrice(subtotal, currencyCode, locale)}</span>
          </div>
          {items.length > 0 ? (
            <a className="btn btn-dark bag-checkout" href={checkoutUrl}>
              <span>{d.checkout}</span>
              <span aria-hidden="true">→</span>
            </a>
          ) : (
            <button type="button" className="btn btn-dark bag-checkout" disabled>
              {d.checkout}
            </button>
          )}
          <p className="bag-checkout-note">{d.checkoutNote}</p>
        </div>
      </aside>

      <div className={`toast-pill${toast ? ' is-visible' : ''}`} role="status" aria-live="polite">
        {toast}
      </div>
    </>
  );
}
