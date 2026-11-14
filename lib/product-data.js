const SPEC_KEYS = {
  potency: ['potency', 'cbd', 'cbd potency', 'cbd content'],
  cbdMg: ['cbd mg', 'total cbd', 'cbd amount'],
  thc: ['thc', 'thc content'],
  terpenes: ['terpene', 'terpenes', 'terpene profile'],
  coa: ['coa', 'coa status', 'certificate of analysis'],
  batch: ['batch', 'batch id', 'batch number'],
  extractType: ['extract type', 'extraction type'],
};

function normalizeKey(value) {
  return value.trim().toLowerCase().replace(/[_-]+/g, ' ').replace(/\s+/g, ' ');
}

export function getProductSpecs(tags = []) {
  const specs = {};

  for (const rawTag of tags) {
    if (typeof rawTag !== 'string') continue;
    const separator = rawTag.search(/[:=]/);
    if (!specs.coa && ['coa', 'certificate of analysis'].includes(normalizeKey(rawTag))) {
      specs.coa = rawTag.trim();
    }
    if (separator < 1) continue;

    const key = normalizeKey(rawTag.slice(0, separator));
    const value = rawTag.slice(separator + 1).trim();
    if (!value) continue;

    for (const [field, aliases] of Object.entries(SPEC_KEYS)) {
      if (aliases.includes(key) && !specs[field]) {
        specs[field] = value;
        break;
      }
    }

  }

  const cbdAmount = specs.cbdMg || (/\bmg\b/i.test(specs.potency || '') ? specs.potency : '');
  const parsedAmount = Number.parseFloat(cbdAmount || '');
  if (Number.isFinite(parsedAmount) && parsedAmount > 0) specs.cbdMgValue = parsedAmount;

  const potencyValue = Number.parseFloat((specs.potency || '').replace(',', '.'));
  if (Number.isFinite(potencyValue) && potencyValue > 0) specs.potencyValue = potencyValue;

  return specs;
}

export function getVariantLabel(variant) {
  if (!variant) return '';
  const optionValues = (variant.options || [])
    .map((option) => option.value)
    .filter(Boolean);
  const label = optionValues.length ? optionValues.join(' · ') : variant.title;
  return label && label.toLowerCase() !== 'default title' ? label : '';
}

export function getVariantPrice(variant) {
  const amount = Number(variant?.price?.amount);
  if (!Number.isFinite(amount)) return null;
  return {
    amount,
    currencyCode: variant.price.currencyCode || 'GBP',
  };
}

export function getProductPrice(product) {
  const prices = (product.variants || [])
    .map(getVariantPrice)
    .filter(Boolean)
    .sort((a, b) => a.amount - b.amount);

  if (prices.length) return prices[0];
  if (!product.price) return null;

  const amount = Number(product.price.amount);
  return Number.isFinite(amount)
    ? { amount, currencyCode: product.price.currencyCode || 'GBP' }
    : null;
}
