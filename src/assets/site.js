const initNav = () => {
  const toggle = document.querySelector('.nav-toggle');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    document.body.classList.toggle('nav-open');
    const isOpen = document.body.classList.contains('nav-open');
    toggle.setAttribute('aria-expanded', String(isOpen));
  });
};

const initHeroSlider = () => {
  const slider = document.querySelector('.hero-slider');
  if (!slider) return;
  const track = slider.querySelector('.hero-slider-track');
  const slides = Array.from(slider.querySelectorAll('.hero-slide'));
  const prev = slider.querySelector('.slider-btn.prev');
  const next = slider.querySelector('.slider-btn.next');
  const toggle = slider.querySelector('.slider-btn.toggle');
  const dotsContainer = slider.querySelector('.slider-dots');

  let index = 0;
  let timer = null;
  let isPaused = false;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const update = () => {
    track.style.transform = `translateX(-${index * 100}%)`;
    if (dotsContainer) {
      dotsContainer.querySelectorAll('button').forEach((dot, idx) => {
        dot.classList.toggle('active', idx === index);
      });
    }
  };

  const buildDots = () => {
    if (!dotsContainer) return;
    dotsContainer.innerHTML = '';
    slides.forEach((_, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.setAttribute('aria-label', `Go to slide ${idx + 1}`);
      btn.addEventListener('click', () => {
        index = idx;
        update();
        resetTimer();
      });
      dotsContainer.append(btn);
    });
  };

  const go = (direction) => {
    index = (index + direction + slides.length) % slides.length;
    update();
  };

  const resetTimer = () => {
    if (timer) clearInterval(timer);
    if (prefersReducedMotion || isPaused) return;
    timer = setInterval(() => go(1), 7000);
  };

  prev?.addEventListener('click', () => {
    go(-1);
    resetTimer();
  });
  next?.addEventListener('click', () => {
    go(1);
    resetTimer();
  });
  toggle?.addEventListener('click', () => {
    isPaused = !isPaused;
    toggle.setAttribute('aria-pressed', String(isPaused));
    toggle.textContent = isPaused ? 'Play' : 'Pause';
    toggle.setAttribute('aria-label', isPaused ? 'Play autoplay' : 'Pause autoplay');
    resetTimer();
  });

  buildDots();
  update();
  resetTimer();
};

const initSlider = (sectionSelector, cardSelector) => {
  const slider = document.querySelector(`${sectionSelector} .slider`);
  const track = document.querySelector(`${sectionSelector} .slider-track`);
  const prev = document.querySelector(`${sectionSelector} .slider-btn.prev`);
  const next = document.querySelector(`${sectionSelector} .slider-btn.next`);
  if (!slider || !track) return;

  const scrollByCard = (direction) => {
    const card = track.querySelector(cardSelector);
    if (!card) return;
    const width = card.getBoundingClientRect().width + 20;
    slider.scrollBy({ left: direction * width, behavior: 'smooth' });
  };

  prev?.addEventListener('click', () => scrollByCard(-1));
  next?.addEventListener('click', () => scrollByCard(1));
};

const initInfiniteScroll = (containerSelector, trackSelector, axis = 'x') => {
  const containers = document.querySelectorAll(containerSelector);
  containers.forEach((container) => {
    const track = container.querySelector(trackSelector);
    if (!track) return;
    const original = track.innerHTML;
    if (!original.trim()) return;
    const originalSize = axis === 'y' ? track.scrollHeight : track.scrollWidth;
    const viewportSize = axis === 'y' ? container.clientHeight : container.clientWidth;
    if (originalSize <= viewportSize) {
      return;
    }
    track.innerHTML = `${original}${original}`;
    const baseSize = axis === 'y' ? track.scrollHeight / 2 : track.scrollWidth / 2;
    let isAdjusting = false;
    requestAnimationFrame(() => {
      if (axis === 'y') {
        container.scrollTop = baseSize;
      } else {
        container.scrollLeft = baseSize;
      }
    });

    const onScroll = () => {
      if (isAdjusting) return;
      if (axis === 'y') {
        if (container.scrollTop >= baseSize * 2 - container.clientHeight) {
          isAdjusting = true;
          container.scrollTop -= baseSize;
        } else if (container.scrollTop <= 0) {
          isAdjusting = true;
          container.scrollTop += baseSize;
        }
      } else {
        if (container.scrollLeft >= baseSize * 2 - container.clientWidth) {
          isAdjusting = true;
          container.scrollLeft -= baseSize;
        } else if (container.scrollLeft <= 0) {
          isAdjusting = true;
          container.scrollLeft += baseSize;
        }
      }
      if (isAdjusting) {
        requestAnimationFrame(() => {
          isAdjusting = false;
        });
      }
    };

    container.addEventListener('scroll', onScroll);
  });
};

window.addEventListener('DOMContentLoaded', () => {
  initNav();
  initHeroSlider();
  initSlider('.services-slider', '.service-slide');
  initSlider('.value-slider', '.value-slide');
  initInfiniteScroll('.services-slider .slider', '.slider-track', 'x');
  initInfiniteScroll('.post-list .post-slider', '.slider-track', 'x');
  initInfiniteScroll('.resource-scroll', '.resource-track', 'y');
});
