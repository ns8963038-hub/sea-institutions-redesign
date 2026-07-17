/**
 * Gallery systems: generic chip filtering (gallery + institutions),
 * the custom lightbox (keyboard ←/→/Esc, focus-trapped, captioned),
 * and click-to-load YouTube embeds.
 */

import { $, $$, esc, trapFocus } from './utils.js';

/* ---- Generic chip filters: [data-filter] chips + [data-category] items ---- */

export function initFilters() {
  $$('[data-filter-group]').forEach((group) => {
    const chips = $$('[data-filter]', group);
    const scope = group.dataset.filterScope
      ? $(group.dataset.filterScope)
      : group.parentElement;
    if (!chips.length || !scope) return;

    const count = $('[data-filter-count]', group.parentElement) || $(group.dataset.filterCount || null);

    chips.forEach((chip) => {
      chip.addEventListener('click', () => {
        chips.forEach((c) => {
          c.classList.toggle('active', c === chip);
          c.setAttribute('aria-pressed', String(c === chip));
        });
        const value = chip.dataset.filter;
        let visible = 0;
        $$('[data-category]', scope).forEach((item) => {
          const show = value === 'all' || item.dataset.category.split(' ').includes(value);
          item.classList.toggle('filtered-out', !show);
          item.classList.toggle('hidden', !show);
          if (show) visible += 1;
        });
        if (count) count.textContent = visible;
      });
    });
  });
}

/* ---- Lightbox ---- */

export function initLightbox() {
  const lightbox = $('.lightbox');
  if (!lightbox) return;

  const img = $('img', lightbox);
  const caption = $('.lightbox-caption', lightbox);
  const counter = $('.lightbox-counter', lightbox);
  let items = [];
  let index = 0;
  let lastFocus = null;

  const visibleItems = () => $$('.gallery-item').filter((el) => !el.classList.contains('filtered-out'));

  const show = (i) => {
    items = visibleItems();
    if (!items.length) return;
    index = (i + items.length) % items.length;
    const source = $('img', items[index]);
    img.src = source.dataset.full || source.src;
    img.alt = source.alt;
    caption.textContent = items[index].dataset.caption || source.alt;
    counter.textContent = `${index + 1} / ${items.length}`;
  };

  const open = (i) => {
    lastFocus = document.activeElement;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    show(i);
    $('.lightbox-close', lightbox).focus();
  };
  const close = () => {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    img.src = '';
    lastFocus?.focus?.();
  };

  document.addEventListener('click', (e) => {
    const item = e.target.closest('.gallery-item');
    if (item) open(visibleItems().indexOf(item));
  });

  $('.lightbox-close', lightbox).addEventListener('click', close);
  $('.lightbox-prev', lightbox).addEventListener('click', () => show(index - 1));
  $('.lightbox-next', lightbox).addEventListener('click', () => show(index + 1));
  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) close();
  });

  window.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    if (e.key === 'ArrowLeft') show(index - 1);
    if (e.key === 'ArrowRight') show(index + 1);
    if (e.key === 'Tab') trapFocus(lightbox, e);
  });
}

/* ---- Click-to-load YouTube embeds (no third-party JS until asked) ---- */

export function initVideos() {
  $$('.video-card[data-video]').forEach((card) => {
    card.addEventListener('click', () => {
      const id = card.dataset.video;
      const title = card.dataset.title || 'SEA campus video';
      const frame = document.createElement('iframe');
      frame.src = `https://www.youtube-nocookie.com/embed/${encodeURIComponent(id)}?autoplay=1`;
      frame.title = title;
      frame.allow = 'accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture';
      frame.allowFullscreen = true;
      card.innerHTML = '';
      card.append(frame);
      card.classList.add('playing');
    }, { once: true });
  });
}
