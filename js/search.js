/**
 * Ctrl+K command palette — fuzzy search over a hand-built index of
 * pages, sections, institutions and programs, with keyboard navigation
 * and recent searches persisted to localStorage.
 */

import { $, $$, esc, store, trapFocus } from './utils.js';
import { SEARCH_INDEX } from './data/search-index.js';
import { PROGRAMS } from './data/programs-data.js';

const RECENTS_KEY = 'sea-recent-searches';
const MAX_RESULTS = 9;

const INDEX = [
  ...SEARCH_INDEX,
  ...PROGRAMS.map((p) => ({
    title: p.name,
    section: 'Program',
    url: `programs.html#${p.id}`,
    keywords: `${p.level} ${p.discipline} ${p.institution} ${p.affiliation}`.toLowerCase(),
  })),
];

/** Subsequence fuzzy score: higher is better, -1 means no match. */
function fuzzyScore(query, text) {
  const q = query.toLowerCase();
  const t = text.toLowerCase();
  const exact = t.indexOf(q);
  if (exact !== -1) return 100 - exact; // strong preference for substring hits
  let qi = 0;
  let score = 0;
  let streak = 0;
  for (let ti = 0; ti < t.length && qi < q.length; ti++) {
    if (t[ti] === q[qi]) {
      streak += 1;
      score += 1 + streak;
      qi += 1;
    } else {
      streak = 0;
    }
  }
  return qi === q.length ? score : -1;
}

function search(query) {
  return INDEX
    .map((item) => {
      const score = Math.max(
        fuzzyScore(query, item.title) * 2,
        fuzzyScore(query, item.keywords || ''),
      );
      return { item, score };
    })
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, MAX_RESULTS)
    .map((r) => r.item);
}

const resultIcon = `<svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6"/></svg>`;

export function initSearch() {
  const palette = $('.palette');
  if (!palette) return;
  const input = $('.palette-input', palette);
  const results = $('.palette-results', palette);
  let selected = 0;
  let lastFocus = null;

  const render = (items, heading) => {
    selected = 0;
    if (!items.length) {
      results.innerHTML = `
        <div class="palette-empty">
          <p>No matches. Try one of these:</p>
          ${['Engineering', 'Nursing', 'Admissions', 'Hostel', 'MBA']
            .map((s) => `<button class="chip" data-suggest="${s}">${s}</button>`).join('')}
        </div>`;
      return;
    }
    results.innerHTML =
      (heading ? `<p class="palette-section">${heading}</p>` : '') +
      items.map((item, i) => `
        <a class="palette-result ${i === 0 ? 'selected' : ''}" href="${esc(item.url)}" data-title="${esc(item.title)}">
          ${resultIcon}
          <span><strong>${esc(item.title)}</strong><br><small>${esc(item.section)}</small></span>
          <span class="go">↵</span>
        </a>`).join('');
  };

  const showDefault = () => {
    const recents = store.get(RECENTS_KEY, []);
    if (recents.length) {
      const items = recents
        .map((title) => INDEX.find((i) => i.title === title))
        .filter(Boolean);
      render(items, 'Recent');
    } else {
      render(INDEX.slice(0, 6), 'Suggestions');
    }
  };

  const open = () => {
    lastFocus = document.activeElement;
    palette.classList.add('open');
    input.value = '';
    showDefault();
    input.focus();
    document.body.style.overflow = 'hidden';
  };
  const close = () => {
    palette.classList.remove('open');
    document.body.style.overflow = '';
    lastFocus?.focus?.();
  };

  $$('.search-toggle').forEach((btn) => btn.addEventListener('click', open));

  window.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      palette.classList.contains('open') ? close() : open();
    }
    if (e.key === 'Escape' && palette.classList.contains('open')) close();
  });

  palette.addEventListener('click', (e) => {
    if (e.target === palette) close();
    const suggest = e.target.closest('[data-suggest]');
    if (suggest) {
      input.value = suggest.dataset.suggest;
      render(search(input.value));
      input.focus();
    }
    const link = e.target.closest('.palette-result');
    if (link) {
      const recents = store.get(RECENTS_KEY, []).filter((t) => t !== link.dataset.title);
      recents.unshift(link.dataset.title);
      store.set(RECENTS_KEY, recents.slice(0, 5));
      close();
    }
  });

  input.addEventListener('input', () => {
    const q = input.value.trim();
    q ? render(search(q)) : showDefault();
  });

  input.addEventListener('keydown', (e) => {
    const items = $$('.palette-result', results);
    if (!items.length) return;
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      e.preventDefault();
      items[selected]?.classList.remove('selected');
      selected = (selected + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      items[selected].classList.add('selected');
      items[selected].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      items[selected]?.click();
    } else if (e.key === 'Tab') {
      trapFocus(palette, e);
    }
  });
}
