/* Horizon Assisted Living — main.js */

/* ——— Mobile nav toggle ——— */
const toggle = document.getElementById('nav-toggle');
const links  = document.getElementById('nav-links');

if (toggle && links) {
  toggle.addEventListener('click', () => {
    const open = links.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
  });

  document.addEventListener('click', (e) => {
    if (!links.contains(e.target) && !toggle.contains(e.target)) {
      links.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    }
  });
}

/* ——— Contact form — client-side demo handler ——— */
const form    = document.getElementById('contact-form');
const success = document.getElementById('success-msg');

if (form && success) {
  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const required = form.querySelectorAll('[required]');
    let valid = true;
    required.forEach(el => {
      if (!el.value.trim()) {
        el.style.borderColor = 'var(--terracotta)';
        valid = false;
      } else {
        el.style.borderColor = '';
      }
    });

    if (!valid) return;

    /* In production, replace this block with a real form submission
       (e.g. fetch to a backend endpoint, Formspree, Netlify Forms, etc.) */
    form.querySelectorAll('input, select, textarea, button').forEach(el => {
      el.setAttribute('disabled', '');
    });

    success.style.display = 'block';
    success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  });

  /* Clear field error highlight on input */
  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => { el.style.borderColor = ''; });
  });
}
