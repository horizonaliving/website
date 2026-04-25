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

/* ——— Contact form — Formspree AJAX submission ——— */
const form    = document.getElementById('contact-form');
const success = document.getElementById('success-msg');

if (form && success) {
  form.addEventListener('submit', async (e) => {
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

    const submitBtn = form.querySelector('button[type="submit"]');
    const originalLabel = submitBtn ? submitBtn.textContent : '';
    if (submitBtn) {
      submitBtn.setAttribute('disabled', '');
      submitBtn.textContent = 'Sending…';
    }

    try {
      const res = await fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        form.querySelectorAll('input, select, textarea').forEach(el => el.setAttribute('disabled', ''));
        if (submitBtn) submitBtn.textContent = 'Message Sent';
        success.style.display = 'block';
        success.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      } else {
        const data = await res.json().catch(() => ({}));
        const msg = (data.errors && data.errors.map(e => e.message).join(', ')) || 'Something went wrong. Please call us at (763) 900-6456.';
        alert(msg);
        if (submitBtn) {
          submitBtn.removeAttribute('disabled');
          submitBtn.textContent = originalLabel;
        }
      }
    } catch (err) {
      alert('Network error. Please try again or call us at (763) 900-6456.');
      if (submitBtn) {
        submitBtn.removeAttribute('disabled');
        submitBtn.textContent = originalLabel;
      }
    }
  });

  /* Clear field error highlight on input */
  form.querySelectorAll('input, select, textarea').forEach(el => {
    el.addEventListener('input', () => { el.style.borderColor = ''; });
  });
}
