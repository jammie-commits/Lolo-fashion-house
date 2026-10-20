import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  about,
  beforeIDo,
  bridalEnquiryTypes,
  bridalOfferings,
  brands,
  collections,
  kidsInfo,
  mfalme,
  contacts,
  digitalProducts,
  gallery,
  heroes,
  homeStrip,
  enquiryOptions,
  guardianAngel,
  planning,
  selarStoreUrl,
  tagline,
  waLink,
} from './content.mjs';
import { articles } from './journal.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'site');
const galleryDir = join(out, 'assets/gallery');
const galleryFiles = gallery.filter((g) => g.listed !== false && existsSync(join(galleryDir, g.file))).map((g) => g.file);
const altFor = (file) => gallery.find((g) => g.file === file)?.alt || 'Custom outfit by LoLo Fashion House';
const SITE_URL = 'https://lolo-fashion-house.vercel.app';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const imgSrc = (name) => `/assets/gallery/${name}`;
const img = (name, alt) =>
  name && existsSync(join(galleryDir, name))
    ? `<img class="card-img" src="${imgSrc(name)}" alt="${esc(alt || altFor(name))}" loading="lazy" />`
    : '';

const nav = [
  ['Home', '/'],
  ['Fashion House', '/#collections'],
  ['Mfalme', '/mfalme.html'],
  ['Kids', '/kids.html'],
  ['Bridal', '/bridal.html'],
  ['Digital', '/digital.html'],
  ['Gallery', '/gallery.html'],
  ['Our Story', '/about.html'],
  ['Contact', '/contact.html'],
];

const wa = (brand, text, label, ghost = false) =>
  `<a class="button ${ghost ? 'button-ghost' : 'button-gold'}" href="${esc(waLink(brand, text))}" target="_blank" rel="noopener">${esc(label)}</a>`;

const head = (eyebrow, title, copy, light = false) => `
  <div class="wrap section-head${light ? ' light' : ''}">
    <span class="eyebrow${light ? ' light' : ''}">${esc(eyebrow)}</span>
    <h2>${esc(title)}</h2>
    ${copy ? `<p>${esc(copy)}</p>` : ''}
  </div>`;

const card = (inner, image) => `<article class="glass-card collection-card">${image || ''}${inner}</article>`;

const pageHero = (eyebrow, title, desc, image) => `
<section class="hero section page-hero">
  <div class="wrap ${image ? 'hero-grid' : 'page-hero-copy'}">
    <div class="page-hero-copy">
      <span class="eyebrow">${esc(eyebrow)}</span>
      <h1>${esc(title)}</h1>
      <p class="lead">${esc(desc)}</p>
    </div>
    ${image ? `<div class="hero-panel glass-card hero-photo">${image}</div>` : ''}
  </div>
</section>`;

const orgSchema = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': ['Organization', 'ClothingStore'],
      '@id': `${SITE_URL}/#org`,
      name: 'LoLo Fashion House',
      alternateName: ['LoLo Bridal', 'Mfalme by LoLo', 'LoLo Kids'],
      url: SITE_URL,
      logo: `${SITE_URL}/logo.jpg`,
      image: `${SITE_URL}${imgSrc(heroes.home.img)}`,
      slogan: 'Style Your Moments. Celebrate Your Story.',
      foundingDate: '2017',
      telephone: `+${contacts.fashion.wa}`,
      email: contacts.bridal.email,
      address: { '@type': 'PostalAddress', addressCountry: 'KE' },
      contactPoint: [
        { '@type': 'ContactPoint', contactType: 'customer service', telephone: `+${contacts.fashion.wa}`, name: 'LoLo Fashion House' },
        { '@type': 'ContactPoint', contactType: 'customer service', telephone: `+${contacts.bridal.wa}`, email: contacts.bridal.email, name: 'LoLo Bridal' },
      ],
    },
  ],
};

const crumbs = (file, title) => ({
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: `${SITE_URL}/` },
    { '@type': 'ListItem', position: 2, name: title.split('|')[0].trim(), item: `${SITE_URL}/${file}` },
  ],
});

const shell = ({ file, title, description, body, ogImage = heroes.home.img, extraSchema = [] }) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <meta name="theme-color" content="#F7F0E8" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:image" content="${SITE_URL}${imgSrc(ogImage)}" />
  <link rel="canonical" href="${SITE_URL}/${file === 'index.html' ? '' : file}" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="icon" href="/logo.jpg" />
  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link rel="stylesheet" href="/assets/styles.css" />
  <link rel="stylesheet" href="/assets/extras.css" />
  <script type="application/ld+json">${JSON.stringify(file === 'index.html' ? orgSchema : [crumbs(file, title), ...extraSchema])}</script>
</head>
<body>
<a class="skip-link" href="#main">Skip to content</a>
<header class="topbar">
  <div class="wrap nav">
    <a class="brand" href="/">
      <img src="/logo.jpg" alt="LoLo Fashion House" class="brand-logo" />
      <span class="brand-name">Lolo <em>Fashion House</em></span>
    </a>
    <button class="nav-toggle" type="button" aria-label="Toggle menu" aria-expanded="false">Menu</button>
    <nav id="site-nav">
      ${nav.map(([l, h]) => `<a class="nav-link${(h === '/' ? 'index.html' : h.slice(1)) === file ? ' active' : ''}" href="${h}">${l}</a>`).join('\n      ')}
    </nav>
  </div>
</header>
<main id="main">
${body}
</main>
<footer class="site-footer">
  <div class="wrap footer-grid">
    <div>
      <strong>${esc(tagline)}</strong>
      <p class="footer-statement">Beautifully Made. Thoughtfully Experienced.</p>
      <p>Designed in Kenya. Delivered worldwide.</p>
      <p><a href="/international.html">International orders &amp; delivery</a> · <a href="/journal.html">Journal</a> · <a href="/gallery.html">Gallery</a></p>
    </div>
    <div>
      <p>LoLo Fashion House: <a href="tel:${contacts.fashion.phone}">${contacts.fashion.phone}</a></p>
      <p>LoLo Bridal: <a href="tel:${contacts.bridal.phone}">${contacts.bridal.phone}</a> · <a href="mailto:${contacts.bridal.email}">${contacts.bridal.email}</a></p>
    </div>
  </div>
</footer>
<script src="/assets/app.js" defer></script>
</body>
</html>
`;

const contactCards = () => `
<div class="wrap grid grid-collections">
  ${Object.entries(contacts)
    .map(([brand, c]) =>
      card(`<h3>${esc(c.label)}</h3>
        <p><a href="tel:${c.phone}">${c.phone}</a>${c.email ? `<br /><a href="mailto:${c.email}">${c.email}</a>` : ''}</p>
        ${wa(brand, `Hello ${c.label}, I would like to make an enquiry.`, `WhatsApp ${c.label}`)}`),
    )
    .join('\n  ')}
</div>`;

const brandCards = (list = brands) => `
<div class="wrap grid grid-collections">
  ${list.map((b) => card(`<span class="pill">${esc(b.kicker)}</span><h3>${esc(b.name)}</h3><p>${esc(b.copy)}</p><a class="button button-ghost" href="${b.href}">Explore</a>`, img(b.img, b.name))).join('\n  ')}
</div>`;

const offeringCards = () => `
<div class="wrap grid grid-collections">
  ${bridalOfferings.map((o) => card(`<h3>${esc(o.title)}</h3><p>${esc(o.copy)}</p>`, img(o.img, o.title))).join('\n  ')}
</div>`;

const priceList = (rows) =>
  `<ul class="price-list">${rows.map(([l, p]) => `<li><span>${esc(l)}</span><strong>${esc(p)}</strong></li>`).join('')}</ul>`;

const jpegSize = (file) => {
  const buf = readFileSync(join(galleryDir, file));
  let i = 2;
  while (i < buf.length) {
    const marker = buf[i + 1];
    if (marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker)) {
      return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
    }
    i += 2 + buf.readUInt16BE(i + 2);
  }
  return { w: 800, h: 1000 };
};

const galleryItem = (f) => {
  if (!existsSync(join(galleryDir, f))) return '';
  const { w, h } = jpegSize(f);
  return `<a class="gallery-item" href="${imgSrc(f)}" data-lightbox><img src="${imgSrc(f)}" alt="${esc(altFor(f))}" width="${w}" height="${h}" loading="lazy" decoding="async" /></a>`;
};

const heroOf = (key, withImage = true) => {
  const h = heroes[key];
  return pageHero(h.eyebrow, h.title, h.desc, withImage ? img(h.img, h.alt) : '');
};

const pages = {};

pages['index.html'] = shell({
  file: 'index.html',
  title: 'LoLo Fashion House | Bespoke Fashion & Bridal Couture',
  description:
    'Discover bespoke gowns, occasion wear, bridal couture, traditional wedding outfits and personalised wedding experiences. Designed in Kenya, delivered worldwide.',
  body: `
<section class="hero section" id="home">
  <div class="wrap hero-grid">
    <div>
      <span class="eyebrow">${esc(heroes.home.eyebrow)}</span>
      <h1>${esc(heroes.home.title)}</h1>
      <p class="brand-statement">Style Your Moments. Celebrate Your Story.</p>
      <p class="lead">${esc(heroes.home.desc)}</p>
      <div class="hero-actions">
        <a class="button button-gold" href="#collections">Explore Our Collections</a>
        <a class="button button-ghost" href="/bridal.html">Discover LoLo Bridal</a>
      </div>
    </div>
    <div class="hero-panel hero-photo">${img(heroes.home.img, heroes.home.alt).replace('loading="lazy"', 'fetchpriority="high"')}</div>
  </div>
</section>

<section class="section" id="brands">
  ${head('The LoLo house', 'Five ways to celebrate your story.', 'Custom fashion, menswear, children’s wear, a full bridal experience and digital planning tools, each with its own character.')}
  ${brandCards([...brands, { name: 'Digital Products', kicker: 'Wedding planning tools', img: '19.jpg', href: '/digital.html', copy: 'Wedding planning resources, downloadable guides and planning tools to help you stay organised and make confident decisions.' }])}
</section>

<section class="section section-dark" id="collections">
  ${head('LoLo Fashion House', 'Custom outfits for every occasion.', 'Made around your measurements and personal style: traditional wedding gowns, red-carpet looks, birthday outfits and graduation ensembles.')}
  <div class="wrap grid grid-collections">
    ${collections.map((c) => card(`<h3>${esc(c.name)}</h3><p>${esc(c.note)}</p>`, img(c.img, c.name))).join('\n    ')}
  </div>
  <div class="wrap hero-actions">${wa('fashion', 'Hello LoLo Fashion House, I would like to request a custom design.', 'Request a Custom Design')}</div>
</section>

<section class="section">
  <div class="wrap story-grid">
    <div>
      <span class="eyebrow">Our story</span>
      <h2>Rooted in Kenya. Made with intention.</h2>
      <p class="subtle">${esc(about.promise)}</p>
      <a class="button button-ghost" href="/about.html">Read our story</a>
    </div>
    <div class="story-copy">
      <p>${esc(about.paragraphs[0])}</p>
      <p>${esc(about.paragraphs[1])}</p>
    </div>
  </div>
</section>

<section class="section section-dark" id="international">
  <div class="wrap hero-grid intl-grid">
    <div class="hero-panel hero-photo">${img('07.jpg', 'A couple in coordinated African-print outfits made by LoLo Fashion House')}</div>
    <div>
      <span class="eyebrow">International orders</span>
      <h2>Designed in Kenya. Delivered Worldwide.</h2>
      <p class="lead">Discover thoughtfully crafted fashion and bridal creations from LoLo, with international ordering available. Contact our team to discuss your design, measurements, order requirements and delivery options.</p>
      <div class="hero-actions">
        <a class="button button-gold" href="/international.html">Enquire About an International Order</a>
      </div>
    </div>
  </div>
</section>

<section class="section">
  ${head('Gallery', 'Moments we’ve dressed.', 'A glimpse of weddings, ruracio ceremonies and celebrations where LoLo outfits took centre stage.')}
  <div class="wrap gallery-strip">
    ${homeStrip.map((n) => galleryItem(n)).join('\n    ')}
  </div>
  <div class="wrap hero-actions"><a class="button button-gold" href="/gallery.html">View the full gallery</a></div>
</section>

<section class="section section-dark cta-final">
  <div class="wrap hero-grid intl-grid">
    <div>
      <span class="eyebrow">Get in touch</span>
      <h2>Let’s Create Something Beautiful.</h2>
      <p class="lead">Whether you’re preparing for a wedding, celebrating a milestone or looking for a design that feels uniquely yours, we’d love to hear your vision.</p>
      <div class="hero-actions">
        <a class="button button-gold" href="/contact.html#enquiry">Book a Consultation</a>
        <a class="button button-ghost" href="/contact.html">Contact LoLo</a>
      </div>
    </div>
    <div class="hero-panel hero-photo">${img('28.jpg', 'A wedding party celebrating with a bride in white')}</div>
  </div>
</section>`,
});

pages['international.html'] = shell({
  file: 'international.html',
  title: 'International Orders & Delivery | LoLo Fashion House',
  description:
    'How to order custom fashion and bridal products from LoLo Fashion House, designed in Kenya, with international ordering available. Enquire for design, measurements and delivery options.',
  body: `
<section class="hero section page-hero">
  <div class="wrap page-hero-copy">
    <span class="eyebrow">International orders</span>
    <h1>Designed in Kenya. Delivered Worldwide.</h1>
    <p class="lead">International ordering is available for custom fashion and many bridal products. Contact our team and we will confirm what is possible for your order and location.</p>
    <div class="hero-actions">${wa('fashion', 'Hello LoLo Fashion House, I would like to enquire about an international order.', 'Enquire About an International Order')}</div>
  </div>
</section>
<section class="section">
  ${head('How it works', 'From first message to delivery.', 'Every order is different, so we guide you through each step personally.')}
  <div class="wrap grid grid-collections">
    ${[
      ['1. Enquire', 'Message us on WhatsApp with your occasion, location and the design you have in mind.'],
      ['2. Design consultation and approval', 'We discuss fabric, style and details, and you approve the design before work begins.'],
      ['3. Measurements', 'For custom clothing we guide you through the measurements we need and how to take them accurately.'],
      ['4. Production timeline', 'Timelines depend on the design and our schedule. We confirm the timeline with you when we agree your order.'],
      ['5. Shipping and delivery', 'Shipping arrangements and delivery estimates are confirmed per order and destination.'],
      ['6. Payment, customs and import charges', 'We confirm payment options with you. Customs or import charges may apply in your country and are usually the customer’s responsibility; ask us if you are unsure.'],
      ['7. Returns and alterations', 'Policies on returns and alterations for made-to-order items are discussed before you order. Please ask us for the details that apply to your order.'],
    ]
      .map(([t, n]) => card(`<h3>${esc(t)}</h3><p>${esc(n)}</p>`))
      .join('\n    ')}
  </div>
</section>
<section class="section section-dark">
  ${head('Products and services', 'What can be shipped, and what is location-based.', 'Made-to-order fashion and many personalised bridal products can be ordered from abroad. Hands-on services such as bridal assistance, wedding planning and coordination, and Before I Do set-ups are delivered in person, so availability depends on your event location. Digital products are available to download instantly from anywhere.')}
  <div class="wrap hero-actions">
    ${wa('bridal', 'Hello LoLo Bridal, I would like to ask about ordering from outside Kenya.', 'Ask LoLo Bridal')}
    <a class="button button-ghost" href="/digital.html">Explore Wedding Planning Tools</a>
  </div>
</section>`,
});

pages['journal.html'] = shell({
  file: 'journal.html',
  title: 'Journal | Fashion & bridal guides from LoLo',
  description: 'Helpful guides on ordering custom outfits, choosing a ruracio look, wedding mornings and bridal preparation from LoLo Fashion House.',
  body: `
<section class="hero section page-hero">
  <div class="wrap page-hero-copy">
    <span class="eyebrow">The LoLo journal</span>
    <h1>Guides for beautiful occasions.</h1>
    <p class="lead">Practical advice on custom fashion, wedding mornings and bridal preparation.</p>
  </div>
</section>
<section class="section">
  <div class="wrap grid grid-collections">
    ${articles.map((a) => card(`<h3><a href="/journal/${a.slug}.html">${esc(a.title)}</a></h3><p>${esc(a.desc)}</p><a class="button button-ghost" href="/journal/${a.slug}.html">Read guide</a>`, img(a.img, a.alt))).join('\n    ')}
  </div>
</section>`,
});

for (const a of articles) {
  pages[`journal/${a.slug}.html`] = shell({
    file: `journal/${a.slug}.html`,
    title: `${a.title} | LoLo Journal`,
    description: a.desc,
    ogImage: a.img,
    extraSchema: [{ '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.desc, image: `${SITE_URL}${imgSrc(a.img)}`, author: { '@type': 'Organization', name: 'LoLo Fashion House' }, publisher: { '@id': `${SITE_URL}/#org` } }],
    body: `
<section class="hero section page-hero">
  <div class="wrap hero-grid">
    <div class="page-hero-copy">
      <span class="eyebrow"><a href="/journal.html">Journal</a></span>
      <h1>${esc(a.title)}</h1>
      <p class="lead">${esc(a.desc)}</p>
    </div>
    <div class="hero-panel hero-photo">${img(a.img, a.alt)}</div>
  </div>
</section>
<section class="section">
  <div class="wrap article">
    ${a.sections.map(([h, t]) => `<h2>${esc(h)}</h2><p>${esc(t)}</p>`).join('\n    ')}
    <div class="hero-actions">
      <a class="button button-gold" href="${a.cta[1]}">${esc(a.cta[0])}</a>
      ${wa(a.brand, `Hello, I read your guide "${a.title}" and would like to enquire.`, 'Ask us on WhatsApp', true)}
    </div>
  </div>
</section>`,
  });
}

pages['mfalme.html'] = shell({
  file: 'mfalme.html',
  title: 'Mfalme by LoLo | Custom menswear and African traditional outfits',
  description: 'Custom-made suits and African traditional outfits for the modern gentleman, by LoLo Fashion House.',
  ogImage: heroes.mfalme.img,
  body: `
${heroOf('mfalme')}
<section class="section">
  <div class="wrap grid grid-collections">
    ${mfalme.offerings.map((o) => card(`<h3>${esc(o.name)}</h3><p>${esc(o.note)}</p>`, img(o.img, o.name))).join('\n    ')}
  </div>
  <div class="wrap hero-actions">${wa('fashion', 'Hello LoLo Fashion House, I would like to enquire about Mfalme menswear.', 'Enquire on WhatsApp')}</div>
</section>
<section class="section section-dark">
  ${head('Mfalme in the field', 'Worn at weddings and ceremonies.', 'Real grooms and guests dressed by Mfalme.', true)}
  <div class="wrap gallery-grid">
    ${mfalme.photos.map((n) => galleryItem(n)).join('\n    ')}
  </div>
</section>`,
});

pages['kids.html'] = shell({
  file: 'kids.html',
  title: 'LoLo Kids | Girls’ occasion wear',
  description: 'Beautiful custom outfits for little girls: birthdays, flower girls, weddings and family occasions.',
  ogImage: heroes.kids.img,
  body: `
${heroOf('kids')}
<section class="section">
  <div class="wrap grid grid-collections">
    ${kidsInfo.occasions.map(([t, n]) => card(`<h3>${esc(t)}</h3><p>${esc(n)}</p>`)).join('\n    ')}
  </div>
  <div class="wrap hero-actions">${wa('fashion', 'Hello LoLo Fashion House, I would like to enquire about a LoLo Kids outfit.', 'Enquire on WhatsApp')}</div>
</section>`,
});

pages['bridal.html'] = shell({
  file: 'bridal.html',
  title: 'LoLo Bridal | Wedding gowns, Before I Do, bridal assistance & planning',
  description:
    'Custom wedding gowns, personalised accessories, Before I Do bridal mornings, bridal assistant services and wedding planning.',
  ogImage: heroes.bridal.img,
  body: `
${heroOf('bridal')}
<section class="section">
  ${offeringCards()}
  <div class="wrap hero-actions">${wa('bridal', 'Hello LoLo Bridal, I would like to make an enquiry.', 'Enquire on WhatsApp')}</div>
</section>

<section class="section section-dark" id="before-i-do">
  ${head('Before I Do', 'Bridal morning experiences', beforeIDo.intro, true)}
  <div class="wrap grid grid-collections">
    ${beforeIDo.packages.map((p, i) => card(`<span class="pill">${esc(p.price)}</span><h3>${esc(p.name)}</h3>${priceList(p.items)}`, img(beforeIDo.packageImages[i], p.name))).join('\n    ')}
    ${card(`<span class="pill">À la carte</span><h3>Individual items</h3>${priceList(beforeIDo.addons)}`, img(beforeIDo.addonsImage, 'Individual items'))}
  </div>
  <div class="wrap section-head light">
    <p>${esc(beforeIDo.note)}</p>
    ${wa('bridal', 'Hello LoLo Bridal, I would like to book a Before I Do experience.', 'Book Before I Do')}
  </div>
</section>

<section class="section" id="bridal-services">
  ${head('Bridal assistant services', 'The Bridal Guardian Angel', guardianAngel.intro)}
  <div class="wrap grid grid-collections">
    ${guardianAngel.tiers.map((t, i) => card(`<span class="pill">${esc(t.price)}</span><h3>${esc(t.name)}</h3><ul class="plain-list">${t.points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`, i === 0 ? img(guardianAngel.image, 'The Bridal Guardian Angel') : '')).join('\n    ')}
  </div>
  <div class="wrap section-head">
    <p>${esc(guardianAngel.extra)}</p>
    <p class="subtle">${esc(guardianAngel.note)}</p>
    ${wa('bridal', 'Hello LoLo Bridal, I would like to enquire about the Bridal Guardian Angel.', 'Enquire about bridal assistance')}
  </div>
</section>

<section class="section section-dark" id="planning">
  ${head('Wedding planning & coordination', 'Three levels of support, one calm celebration.', planning.intro, true)}
  <div class="wrap grid grid-collections">
    ${planning.tiers.map((t) => card(`<span class="pill">${esc(t.price)}</span><h3>${esc(t.name)}</h3><p>${esc(t.detail)}</p>`)).join('\n    ')}
  </div>
  <div class="wrap section-head light">
    <p>${esc(planning.note)}</p>
    ${wa('bridal', 'Hello LoLo Bridal, I would like to enquire about wedding planning and coordination.', 'Request a planning package')}
  </div>
</section>`,
});

pages['gallery.html'] = shell({
  file: 'gallery.html',
  title: 'Gallery | Events dressed by LoLo Fashion House',
  description: 'Real weddings, ruracio ceremonies and celebrations where clients wore outfits crafted by LoLo Fashion House.',
  ogImage: galleryFiles[0],
  body: `
${heroOf('gallery', false)}
<section class="section">
  <div class="wrap gallery-grid">
    ${galleryFiles.map((f) => galleryItem(f)).join('\n    ')}
  </div>
  <div class="wrap section-head">
    <p>Want to look this good at your own event?</p>
    ${wa('fashion', 'Hello LoLo Fashion House, I saw your gallery and would like a custom outfit.', 'Enquire on WhatsApp')}
  </div>
</section>`,
});

pages['digital.html'] = shell({
  file: 'digital.html',
  title: 'LoLo Bridal Digital Products | Wedding planning tools',
  description:
    'The Bridal Roadmap, Vendor Matchbook, Bridal Party Playbook and Wedding Masterplanner. Available on Selar.',
  ogImage: heroes.digital.img,
  body: `
${heroOf('digital')}
<section class="section">
  <div class="wrap grid grid-collections">
    ${digitalProducts
      .map((p) =>
        card(
          `<h3>${esc(p.name)}</h3><p>${esc(p.copy)}</p><a class="button button-gold" href="${esc(p.url || selarStoreUrl)}" target="_blank" rel="noopener">Buy on Selar</a>`,
        ),
      )
      .join('\n    ')}
  </div>
</section>`,
});

pages['about.html'] = shell({
  file: 'about.html',
  title: 'About | LoLo Fashion House & LoLo Bridal',
  description: 'Since 2017, LoLo Fashion House has created meaningful, beautifully crafted pieces for life’s special moments.',
  ogImage: heroes.about.img,
  body: `
${heroOf('about')}
<section class="section">
  <div class="wrap story-grid">
    <div>
      <span class="eyebrow">Since 2017</span>
      <h2>Meaningful, beautifully crafted pieces.</h2>
      <p class="subtle">${esc(about.promise)}</p>
    </div>
    <div class="story-copy glass-card">${about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
  </div>
</section>`,
});

pages['contact.html'] = shell({
  file: 'contact.html',
  title: 'Contact & Enquiries | LoLo Fashion House & LoLo Bridal',
  description: 'Make an enquiry or book a consultation. Your request is sent straight to WhatsApp.',
  body: `
${heroOf('contact', false)}
<section class="section">${contactCards()}</section>
<section class="section section-dark" id="enquiry">
  <div class="wrap booking-grid">
    <div class="section-head light">
      <span class="eyebrow light">Make an enquiry</span>
      <h2>Send your details and we’ll reply on WhatsApp.</h2>
      <p>Submitting opens WhatsApp with your details for the right team: LoLo Bridal for bridal services, LoLo Fashion House for everything else.</p>
    </div>
    <form class="glass-card booking-card" id="enquiry-form" data-bridal-types='${esc(JSON.stringify(bridalEnquiryTypes))}' data-wa-fashion="${contacts.fashion.wa}" data-wa-bridal="${contacts.bridal.wa}">
      <div class="grid form-grid">
        <label>Full name<input name="name" required /></label>
        <label>WhatsApp / phone<input name="phone" required inputmode="tel" /></label>
        <label>Email<input name="email" type="email" /></label>
        <label>Enquiry type<select name="eventType">${enquiryOptions.map((o) => `<option>${esc(o)}</option>`).join('')}</select></label>
        <label>Event date<input name="eventDate" type="date" /></label>
        <label>Location<input name="location" /></label>
        <label class="full-span">Notes<textarea name="note" rows="4"></textarea></label>
      </div>
      <button class="button button-gold" type="submit">Send via WhatsApp</button>
      <p class="success-note" id="enquiry-status" hidden>Your enquiry is ready in WhatsApp. Press send there to reach us.</p>
    </form>
  </div>
</section>`,
});

// Ensure the site dir exists, then write generated pages and sitemap.
mkdirSync(out, { recursive: true });
mkdirSync(join(out, 'journal'), { recursive: true });
for (const [file, html] of Object.entries(pages)) writeFileSync(join(out, file), html);
writeFileSync(
  join(out, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Object.keys(pages)
    .map((f) => `<url><loc>${SITE_URL}/${f === 'index.html' ? '' : f}</loc></url>`)
    .join('\n')}\n</urlset>\n`,
);
console.log(`Generated ${Object.keys(pages).length} pages in site/`);
