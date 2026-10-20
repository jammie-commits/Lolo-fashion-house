(() => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
    });
  }

  const items = [...document.querySelectorAll('[data-lightbox]')];
  if (items.length) {
    const box = document.createElement('div');
    box.className = 'lightbox';
    box.setAttribute('role', 'dialog');
    box.setAttribute('aria-label', 'Photo viewer');
    box.innerHTML =
      '<button class="lb-close" aria-label="Close">×</button><button class="lb-prev" aria-label="Previous">‹</button><img alt="" /><button class="lb-next" aria-label="Next">›</button>';
    document.body.append(box);
    const big = box.querySelector('img');
    let index = 0;
    const show = (i) => {
      index = (i + items.length) % items.length;
      big.src = items[index].href;
      big.alt = items[index].querySelector('img').alt;
      box.classList.add('open');
    };
    const close = () => box.classList.remove('open');
    items.forEach((a, i) =>
      a.addEventListener('click', (e) => {
        e.preventDefault();
        show(i);
      }),
    );
    box.querySelector('.lb-close').addEventListener('click', close);
    box.querySelector('.lb-prev').addEventListener('click', () => show(index - 1));
    box.querySelector('.lb-next').addEventListener('click', () => show(index + 1));
    box.addEventListener('click', (e) => e.target === box && close());
    document.addEventListener('keydown', (e) => {
      if (!box.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') show(index - 1);
      if (e.key === 'ArrowRight') show(index + 1);
    });
  }

  const form = document.getElementById('enquiry-form');
  if (!form) return;

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const d = Object.fromEntries(new FormData(form).entries());
    const bridal = JSON.parse(form.dataset.bridalTypes).includes(d.eventType);
    const number = bridal ? form.dataset.waBridal : form.dataset.waFashion;
    const text = [
      'Hello, I would like to make an enquiry.',
      `Name: ${d.name}`,
      `Phone: ${d.phone}`,
      d.email && `Email: ${d.email}`,
      `Enquiry type: ${d.eventType}`,
      d.eventDate && `Event date: ${d.eventDate}`,
      d.location && `Location: ${d.location}`,
      d.note && `Notes: ${d.note}`,
    ]
      .filter(Boolean)
      .join('\n');
    const url = `https://wa.me/${number}?text=${encodeURIComponent(text)}`;
    if (!window.open(url, '_blank', 'noopener')) window.location.href = url;
    document.getElementById('enquiry-status').hidden = false;
    form.reset();
  });
})();
