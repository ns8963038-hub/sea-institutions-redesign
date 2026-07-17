/**
 * Flash-news ticker — the marquee itself is pure CSS; this adds an
 * accessible pause/resume control and stops it under reduced motion.
 */

import { $, prefersReducedMotion } from './utils.js';

export function initTicker() {
  const ticker = $('.ticker');
  if (!ticker) return;

  if (prefersReducedMotion()) {
    ticker.classList.add('paused');
    return;
  }

  const button = $('.ticker-pause', ticker);
  button?.addEventListener('click', () => {
    const paused = ticker.classList.toggle('paused');
    button.setAttribute('aria-pressed', String(paused));
    button.setAttribute('aria-label', paused ? 'Resume announcements' : 'Pause announcements');
  });
}
