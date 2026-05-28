import { useEffect } from 'react';

const BASE_URL = import.meta.env.VITE_BASE_URL || 'https://techmarket.com.co';

function setMeta(selector, attr, value) {
  let el = document.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    const parts = selector.match(/\[([^\]]+)="([^"]+)"\]/);
    if (parts) el.setAttribute(parts[1], parts[2]);
    document.head.appendChild(el);
  }
  el.setAttribute(attr, value || '');
}

/**
 * @param {object} opts
 * @param {string} opts.title
 * @param {string} [opts.description]
 * @param {string} [opts.image]      — absolute URL
 * @param {string} [opts.url]        — canonical path, e.g. '/producto/5'
 * @param {string} [opts.type]       — 'website' | 'product' | 'article'
 * @param {number} [opts.precio]
 */
export function useSEO({ title, description, image, url, type = 'website', precio } = {}) {
  useEffect(() => {
    const fullTitle = title ? `${title} — TechMarket` : 'TechMarket — El marketplace tecnológico de Colombia';
    const desc = description || 'Compra y vende productos tecnológicos en TechMarket: laptops, accesorios, electrónica y más.';
    const img = image || `${BASE_URL}/og-default.png`;
    const canonical = url ? `${BASE_URL}${url}` : BASE_URL;

    document.title = fullTitle;

    setMeta('meta[name="description"]', 'content', desc);

    setMeta('meta[property="og:title"]', 'content', fullTitle);
    setMeta('meta[property="og:description"]', 'content', desc);
    setMeta('meta[property="og:image"]', 'content', img);
    setMeta('meta[property="og:url"]', 'content', canonical);
    setMeta('meta[property="og:type"]', 'content', type);

    setMeta('meta[name="twitter:title"]', 'content', fullTitle);
    setMeta('meta[name="twitter:description"]', 'content', desc);
    setMeta('meta[name="twitter:image"]', 'content', img);

    if (precio != null) {
      setMeta('meta[property="product:price:amount"]', 'content', String(precio));
      setMeta('meta[property="product:price:currency"]', 'content', 'USD');
    }

    let link = document.querySelector('link[rel="canonical"]');
    if (!link) {
      link = document.createElement('link');
      link.rel = 'canonical';
      document.head.appendChild(link);
    }
    link.href = canonical;

    return () => {
      document.title = 'TechMarket — El marketplace tecnológico de Colombia';
    };
  }, [title, description, image, url, type, precio]);
}
