import { NavLink } from 'react-router-dom';
import {
  about,
  beforeIDo,
  bridalOfferings,
  brands,
  contacts,
  digitalProducts,
  guardianAngel,
  planning,
  selarStoreUrl,
  tagline,
  waLink,
} from './siteContent';

export function WhatsAppButton({ brand, text, children, ghost }) {
  return (
    <a
      className={`button ${ghost ? 'button-ghost' : 'button-gold'}`}
      href={waLink(brand, text)}
      target="_blank"
      rel="noreferrer"
    >
      {children}
    </a>
  );
}

export function ContactCards() {
  return (
    <div className="wrap grid grid-collections">
      {Object.entries(contacts).map(([brand, c]) => (
        <article className="glass-card collection-card" key={brand}>
          <h3>{c.label}</h3>
          <p>
            <a href={`tel:${c.phone}`}>{c.phone}</a>
            {c.email ? (
              <>
                <br />
                <a href={`mailto:${c.email}`}>{c.email}</a>
              </>
            ) : null}
          </p>
          <WhatsAppButton brand={brand} text={`Hello ${c.label}, I would like to make an enquiry.`}>
            WhatsApp {c.label}
          </WhatsAppButton>
        </article>
      ))}
    </div>
  );
}

function BrandCards() {
  return (
    <div className="wrap grid grid-collections">
      {brands.map((brand) => (
        <article className="glass-card collection-card" key={brand.id}>
          <span className="pill">{brand.kicker}</span>
          <h3>{brand.name}</h3>
          <p>{brand.copy}</p>
        </article>
      ))}
    </div>
  );
}

function Head({ eyebrow, title, children, light }) {
  return (
    <div className={`wrap section-head${light ? ' light' : ''}`}>
      <span className={`eyebrow${light ? ' light' : ''}`}>{eyebrow}</span>
      <h2>{title}</h2>
      {children ? <p>{children}</p> : null}
    </div>
  );
}

export function HomeSections() {
  return (
    <>
      <section className="section">
        <Head eyebrow="Our brands" title="One house, four ways to celebrate your story.">
          Custom-made fashion, menswear, children’s wear and a full bridal offering, each with its own character.
        </Head>
        <BrandCards />
      </section>

      <section className="section section-dark">
        <Head light eyebrow="LoLo Bridal" title="Plan beautifully. Prepare confidently. Celebrate fully.">
          Bridal products, hands-on wedding support, and digital planning resources.
        </Head>
        <div className="wrap grid grid-collections">
          {bridalOfferings.map((o) => (
            <article className="glass-card collection-card" key={o.title}>
              <h3>{o.title}</h3>
              <p>{o.copy}</p>
            </article>
          ))}
        </div>
        <div className="wrap hero-actions">
          <NavLink className="button button-gold" to="/bridal">
            Explore LoLo Bridal
          </NavLink>
          <NavLink className="button button-ghost" to="/digital">
            Shop digital products
          </NavLink>
        </div>
      </section>

      <section className="section">
        <Head eyebrow="Contact" title="Let’s bring your vision to life.">
          Have a design in mind, a wedding to plan, or a special occasion coming up? We’d love to hear from you.
        </Head>
        <ContactCards />
      </section>
    </>
  );
}

export function FashionPage({ Shell }) {
  return (
    <>
      <Shell
        eyebrow="LoLo Fashion House"
        title="Made for your moments. Designed for your story."
        description="Custom-made outfits for life’s most memorable occasions: traditional wedding gowns, red-carpet looks, birthday outfits and graduation ensembles."
      />
      <section className="section">
        <div className="wrap section-head">
          <p>
            We believe that what you wear should feel uniquely yours. Through personalised design, careful
            craftsmanship and attention to detail, we bring your ideas to life, one beautiful outfit at a time.
          </p>
        </div>
        <div className="wrap grid grid-collections">
          {brands.filter((b) => b.id !== 'bridal').map((b) => (
            <article className="glass-card collection-card" key={b.id}>
              <span className="pill">{b.kicker}</span>
              <h3>{b.name}</h3>
              <p>{b.copy}</p>
              <WhatsAppButton brand="fashion" text={`Hello LoLo Fashion House, I would like to enquire about ${b.name}.`}>
                Enquire on WhatsApp
              </WhatsAppButton>
            </article>
          ))}
        </div>
        <div className="wrap hero-actions">
          <NavLink className="button button-ghost" to="/collections">
            View collections
          </NavLink>
          <NavLink className="button button-ghost" to="/book">
            Book a consultation
          </NavLink>
        </div>
      </section>
    </>
  );
}

function PriceList({ rows }) {
  return (
    <ul className="price-list">
      {rows.map(([label, price]) => (
        <li key={label}>
          <span>{label}</span>
          <strong>{price}</strong>
        </li>
      ))}
    </ul>
  );
}

export function BridalPage({ Shell }) {
  return (
    <>
      <Shell
        eyebrow="LoLo Bridal · Weddings & Events"
        title="Plan beautifully. Prepare confidently. Celebrate fully."
        description="Your wedding deserves more than beautiful details. It deserves a thoughtful, seamless and memorable experience."
      />

      <section className="section">
        <div className="wrap grid grid-collections">
          {bridalOfferings.map((o) => (
            <article className="glass-card collection-card" key={o.title}>
              <h3>{o.title}</h3>
              <p>{o.copy}</p>
            </article>
          ))}
        </div>
        <div className="wrap hero-actions">
          <WhatsAppButton brand="bridal" text="Hello LoLo Bridal, I would like to make an enquiry.">
            Enquire on WhatsApp
          </WhatsAppButton>
        </div>
      </section>

      <section className="section section-dark" id="before-i-do">
        <Head light eyebrow="Before I Do" title="Bridal morning experiences">
          {beforeIDo.intro}
        </Head>
        <div className="wrap grid grid-collections">
          {beforeIDo.packages.map((p) => (
            <article className="glass-card collection-card" key={p.name}>
              <span className="pill">{p.price}</span>
              <h3>{p.name}</h3>
              <PriceList rows={p.items} />
            </article>
          ))}
          <article className="glass-card collection-card">
            <span className="pill">À la carte</span>
            <h3>Individual items</h3>
            <PriceList rows={beforeIDo.addons} />
          </article>
        </div>
        <div className="wrap section-head light">
          <p>{beforeIDo.note}</p>
          <WhatsAppButton brand="bridal" text="Hello LoLo Bridal, I would like to book a Before I Do experience.">
            Book Before I Do
          </WhatsAppButton>
        </div>
      </section>

      <section className="section" id="bridal-services">
        <Head eyebrow="Bridal assistant services" title="The Bridal Guardian Angel">
          {guardianAngel.intro}
        </Head>
        <div className="wrap grid grid-collections">
          {guardianAngel.tiers.map((t) => (
            <article className="glass-card collection-card" key={t.name}>
              <span className="pill">{t.price}</span>
              <h3>{t.name}</h3>
              <ul className="plain-list">
                {t.points.map((pt) => (
                  <li key={pt}>{pt}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
        <div className="wrap section-head">
          <p>{guardianAngel.extra}</p>
          <p className="subtle">{guardianAngel.note}</p>
          <WhatsAppButton brand="bridal" text="Hello LoLo Bridal, I would like to enquire about the Bridal Guardian Angel.">
            Enquire about bridal assistance
          </WhatsAppButton>
        </div>
      </section>

      <section className="section section-dark" id="planning">
        <Head light eyebrow="Wedding planning & coordination" title="Three levels of support, one calm celebration.">
          {planning.intro}
        </Head>
        <div className="wrap grid grid-collections">
          {planning.tiers.map((t) => (
            <article className="glass-card collection-card" key={t.name}>
              <span className="pill">{t.price}</span>
              <h3>{t.name}</h3>
              <p>{t.detail}</p>
            </article>
          ))}
        </div>
        <div className="wrap section-head light">
          <p>{planning.note}</p>
          <WhatsAppButton brand="bridal" text="Hello LoLo Bridal, I would like to enquire about wedding planning and coordination.">
            Request a planning package
          </WhatsAppButton>
        </div>
      </section>
    </>
  );
}

export function DigitalPage({ Shell }) {
  return (
    <>
      <Shell
        eyebrow="LoLo Bridal · Digital products"
        title="Your wedding. Your vision. Your plan."
        description="Thoughtfully designed digital resources to help you make informed decisions, stay organised, work with your vendors and prepare with confidence."
      />
      <section className="section">
        <div className="wrap grid grid-collections">
          {digitalProducts.map((p) => (
            <article className="glass-card collection-card" key={p.name}>
              <h3>{p.name}</h3>
              <p>{p.copy}</p>
              <a className="button button-gold" href={p.url || selarStoreUrl} target="_blank" rel="noreferrer">
                Buy on Selar
              </a>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

export function AboutSection() {
  return (
    <section className="section">
      <div className="wrap story-grid">
        <div>
          <span className="eyebrow">About us</span>
          <h2>Since 2017, a passion for meaningful, beautifully crafted pieces.</h2>
          <p className="subtle">{about.promise}</p>
        </div>
        <div className="story-copy glass-card">
          {about.paragraphs.map((p) => (
            <p key={p.slice(0, 20)}>{p}</p>
          ))}
        </div>
      </div>
      <BrandCards />
    </section>
  );
}

export { tagline };
