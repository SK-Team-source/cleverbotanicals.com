'use client';

import { useMemo, useState } from 'react';
import ProductCard from './ProductCard';
import { getCollectionText, t } from '../lib/i18n';
import { getProductPrice, getProductSpecs } from '../lib/product-data';

export default function ProductBrowser({ products, locale }) {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [sortMode, setSortMode] = useState('featured');
  const d = t(locale);
  const categories = useMemo(
    () => ['all', ...new Set(products.flatMap((product) => product.collections || [product.collection])
      .filter((collection) => collection && collection !== 'all'))],
    [products],
  );
  const visibleProducts = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase();
    const filtered = products.filter((product) =>
      (category === 'all' || (product.collections || [product.collection]).includes(category)) &&
      `${product.title} ${product.description || ''} ${(product.tags || []).join(' ')}`
        .toLocaleLowerCase()
        .includes(normalizedQuery),
    );

    if (sortMode === 'price-asc') {
      return [...filtered].sort((a, b) => {
        const priceA = getProductPrice(a)?.amount;
        const priceB = getProductPrice(b)?.amount;
        if (priceA === undefined) return priceB === undefined ? 0 : 1;
        if (priceB === undefined) return -1;
        return priceA - priceB;
      });
    }

    if (sortMode === 'potency-desc') {
      return [...filtered].sort((a, b) => {
        const potencyA = getProductSpecs(a.tags).potencyValue;
        const potencyB = getProductSpecs(b.tags).potencyValue;
        if (potencyA === undefined) return potencyB === undefined ? 0 : 1;
        if (potencyB === undefined) return -1;
        return potencyB - potencyA;
      });
    }

    return filtered;
  }, [category, products, query, sortMode]);

  return (
    <>
      <div className="catalogue-toolbar">
        <div className="filter-pills" role="group" aria-label={d.filterCollection}>
          {categories.map((handle) => {
            const count = handle === 'all'
              ? products.length
              : products.filter((product) =>
                (product.collections || [product.collection]).includes(handle)).length;
            const label = handle === 'all'
              ? d.filterAll
              : getCollectionText(locale, handle, {
                title: handle.replaceAll('-', ' '),
              }).title;

            return (
              <button
                key={handle}
                type="button"
                className={`filter-pill${category === handle ? ' is-active' : ''}`}
                aria-pressed={category === handle}
                onClick={() => setCategory(handle)}
              >
                {label} <span className="filter-pill-count">{count}</span>
              </button>
            );
          })}
        </div>

        <div className="toolbar-inputs">
          <label className="underline-search">
            <span className="visually-hidden">{d.search}</span>
            <input
              type="search"
              placeholder={`${d.search}…`}
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
            <span aria-hidden="true">⌕</span>
          </label>
          <label className="sort-control">
            <span className="visually-hidden">{d.sortLabel}</span>
            <select
              className="underline-select"
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value)}
            >
              <option value="featured">{d.sortFeatured}</option>
              <option value="price-asc">{d.sortPriceLowToHigh}</option>
              <option value="potency-desc">{d.sortPotencyHighToLow}</option>
            </select>
          </label>
        </div>
      </div>
      <p className="catalogue-result-count" aria-live="polite">
        {d.browseCount(visibleProducts.length)}
      </p>
      {visibleProducts.length ? (
        <div className="product-grid">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} locale={locale} />
          ))}
        </div>
      ) : (
        <p className="catalogue-empty">{d.noResults}</p>
      )}
    </>
  );
}
