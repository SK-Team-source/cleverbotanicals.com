'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { getVariantLabel, getVariantPrice } from '../lib/product-data';
import { t } from '../lib/i18n';

const STORAGE_KEY = 'clever-botanics-bag';
const BagContext = createContext(null);

export function BagProvider({ children, locale }) {
  const [items, setItems] = useState([]);
  const [isHydrated, setIsHydrated] = useState(false);
  const [drawer, setDrawer] = useState('closed');
  const [quickViewProduct, setQuickViewProduct] = useState(null);
  const [selectedVariantId, setSelectedVariantId] = useState('');
  const [toast, setToast] = useState('');
  const returnFocusRef = useRef(null);
  const toastTimerRef = useRef(null);
  const previousDrawerRef = useRef('closed');
  const d = t(locale);

  const showToast = useCallback((message) => {
    setToast(message);
    window.clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToast(''), 3000);
  }, []);

  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.items)) {
          setItems(parsed.items.filter((item) =>
            item &&
            typeof item.variantId === 'string' &&
            /^\d+$/.test(item.variantId) &&
            typeof item.title === 'string' &&
            Number.isFinite(item.price) &&
            item.price >= 0 &&
            typeof item.currencyCode === 'string' &&
            Number.isInteger(item.quantity) &&
            item.quantity > 0,
          ));
        }
      }
    } catch (error) {
      console.error('Unable to restore the saved shopping bag:', error);
    } finally {
      setIsHydrated(true);
    }
  }, []);

  useEffect(() => {
    if (!isHydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ items }));
    } catch (error) {
      console.error('Unable to persist the shopping bag:', error);
      showToast(d.bagStorageError);
    }
  }, [d.bagStorageError, isHydrated, items, showToast]);

  useEffect(() => {
    const wasOpen = previousDrawerRef.current !== 'closed';
    const isOpen = drawer !== 'closed';
    previousDrawerRef.current = drawer;

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      if (wasOpen && returnFocusRef.current instanceof HTMLElement) {
        returnFocusRef.current.focus({ preventScroll: true });
        returnFocusRef.current = null;
      }
    }

    return () => {
      document.body.style.overflow = '';
    };
  }, [drawer]);

  useEffect(() => () => window.clearTimeout(toastTimerRef.current), []);

  const rememberFocus = useCallback(() => {
    if (drawer === 'closed' && document.activeElement instanceof HTMLElement) {
      returnFocusRef.current = document.activeElement;
    }
  }, [drawer]);

  const openBag = useCallback(() => {
    rememberFocus();
    setDrawer('bag');
  }, [rememberFocus]);

  const openQuickView = useCallback((product) => {
    rememberFocus();
    setQuickViewProduct(product);
    const variants = product.variants || [];
    const initialVariant = variants.find((variant) => variant.available) || variants[0];
    setSelectedVariantId(initialVariant?.id || '');
    setDrawer('quick-view');
  }, [rememberFocus]);

  const closeDrawer = useCallback(() => {
    setDrawer('closed');
    setQuickViewProduct(null);
    setSelectedVariantId('');
  }, []);

  const selectedVariant = useMemo(
    () => quickViewProduct?.variants?.find((variant) => variant.id === selectedVariantId) || null,
    [quickViewProduct, selectedVariantId],
  );

  const addToBag = useCallback((product, variant) => {
    const price = getVariantPrice(variant);
    const variantId = variant?.cartId || variant?.id;
    if (!variantId || !/^\d+$/.test(String(variantId)) || !price) {
      showToast(d.bagVariantUnavailable);
      return false;
    }

    if (items.length && items[0].currencyCode !== price.currencyCode) {
      showToast(d.bagCurrencyMismatch);
      return false;
    }

    setItems((current) => {
      const existing = current.find((item) => item.variantId === String(variantId));
      if (existing) {
        return current.map((item) => item.variantId === String(variantId)
          ? { ...item, quantity: item.quantity + 1 }
          : item);
      }

      return [...current, {
        variantId: String(variantId),
        title: product.title,
        variantLabel: getVariantLabel(variant),
        price: price.amount,
        currencyCode: price.currencyCode,
        image: product.image || '',
        quantity: 1,
      }];
    });

    showToast(d.bagAdded(product.title));
    return true;
  }, [d, items, showToast]);

  const changeQuantity = useCallback((variantId, delta) => {
    setItems((current) => current
      .map((item) => item.variantId === variantId
        ? { ...item, quantity: item.quantity + delta }
        : item)
      .filter((item) => item.quantity > 0));
  }, []);

  const removeFromBag = useCallback((variantId) => {
    setItems((current) => current.filter((item) => item.variantId !== variantId));
  }, []);

  const value = useMemo(() => ({
    items,
    drawer,
    quickViewProduct,
    selectedVariant,
    selectedVariantId,
    setSelectedVariantId,
    toast,
    openBag,
    openQuickView,
    closeDrawer,
    addToBag,
    changeQuantity,
    removeFromBag,
    showToast,
  }), [
    items,
    drawer,
    quickViewProduct,
    selectedVariant,
    selectedVariantId,
    toast,
    openBag,
    openQuickView,
    closeDrawer,
    addToBag,
    changeQuantity,
    removeFromBag,
    showToast,
  ]);

  return <BagContext.Provider value={value}>{children}</BagContext.Provider>;
}

export function useBag() {
  const value = useContext(BagContext);
  if (!value) throw new Error('useBag must be used within a BagProvider');
  return value;
}
