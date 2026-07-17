/**
 * Reusable fade slider — powers the cinematic hero and the
 * testimonials carousel. Autoplay with pause control, swipe on touch,
 * keyboard arrows, dot indicators, reduced-motion aware.
 */

import { $, $$, prefersReducedMotion } from './utils.js';

export class Slider {
  /**
   * @param {HTMLElement} root
   * @param {object} opts
   * @param {string} opts.slideSelector
   * @param {number} [opts.interval] autoplay ms (0 = off)
   * @param {HTMLElement} [opts.dotsContainer]
   * @param {HTMLElement} [opts.pauseButton]
   * @param {HTMLElement} [opts.prevButton]
   * @param {HTMLElement} [opts.nextButton]
   */
  constructor(root, opts) {
    this.root = root;
    this.slides = $$(opts.slideSelector, root);
    this.interval = prefersReducedMotion() ? 0 : (opts.interval ?? 0);
    this.dotsContainer = opts.dotsContainer;
    this.pauseButton = opts.pauseButton;
    this.index = 0;
    this.timer = null;
    this.paused = false;

    if (this.slides.length < 2) return;

    if (this.dotsContainer) this.buildDots();
    opts.prevButton?.addEventListener('click', () => this.go(this.index - 1, true));
    opts.nextButton?.addEventListener('click', () => this.go(this.index + 1, true));
    this.pauseButton?.addEventListener('click', () => this.togglePause());

    // Swipe on touch.
    let startX = null;
    root.addEventListener('pointerdown', (e) => { startX = e.clientX; }, { passive: true });
    root.addEventListener('pointerup', (e) => {
      if (startX === null) return;
      const dx = e.clientX - startX;
      if (Math.abs(dx) > 48) this.go(this.index + (dx < 0 ? 1 : -1), true);
      startX = null;
    }, { passive: true });

    // Keyboard when the region has focus.
    root.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') this.go(this.index - 1, true);
      if (e.key === 'ArrowRight') this.go(this.index + 1, true);
    });

    // Don't animate while the tab is hidden.
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) this.stop();
      else this.play();
    });

    this.go(0);
    this.play();
  }

  buildDots() {
    this.dots = this.slides.map((_, i) => {
      const dot = document.createElement('button');
      dot.className = 'hero-dot';
      dot.setAttribute('aria-label', `Go to slide ${i + 1} of ${this.slides.length}`);
      dot.addEventListener('click', () => this.go(i, true));
      this.dotsContainer.append(dot);
      return dot;
    });
  }

  go(index, user = false) {
    this.index = (index + this.slides.length) % this.slides.length;
    this.slides.forEach((slide, i) => {
      slide.classList.toggle('active', i === this.index);
      slide.setAttribute('aria-hidden', String(i !== this.index));
    });
    this.dots?.forEach((dot, i) => {
      dot.classList.toggle('active', i === this.index);
      dot.classList.toggle('paused', this.paused);
    });
    if (user) this.play(); // restart the clock after manual navigation
  }

  play() {
    this.stop();
    if (!this.interval || this.paused) return;
    this.timer = setInterval(() => this.go(this.index + 1), this.interval);
  }

  stop() {
    clearInterval(this.timer);
    this.timer = null;
  }

  togglePause() {
    this.paused = !this.paused;
    this.pauseButton.setAttribute('aria-pressed', String(this.paused));
    this.pauseButton.setAttribute('aria-label', this.paused ? 'Resume slideshow' : 'Pause slideshow');
    const [playIcon, pauseIcon] = $$('svg', this.pauseButton);
    if (playIcon && pauseIcon) {
      playIcon.classList.toggle('hidden', !this.paused);
      pauseIcon.classList.toggle('hidden', this.paused);
    }
    this.dots?.forEach((d) => d.classList.toggle('paused', this.paused));
    if (this.paused) this.stop();
    else this.play();
  }
}

export function initSliders() {
  const hero = $('.hero[data-slider]');
  if (hero) {
    new Slider(hero, {
      slideSelector: '.hero-slide',
      interval: 6000,
      dotsContainer: $('.hero-dots', hero),
      pauseButton: $('.hero-pause', hero),
    });
  }

  const testimonials = $('.testimonials[data-slider]');
  if (testimonials) {
    new Slider(testimonials, {
      slideSelector: '.testimonial',
      interval: 7000,
      prevButton: $('.carousel-prev', testimonials),
      nextButton: $('.carousel-next', testimonials),
    });
  }
}
