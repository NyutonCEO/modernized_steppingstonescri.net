const SERVICE_DATA_URL = '/data/services.json';
let cachedServices = null;

const buildElement = (tag, className, text) => {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text) el.textContent = text;
  return el;
};

const fetchServices = async () => {
  if (cachedServices) return cachedServices;
  const response = await fetch(SERVICE_DATA_URL, { cache: 'no-store' });
  if (!response.ok) {
    throw new Error('Unable to load services data.');
  }
  const data = await response.json();
  cachedServices = data.sort((a, b) => a.order - b.order);
  return cachedServices;
};

const renderSlider = (services) => {
  const track = document.querySelector('.slider-track');
  if (!track) return;
  track.innerHTML = '';

  services.forEach((service) => {
    const slide = buildElement('article', 'service-slide');
    const link = buildElement('a', 'service-slide-link');
    link.href = `/services/${service.slug}/`;
    link.setAttribute('aria-label', `Learn more about ${service.name}`);

    const image = buildElement('img', 'service-slide-image');
    image.src = service.image;
    image.alt = service.name;

    const content = buildElement('div', 'service-slide-content');
    const title = buildElement('h4', 'service-slide-title', service.name);

    content.append(title);
    link.append(image, content);
    slide.append(link);
    track.append(slide);
  });

  const prevButton = document.querySelector('.slider-arrow.prev');
  const nextButton = document.querySelector('.slider-arrow.next');
  if (!prevButton || !nextButton) return;

  const updateButtons = () => {
    const maxScrollLeft = track.scrollWidth - track.clientWidth;
    prevButton.disabled = track.scrollLeft <= 2;
    nextButton.disabled = track.scrollLeft >= maxScrollLeft - 2;
  };

  const scrollByCard = (direction) => {
    const card = track.querySelector('.service-slide');
    if (!card) return;
    const cardWidth = card.getBoundingClientRect().width;
    const gap = 18;
    track.scrollBy({ left: direction * (cardWidth + gap), behavior: 'smooth' });
  };

  prevButton.addEventListener('click', () => scrollByCard(-1));
  nextButton.addEventListener('click', () => scrollByCard(1));
  track.addEventListener('scroll', updateButtons);
  window.addEventListener('resize', updateButtons);
  updateButtons();
};

const renderServicesIndex = (services) => {
  const grid = document.querySelector('#services-grid');
  if (!grid) return;
  grid.innerHTML = '';

  services.forEach((service) => {
    const card = buildElement('article', 'service-card');
    const image = buildElement('img', 'service-card-image');
    image.src = service.image;
    image.alt = service.name;

    const title = buildElement('h3', 'service-card-title', service.name);
    const summary = buildElement('p', 'service-card-summary', service.summary);
    const link = buildElement('a', 'service-card-link', 'Learn More');
    link.href = `/services/${service.slug}/`;

    card.append(image, title, summary, link);
    grid.append(card);
  });
};

const renderServiceDetail = (services) => {
  const slug = document.body.dataset.serviceSlug;
  if (!slug) return;
  const service = services.find((item) => item.slug === slug);
  const titleEl = document.querySelector('#service-title');
  const summaryEl = document.querySelector('#service-summary');
  const bodyEl = document.querySelector('#service-body');
  const listEl = document.querySelector('#service-expectations');
  const faqEl = document.querySelector('#service-faqs');
  const imageEl = document.querySelector('#service-image');
  const metaDescription = document.querySelector('#meta-description');

  if (!service) {
    if (titleEl) titleEl.textContent = 'Service not found';
    if (summaryEl) summaryEl.textContent = 'We could not locate the requested service.';
    return;
  }

  document.title = `${service.name} | Stepping Stones`;
  if (metaDescription) metaDescription.setAttribute('content', service.metaDescription || service.summary);

  if (titleEl) titleEl.textContent = service.name;
  if (summaryEl) summaryEl.textContent = service.summary;
  if (imageEl) {
    imageEl.src = service.image;
    imageEl.alt = service.name;
  }

  if (bodyEl) {
    bodyEl.innerHTML = '';
    service.body.split('\n\n').forEach((paragraph) => {
      const p = buildElement('p', null, paragraph);
      bodyEl.append(p);
    });
  }

  if (listEl) {
    listEl.innerHTML = '';
    service.expectations.forEach((item) => {
      const li = buildElement('li', null, item);
      listEl.append(li);
    });
  }

  if (faqEl) {
    faqEl.innerHTML = '';
    service.faqs.forEach((item, index) => {
      const accordionItem = buildElement('div', 'faq-item');
      const button = buildElement('button', 'faq-question', item.question);
      const panelId = `faq-panel-${service.slug}-${index}`;
      const panel = buildElement('div', 'faq-answer');
      panel.id = panelId;
      panel.setAttribute('role', 'region');
      panel.setAttribute('hidden', '');
      panel.textContent = item.answer;
      button.setAttribute('aria-expanded', 'false');
      button.setAttribute('aria-controls', panelId);

      button.addEventListener('click', () => {
        const isExpanded = button.getAttribute('aria-expanded') === 'true';
        button.setAttribute('aria-expanded', String(!isExpanded));
        if (isExpanded) {
          panel.setAttribute('hidden', '');
        } else {
          panel.removeAttribute('hidden');
        }
      });

      accordionItem.append(button, panel);
      faqEl.append(accordionItem);
    });
  }
};

const init = async () => {
  try {
    const services = await fetchServices();
    const page = document.body.dataset.page;
    if (page === 'home') {
      renderSlider(services);
    }
    if (page === 'services-index') {
      renderServicesIndex(services);
    }
    if (page === 'service-detail') {
      renderServiceDetail(services);
    }
  } catch (error) {
    console.error(error);
  }
};

document.addEventListener('DOMContentLoaded', init);
