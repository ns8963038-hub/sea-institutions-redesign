/**
 * Header behaviour: glass-shrink on scroll, gold scroll-progress bar,
 * mobile drawer, back-to-top button and section-nav scrollspy.
 * All scroll work is rAF-batched.
 */

import { $, $$ } from './utils.js';

export function initNav() {
  const header = $('.site-header');
  const progress = $('.scroll-progress');
  const backToTop = $('.back-to-top');
  const menuToggle = $('.menu-toggle');
  const links = $('.nav-links');

  /* ---- Scroll-linked chrome ---- */
  let ticking = false;
  const onScroll = () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      header?.classList.toggle('scrolled', y > 24);
      if (progress) {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        progress.style.width = `${max > 0 ? Math.min(100, (y / max) * 100) : 0}%`;
      }
      backToTop?.classList.toggle('visible', y > 640);
      ticking = false;
    });
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---- Mobile drawer ---- */
  const closeDrawer = () => {
    links?.classList.remove('open');
    menuToggle?.setAttribute('aria-expanded', 'false');
  };
  menuToggle?.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    menuToggle.setAttribute('aria-expanded', String(open));
  });
  links?.addEventListener('click', (e) => {
    if (e.target.closest('a')) closeDrawer();
  });
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeDrawer();
  });
  window.matchMedia('(min-width: 1120px)').addEventListener('change', closeDrawer);

  /* ---- Scrollspy for sticky section-nav (campus page) ---- */
  const sectionNav = $('.section-nav');
  if (sectionNav) {
    const navLinks = $$('a[href^="#"]', sectionNav);
    const sections = navLinks
      .map((a) => $(a.getAttribute('href')))
      .filter(Boolean);
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          navLinks.forEach((a) =>
            a.classList.toggle('active', a.getAttribute('href') === `#${entry.target.id}`));
        });
      },
      { rootMargin: '-40% 0px -55% 0px' },
    );
    sections.forEach((s) => spy.observe(s));
  }
}
