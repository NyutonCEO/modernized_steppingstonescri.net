const initNav = () => {
  const toggle = document.querySelector('.nav-toggle');
  if (!toggle) return;
  toggle.addEventListener('click', () => {
    document.body.classList.toggle('nav-open');
  });
};

const initHeroSlider = () => {
  const slider = document.querySelector('.hero-slider');
  if (!slider) return;
  const track = slider.querySelector('.hero-slider-track');
  const slides = Array.from(slider.querySelectorAll('.hero-slide'));
  const prev = slider.querySelector('.slider-btn.prev');
  const next = slider.querySelector('.slider-btn.next');
  const dotsContainer = slider.querySelector('.slider-dots');

  let index = 0;
  let timer = null;

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

  buildDots();
  update();
  resetTimer();
};

const initServicesSlider = () => {
  const slider = document.querySelector('.services-slider .slider');
  const track = document.querySelector('.services-slider .slider-track');
  const prev = document.querySelector('.services-slider .slider-btn.prev');
  const next = document.querySelector('.services-slider .slider-btn.next');
  if (!slider || !track) return;

  const scrollByCard = (direction) => {
    const card = track.querySelector('.service-slide');
    if (!card) return;
    const width = card.getBoundingClientRect().width + 20;
    slider.scrollBy({ left: direction * width, behavior: 'smooth' });
  };

  prev?.addEventListener('click', () => scrollByCard(-1));
  next?.addEventListener('click', () => scrollByCard(1));
};

window.addEventListener('DOMContentLoaded', () => {
  initNav();
  initHeroSlider();
  initServicesSlider();
});
