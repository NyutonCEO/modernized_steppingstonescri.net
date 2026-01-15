const initNav = () => {
  const toggle = document.querySelector('.nav-toggle');
  const menu = document.getElementById('mobileMenu');
  const overlay = document.querySelector('.mobile-menu-overlay');
  const closeButtons = document.querySelectorAll('[data-menu-close]');
  const main = document.getElementById('maincontent');
  const focusableSelector = 'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex=\"-1\"])';
  if (!toggle || !menu) return;
  let lastFocused = null;

  const openMenu = () => {
    lastFocused = document.activeElement;
    menu.hidden = false;
    document.body.classList.add('nav-open');
    toggle.setAttribute('aria-expanded', 'true');
    if (main) main.setAttribute('inert', '');
    const focusables = menu.querySelectorAll(focusableSelector);
    if (focusables.length) focusables[0].focus();
  };

  const closeMenu = () => {
    document.body.classList.remove('nav-open');
    toggle.setAttribute('aria-expanded', 'false');
    if (main) main.removeAttribute('inert');
    menu.hidden = true;
    if (lastFocused && typeof lastFocused.focus === 'function') {
      lastFocused.focus();
    }
  };

  toggle.addEventListener('click', () => {
    const isOpen = document.body.classList.contains('nav-open');
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  closeButtons.forEach((button) => {
    button.addEventListener('click', closeMenu);
  });

  if (overlay) {
    overlay.addEventListener('click', closeMenu);
  }

  document.addEventListener('keydown', (event) => {
    if (!document.body.classList.contains('nav-open')) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      closeMenu();
      return;
    }
    if (event.key !== 'Tab') return;
    const focusables = Array.from(menu.querySelectorAll(focusableSelector)).filter((el) => !el.hasAttribute('disabled'));
    if (!focusables.length) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
};

const initHeaderScroll = () => {
  const header = document.querySelector('.site-header');
  if (!header) return;
  const onScroll = () => {
    header.classList.toggle('is-scrolled', window.scrollY > 8);
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });
};

window.addEventListener('DOMContentLoaded', () => {
  initNav();
  initHeaderScroll();
});
