'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

export default function HeroCarousel({
  slides,
  labels,
  primaryHref,
  primaryLabel,
  secondaryHref,
  secondaryLabel,
  metrics,
}) {
  const [activeIndex, setActiveIndex] = useState(0);
  const pointerStartX = useRef(null);

  useEffect(() => {
    if (slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % slides.length);
    }, 6500);
    return () => window.clearInterval(timer);
  }, [slides.length]);

  if (!slides.length) return null;

  const showSlide = (index) => {
    setActiveIndex((index + slides.length) % slides.length);
  };
  const activeSlide = slides[activeIndex];

  return (
    <section
      className="hero"
      aria-roledescription="carousel"
      aria-label={labels.carousel}
      tabIndex={0}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft') {
          event.preventDefault();
          showSlide(activeIndex - 1);
        } else if (event.key === 'ArrowRight') {
          event.preventDefault();
          showSlide(activeIndex + 1);
        }
      }}
    >
      <div
        className="hero-photo"
        onPointerDown={(event) => {
          pointerStartX.current = event.clientX;
        }}
        onPointerUp={(event) => {
          if (pointerStartX.current === null) return;
          const delta = event.clientX - pointerStartX.current;
          pointerStartX.current = null;
          if (Math.abs(delta) > 48) showSlide(activeIndex + (delta < 0 ? 1 : -1));
        }}
        onPointerCancel={() => {
          pointerStartX.current = null;
        }}
      >
        {slides.map((slide, index) => (
          <img
            key={slide.src}
            className={`hero-slide${index === activeIndex ? ' is-active' : ''}`}
            src={slide.src}
            alt={slide.alt}
            aria-hidden={index !== activeIndex}
            loading={index === 0 ? 'eager' : 'lazy'}
            fetchPriority={index === 0 ? 'high' : 'auto'}
          />
        ))}
      </div>
      <div className="container hero-grid">
        <div className="hero-content" aria-live="polite">
          <span className="hero-spec-pill">
            <span className="hero-spec-dot" aria-hidden="true" />
            <span>{activeSlide.badge}</span>
          </span>
          <h1>{activeSlide.title} <em>{activeSlide.titleEm}</em></h1>
          <p>{activeSlide.description}</p>
          <div className="hero-actions">
            <Link className="btn btn-light" href={primaryHref}>
              {primaryLabel} <span aria-hidden="true">↗</span>
            </Link>
            <a
              className="btn btn-outline"
              href={secondaryHref}
              target="_blank"
              rel="noopener noreferrer"
            >
              {secondaryLabel} <span aria-hidden="true">↗</span>
            </a>
          </div>
          <div className="hero-metrics-strip" aria-label={labels.metrics}>
            {metrics.map((metric, index) => (
              <span className="hero-metric-group" key={metric.label}>
                {index > 0 && <span className="hero-metric-divider" aria-hidden="true" />}
                <span className="hero-metric">
                  <strong>{metric.value}</strong>
                  <span>{metric.label}</span>
                </span>
              </span>
            ))}
          </div>
        </div>
        <div className="hero-carousel-controls">
          <span className="hero-carousel-count" aria-live="polite">
            {String(activeIndex + 1).padStart(2, '0')}
            <span aria-hidden="true"> / </span>
            {String(slides.length).padStart(2, '0')}
          </span>
          <div className="hero-carousel-dots" aria-label={labels.carousel}>
            {slides.map((slide, index) => (
              <button
                key={slide.src}
                className={`hero-carousel-dot${index === activeIndex ? ' is-active' : ''}`}
                type="button"
                aria-label={`${labels.showSlide} ${index + 1}`}
                aria-current={index === activeIndex ? 'true' : undefined}
                onClick={() => showSlide(index)}
              />
            ))}
          </div>
          <button
            className="hero-carousel-button"
            type="button"
            aria-label={labels.previous}
            onClick={() => showSlide(activeIndex - 1)}
          >
            <span aria-hidden="true">‹</span>
          </button>
          <button
            className="hero-carousel-button"
            type="button"
            aria-label={labels.next}
            onClick={() => showSlide(activeIndex + 1)}
          >
            <span aria-hidden="true">›</span>
          </button>
        </div>
      </div>
    </section>
  );
}
