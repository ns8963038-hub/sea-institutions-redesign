/**
 * Entry point — initializes every module. Each init is a no-op when
 * its DOM hooks are absent, so one bundle serves all pages.
 */

import { initTheme } from './theme.js';
import { initLoader } from './loader.js';
import { initNav } from './nav.js';
import { initReveal, initTimeline } from './reveal.js';
import { initCounters } from './counters.js';
import { initSliders } from './slider.js';
import { initTabs, initAccordions } from './tabs.js';
import { initTicker } from './ticker.js';
import { initTilt } from './tilt.js';
import { initSearch } from './search.js';
import { initApplyForm, initContactForm, initNewsletter } from './forms.js';
import { initFilters, initLightbox, initVideos } from './gallery.js';
import { initPrograms } from './programs.js';

initLoader();
initTheme();
initNav();
initTicker();
initSearch();
initNewsletter();

initPrograms();   // before reveal so injected cards are observed correctly
initSliders();
initTabs();
initAccordions();
initFilters();
initLightbox();
initVideos();
initApplyForm();
initContactForm();
initTilt();
initCounters();
initTimeline();
initReveal();
