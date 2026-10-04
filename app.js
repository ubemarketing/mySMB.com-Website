if (!location.hash) {
  window.scrollTo(0, 0);
  window.addEventListener('load', () => window.scrollTo(0, 0));
  window.addEventListener('pageshow', () => window.scrollTo(0, 0));
}

const menuButton = document.querySelector('.menu-button');
const nav = document.querySelector('.site-nav');
const header = document.querySelector('[data-header]');
menuButton?.addEventListener('click', () => {
  const open = menuButton.getAttribute('aria-expanded') === 'true';
  menuButton.setAttribute('aria-expanded', String(!open));
  nav.classList.toggle('open', !open);
});
nav?.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menuButton?.setAttribute('aria-expanded', 'false'); nav.classList.remove('open');
}));
window.addEventListener('scroll', () => header?.classList.toggle('scrolled', window.scrollY > 8), { passive: true });

function positionFixedDropdown(parent) {
  const menu = parent.querySelector('.dropdown-menu');
  if (!menu || getComputedStyle(menu).position !== 'fixed') return;
  const toggle = parent.querySelector('.dropdown-toggle');
  const rect = toggle.getBoundingClientRect();
  menu.style.top = rect.bottom + 'px';
  menu.style.left = rect.left + 'px';
}
document.querySelectorAll('.has-dropdown > .dropdown-toggle').forEach(toggle => {
  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    const parent = toggle.closest('.has-dropdown');
    const willOpen = !parent.classList.contains('open');
    document.querySelectorAll('.has-dropdown.open').forEach(p => { if (p !== parent) p.classList.remove('open'); });
    parent.classList.toggle('open', willOpen);
    toggle.setAttribute('aria-expanded', String(willOpen));
    if (willOpen) positionFixedDropdown(parent);
  });
});
window.addEventListener('resize', () => {
  document.querySelectorAll('.has-dropdown.open').forEach(positionFixedDropdown);
});
document.querySelectorAll('.audience-nav .has-dropdown').forEach(parent => {
  parent.addEventListener('mouseenter', () => positionFixedDropdown(parent));
});
document.addEventListener('click', (e) => {
  if (!e.target.closest('.has-dropdown')) {
    document.querySelectorAll('.has-dropdown.open').forEach(p => {
      p.classList.remove('open');
      p.querySelector('.dropdown-toggle')?.setAttribute('aria-expanded', 'false');
    });
  }
});

document.querySelectorAll('.has-submenu').forEach(parent => {
  const link = parent.querySelector(':scope > a');
  if (!link) return;
  const toggle = document.createElement('button');
  toggle.type = 'button';
  toggle.className = 'submenu-toggle';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-label', 'Show ' + link.textContent.trim() + ' details');
  toggle.innerHTML = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  toggle.addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    const willOpen = !parent.classList.contains('open');
    parent.classList.toggle('open', willOpen);
    toggle.setAttribute('aria-expanded', String(willOpen));
  });
  link.insertAdjacentElement('afterend', toggle);
});

const overviewVideoEl = document.getElementById('heroVideo');
const overviewVideoPlayBtn = document.querySelector('.video-play-btn');
if (overviewVideoEl && overviewVideoPlayBtn) {
  overviewVideoPlayBtn.addEventListener('click', () => {
    const iframe = document.createElement('iframe');
    iframe.src = `https://www.youtube-nocookie.com/embed/${overviewVideoEl.dataset.youtubeId}?autoplay=1&rel=0&playsinline=1`;
    iframe.title = 'mySMB.com overview';
    iframe.allow = 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share';
    iframe.allowFullscreen = true;
    overviewVideoEl.replaceWith(iframe);
    overviewVideoPlayBtn.remove();
  });
}
