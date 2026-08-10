import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollReveal = () => {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Selectors for elements that should fade in on scroll
    const selectors = [
      '.reveal-on-scroll',
      '.home-hero-content',
      '.home-section',
      '.home-category-card',
      '.home-feature-card',
      '.product-card',
      '.home-story-split',
      '.home-editorial-image',
      '.home-newsletter-inner',
      '.collection-hero-inner',
      '.collection-filter-bar',
      '.collection-grid',
      '.pd-grid',
      '.pd-description-box',
      '.acc-card',
      '.acc-order-card',
      '.acc-address-card',
      '.about-hero-inner',
      '.about-beginnings-split',
      '.about-value-card',
      '.about-quote-inner',
      '.about-cta-inner',
      '.contact-header',
      '.contact-info-card',
      '.contact-form-card',
      '.contact-faq-item',
      '.footer-grid'
    ];

    let observer;

    const setupObserver = () => {
      const elements = document.querySelectorAll(selectors.join(', '));

      elements.forEach((el) => {
        if (!el.classList.contains('reveal-on-scroll')) {
          el.classList.add('reveal-on-scroll');
        }
      });

      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-revealed');
              observer.unobserve(entry.target);
            }
          });
        },
        {
          threshold: 0.08,
          rootMargin: '0px 0px -30px 0px'
        }
      );

      elements.forEach((el) => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight * 0.95 && rect.bottom > 0) {
          el.classList.add('is-revealed');
        } else {
          observer.observe(el);
        }
      });
    };

    const timer = setTimeout(() => {
      setupObserver();
    }, 60);

    return () => {
      clearTimeout(timer);
      if (observer) observer.disconnect();
    };
  }, [pathname, search]);
};
