/* Sunbridge Freight — site behavior. No deps. */
(function () {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  document.addEventListener('DOMContentLoaded', function () {
    initStickyHeader();
    initMobileNav();
    initRevealOnScroll();
    initCounters();
    initTrackDialog();
    initYear();
    initNewsletter();
    initQuoteForm();
    initHeroQuickQuote();
    initQuotePrefill();
  });

  /* Sticky header — shadow on scroll */
  function initStickyHeader() {
    const header = document.querySelector('.site-header');
    if (!header) return;
    let ticking = false;
    function onScroll() {
      if (!ticking) {
        window.requestAnimationFrame(function () {
          header.classList.toggle('is-scrolled', window.scrollY > 8);
          ticking = false;
        });
        ticking = true;
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  /* Mobile nav */
  function initMobileNav() {
    const toggle = document.querySelector('.nav-toggle');
    const nav = document.getElementById('primary-nav');
    if (!toggle || !nav) return;

    function close() {
      toggle.setAttribute('aria-expanded', 'false');
      toggle.setAttribute('aria-label', 'Open navigation');
      nav.classList.remove('is-open');
    }
    function open() {
      toggle.setAttribute('aria-expanded', 'true');
      toggle.setAttribute('aria-label', 'Close navigation');
      nav.classList.add('is-open');
    }

    toggle.addEventListener('click', function () {
      const isOpen = toggle.getAttribute('aria-expanded') === 'true';
      isOpen ? close() : open();
    });

    nav.addEventListener('click', function (e) {
      const t = e.target;
      if (t instanceof HTMLAnchorElement) close();
    });

    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') close();
    });

    document.addEventListener('click', function (e) {
      if (!nav.classList.contains('is-open')) return;
      if (nav.contains(e.target) || toggle.contains(e.target)) return;
      close();
    });
  }

  /* Reveal on scroll */
  function initRevealOnScroll() {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      els.forEach(function (el) { el.classList.add('is-visible'); });
      return;
    }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -60px 0px', threshold: 0.08 });
    els.forEach(function (el) { io.observe(el); });
    // Defensive fallback: ensure everything is visible after 2.5s
    // in case the page is loaded mid-scroll or the observer never fires.
    setTimeout(function () {
      els.forEach(function (el) { el.classList.add('is-visible'); });
    }, 2500);
  }

  /* Stat counters */
  function initCounters() {
    const nodes = document.querySelectorAll('[data-target]');
    if (!nodes.length) return;
    if (reduceMotion || !('IntersectionObserver' in window)) {
      nodes.forEach(function (n) {
        const target = parseFloat(n.getAttribute('data-target')) || 0;
        const suffix = n.getAttribute('data-suffix') || '';
        n.textContent = formatStat(target) + suffix;
      });
      return;
    }
    const io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        animateCount(entry.target);
        io.unobserve(entry.target);
      });
    }, { threshold: 0.5 });
    nodes.forEach(function (n) { io.observe(n); });
  }

  function animateCount(node) {
    const target = parseFloat(node.getAttribute('data-target')) || 0;
    const suffix = node.getAttribute('data-suffix') || '';
    const isFloat = (node.getAttribute('data-target') || '').indexOf('.') !== -1;
    const duration = 1300;
    const start = performance.now();
    node.setAttribute('aria-live', 'off');
    function tick(now) {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const v = target * eased;
      node.textContent = (isFloat ? v.toFixed(1) : Math.round(v).toLocaleString()) + suffix;
      if (t < 1) window.requestAnimationFrame(tick);
      else node.textContent = formatStat(target) + suffix;
    }
    window.requestAnimationFrame(tick);
  }

  function formatStat(n) {
    const isFloat = !Number.isInteger(n);
    return isFloat ? n.toFixed(1) : Math.round(n).toLocaleString();
  }

  /* Track dialog */
  function initTrackDialog() {
    const open = document.getElementById('track-open');
    const dialog = document.getElementById('track-dialog');
    const close = document.getElementById('track-close');
    const form = document.getElementById('track-form');
    const input = document.getElementById('track-input');
    const feedback = document.getElementById('track-feedback');
    if (!open || !dialog) return;

    const canDialog = typeof dialog.showModal === 'function';

    open.addEventListener('click', function () {
      if (canDialog) dialog.showModal();
      else dialog.setAttribute('open', '');
      setTimeout(function () { input && input.focus(); }, 40);
    });
    close && close.addEventListener('click', function () {
      if (canDialog) dialog.close(); else dialog.removeAttribute('open');
      feedback.textContent = '';
    });
    dialog.addEventListener('click', function (e) {
      if (e.target === dialog) {
        if (canDialog) dialog.close(); else dialog.removeAttribute('open');
        feedback.textContent = '';
      }
    });

    form && form.addEventListener('submit', function (e) {
      e.preventDefault();
      const v = (input.value || '').trim();
      if (!v) {
        feedback.textContent = 'Enter a reference to see a demo status.';
        return;
      }
      feedback.innerHTML = '<strong style="color:var(--color-accent);">On track.</strong> ' + escapeHtml(v) + ' — currently in transit. ETA in 6 days. (Demo response.)';
    });
  }

  /* Year */
  function initYear() {
    const nodes = document.querySelectorAll('#year');
    nodes.forEach(function (n) { n.textContent = String(new Date().getFullYear()); });
  }

  /* Newsletter (visual only) */
  function initNewsletter() {
    const form = document.getElementById('newsletter');
    if (!form) return;
    const ok = form.querySelector('.newsletter__success');
    const note = form.querySelector('.newsletter__note');
    const email = form.querySelector('input[type="email"]');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      if (!email.value || !isEmail(email.value)) {
        email.focus();
        email.style.borderColor = '#E8843C';
        return;
      }
      ok.hidden = false;
      if (note) note.style.display = 'none';
      form.querySelector('.newsletter__row').style.display = 'none';
    });
  }

  /* Quote form — mailto */
  function initQuoteForm() {
    const form = document.getElementById('quote-form');
    if (!form) return;
    const successPanel = document.getElementById('form-success');
    const resetBtn = document.getElementById('form-reset');
    const globalErr = document.getElementById('form-error-global');

    form.addEventListener('submit', function (e) {
      e.preventDefault();
      globalErr.textContent = '';

      // Clear previous field errors
      form.querySelectorAll('.form-field').forEach(function (f) {
        f.removeAttribute('aria-invalid');
        const err = f.querySelector('.form-error');
        if (err) err.textContent = '';
      });

      const fields = {
        name: form.elements['name'],
        company: form.elements['company'],
        email: form.elements['email'],
        phone: form.elements['phone'],
        origin: form.elements['origin'],
        destination: form.elements['destination'],
        mode: form.querySelectorAll('input[name="mode"]'),
        weight: form.elements['weight'],
        ready_by: form.elements['ready_by'],
        cargo: form.elements['cargo'],
        consent: form.elements['consent']
      };

      let ok = true;

      function fail(name, msg) {
        ok = false;
        const el = name === 'mode'
          ? form.querySelector('.mode-group').closest('.form-field')
          : (form.elements[name] && form.elements[name].closest('.form-field'));
        if (!el) return;
        el.setAttribute('aria-invalid', 'true');
        const err = el.querySelector('.form-error');
        if (err) err.textContent = msg;
      }

      if (!fields.name.value.trim()) fail('name', 'Please enter your name.');
      if (!fields.company.value.trim()) fail('company', 'Please enter your company.');
      if (!fields.email.value.trim()) fail('email', 'Please enter your work email.');
      else if (!isEmail(fields.email.value)) fail('email', 'That email doesn\'t look right.');
      if (!fields.origin.value.trim()) fail('origin', 'Please enter an origin.');
      if (!fields.destination.value.trim()) fail('destination', 'Please enter a destination.');

      let modeVal = '';
      fields.mode.forEach(function (r) { if (r.checked) modeVal = r.value; });
      if (!modeVal) fail('mode', 'Please pick a mode.');

      if (!fields.consent.checked) fail('consent', 'We need your consent to reply.');

      if (!ok) {
        globalErr.textContent = 'Please fix the highlighted fields above.';
        const firstInvalid = form.querySelector('[aria-invalid="true"]');
        firstInvalid && firstInvalid.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });
        return;
      }

      // Build mailto:
      const subject = 'New quote request — ' + (fields.origin.value || '?') + ' → ' + (fields.destination.value || '?');
      const lines = [
        'Name:        ' + fields.name.value,
        'Company:     ' + fields.company.value,
        'Email:       ' + fields.email.value,
        'Phone:       ' + (fields.phone.value || '—'),
        '',
        'Origin:      ' + fields.origin.value,
        'Destination: ' + fields.destination.value,
        'Mode:        ' + modeVal,
        'Weight/Vol:  ' + (fields.weight.value || '—'),
        'Ready by:    ' + (fields.ready_by.value || '—'),
        '',
        'Cargo description:',
        (fields.cargo.value || '—'),
        '',
        '—',
        'Sent from the sunbridgefreight.com quote form.'
      ];
      const body = lines.join('\n');
      const url = 'mailto:hello@sunbridgefreight.com'
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(body);

      // Hide form, show success
      form.style.display = 'none';
      successPanel.classList.add('is-on');
      successPanel.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'center' });

      // Trigger mailto
      window.location.href = url;
    });

    resetBtn && resetBtn.addEventListener('click', function () {
      form.reset();
      form.style.display = '';
      successPanel.classList.remove('is-on');
      form.querySelectorAll('.form-field').forEach(function (f) {
        f.removeAttribute('aria-invalid');
        const err = f.querySelector('.form-error');
        if (err) err.textContent = '';
      });
      globalErr.textContent = '';
      form.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'start' });
      const first = form.elements['name'];
      first && first.focus();
    });
  }

  /* Hero quick-quote — hand off From/To/Mode to quote.html via query string */
  function initHeroQuickQuote() {
    const form = document.getElementById('hero-quick-quote');
    if (!form) return;
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      const data = new FormData(form);
      const params = new URLSearchParams();
      const map = { from: 'origin', to: 'destination', mode: 'mode' };
      for (const [k, v] of data.entries()) {
        const target = map[k] || k;
        if (v) params.set(target, v);
      }
      const qs = params.toString();
      location.href = 'quote.html' + (qs ? '?' + qs : '');
    });
  }

  /* Quote page — prefill fields from the hero hand-off query string */
  function initQuotePrefill() {
    if (!/quote\.html$/.test(location.pathname)) return;
    const params = new URLSearchParams(location.search);
    if (![...params.keys()].length) return;
    let focused = false;
    for (const [k, v] of params.entries()) {
      const el = document.querySelector('[name="' + cssEscape(k) + '"]');
      if (!el) continue;
      if (el.type === 'radio' || el.tagName === 'INPUT' && el.matches('[type=radio]')) {
        const radio = document.querySelector('[name="' + cssEscape(k) + '"][value="' + cssEscape(v) + '"]');
        if (radio) radio.checked = true;
      } else {
        el.value = v;
      }
      if (!focused && el.focus) {
        try { el.focus({ preventScroll: true }); } catch (_) { el.focus(); }
        focused = true;
      }
    }
  }
  function cssEscape(s) {
    return String(s).replace(/["\\]/g, '\\$&');
  }

  /* Utils */
  function isEmail(v) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v).trim());
  }
  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, function (c) {
      return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[c];
    });
  }
})();
