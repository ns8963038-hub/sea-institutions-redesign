/**
 * Scroll choreography: IntersectionObserver reveal system with
 * per-container stagger, plus the scroll-drawn admissions timeline.
 */

import { $, $$, prefersReducedMotion } from './utils.js';

export function initReveal() {
  if (prefersReducedMotion()) return;

  // Stagger children of any [data-stagger] container.
  $$('[data-stagger]').forEach((group) => {
    const step = Number(group.dataset.stagger) || 80;
    $$('.reveal, .reveal-left, .reveal-right, .reveal-scale', group)
      .forEach((el, i) => el.style.setProperty('--stagger', `${i * step}ms`));
  });

  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -8% 0px' },
  );
  $$('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach((el) => io.observe(el));
}

/** SVG line that draws itself as the admissions timeline scrolls by.
 *  The path carries pathLength="1", so dash units are normalized 0–1. */
export function initTimeline() {
  const path = $('.timeline-path');
  if (!path) return;

  path.style.strokeDashoffset = prefersReducedMotion() ? 0 : 1;
  if (prefersReducedMotion()) return;

  const timeline = path.closest('.timeline');
  let ticking = false;
  const draw = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const rect = timeline.getBoundingClientRect();
      const viewH = window.innerHeight;
      // 0 when the timeline top reaches 80% of viewport; 1 when its bottom passes 45%.
      const progress = Math.min(1, Math.max(0,
        (viewH * 0.8 - rect.top) / (rect.height + viewH * 0.35)));
      path.style.strokeDashoffset = 1 - progress;
      ticking = false;
    });
  };
  window.addEventListener('scroll', draw, { passive: true });
  draw();
}
