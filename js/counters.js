/**
 * Odometer stat counters — roll up with an ease-out cubic when they
 * scroll into view. Values come from data-count / data-suffix.
 */

import { $$, prefersReducedMotion } from './utils.js';

export function initCounters() {
  const counters = $$('[data-count]');
  if (!counters.length) return;

  const finish = (el) => {
    el.textContent = Number(el.dataset.count).toLocaleString('en-IN') + (el.dataset.suffix || '');
  };

  if (prefersReducedMotion()) {
    counters.forEach(finish);
    return;
  }

  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      io.unobserve(entry.target);
      const el = entry.target;
      const target = Number(el.dataset.count);
      const suffix = el.dataset.suffix || '';
      const start = performance.now();
      const duration = 1600;
      const tick = (now) => {
        const p = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - p, 3);
        el.textContent = Math.round(target * eased).toLocaleString('en-IN') + suffix;
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }, { threshold: 0.4 });

  counters.forEach((el) => io.observe(el));
}
