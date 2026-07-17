/**
 * Program finder — renders the catalogue from programs-data.js and
 * powers live search, level/discipline filters, in-place details,
 * a compare tool (up to 3) and a localStorage-backed shortlist.
 */

import { $, $$, esc, store, toast, debounce, trapFocus } from './utils.js';
import { PROGRAMS } from './data/programs-data.js';

const SHORTLIST_KEY = 'sea-shortlist';
const COMPARE_MAX = 3;

const state = {
  query: '',
  level: 'all',
  discipline: 'all',
  savedOnly: false,
  shortlist: [],
  compare: [],
};

const heartIcon = `<svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><path d="M12 20.5s-7.5-4.7-9.5-9A5.4 5.4 0 0 1 12 6.6a5.4 5.4 0 0 1 9.5 4.9c-2 4.3-9.5 9-9.5 9Z"/></svg>`;

function matches(program) {
  const haystack = `${program.name} ${program.institution} ${program.discipline} ${program.affiliation} ${program.blurb}`.toLowerCase();
  return (
    (state.query === '' || haystack.includes(state.query)) &&
    (state.level === 'all' || program.level === state.level) &&
    (state.discipline === 'all' || program.discipline === state.discipline) &&
    (!state.savedOnly || state.shortlist.includes(program.id))
  );
}

function cardHTML(p) {
  const saved = state.shortlist.includes(p.id);
  return `
  <article class="card program-card reveal" id="${p.id}" data-id="${p.id}">
    <div class="prog-top">
      <div>
        <span class="tag">${esc(p.level)} · ${esc(p.discipline)}</span>
        <h3>${esc(p.name)}</h3>
      </div>
      <button class="save-btn ${saved ? 'saved' : ''}" data-save="${p.id}"
        aria-pressed="${saved}" aria-label="${saved ? 'Remove from' : 'Save to'} shortlist: ${esc(p.name)}">
        ${heartIcon}
      </button>
    </div>
    <p>${esc(p.blurb)}</p>
    <div class="prog-meta">
      <span>Institution <strong>${esc(p.institution)}</strong></span>
      <span>Duration <strong>${esc(p.duration ?? '—')}</strong></span>
      ${p.intake ? `<span>Intake <strong>${esc(p.intake)}</strong></span>` : ''}
      <span>Affiliation <strong>${esc(p.affiliation)}</strong></span>
    </div>
    <div class="prog-details" id="details-${p.id}" hidden>
      <p>${esc(p.details)}</p>
      <p style="margin-top:.5rem"><strong>Eligibility:</strong> ${esc(p.eligibility)}</p>
    </div>
    <div class="prog-actions">
      <button class="btn btn-outline" data-details="${p.id}" aria-expanded="false" aria-controls="details-${p.id}">View details</button>
      <a class="btn btn-ghost" href="${esc(p.site)}" target="_blank" rel="noopener">
        Official site
        <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M14 4h6v6M20 4l-9 9M20 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1h5"/></svg>
      </a>
      <label class="compare-check">
        <input type="checkbox" data-compare="${p.id}" ${state.compare.includes(p.id) ? 'checked' : ''}>
        Compare
      </label>
    </div>
  </article>`;
}

function render() {
  const grid = $('#program-grid');
  const results = PROGRAMS.filter(matches);
  grid.innerHTML = results.map(cardHTML).join('');
  // Cards render in place — no scroll reveal replay on every keystroke.
  $$('.reveal', grid).forEach((el) => el.classList.add('in'));

  const count = $('#program-count');
  if (count) count.innerHTML = `Showing <strong>${results.length}</strong> of ${PROGRAMS.length} programs`;
  $('#program-empty')?.toggleAttribute('hidden', results.length > 0);
  updateShortlistBadge();
}

/* ---- Shortlist ---- */

function updateShortlistBadge() {
  const badge = $('#shortlist-count');
  if (!badge) return;
  badge.textContent = state.shortlist.length;
  badge.parentElement.classList.toggle('hidden', state.shortlist.length === 0 && !state.savedOnly);
}

function toggleShortlist(id) {
  const saved = state.shortlist.includes(id);
  state.shortlist = saved
    ? state.shortlist.filter((x) => x !== id)
    : [...state.shortlist, id];
  store.set(SHORTLIST_KEY, state.shortlist);
  toast(saved ? 'Removed from shortlist' : 'Added to shortlist ♥');
  render();
}

/* ---- Compare ---- */

function renderCompareBar() {
  const bar = $('#compare-bar');
  if (!bar) return;
  const slots = $('.compare-slots', bar);
  bar.classList.toggle('visible', state.compare.length > 0);
  slots.innerHTML = state.compare.map((id) => {
    const p = PROGRAMS.find((x) => x.id === id);
    return `<span class="compare-slot">${esc(p.name)}
      <button data-uncompare="${id}" aria-label="Remove ${esc(p.name)} from comparison">
        <svg viewBox="0 0 24 24" class="icon" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>
      </button></span>`;
  }).join('');
  $('#compare-open').disabled = state.compare.length < 2;
}

function toggleCompare(id, checked) {
  if (checked && state.compare.length >= COMPARE_MAX) {
    toast(`Compare up to ${COMPARE_MAX} programs`);
    render();
    renderCompareBar();
    return;
  }
  state.compare = checked
    ? [...state.compare, id]
    : state.compare.filter((x) => x !== id);
  render();
  renderCompareBar();
}

function openCompareModal() {
  const modal = $('#compare-modal');
  const table = $('#compare-table');
  const programs = state.compare.map((id) => PROGRAMS.find((p) => p.id === id));
  const rows = [
    ['Level', (p) => `${p.level} · ${p.discipline}`],
    ['Institution', (p) => p.institution],
    ['Duration', (p) => p.duration ?? '—'],
    ['Intake', (p) => p.intake ?? '—'],
    ['Affiliation', (p) => p.affiliation],
    ['Eligibility', (p) => p.eligibility],
  ];
  table.innerHTML = `
    <thead><tr><th scope="col">Criteria</th>${programs.map((p) => `<th scope="col">${esc(p.name)}</th>`).join('')}</tr></thead>
    <tbody>${rows.map(([label, get]) =>
      `<tr><th scope="row">${label}</th>${programs.map((p) => `<td>${esc(get(p))}</td>`).join('')}</tr>`).join('')}
    </tbody>`;
  modal.classList.add('open');
  $('.modal-close', modal).focus();
  document.body.style.overflow = 'hidden';
}

/* ---- Init ---- */

export function initPrograms() {
  const grid = $('#program-grid');
  if (!grid) return;

  state.shortlist = store.get(SHORTLIST_KEY, []);

  /* Toolbar */
  const searchInput = $('#program-search');
  searchInput?.addEventListener('input', debounce(() => {
    state.query = searchInput.value.trim().toLowerCase();
    render();
  }, 160));

  $$('#level-filters .chip').forEach((chip) => chip.addEventListener('click', () => {
    $$('#level-filters .chip').forEach((c) => {
      c.classList.toggle('active', c === chip);
      c.setAttribute('aria-pressed', String(c === chip));
    });
    state.level = chip.dataset.value;
    render();
  }));

  $$('#discipline-filters .chip').forEach((chip) => chip.addEventListener('click', () => {
    $$('#discipline-filters .chip').forEach((c) => {
      c.classList.toggle('active', c === chip);
      c.setAttribute('aria-pressed', String(c === chip));
    });
    state.discipline = chip.dataset.value;
    render();
  }));

  const savedToggle = $('#saved-filter');
  savedToggle?.addEventListener('click', () => {
    state.savedOnly = !state.savedOnly;
    savedToggle.classList.toggle('active', state.savedOnly);
    savedToggle.setAttribute('aria-pressed', String(state.savedOnly));
    render();
  });

  /* Card actions (delegated — cards re-render) */
  grid.addEventListener('click', (e) => {
    const save = e.target.closest('[data-save]');
    if (save) toggleShortlist(save.dataset.save);

    const details = e.target.closest('[data-details]');
    if (details) {
      const panel = $(`#details-${details.dataset.details}`);
      const open = panel.toggleAttribute('hidden');
      details.setAttribute('aria-expanded', String(!open));
      details.textContent = open ? 'View details' : 'Hide details';
    }
  });
  grid.addEventListener('change', (e) => {
    const box = e.target.closest('[data-compare]');
    if (box) toggleCompare(box.dataset.compare, box.checked);
  });

  /* No-results suggestions */
  $('#program-empty')?.addEventListener('click', (e) => {
    const suggestion = e.target.closest('[data-suggest]');
    if (!suggestion) return;
    searchInput.value = suggestion.dataset.suggest;
    state.query = suggestion.dataset.suggest.toLowerCase();
    render();
  });

  /* Compare bar + modal */
  $('#compare-bar')?.addEventListener('click', (e) => {
    const remove = e.target.closest('[data-uncompare]');
    if (remove) toggleCompare(remove.dataset.uncompare, false);
    if (e.target.closest('#compare-clear')) {
      state.compare = [];
      render();
      renderCompareBar();
    }
    if (e.target.closest('#compare-open')) openCompareModal();
  });

  const modal = $('#compare-modal');
  const closeModal = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
    $('#compare-open')?.focus();
  };
  $('.modal-close', modal)?.addEventListener('click', closeModal);
  modal?.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
  window.addEventListener('keydown', (e) => {
    if (!modal?.classList.contains('open')) return;
    if (e.key === 'Escape') closeModal();
    if (e.key === 'Tab') trapFocus(modal, e);
  });

  render();
  renderCompareBar();

  // Deep links from the search palette (programs.html#<id>).
  if (location.hash) {
    const target = $(location.hash, grid);
    target?.scrollIntoView({ block: 'center' });
  }
}
