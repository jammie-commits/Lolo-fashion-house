(() => {
  const toggle = document.querySelector('.nav-toggle');
  const nav = document.getElementById('site-nav');
  if (toggle && nav) {
    toggle.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', String(open));
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
