/**
 * Loading screen: shown once per session, dismissed as soon as the
 * page is ready (never an artificial delay beyond a 400ms grace so the
 * crest doesn't strobe). Skipped entirely under prefers-reduced-motion
 * (handled in CSS) and on repeat page views within the session.
 */

import { $, prefersReducedMotion } from './utils.js';

const KEY = 'sea-loader-shown';

export function initLoader() {
  const loader = $('.loader');
  if (!loader) return;

  let seen = false;
  try { seen = sessionStorage.getItem(KEY) === '1'; } catch { /* ignore */ }

  if (seen || prefersReducedMotion()) {
    loader.remove();
    return;
  }

  try { sessionStorage.setItem(KEY, '1'); } catch { /* ignore */ }

  const shownAt = performance.now();
  const dismiss = () => {
    const wait = Math.max(0, 400 - (performance.now() - shownAt));
    setTimeout(() => {
      loader.classList.add('done');
      loader.addEventListener('transitionend', () => loader.remove(), { once: true });
      // Safety: remove even if transitionend never fires.
      setTimeout(() => loader.remove(), 900);
    }, wait);
  };

  if (document.readyState === 'complete') dismiss();
  else window.addEventListener('load', dismiss, { once: true });
  // Hard ceiling — never hold the page hostage.
  setTimeout(dismiss, 2500);
}
