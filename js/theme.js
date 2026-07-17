/**
 * Dark/light theme engine.
 * The initial theme is applied by a render-blocking inline snippet in
 * <head> (prevents a flash of the wrong theme); this module wires the
 * toggle button and persists the choice. Light is the house default —
 * dark is an explicit visitor choice.
 */

import { $$, store, prefersReducedMotion } from './utils.js';

const KEY = 'sea-theme';

function apply(theme) {
  document.documentElement.dataset.theme = theme;
  $$('.theme-toggle').forEach((btn) => {
    btn.setAttribute('aria-pressed', theme === 'dark');
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  });
}

/* Circular reveal from the toggle button via the View Transitions API;
   browsers without it (or reduced-motion users) get an instant switch. */
function switchTheme(next, btn) {
  if (!document.startViewTransition || prefersReducedMotion()) {
    apply(next);
    return;
  }
  const r = btn.getBoundingClientRect();
  const x = r.left + r.width / 2;
  const y = r.top + r.height / 2;
  const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));

  const transition = document.startViewTransition(() => apply(next));
  transition.ready.then(() => {
    document.documentElement.animate(
      { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
      {
        duration: 550,
        easing: 'cubic-bezier(0.22, 1, 0.36, 1)',
        pseudoElement: '::view-transition-new(root)',
      },
    );
  }).catch(() => { /* transition skipped (e.g. rapid toggling) — theme is already applied */ });
}

export function initTheme() {
  apply(document.documentElement.dataset.theme || 'light');

  $$('.theme-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      switchTheme(next, btn);
      store.set(KEY, next);
    });
  });
}
