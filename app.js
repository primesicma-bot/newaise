(() => {
  'use strict';

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const reducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const body = document.body;
  const nav = $('#siteNav');
  const menuButton = $('#menuButton');
  const themeButton = $('#themeButton');
  const installButton = $('#installButton');
  const replayOpening = $('#replayOpening');
  const opening = $('#opening');
  const openingKey = 'aise-opening-seen-v3';

  /* ---------------------------------------------------------
     Opening cinematic — deterministic, first visit only.
     --------------------------------------------------------- */
  function storageGet(key) {
    try { return window.localStorage.getItem(key); } catch (_) { return null; }
  }
  function storageSet(key, value) {
    try { window.localStorage.setItem(key, value); } catch (_) {}
  }

  function finishOpening() {
    if (!opening) return;
    opening.classList.add('is-done');
    body.classList.remove('opening-active');
  }

  function runOpening(force = false) {
    if (!opening) return;
    const seen = storageGet(openingKey) === '1';
    if (seen && !force) {
      finishOpening();
      return;
    }

    body.classList.add('opening-active');
    opening.classList.remove('is-done', 'is-opening');
    void opening.offsetWidth;

    if (reducedMotion()) {
      finishOpening();
      storageSet(openingKey, '1');
      return;
    }

    window.setTimeout(() => opening.classList.add('is-opening'), 360);
    window.setTimeout(() => {
      finishOpening();
      storageSet(openingKey, '1');
    }, 1680);
  }

  runOpening(false);
  replayOpening?.addEventListener('click', () => runOpening(true));

  /* ---------------------------------------------------------
     Navigation — no transform conflict with scroll state.
     The header receives only a class; its transform stays fixed.
     --------------------------------------------------------- */
  let lastScrollY = window.scrollY;
  let scrollFrame = 0;
  let direction = 'down';

  function updateNav() {
    const y = window.scrollY;
    if (Math.abs(y - lastScrollY) > 1) direction = y > lastScrollY ? 'down' : 'up';
    nav?.classList.toggle('scrolled', y > 20);
    nav?.classList.toggle('nav-up', direction === 'up' && y > 120);
    nav?.classList.toggle('nav-top', y <= 20);
    lastScrollY = y;
    scrollFrame = 0;
  }

  function requestScrollUpdate() {
    if (scrollFrame) return;
    scrollFrame = window.requestAnimationFrame(updateNav);
  }

  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  updateNav();

  /* Mobile menu */
  menuButton?.addEventListener('click', () => {
    const open = body.classList.toggle('menu-open');
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
  });
  $$('.desktop-nav a').forEach((link) => link.addEventListener('click', () => {
    body.classList.remove('menu-open');
    menuButton?.setAttribute('aria-expanded', 'false');
  }));

  /* ---------------------------------------------------------
     Stable reveals.
     Important fix: revealed elements are NOT removed when they
     leave the viewport. This prevents the top-of-page flicker /
     replay bug caused by IntersectionObserver while scrolling up.
     --------------------------------------------------------- */
  const revealElements = $$('.reveal');
  if (reducedMotion()) {
    revealElements.forEach((element) => element.classList.add('in'));
  } else {
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('in');
        obs.unobserve(entry.target);
      });
    }, { threshold: 0.08, rootMargin: '-6% 0px -8% 0px' });
    revealElements.forEach((element) => observer.observe(element));
  }

  /* ---------------------------------------------------------
     Hero parallax — limited to the hero and only while near it.
     This avoids transform/scroll interactions further down the page.
     --------------------------------------------------------- */
  const hero = $('.hero');
  const heroCopy = $('.hero-copy');
  const heroArt = $('.hero-art');
  let parallaxFrame = 0;

  function updateParallax() {
    parallaxFrame = 0;
    if (reducedMotion() || !hero || !heroCopy || !heroArt) return;
    const rect = hero.getBoundingClientRect();
    const progress = Math.max(0, Math.min(1, -rect.top / Math.max(rect.height, 1)));
    heroCopy.style.setProperty('--hero-shift', `${progress * 34}px`);
    heroArt.style.setProperty('--hero-shift', `${progress * -22}px`);
  }

  window.addEventListener('scroll', () => {
    if (!parallaxFrame) parallaxFrame = window.requestAnimationFrame(updateParallax);
  }, { passive: true });
  window.addEventListener('resize', updateParallax, { passive: true });
  updateParallax();

  /* Theme */
  const applyTheme = (theme) => {
    const light = theme === 'light';
    body.classList.toggle('light-mode', light);
    themeButton?.setAttribute('aria-pressed', String(light));
    if (themeButton) themeButton.textContent = light ? '☼' : '◐';
  };
  applyTheme(storageGet('aise-theme') || 'dark');
  themeButton?.addEventListener('click', () => {
    const next = body.classList.contains('light-mode') ? 'dark' : 'light';
    applyTheme(next);
    storageSet('aise-theme', next);
  });

  /* ---------------------------------------------------------
     Interactive app preview. Only switches local presentation.
     No external request, no user data.
     --------------------------------------------------------- */
  const previewTabs = $$('.showcase-tabs [data-preview]');
  const previewPanels = $$('.preview-panel[data-panel]');
  previewTabs.forEach((tab) => {
    tab.addEventListener('click', () => {
      const target = tab.dataset.preview;
      previewTabs.forEach((item) => item.classList.toggle('active', item === tab));
      previewPanels.forEach((panel) => panel.classList.toggle('is-active', panel.dataset.panel === target));
    });
  });

  /* PWA installation */
  let deferredInstall = null;
  window.addEventListener('beforeinstallprompt', (event) => {
    event.preventDefault();
    deferredInstall = event;
    if (installButton) installButton.innerHTML = 'Installer Aise <span>↓</span>';
  });

  installButton?.addEventListener('click', async () => {
    const hint = $('#installHint');
    if (!deferredInstall) {
      if (hint) hint.textContent = 'Si ton navigateur le permet : menu du navigateur → Installer l’application. Sur iPhone/iPad : Partager → Ajouter à l’écran d’accueil.';
      return;
    }
    try {
      deferredInstall.prompt();
      await deferredInstall.userChoice;
    } catch (_) {
      if (hint) hint.textContent = 'L’installation a été interrompue. Tu peux la relancer depuis le menu de ton navigateur.';
    } finally {
      deferredInstall = null;
    }
  });

  /* Protect the single local demo from accidental navigation on touch. */
  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && body.classList.contains('menu-open')) {
      body.classList.remove('menu-open');
      menuButton?.setAttribute('aria-expanded', 'false');
    }
  });
})();
