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

/* ——— Horizon chat assistant (answers common questions; no AI, no data stored) ——— */
(function () {
  const PHONE = '(763) 900-6456';
  const TEL = 'tel:+17639006456';
  const callLink = `<a href="${TEL}">${PHONE}</a>`;
  const tourLink = '<a href="contact.html">schedule a tour</a>';

  const TOPICS = [
    { id: 'tour', label: 'Schedule a tour',
      keys: ['tour', 'visit', 'see the home', 'appointment', 'come see', 'schedule'],
      answer: `Tours are by appointment and take about 30–45 minutes. You'll see the rooms and common areas, meet staff, and ask every question you have. Family members and care coordinators are welcome. Call ${callLink} or ${tourLink} online.` },
    { id: 'services', label: 'What care do you provide?',
      keys: ['service', 'care', 'help with', 'bathing', 'dressing', 'provide', 'offer', 'do you do'],
      answer: 'Our main service is 24-Hour Customized Living. Each resident gets an individual plan that can include personal care, medication management, mobility and transfer help, three home-cooked meals a day, housekeeping and laundry, activities, health monitoring under RN supervision, and help with appointments and transportation. <a href="services.html">See all services</a>.' },
    { id: 'pay', label: 'Payment & waivers',
      keys: ['pay', 'cost', 'price', 'rate', 'afford', 'waiver', 'cadi', 'elderly', 'brain', 'medicaid', 'insurance', 'money', 'how much'],
      answer: `We accept Minnesota Medicaid HCBS waivers for 24-Hour Customized Living: CADI, Elderly Waiver (EW), and Brain Injury (BI). We also accept long-term care insurance and private pay. For private pay rates, please call ${callLink}.` },
    { id: 'staff', label: 'Is staff there 24/7?',
      keys: ['24', 'night', 'overnight', 'staff', 'awake', 'weekend', 'holiday', 'always'],
      answer: 'Yes. A trained, awake staff member is in the home 24 hours a day, 7 days a week, including nights, weekends, and holidays. If help is needed at 3 a.m., someone is already there.' },
    { id: 'size', label: 'How many residents?',
      keys: ['how many', 'residents', 'small', 'size', 'bed', 'room', 'capacity'],
      answer: 'Horizon is a small home with just five residents, so everyone on staff knows every resident personally.' },
    { id: 'avail', label: 'Do you have openings?',
      keys: ['opening', 'available', 'availability', 'vacancy', 'space', 'move in', 'waitlist', 'wait list'],
      answer: `Availability changes, so the best way to check is to call ${callLink} or <a href="contact.html">send us a message</a>. We usually reply within one business day.` },
    { id: 'start', label: 'How do we get started?',
      keys: ['start', 'begin', 'qualify', 'eligible', 'assessment', 'case manager', 'referral', 'process', 'apply'],
      answer: `It's four simple steps: 1) Reach out for a no-pressure conversation. 2) Tour the home. 3) Your county case manager does a care assessment (we can work with them directly). 4) Move in on a timeline that feels right. Call ${callLink} to begin.` },
    { id: 'vets', label: 'Do you accept veterans?',
      keys: ['veteran', 'va ', ' va', 'military', 'served', 'army', 'navy', 'marine', 'air force'],
      answer: `Yes, Horizon proudly welcomes veteran seniors. Veterans may qualify for VA benefits that help pay for care; a County Veterans Service Officer can explain what's available. We're glad to answer questions about Horizon at ${callLink}.` },
    { id: 'where', label: 'Where are you & hours?',
      keys: ['where', 'address', 'location', 'located', 'directions', 'hours', 'open', 'office', 'phone', 'email', 'contact', 'call'],
      answer: `We're at 3136 Bloomington Ave S, Minneapolis, MN 55407. Care staff are there 24/7. Office hours are Mon–Fri, 8 am–5 pm. Phone: ${callLink} · Email: <a href="mailto:contact@horizonaliving.com">contact@horizonaliving.com</a>` },
    { id: 'meals', label: 'Meals',
      keys: ['meal', 'food', 'eat', 'diet', 'breakfast', 'lunch', 'dinner', 'snack'],
      answer: 'We cook three nutritious meals in the home every day, plus snacks, with accommodations for dietary restrictions, preferences, and texture needs.' },
    { id: 'meds', label: 'Medications',
      keys: ['medication', 'medicine', 'pill', 'pharmacy', 'nurse', 'nursing', 'doctor', 'health'],
      answer: 'Staff help with medication setup, reminders, and documentation, and coordinate with pharmacies and providers. Health monitoring and delegated nursing tasks are done under a registered nurse\'s supervision.' }
  ];
  const MENU = ['tour', 'services', 'pay', 'avail', 'vets', 'where'];
  const FALLBACK = `I'm not sure about that one, but our team is happy to help. Call ${callLink} or <a href="contact.html">send us a message</a>.`;
  const URGENT = /emergenc|911|hurt|fell|fall(en)?\b|chest pain|can't breathe|cannot breathe|suicid/i;

  const root = document.createElement('div');
  root.className = 'hz-chat';
  root.innerHTML = `
    <button class="hz-chat-btn" type="button" aria-expanded="false" aria-controls="hz-chat-panel">
      <span aria-hidden="true">💬</span> <span>Questions? Chat</span>
    </button>
    <section class="hz-chat-panel" id="hz-chat-panel" role="dialog" aria-label="Chat with Horizon" hidden>
      <header class="hz-chat-head">
        <img src="logo.png" alt="" width="36" height="37">
        <div><strong>Horizon Assistant</strong><small>Automated answers · call us anytime</small></div>
        <button type="button" class="hz-chat-close" aria-label="Close chat">✕</button>
      </header>
      <div class="hz-chat-log" aria-live="polite"></div>
      <div class="hz-chat-chips"></div>
      <form class="hz-chat-form">
        <label class="sr-only" for="hz-chat-input">Type your question</label>
        <input id="hz-chat-input" type="text" placeholder="Type a question…" autocomplete="off" maxlength="200">
        <button type="submit">Send</button>
      </form>
    </section>`;
  document.body.appendChild(root);

  const btn = root.querySelector('.hz-chat-btn');
  const panel = root.querySelector('.hz-chat-panel');
  const log = root.querySelector('.hz-chat-log');
  const chips = root.querySelector('.hz-chat-chips');
  const form = root.querySelector('.hz-chat-form');
  const input = root.querySelector('#hz-chat-input');
  let started = false;

  function add(who, content, isHTML) {
    const b = document.createElement('div');
    b.className = 'hz-msg hz-' + who;
    if (isHTML) b.innerHTML = content; else b.textContent = content;
    log.appendChild(b);
    log.scrollTop = log.scrollHeight;
  }
  function showChips(ids) {
    chips.innerHTML = '';
    ids.forEach(id => {
      const t = TOPICS.find(x => x.id === id);
      const c = document.createElement('button');
      c.type = 'button'; c.textContent = t.label;
      c.addEventListener('click', () => { add('user', t.label); reply(t); });
      chips.appendChild(c);
    });
  }
  function reply(t) {
    setTimeout(() => {
      add('bot', t ? t.answer : FALLBACK, true);
      showChips(MENU.filter(id => !t || id !== t.id).slice(0, 5));
    }, 350);
  }
  function match(text) {
    const q = ' ' + text.toLowerCase() + ' ';
    let best = null, score = 0;
    TOPICS.forEach(t => {
      const s = t.keys.reduce((n, k) => n + (q.includes(k) ? k.length : 0), 0);
      if (s > score) { score = s; best = t; }
    });
    return best;
  }
  function open(state) {
    panel.hidden = !state;
    btn.setAttribute('aria-expanded', String(state));
    root.classList.toggle('is-open', state);
    if (state && !started) {
      started = true;
      add('bot', 'Hi! 👋 Welcome to Horizon Assisted Living. I can answer common questions about our home, care, and tours. What would you like to know?');
      showChips(MENU);
    }
    if (state) input.focus();
  }
  btn.addEventListener('click', () => open(panel.hidden));
  root.querySelector('.hz-chat-close').addEventListener('click', () => open(false));
  document.addEventListener('keydown', e => { if (e.key === 'Escape' && !panel.hidden) open(false); });
  form.addEventListener('submit', e => {
    e.preventDefault();
    const text = input.value.trim();
    if (!text) return;
    add('user', text);
    input.value = '';
    if (URGENT.test(text)) {
      setTimeout(() => add('bot', `If this is an emergency, please call <a href="tel:911">911</a> right away. For anything else, call us at ${callLink}.`, true), 300);
      return;
    }
    reply(match(text));
  });
})();
