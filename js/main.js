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

/* ——— Contact form — validation + Formspree AJAX submission ——— */
const form    = document.getElementById('contact-form');
const success = document.getElementById('success-msg');

if (form && success) {

  /* Email validation: must look like name@domain.tld */
  const EMAIL_RE = /^[A-Za-z0-9._%+\-]+@[A-Za-z0-9.\-]+\.[A-Za-z]{2,}$/;

  /* Format US phone as user types: (XXX) XXX-XXXX */
  const phoneInput = form.querySelector('#phone');
  if (phoneInput) {
    phoneInput.addEventListener('input', () => {
      const digits = phoneInput.value.replace(/\D/g, '').slice(0, 10);
      let formatted = digits;
      if (digits.length > 6) {
        formatted = `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
      } else if (digits.length > 3) {
        formatted = `(${digits.slice(0,3)}) ${digits.slice(3)}`;
      } else if (digits.length > 0) {
        formatted = `(${digits}`;
      }
      phoneInput.value = formatted;
    });
  }

  function setError(fieldId, message) {
    const field = form.querySelector(`#${fieldId}`);
    const errEl = form.querySelector(`#err-${fieldId}`);
    if (field) field.classList.add('invalid');
    if (errEl) {
      errEl.textContent = message;
      errEl.classList.add('show');
    }
  }
  function clearError(fieldId) {
    const field = form.querySelector(`#${fieldId}`);
    const errEl = form.querySelector(`#err-${fieldId}`);
    if (field) field.classList.remove('invalid');
    if (errEl) {
      errEl.textContent = '';
      errEl.classList.remove('show');
    }
  }
  function clearAllErrors() {
    ['fname','lname','email','phone','reason','message'].forEach(clearError);
  }

  function validate() {
    clearAllErrors();
    let valid = true;
    let firstInvalid = null;

    const fname  = form.fname.value.trim();
    const lname  = form.lname.value.trim();
    const email  = form.email.value.trim();
    const phone  = form.phone.value.trim();
    const reason = form.reason.value;
    const msg    = form.message.value.trim();

    if (!fname) { setError('fname', 'Please enter your first name.'); firstInvalid = firstInvalid || 'fname'; valid = false; }
    if (!lname) { setError('lname', 'Please enter your last name.');  firstInvalid = firstInvalid || 'lname'; valid = false; }

    if (!email) {
      setError('email', 'Please enter your email address.');
      firstInvalid = firstInvalid || 'email'; valid = false;
    } else if (!EMAIL_RE.test(email)) {
      setError('email', 'Please enter a valid email (e.g. name@example.com).');
      firstInvalid = firstInvalid || 'email'; valid = false;
    }

    /* Phone is optional, but if filled, must be 10 digits */
    if (phone) {
      const digits = phone.replace(/\D/g, '');
      if (digits.length !== 10) {
        setError('phone', 'Please enter a 10-digit US phone number — or leave it blank.');
        firstInvalid = firstInvalid || 'phone'; valid = false;
      }
    }

    if (!reason) { setError('reason', 'Please choose a reason.'); firstInvalid = firstInvalid || 'reason'; valid = false; }

    if (!msg) {
      setError('message', 'Please tell us a little about your situation.');
      firstInvalid = firstInvalid || 'message'; valid = false;
    } else if (msg.length < 10) {
      setError('message', 'A little more detail helps us help you — at least 10 characters.');
      firstInvalid = firstInvalid || 'message'; valid = false;
    }

    if (firstInvalid) {
      const el = form.querySelector(`#${firstInvalid}`);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setTimeout(() => el.focus({ preventScroll: true }), 200);
      }
    }
    return valid;
  }

  /* Live: clear individual field errors as user fixes them */
  form.querySelectorAll('input, select, textarea').forEach(el => {
    const evt = el.tagName === 'SELECT' ? 'change' : 'input';
    el.addEventListener(evt, () => {
      if (el.id) clearError(el.id);
    });
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validate()) return;

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
        const message = (data.errors && data.errors.map(e => e.message).join(', ')) || 'Something went wrong. Please call us at (763) 900-6456.';
        alert(message);
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
}
