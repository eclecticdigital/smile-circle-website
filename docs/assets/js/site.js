/* Smile Circle Five Dock — site.js
   Progressive enhancement only: every page works without this file. */
(function () {
  'use strict';
  const $ = (s, c) => (c || document).querySelector(s);
  const $$ = (s, c) => Array.from((c || document).querySelectorAll(s));
  const body = document.body;

  /* Header shadow when scrolled (IntersectionObserver on a top sentinel, no scroll listener) */
  const sentinel = document.createElement('div');
  sentinel.style.cssText = 'position:absolute;top:0;left:0;height:1px;width:1px;pointer-events:none;';
  body.prepend(sentinel);
  new IntersectionObserver(([e]) => body.classList.toggle('is-scrolled', !e.isIntersecting), { threshold: 0 }).observe(sentinel);

  /* Mobile menu: hamburger morph + full-screen overlay */
  const burger = $('.nav__burger');
  const overlay = $('.overlay');
  const setMenu = (open) => {
    body.classList.toggle('menu-open', open);
    if (burger) burger.setAttribute('aria-expanded', String(open));
    if (overlay) overlay.setAttribute('aria-hidden', String(!open));
  };
  if (burger) burger.addEventListener('click', () => setMenu(!body.classList.contains('menu-open')));
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') { setMenu(false); $$('.has-mega.is-open').forEach(li => li.classList.remove('is-open')); } });
  $$('.overlay__group > .overlay__link').forEach(btn => {
    btn.addEventListener('click', () => {
      const g = btn.parentElement;
      const open = g.classList.toggle('is-open');
      btn.setAttribute('aria-expanded', String(open));
    });
  });
  $$('.overlay a[href]').forEach(a => a.addEventListener('click', () => setMenu(false)));

  /* Mega menu on touch devices: first tap opens, second tap follows the link */
  const coarse = window.matchMedia('(hover: none)').matches;
  $$('.has-mega').forEach(li => {
    const link = $('.nav__link', li);
    if (!link) return;
    link.addEventListener('click', (e) => {
      if (coarse && !li.classList.contains('is-open')) { e.preventDefault(); li.classList.add('is-open'); }
    });
    li.addEventListener('mouseleave', () => li.classList.remove('is-open'));
  });
  document.addEventListener('click', (e) => { if (!e.target.closest('.has-mega')) $$('.has-mega.is-open').forEach(li => li.classList.remove('is-open')); });

  /* Reveal on scroll */
  const io = new IntersectionObserver((entries) => {
    entries.forEach(en => { if (en.isIntersecting) { en.target.classList.add('is-in'); io.unobserve(en.target); } });
  }, { rootMargin: '0px 0px -8% 0px', threshold: 0.08 });
  $$('.reveal').forEach(el => io.observe(el));

  /* Reviews scroller */
  $$('.reviews-wrap').forEach(wrap => {
    const track = $('.reviews', wrap);
    const step = () => { const card = $('.review', track); return card ? card.getBoundingClientRect().width + 20 : 360; };
    $$('[data-dir]', wrap).forEach(b => b.addEventListener('click', () => track.scrollBy({ left: step() * Number(b.dataset.dir), behavior: 'smooth' })));
  });

  /* Highlight today's opening hours */
  const day = new Date().getDay(); // 0 = Sunday
  $$('.hours tr[data-day]').forEach(tr => { if (Number(tr.dataset.day) === day) tr.classList.add('is-today'); });

  /* Current year */
  $$('[data-year]').forEach(el => { el.textContent = new Date().getFullYear(); });

  /* Contact form: client-side validation + JSON POST to the endpoint in data-endpoint */
  const form = $('#contact-form');
  if (form) {
    const status = $('.form__status', form);
    const show = (cls, msg) => { status.className = 'form__status ' + cls; status.textContent = msg; status.scrollIntoView({ block: 'nearest', behavior: 'smooth' }); };
    const setErr = (field, on) => {
      const wrap = field.closest('.field');
      if (wrap) wrap.classList.toggle('has-error', on);
      field.setAttribute('aria-invalid', on ? 'true' : 'false');
    };
    $$('input, textarea', form).forEach(f => f.addEventListener('input', () => setErr(f, false)));
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      status.className = 'form__status';
      let ok = true;
      $$('[required]', form).forEach(f => {
        let valid = f.type === 'checkbox' ? f.checked : f.value.trim() !== '';
        if (valid && f.type === 'email') valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(f.value.trim());
        if (!valid) { ok = false; setErr(f, true); }
      });
      if (!ok) { show('is-err', 'Please complete the highlighted fields.'); return; }
      if (form.website && form.website.value) return; // honeypot
      const endpoint = form.dataset.endpoint;
      const data = Object.fromEntries(new FormData(form).entries());
      delete data.website;
      const btn = $('button[type="submit"]', form);
      btn.disabled = true;
      try {
        if (!endpoint) throw new Error('No endpoint configured. Set data-endpoint on the form (see README).');
        const res = await fetch(endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' }, body: JSON.stringify(data) });
        if (!res.ok) throw new Error('Request failed');
        form.reset();
        show('is-ok', 'Thank you. Your message has been sent and our team will be in touch shortly.');
      } catch (err) {
        show('is-err', 'Sorry, your message could not be sent. Please call us on (02) 9166 7757.');
        console.warn(err);
      } finally { btn.disabled = false; }
    });
  }
})();
