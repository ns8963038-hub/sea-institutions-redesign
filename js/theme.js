/**
 * Dark/light theme engine.
 * The initial theme is applied by a render-blocking inline snippet in
 * <head> (prevents a flash of the wrong theme); this module wires the
 * toggle button, persists the choice and follows OS changes until the
 * visitor picks a side.
 */

import { $$, store } from './utils.js';

const KEY = 'sea-theme';

function apply(theme) {
  document.documentElement.dataset.theme = theme;
  $$('.theme-toggle').forEach((btn) => {
    btn.setAttribute('aria-pressed', theme === 'dark');
    btn.setAttribute('aria-label', theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme');
  });
}

export function initTheme() {
  apply(document.documentElement.dataset.theme || 'light');

  $$('.theme-toggle').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      apply(next);
      store.set(KEY, next);
    });
  });

  // Follow OS preference while the visitor hasn't chosen explicitly.
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (store.get(KEY) === null) apply(e.matches ? 'dark' : 'light');
  });
}
