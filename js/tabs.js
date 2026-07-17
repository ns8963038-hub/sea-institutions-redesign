/**
 * One ARIA-correct system for tabs and accordions.
 * Tabs:      [role=tablist] > .tab[role=tab] + .tab-panel[role=tabpanel]
 * Accordion: .accordion > .accordion-item > .accordion-trigger + .accordion-panel
 */

import { $, $$ } from './utils.js';

export function initTabs() {
  $$('[role="tablist"]').forEach((list) => {
    const tabs = $$('[role="tab"]', list);
    const panels = tabs.map((tab) => $(`#${tab.getAttribute('aria-controls')}`));

    const select = (tab, focus = false) => {
      tabs.forEach((t, i) => {
        const active = t === tab;
        t.setAttribute('aria-selected', String(active));
        t.tabIndex = active ? 0 : -1;
        if (panels[i]) panels[i].hidden = !active;
        // Leadership panels animate via a class rather than [hidden].
        if (panels[i]?.classList.contains('leader-panel')) {
          panels[i].classList.toggle('active', active);
          panels[i].hidden = false;
        }
      });
      if (focus) tab.focus();
    };

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => select(tab));
      tab.addEventListener('keydown', (e) => {
        const i = tabs.indexOf(tab);
        if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
          e.preventDefault();
          select(tabs[(i + 1) % tabs.length], true);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
          e.preventDefault();
          select(tabs[(i - 1 + tabs.length) % tabs.length], true);
        } else if (e.key === 'Home') {
          e.preventDefault();
          select(tabs[0], true);
        } else if (e.key === 'End') {
          e.preventDefault();
          select(tabs[tabs.length - 1], true);
        }
      });
    });

    select(tabs.find((t) => t.getAttribute('aria-selected') === 'true') || tabs[0]);
  });
}

export function initAccordions() {
  $$('.accordion-trigger').forEach((trigger) => {
    trigger.addEventListener('click', () => {
      const item = trigger.closest('.accordion-item');
      const open = item.classList.toggle('open');
      trigger.setAttribute('aria-expanded', String(open));
    });
  });
}
