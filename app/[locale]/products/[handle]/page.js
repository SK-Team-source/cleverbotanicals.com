import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getProduct, getProducts } from '../../../../lib/shopify';
import { getProductSpecs } from '../../../../lib/product-data';
import { t } from '../../../../lib/i18n';
import ProductCard from '../../../../components/ProductCard';
import ProductPurchasePanel from '../../../../components/ProductPurchasePanel';

function splitDescription(description, wordLimit) {
  const excerpt = [];
  const remaining = [];
  let wordCount = 0;
  let isRemaining = false;

  for (const paragraph of description.split(/\n{2,}/).map((part) => part.trim()).filter(Boolean)) {
    const words = paragraph.split(/\s+/);
    if (isRemaining || wordCount >= wordLimit) {
      remaining.push(paragraph);
      isRemaining = true;
      continue;
    }

    const availableWords = wordLimit - wordCount;
    if (words.length <= availableWords) {
      excerpt.push(paragraph);
      wordCount += words.length;
      continue;
    }

    excerpt.push(words.slice(0, availableWords).join(' '));
    remaining.push(words.slice(availableWords).join(' '));
    wordCount = wordLimit;
    isRemaining = true;
  }

  return {
    excerpt: excerpt.join('\n\n'),
    remaining: remaining.join('\n\n'),
  };
}

export async function generateMetadata({ params }) {
  const { handle } = await params;
  const product = await getProduct(handle);
  return {
    title: product?.title || 'Product',
    description: product?.description || 'Clever Botanics product',
    alternates: { canonical: product?.url },
  };
}

export default async function Product({ params }) {
  const { locale, handle } = await params;
  const allProducts = await getProducts();
  const product = allProducts.find((item) => item.handle === handle);
  if (!product) notFound();

  const d = t(locale);
  const productCollections = (product.collections || [product.collection])
    .filter((collection) => collection && collection !== 'all');
  const relatedProducts = allProducts
    .filter((item) => item.handle !== product.handle)
    .filter((item) => {
      const collections = item.collections || [item.collection];
      return collections.some((collection) => productCollections.includes(collection));
    })
    .slice(0, 4);
  const recommendations = relatedProducts.length
    ? relatedProducts
    : allProducts.filter((item) => item.handle !== product.handle).slice(0, 4);
  const { excerpt: descriptionExcerpt, remaining: remainingDescription } = splitDescription(
    product.description || '',
    80,
  );
  const hasLongDescription = Boolean(remainingDescription);
  const specs = getProductSpecs(product.tags);

  return (
    <section className="section page-section">
      <div className="container">
        <Link className="text-link" href={`/${locale}/products`}>
          ← {d.back}
        </Link>
        <div className="detail-grid">
          <div
            className={`detail-image img-fallback-slot${product.image ? '' : ' is-missing'}`}
            data-fallback-label={d.productImagePlaceholder}
          >
            {product.image && (
              <img
                src={product.image}
                alt={product.alt || product.title}
              />
            )}
            {specs.potency && <span className="product-spec-pill">{specs.potency}</span>}
            {specs.coa && <span className="product-coa-badge">{specs.coa}</span>}
          </div>
          <ProductPurchasePanel
            key={product.id}
            product={product}
            locale={locale}
            descriptionExcerpt={descriptionExcerpt}
            remainingDescription={remainingDescription}
            hasLongDescription={hasLongDescription}
          />
        </div>
        {recommendations.length > 0 && (
          <section className="related-products" aria-labelledby="related-products-heading">
            <div className="section-heading">
              <div>
                <span className="eyebrow">{d.relatedEyebrow}</span>
                <h2 id="related-products-heading">{d.relatedHeading}</h2>
              </div>
            </div>
            <div className="product-grid">
              {recommendations.map((relatedProduct) => (
                <ProductCard
                  key={relatedProduct.id}
                  product={relatedProduct}
                  locale={locale}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </section>
  );
}
