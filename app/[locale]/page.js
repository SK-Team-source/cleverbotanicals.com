import Link from 'next/link';
import { getProducts, collections } from '../../lib/shopify';
import { getCurrencyLocale, t } from '../../lib/i18n';
import { getProductPrice } from '../../lib/product-data';
import ProductCard from '../../components/ProductCard';
import HeroCarousel from '../../components/HeroCarousel';

export default async function Home({ params }) {
  const { locale } = await params;
  const d = t(locale);
  const products = await getProducts();
  const featuredCollections = collections.filter((collection) => collection.featured);
  const currencyLocale = getCurrencyLocale(locale);
  const heroImageSources = [
    '/autumn-lakeside-banner.png',
    collections.find((collection) => collection.handle === 'oil-concentrates').image,
    collections.find((collection) => collection.handle === 'cbd-flowers-herbs').image,
  ];
  const heroSlides = d.heroSlides.map((copy, index) => ({
    ...copy,
    src: heroImageSources[index],
    alt: d.heroBannerAlts[index],
  }));

  return (
    <>
      <HeroCarousel
        slides={heroSlides}
        primaryHref={`/${locale}/products`}
        primaryLabel={d.discover}
        secondaryHref="https://cleverbotanics.com/collections/most-popular"
        secondaryLabel={d.originalStore}
        metrics={[
          { value: products.length, label: d.productCountLabel },
          { value: featuredCollections.length, label: d.collectionsCountLabel },
          { value: 'Shopify', label: d.checkoutMetricLabel },
        ]}
        labels={{
          carousel: d.heroCarousel,
          metrics: d.keyMetrics,
          previous: d.previousBanner,
          next: d.nextBanner,
          showSlide: d.showBannerSlide,
        }}
      />

      <section className="trust-bar" aria-label={d.commitments}>
        <div className="container trust-bar-inner">
          {d.trustDetails.map(([title, subtitle], index) => (
            <div className="trust-point" key={title}>
              <span className="trust-point-number">0{index + 1}</span>
              <div>
                <strong>{title}</strong>
                <span>{subtitle}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="section collection-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">{d.collectionEyebrow}</span>
              <h2>{d.collectionHeading}</h2>
            </div>
            <p>{d.collectionIntro}</p>
          </div>
          <div className="category-grid">
            {featuredCollections.map((collection, index) => {
              const collectionProducts = products.filter((product) =>
                (product.collections || [product.collection]).includes(collection.handle));
              const availablePrices = collectionProducts
                .map(getProductPrice)
                .filter(Boolean)
                .sort((a, b) => a.amount - b.amount);
              const fromPrice = availablePrices.length
                ? new Intl.NumberFormat(currencyLocale, {
                  style: 'currency',
                  currency: availablePrices[0].currencyCode,
                }).format(availablePrices[0].amount)
                : '';

              return (
                <Link
                  key={collection.handle}
                  className={`category-card category-${collection.handle}`}
                  href={`/${locale}/collections/${collection.handle}`}
                >
                  {collection.image && (
                    <img
                      className="category-card-image"
                      src={collection.image}
                      alt=""
                      loading="lazy"
                    />
                  )}
                  <div className="category-card-top">
                    <span className="category-number">0{index + 1} · {d.collectionLabel}</span>
                    <span className="category-count-pill">{d.categoryCount(collectionProducts.length)}</span>
                  </div>
                  <div className="category-card-content">
                    <p>{d.collections[collection.handle]?.[1] || collection.description}</p>
                    <h3>{d.collections[collection.handle]?.[0] || collection.title}</h3>
                    <div className="category-card-footer">
                      <span className="category-card-link">{d.browse} <span aria-hidden="true">↗</span></span>
                      {fromPrice && <span className="category-from-price">{d.fromPrice(fromPrice)}</span>}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className="section section-cream product-section">
        <div className="container">
          <div className="section-heading">
            <div>
              <span className="eyebrow">{d.featuredEyebrow}</span>
              <h2>{d.featured}</h2>
            </div>
            <Link className="text-link section-all-link" href={`/${locale}/products`}>
              {d.all} <span aria-hidden="true">↗</span>
            </Link>
          </div>
          <div className="product-grid">
            {products.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} locale={locale} />
            ))}
          </div>
          {products.some((product) => product.isPreview) && (
            <p className="catalogue-caption">{d.catalogueUnavailable}</p>
          )}
        </div>
      </section>

      <section className="story-strip">
        <div className="container story-grid">
          <div>
            <span className="eyebrow light">{d.storyEyebrow}</span>
            <h2>{d.storyTitle} <em>{d.storyTitleEm}</em></h2>
          </div>
          <div>
            <p>{d.storyDescription}</p>
            <Link className="btn btn-light" href={`/${locale}/about`}>
              {d.getToKnow} <span aria-hidden="true">↗</span>
            </Link>
          </div>
        </div>
      </section>

      <section className="review-strip">
        <div className="container review-strip-inner">
          <div>
            <span className="eyebrow">{d.reviewEyebrow}</span>
            <h2>{d.reviewTitle}</h2>
          </div>
          <a
            className="review-link"
            href="https://uk.trustpilot.com/review/cleverbotanics.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="review-stars" aria-label={d.fiveStars}>★★★★★</span>
            <span>{d.readReviews} <span aria-hidden="true">↗</span></span>
          </a>
        </div>
      </section>
    </>
  );
}
