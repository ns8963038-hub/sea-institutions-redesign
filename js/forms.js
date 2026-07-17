/**
 * Form engine: live validation, the 3-step application flow with
 * draft autosave to localStorage, an honest success summary (no fake
 * "submitted" claim), the contact form and the newsletter field.
 */

import { $, $$, esc, store, toast, debounce, prefersReducedMotion } from './utils.js';

const DRAFT_KEY = 'sea-apply-draft';

const RULES = {
  required: (v) => v.trim() !== '' || 'This field is required.',
  email: (v) => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) || 'Enter a valid email address.',
  phone: (v) => v === '' || /^[+]?[\d\s-]{10,15}$/.test(v.trim()) || 'Enter a valid phone number (10–15 digits).',
  name: (v) => v === '' || /^[A-Za-z][A-Za-z\s.'-]{1,60}$/.test(v.trim()) || 'Use letters, spaces and simple punctuation only.',
  dob: (v) => {
    if (v === '') return true;
    const dob = new Date(v);
    if (Number.isNaN(dob.getTime()) || dob > new Date()) return 'Enter a valid date of birth.';
    const age = (Date.now() - dob.getTime()) / (365.25 * 24 * 3600 * 1000);
    return (age >= 3 && age <= 80) || 'Please check the date of birth.';
  },
};

function validateField(input) {
  const field = input.closest('.field');
  const errorEl = field?.querySelector('.error');
  if (!field || !errorEl) return true;

  const checks = (input.dataset.validate || '').split(' ').filter(Boolean);
  if (input.required) checks.unshift('required');

  for (const rule of checks) {
    const result = RULES[rule]?.(input.value);
    if (typeof result === 'string') {
      field.classList.add('invalid');
      errorEl.textContent = result;
      if (!prefersReducedMotion()) {
        field.classList.remove('shake');
        void field.offsetWidth; // restart the animation
        field.classList.add('shake');
      }
      input.setAttribute('aria-invalid', 'true');
      return false;
    }
  }
  field.classList.remove('invalid');
  errorEl.textContent = '';
  input.removeAttribute('aria-invalid');
  return true;
}

function validateGroup(container) {
  const inputs = $$('input, select, textarea', container).filter((i) => i.type !== 'hidden');
  return inputs.map((i) => validateField(i)).every(Boolean);
}

function wireLiveValidation(form) {
  form.addEventListener('blur', (e) => {
    if (e.target.matches('input, select, textarea')) validateField(e.target);
  }, true);
  form.addEventListener('input', (e) => {
    const field = e.target.closest('.field');
    if (field?.classList.contains('invalid')) validateField(e.target);
  });
}

/* ================= Multi-step application ================= */

export function initApplyForm() {
  const form = $('#apply-form');
  if (!form) return;

  const steps = $$('.form-step', form);
  const stepperSteps = $$('.stepper-step');
  const draftBanner = $('#draft-banner');
  let current = 0;

  const show = (index) => {
    current = index;
    steps.forEach((s, i) => s.classList.toggle('active', i === index));
    stepperSteps.forEach((s, i) => {
      s.classList.toggle('active', i === index);
      s.classList.toggle('done', i < index);
    });
    if (index === steps.length - 1) renderReview();
    $('.form-step.active', form)?.querySelector('input, select, textarea, button')?.focus();
  };

  /* Draft autosave */
  const saveDraft = debounce(() => {
    const data = Object.fromEntries(new FormData(form));
    store.set(DRAFT_KEY, data);
    toast('Draft saved ✓');
  }, 900);
  form.addEventListener('input', saveDraft);

  /* Restore draft */
  const draft = store.get(DRAFT_KEY);
  if (draft && Object.values(draft).some((v) => String(v).trim())) {
    draftBanner?.removeAttribute('hidden');
    $('#draft-restore')?.addEventListener('click', () => {
      Object.entries(draft).forEach(([name, value]) => {
        if (form.elements[name]) form.elements[name].value = value;
      });
      draftBanner.setAttribute('hidden', '');
      toast('Draft restored');
    });
    $('#draft-discard')?.addEventListener('click', () => {
      store.remove(DRAFT_KEY);
      draftBanner.setAttribute('hidden', '');
    });
  }

  /* Step navigation */
  form.addEventListener('click', (e) => {
    const next = e.target.closest('[data-next]');
    const prev = e.target.closest('[data-prev]');
    if (next) {
      if (validateGroup(steps[current])) show(current + 1);
      else $('.field.invalid input, .field.invalid select', steps[current])?.focus();
    }
    if (prev) show(current - 1);
  });

  function renderReview() {
    const list = $('#review-list');
    if (!list) return;
    const labels = {
      studentName: "Student's full name", institution: 'Institution applying to',
      fatherName: "Father's name", motherName: "Mother's name",
      phone: 'Contact number', email: 'Email', dob: 'Date of birth', address: 'Address',
    };
    const data = Object.fromEntries(new FormData(form));
    list.innerHTML = Object.entries(labels)
      .filter(([key]) => data[key])
      .map(([key, label]) => `<div><dt>${label}</dt><dd>${esc(data[key])}</dd></div>`)
      .join('');
  }

  wireLiveValidation(form);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateGroup(form)) {
      // Jump back to the first step containing an error.
      const bad = steps.findIndex((s) => $('.field.invalid', s));
      if (bad !== -1) show(bad);
      return;
    }
    const name = form.elements.studentName?.value?.split(' ')[0] || 'there';
    saveDraft.cancel(); // a pending autosave must not resurrect the draft
    store.remove(DRAFT_KEY);
    $('#apply-wrapper').innerHTML = `
      <div class="success-state">
        <div class="success-check" aria-hidden="true">
          <svg class="icon" viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg>
        </div>
        <span class="section-kicker">Details verified</span>
        <h2>Thank you, ${esc(name)} — your details are ready.</h2>
        <p class="lede" style="max-width:44rem;margin:1rem auto 0">
          This demonstration site does not transmit applications. To complete a real
          application, contact the SEA Office of Admissions with the details you prepared —
          the team will guide you through the next steps.
        </p>
        <div class="hero-actions" style="justify-content:center">
          <a class="btn btn-primary" href="tel:+917353945999">
            <svg class="icon" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/></svg>
            Call +91 73539 45999</a>
          <a class="btn btn-outline" href="mailto:seaeduinfo@seaedu.ac.in">Email the admissions office</a>
        </div>
      </div>`;
    $('#apply-wrapper').scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'center' });
  });

  show(0);
}

/* ================= Contact form ================= */

export function initContactForm() {
  const form = $('#contact-form');
  if (!form) return;

  wireLiveValidation(form);

  const message = form.elements.message;
  const counter = $('.char-counter', form);
  if (message && counter) {
    const max = message.maxLength > 0 ? message.maxLength : 600;
    const update = () => { counter.textContent = `${message.value.length} / ${max}`; };
    message.addEventListener('input', update);
    update();
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!validateGroup(form)) return;
    form.innerHTML = `
      <div class="success-state">
        <div class="success-check" aria-hidden="true">
          <svg class="icon" viewBox="0 0 24 24"><path d="M4 12.5l5 5L20 6.5"/></svg>
        </div>
        <h3>Your message is ready to send.</h3>
        <p class="muted" style="max-width:38rem;margin:.75rem auto 0">
          This demonstration form does not deliver messages. Please reach the SEA team
          directly at <a href="mailto:seaeduinfo@seaedu.ac.in">seaeduinfo@seaedu.ac.in</a>
          or call <a href="tel:+916366453030">+91 63664 53030</a> — they respond
          Monday to Saturday, 10&nbsp;AM to 5&nbsp;PM.
        </p>
      </div>`;
  });
}

/* ================= Newsletter (footer) ================= */

export function initNewsletter() {
  $$('.newsletter').forEach((box) => {
    const input = $('input', box.parentElement);
    const error = $('.error', box.parentElement);
    $('button', box)?.addEventListener('click', () => {
      const value = input.value.trim();
      if (!value || RULES.email(value) !== true) {
        error.textContent = 'Enter a valid email address.';
        input.focus();
        return;
      }
      error.textContent = '';
      input.value = '';
      toast('Thanks! Reach us at seaeduinfo@seaedu.ac.in for updates.');
    });
  });
}
