/**
 * 3D tilt for institution cards — pointer-tracked rotateX/rotateY
 * capped at 6°, with a gold sheen that follows the cursor.
 * Enabled only for fine pointers and never under reduced motion.
 */

import { $$, prefersReducedMotion } from './utils.js';

const MAX_TILT = 6;

export function initTilt() {
  if (prefersReducedMotion()) return;
  if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;

  $$('.tilt').forEach((card) => {
    let raf = null;

    card.addEventListener('pointermove', (e) => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        const rect = card.getBoundingClientRect();
        const px = (e.clientX - rect.left) / rect.width;
        const py = (e.clientY - rect.top) / rect.height;
        const rx = (0.5 - py) * MAX_TILT * 2;
        const ry = (px - 0.5) * MAX_TILT * 2;
        card.style.transform =
          `perspective(900px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-4px)`;
        card.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
        card.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
        raf = null;
      });
    });

    card.addEventListener('pointerleave', () => {
      if (raf) { cancelAnimationFrame(raf); raf = null; }
      card.style.transform = '';
    });
  });
}
