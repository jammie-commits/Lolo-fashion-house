import { mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  about,
  beforeIDo,
  bridalEnquiryTypes,
  bridalOfferings,
  brands,
  collections,
  contacts,
  digitalProducts,
  enquiryOptions,
  guardianAngel,
  planning,
  selarStoreUrl,
  tagline,
  waLink,
} from './content.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const out = join(root, 'site');
const galleryFiles = readdirSync(join(out, 'assets/gallery')).filter((f) => f.endsWith('.jpg')).sort();
const SITE_URL = 'https://lolo-fashion-house.vercel.app';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const img = (name, alt) => `<img class="card-img" src="/assets/images/${name}.jpg" alt="${esc(alt)}" loading="lazy" />`;

const nav = [
  ['Home', '/'],
  ['Fashion House', '/fashion.html'],
  ['Bridal', '/bridal.html'],
  ['Gallery', '/gallery.html'],
  ['Digital Products', '/digital.html'],
  ['About', '/about.html'],
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

const shell = ({ file, title, description, body, ogImage = 'hero' }) => `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width,initial-scale=1" />
  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}" />
  <meta name="theme-color" content="#1C1B3A" />
  <meta property="og:type" content="website" />
  <meta property="og:title" content="${esc(title)}" />
  <meta property="og:description" content="${esc(description)}" />
  <meta property="og:image" content="${SITE_URL}/assets/images/${ogImage}.jpg" />
  <link rel="canonical" href="${SITE_URL}/${file === 'index.html' ? '' : file}" />
  <link rel="icon" href="/logo.jpg" />
  <link rel="stylesheet" href="/assets/styles.css" />
  <link rel="stylesheet" href="/assets/extras.css" />
</head>
<body>
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
<main>
${body}
</main>
<footer class="site-footer">
  <div class="wrap footer-grid">
    <div>
      <strong>${esc(tagline)}</strong>
      <p>Custom fashion · Bridal products · Wedding support · Digital planning tools</p>
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
  ${list.map((b) => card(`<span class="pill">${esc(b.kicker)}</span><h3>${esc(b.name)}</h3><p>${esc(b.copy)}</p>`, img(b.img, b.name))).join('\n  ')}
</div>`;

const offeringCards = () => `
<div class="wrap grid grid-collections">
  ${bridalOfferings.map((o) => card(`<h3>${esc(o.title)}</h3><p>${esc(o.copy)}</p>`, img(o.img, o.title))).join('\n  ')}
</div>`;

const priceList = (rows) =>
  `<ul class="price-list">${rows.map(([l, p]) => `<li><span>${esc(l)}</span><strong>${esc(p)}</strong></li>`).join('')}</ul>`;

const galleryItem = (f, i) =>
  `<a class="gallery-item" href="/assets/gallery/${f}" data-lightbox><img src="/assets/gallery/${f}" alt="Outfit made by LoLo Fashion House, photo ${i + 1}" loading="lazy" /></a>`;

const pages = {};

pages['index.html'] = shell({
  file: 'index.html',
  title: 'LoLo Fashion House & LoLo Bridal | Style your moments. Celebrate your story.',
  description:
    'Custom fashion, bridal products, wedding support and digital planning tools from LoLo Fashion House and LoLo Bridal.',
  body: `
<section class="hero section" id="home">
  <div class="wrap hero-grid">
    <div>
      <span class="eyebrow">LoLo Fashion House &amp; LoLo Bridal</span>
      <h1>${esc(tagline)}</h1>
      <p class="lead">From custom-made fashion to beautiful bridal experiences, LoLo brings your vision to life through thoughtful design, personalised details, and creative craftsmanship. Discover fashion that expresses you and bridal services that make your special moments unforgettable.</p>
      <div class="hero-actions">
        <a class="button button-gold" href="/contact.html">Make an enquiry</a>
        <a class="button button-ghost" href="/bridal.html">Explore LoLo Bridal</a>
      </div>
    </div>
    <div class="hero-panel glass-card hero-photo">${img('hero', 'A woman in a pink gown at the doorway of a fashion atelier')}</div>
  </div>
</section>

<section class="section marquee">
  <div class="wrap marquee-track">
    <span>Custom occasion wear</span><span>Mfalme menswear</span><span>LoLo Kids</span><span>Wedding gowns</span><span>Before I Do</span><span>Bridal assistance</span><span>Digital planners</span>
  </div>
</section>

<section class="section">
  ${head('Our brands', 'One house, four ways to celebrate your story.', 'Custom-made fashion, menswear, children’s wear and a full bridal offering, each with its own character.')}
  ${brandCards()}
</section>

<section class="section section-dark">
  ${head('LoLo Bridal', 'Plan beautifully. Prepare confidently. Celebrate fully.', 'Bridal products, hands-on wedding support, and digital planning resources.', true)}
  ${offeringCards()}
  <div class="wrap hero-actions">
    <a class="button button-gold" href="/bridal.html">Explore LoLo Bridal</a>
    <a class="button button-ghost" href="/digital.html">Shop digital products</a>
  </div>
</section>

<section class="section section-dark">
  ${head('Gallery', 'Moments we’ve dressed.', 'A glimpse of weddings, ruracio ceremonies and celebrations where LoLo outfits took centre stage.', true)}
  <div class="wrap gallery-strip">
    ${galleryFiles.slice(0, 6).map((f, i) => galleryItem(f, i)).join('\n    ')}
  </div>
  <div class="wrap hero-actions"><a class="button button-gold" href="/gallery.html">View the full gallery</a></div>
</section>

<section class="section">
  ${head('Contact', 'Let’s bring your vision to life.', 'Have a design in mind, a wedding to plan, or a special occasion coming up? We’d love to hear from you.')}
  ${contactCards()}
</section>`,
});

pages['fashion.html'] = shell({
  file: 'fashion.html',
  title: 'LoLo Fashion House | Custom occasion wear, Mfalme menswear, LoLo Kids',
  description:
    'Custom-made outfits for weddings, red-carpet events, birthdays and graduations, plus Mfalme menswear and LoLo Kids.',
  ogImage: 'traditional',
  body: `
${pageHero('LoLo Fashion House', 'Made for your moments. Designed for your story.', 'Custom-made outfits for life’s most memorable occasions: traditional wedding gowns, red-carpet looks, birthday outfits and graduation ensembles.', img('red-carpet', 'A woman in a navy gown on a red carpet'))}
<section class="section">
  <div class="wrap section-head"><p>We believe that what you wear should feel uniquely yours. Through personalised design, careful craftsmanship and attention to detail, we bring your ideas to life, one beautiful outfit at a time.</p></div>
  <div class="wrap grid grid-collections">
    ${brands
      .filter((b) => b.id !== 'bridal')
      .map((b) =>
        card(
          `<span class="pill">${esc(b.kicker)}</span><h3>${esc(b.name)}</h3><p>${esc(b.copy)}</p>${wa('fashion', `Hello LoLo Fashion House, I would like to enquire about ${b.name}.`, 'Enquire on WhatsApp')}`,
          img(b.img, b.name),
        ),
      )
      .join('\n    ')}
  </div>
</section>
<section class="section section-dark">
  ${head('Collections', 'Outfits for every occasion.', 'Custom-made around your measurements and personal style.', true)}
  <div class="wrap grid grid-collections">
    ${collections.map((c) => card(`<h3>${esc(c.name)}</h3><p>${esc(c.note)}</p>`, img(c.img, c.name))).join('\n    ')}
  </div>
  <div class="wrap hero-actions">${wa('fashion', 'Hello LoLo Fashion House, I would like to book a consultation.', 'Book a consultation')}</div>
</section>`,
});

pages['bridal.html'] = shell({
  file: 'bridal.html',
  title: 'LoLo Bridal | Wedding gowns, Before I Do, bridal assistance & planning',
  description:
    'Custom wedding gowns, personalised accessories, Before I Do bridal mornings, bridal assistant services and wedding planning.',
  ogImage: 'gown',
  body: `
${pageHero('LoLo Bridal · Weddings & Events', 'Plan beautifully. Prepare confidently. Celebrate fully.', 'Your wedding deserves more than beautiful details. It deserves a thoughtful, seamless and memorable experience.', img('gown', 'A bride and groom standing by a lake'))}
<section class="section">
  ${offeringCards()}
  <div class="wrap hero-actions">${wa('bridal', 'Hello LoLo Bridal, I would like to make an enquiry.', 'Enquire on WhatsApp')}</div>
</section>

<section class="section section-dark" id="before-i-do">
  ${head('Before I Do', 'Bridal morning experiences', beforeIDo.intro, true)}
  <div class="wrap grid grid-collections">
    ${beforeIDo.packages.map((p, i) => card(`<span class="pill">${esc(p.price)}</span><h3>${esc(p.name)}</h3>${priceList(p.items)}`, img(['balloons', 'venue', 'champagne'][i], p.name))).join('\n    ')}
    ${card(`<span class="pill">À la carte</span><h3>Individual items</h3>${priceList(beforeIDo.addons)}`, img('rings', 'Gold wedding rings'))}
  </div>
  <div class="wrap section-head light">
    <p>${esc(beforeIDo.note)}</p>
    ${wa('bridal', 'Hello LoLo Bridal, I would like to book a Before I Do experience.', 'Book Before I Do')}
  </div>
</section>

<section class="section" id="bridal-services">
  ${head('Bridal assistant services', 'The Bridal Guardian Angel', guardianAngel.intro)}
  <div class="wrap grid grid-collections">
    ${guardianAngel.tiers.map((t, i) => card(`<span class="pill">${esc(t.price)}</span><h3>${esc(t.name)}</h3><ul class="plain-list">${t.points.map((x) => `<li>${esc(x)}</li>`).join('')}</ul>`, i === 0 ? img('robe', 'A bride in a robe holding a bouquet') : '')).join('\n    ')}
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
  ogImage: 'traditional',
  body: `
${pageHero('Gallery', 'Moments we’ve dressed.', 'Real events and real clients: wedding gowns, ruracio and traditional wear, bridal parties and groomswear, all crafted by LoLo Fashion House.')}
<section class="section">
  <div class="wrap gallery-grid">
    ${galleryFiles.map((f, i) => galleryItem(f, i)).join('\n    ')}
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
  ogImage: 'planner',
  body: `
${pageHero('LoLo Bridal · Digital products', 'Your wedding. Your vision. Your plan.', 'Thoughtfully designed digital resources to help you make informed decisions, stay organised, work with your vendors and prepare with confidence.', img('planner', 'A planner notebook and a gold watch'))}
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
  ogImage: 'birthday',
  body: `
${pageHero('About us', 'Thoughtful design. Personal expression. Beautifully made moments.', 'Clothing is more than what we wear. It is an expression of identity, confidence, culture, and personal style.', img('birthday', 'A woman in a yellow dress holding balloons'))}
<section class="section">
  <div class="wrap story-grid">
    <div>
      <span class="eyebrow">Since 2017</span>
      <h2>Meaningful, beautifully crafted pieces.</h2>
      <p class="subtle">${esc(about.promise)}</p>
    </div>
    <div class="story-copy glass-card">${about.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}</div>
  </div>
  ${brandCards()}
</section>`,
});

pages['contact.html'] = shell({
  file: 'contact.html',
  title: 'Contact & Enquiries | LoLo Fashion House & LoLo Bridal',
  description: 'Make an enquiry or book a consultation. Your request is sent straight to WhatsApp.',
  body: `
${pageHero('Contact & enquiries', 'Let’s bring your vision to life.', 'Have a design in mind, a wedding to plan, or a special occasion coming up? Make an enquiry, discuss your ideas, or book a consultation.')}
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
for (const [file, html] of Object.entries(pages)) writeFileSync(join(out, file), html);
writeFileSync(
  join(out, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Object.keys(pages)
    .map((f) => `<url><loc>${SITE_URL}/${f === 'index.html' ? '' : f}</loc></url>`)
    .join('\n')}\n</urlset>\n`,
);
console.log(`Generated ${Object.keys(pages).length} pages in site/`);
