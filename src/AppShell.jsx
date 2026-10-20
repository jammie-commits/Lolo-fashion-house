import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter, Navigate, NavLink, Route, Routes, useNavigate } from 'react-router-dom';
import {
  adminLogin,
  adminLogout,
  apiRequest,
  loadAdminBootstrap,
  loadAdminSession,
  loadBootstrap,
  refreshInsight,
} from './api';
import fallbackSite from './fallbackSite.json';
import { AboutSection, BridalPage, ContactCards, DigitalPage, FashionPage, HomeSections } from './ContentPages';
import { bridalEnquiryTypes, buildEnquiryMessage, tagline, waLink } from './siteContent';

const initialBooking = {
  name: '',
  phone: '',
  email: '',
  eventType: 'Wedding Gown',
  eventDate: '',
  location: '',
  note: '',
};

const initialCollectionDraft = {
  name: '',
  subtitle: '',
  description: '',
  tag: '',
  accent: '#d7b15d',
  featured: true,
};

const initialProductDraft = {
  name: '',
  collectionId: '',
  price: '',
  status: 'Available',
  description: '',
  imageUrl: '',
};

const chatStarters = [
  'What fabric works best for an outdoor wedding in Nairobi?',
  'How long does a custom gown usually take?',
  'What should a bridal party wear for a golden theme?',
];

const bookingOptions = [
  'Wedding Gown',
  'Ruracio / Traditional Wear',
  'Ankara / Kitenge',
  'Senator Suit / Menswear',
  'Bridesmaid Dresses',
  'Kaftan',
  'Mfalme Menswear',
  'LoLo Kids Outfit',
  'Before I Do Experience',
  'Bridal Assistant Services',
  'Wedding Planning & Coordination',
  'Other',
];

const publicNavItems = [
  { label: 'Home', to: '/' },
  { label: 'Fashion House', to: '/fashion' },
  { label: 'Bridal', to: '/bridal' },
  { label: 'Digital Products', to: '/digital' },
  { label: 'Collections', to: '/collections' },
  { label: 'About', to: '/story' },
  { label: 'Contact', to: '/book' },
  { label: 'Staff login', to: '/admin/login' },
];

function formatCurrency(value) {
  return new Intl.NumberFormat('en-KE', {
    style: 'currency',
    currency: 'KES',
    maximumFractionDigits: 0,
  }).format(Number(value || 0));
}

function AppShell() {
  return (
    <BrowserRouter>
      <div className="app-shell">
        <SiteHeader />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/fashion" element={<FashionPage Shell={PublicPageShell} />} />
            <Route path="/bridal" element={<BridalPage Shell={PublicPageShell} />} />
            <Route path="/digital" element={<DigitalPage Shell={PublicPageShell} />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/story" element={<StoryPage />} />
            <Route path="/book" element={<BookingPage />} />
            <Route path="/admin/login" element={<AdminLoginPage />} />
            <Route path="/admin" element={<AdminRoute />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

function SiteHeader() {
  return (
    <header className="topbar">
      <div className="wrap nav">
        <NavLink className="brand" to="/">
          <img src="/logo.jpg" alt="Lolo Fashion House" className="brand-logo" />
          <span className="brand-name">
            Lolo <em>Fashion House</em>
          </span>
        </NavLink>
        <nav>
          {publicNavItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'nav-link active' : 'nav-link')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

function PublicPageShell({ eyebrow, title, description, children }) {
  return (
    <>
      <section className="hero section page-hero">
        <div className="wrap page-hero-copy">
          <span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p className="lead">{description}</p>
        </div>
      </section>
      {children}
    </>
  );
}

function usePublicSite() {
  const [site, setSite] = useState(null);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState([]);
  const [chatBusy, setChatBusy] = useState(false);
  const [booking, setBooking] = useState(initialBooking);
  const [bookingBusy, setBookingBusy] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [styleFile, setStyleFile] = useState(null);
  const [stylePreview, setStylePreview] = useState('');
  const [styleResult, setStyleResult] = useState(null);
  const [styleBusy, setStyleBusy] = useState(false);

  async function loadData() {
    setLoading(true);
    try {
      const payload = await loadBootstrap();
      setSite(payload.site);
      setInsight(payload.insight);
      if (!chatMessages.length) {
        setChatMessages([
          {
            id: 'welcome',
            role: 'assistant',
            text:
              'Hi, I am the LoLo Style Concierge. Ask about fabric, fit, timelines, or the right collection for your occasion.',
          },
        ]);
      }
    } catch (error) {
      // Static hosting has no API; fall back to bundled collections.
      setSite((current) => current || { collections: fallbackSite.collections, products: [] });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const collections = site?.collections || [];
  const products = site?.products || [];
  const featuredProducts = useMemo(() => products.filter((product) => product.featured), [products]);

  async function submitChat(messageText) {
    const text = messageText.trim();
    if (!text || chatBusy) return;
    setChatBusy(true);
    setChatMessages((current) => [...current, { id: crypto.randomUUID(), role: 'user', text }]);
    setChatInput('');

    try {
      const response = await apiRequest('/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: text }),
      });
      setChatMessages((current) => [
        ...current,
        { id: response.entry.id, role: 'assistant', text: response.reply },
      ]);
      await loadData();
    } catch (error) {
      setChatMessages((current) => [
        ...current,
        { id: crypto.randomUUID(), role: 'assistant', text: error.message },
      ]);
    } finally {
      setChatBusy(false);
    }
  }

  async function submitBooking(event) {
    event.preventDefault();
    if (bookingBusy) return;
    setBookingBusy(true);

    const brand = bridalEnquiryTypes.includes(booking.eventType) ? 'bridal' : 'fashion';
    // Open synchronously so the popup is not blocked; the inbox copy is saved best-effort below.
    const win = window.open(waLink(brand, buildEnquiryMessage(booking)), '_blank');
    if (!win) window.location.href = waLink(brand, buildEnquiryMessage(booking));

    try {
      await apiRequest('/api/messages', {
        method: 'POST',
        body: JSON.stringify(booking),
      }).catch(() => null);
      setBooking(initialBooking);
      setBookingSuccess(true);
      setNotice('Your request was sent to WhatsApp.');
    } finally {
      setBookingBusy(false);
    }
  }

  async function updateInsight() {
    try {
      const response = await refreshInsight();
      setInsight(response.insight);
      setNotice('Style insight refreshed.');
      await loadData();
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function analyzeStyle() {
    if (!styleFile || styleBusy) return;
    setStyleBusy(true);

    try {
      const reader = new FileReader();
      const dataUrl = await new Promise((resolve, reject) => {
        reader.onload = () => resolve(String(reader.result || ''));
        reader.onerror = reject;
        reader.readAsDataURL(styleFile);
      });

      setStylePreview(dataUrl);
      const [, base64] = dataUrl.split(',');
      const response = await apiRequest('/api/style-match', {
        method: 'POST',
        body: JSON.stringify({ base64, mediaType: styleFile.type }),
      });
      setStyleResult(response.match);
      setNotice('Inspiration analyzed.');
    } catch (error) {
      setNotice(error.message);
    } finally {
      setStyleBusy(false);
    }
  }

  function useStyleMatch() {
    if (!styleResult) return;
    setBooking((current) => ({
      ...current,
      eventType: styleResult.collection || current.eventType,
      note: `Silhouette: ${styleResult.silhouette}. Fabric: ${styleResult.fabric}. Tip: ${styleResult.tip}`,
    }));
    document.getElementById('book-form')?.scrollIntoView({ behavior: 'smooth' });
  }

  return {
    collections,
    featuredProducts,
    insight,
    loading,
    notice,
    chatInput,
    chatMessages,
    chatBusy,
    booking,
    bookingBusy,
    bookingSuccess,
    bookingOptions,
    styleFile,
    stylePreview,
    styleResult,
    styleBusy,
    setChatInput,
    setBooking,
    setStyleFile,
    submitChat,
    submitBooking,
    analyzeStyle,
    useStyleMatch,
    updateInsight,
    formatCurrency,
  };
}

function HomePage() {
  const data = usePublicSite();
  const heroStats = [
    { label: 'Collections in the atelier', value: data.collections.length },
    { label: 'Featured products', value: data.featuredProducts.length },
    { label: 'Concierge status', value: 'Online' },
  ];

  return (
    <>
      <section className="hero section" id="home">
        <div className="wrap hero-grid">
          <div>
            <span className="eyebrow">LoLo Fashion House &amp; LoLo Bridal</span>
            <h1>{tagline}</h1>
            <p className="lead">
              From custom-made fashion to beautiful bridal experiences, LoLo brings your vision to life through
              thoughtful design, personalised details, and creative craftsmanship. Discover fashion that expresses
              you and bridal services that make your special moments unforgettable.
            </p>
            <div className="hero-actions">
              <NavLink className="button button-gold" to="/book">
                Make an enquiry
              </NavLink>
              <NavLink className="button button-ghost" to="/bridal">
                Explore LoLo Bridal
              </NavLink>
            </div>
            <div className="stat-row">
              {heroStats.map((stat) => (
                <div className="stat" key={stat.label}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="hero-panel glass-card">
            <div className="panel-label">Signature wardrobe</div>
            <div className="hero-collection-list">
              {data.collections.slice(0, 4).map((collection) => (
                <article className="mini-card" key={collection.id}>
                  <div className="mini-swatch" style={{ background: collection.accent }} />
                  <div>
                    <h3>{collection.name}</h3>
                    <p>{collection.subtitle}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section marquee">
        <div className="wrap marquee-track">
          <span>Custom occasion wear</span>
          <span>Mfalme menswear</span>
          <span>LoLo Kids</span>
          <span>Wedding gowns</span>
          <span>Before I Do</span>
          <span>Bridal assistance</span>
          <span>Digital planners</span>
        </div>
      </section>

      <section className="section">
        <div className="wrap section-head">
          <span className="eyebrow">Collections</span>
          <h2>Six wardrobe pillars with an elegant online presentation.</h2>
          <p>Each collection is maintained on the server so the public storefront stays in sync with the atelier team.</p>
        </div>
        <div className="wrap grid grid-collections">
          {data.collections.map((collection) => (
            <article className="glass-card collection-card" key={collection.id}>
              <div className="collection-top">
                <span className="collection-dot" style={{ background: collection.accent }} />
                <span className="pill">{collection.tag}</span>
              </div>
              <h3>{collection.name}</h3>
              <p>{collection.description}</p>
              <span className="subtle">{collection.subtitle}</span>
            </article>
          ))}
        </div>
      </section>

      {data.featuredProducts.length ? (
      <section className="section section-dark">
        <div className="wrap section-head light">
          <span className="eyebrow light">Products</span>
          <h2>Featured products with editorial presentation.</h2>
          <p>Product cards remain editable from the protected admin area.</p>
        </div>
        <div className="wrap grid grid-products">
          {data.featuredProducts.map((product) => (
            <article className="product-card" key={product.id}>
              <div
                className="product-media"
                style={{
                  background: product.imageUrl
                    ? 'transparent'
                    : `linear-gradient(135deg, ${product.gradientStart || '#201713'}, ${product.gradientEnd || '#6b4d1c'})`,
                }}
              >
                {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <span>{product.name.slice(0, 1)}</span>}
              </div>
              <div className="product-copy">
                <div className="product-row">
                  <h3>{product.name}</h3>
                  <strong>{data.formatCurrency(product.price)}</strong>
                </div>
                <p>{product.description}</p>
                <div className="product-row meta">
                  <span>{product.collectionName}</span>
                  <span>{product.status}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      ) : null}

      <HomeSections />

      <section className="section section-dark">
        <div className="wrap section-head light">
          <span className="eyebrow light">AI Style Concierge</span>
          <h2>Chat, upload inspiration, and refresh style insight.</h2>
          <p>The concierge lives on the public site, while the message inbox stays behind admin login.</p>
        </div>
        <div className="wrap concierge-grid">
          <div className="glass-card concierge-card">
            <div className="chat-log">
              {data.chatMessages.map((message) => (
                <div className={`chat-bubble ${message.role}`} key={message.id}>
                  {message.text}
                </div>
              ))}
            </div>
            <div className="quick-replies">
              {chatStarters.map((starter) => (
                <button key={starter} className="chip" onClick={() => data.submitChat(starter)} type="button">
                  {starter}
                </button>
              ))}
            </div>
            <div className="chat-input-row">
              <input
                value={data.chatInput}
                onChange={(event) => data.setChatInput(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && data.submitChat(data.chatInput)}
                placeholder="Ask about fabric, fit, timelines, or ceremony styling"
              />
              <button className="button button-gold" onClick={() => data.submitChat(data.chatInput)} disabled={data.chatBusy} type="button">
                {data.chatBusy ? 'Thinking…' : 'Ask'}
              </button>
            </div>
          </div>

          <div className="glass-card concierge-side">
            <div className="upload-box">
              <input
                id="styleFile"
                type="file"
                accept="image/*"
                onChange={(event) => data.setStyleFile(event.target.files?.[0] || null)}
              />
              <label htmlFor="styleFile">Drop an inspiration image or select a file</label>
              {data.styleFile ? <span>{data.styleFile.name}</span> : <span>Gown, suit, fabric sample, or Pinterest save</span>}
            </div>
            {data.stylePreview ? <img className="style-preview" src={data.stylePreview} alt="Style inspiration preview" /> : null}
            <button className="button button-ghost full-width" onClick={data.analyzeStyle} disabled={data.styleBusy || !data.styleFile} type="button">
              {data.styleBusy ? 'Analyzing…' : 'Analyze inspiration'}
            </button>
            {data.styleResult ? (
              <div className="result-grid">
                <div><span>Silhouette</span><strong>{data.styleResult.silhouette}</strong></div>
                <div><span>Fabric</span><strong>{data.styleResult.fabric}</strong></div>
                <div><span>Collection</span><strong>{data.styleResult.collection}</strong></div>
                <div><span>Styling note</span><strong>{data.styleResult.tip}</strong></div>
              </div>
            ) : null}
            <button className="button button-gold full-width" onClick={data.useStyleMatch} type="button" disabled={!data.styleResult}>
              Use this in booking
            </button>
            <div className="insight-block">
              <div className="insight-head">
                <span className="eyebrow light">Today’s insight</span>
                <button className="link-button" onClick={data.updateInsight} type="button">
                  Refresh
                </button>
              </div>
              <p>{data.insight?.copy || 'Loading insight...'}</p>
              <small>{data.insight?.generatedAt}</small>
            </div>
          </div>
        </div>
      </section>

    </>
  );
}

function CollectionsPage() {
  const data = usePublicSite();

  return (
    <>
      <PublicPageShell
        eyebrow="Collections"
        title="A curated wardrobe system for every ceremony."
        description="Browse the core collections and featured pieces that shape the Lolo Fashion House wardrobe."
      />
      <section className="section">
        <div className="wrap grid grid-collections">
          {data.collections.map((collection) => (
            <article className="glass-card collection-card" key={collection.id}>
              <div className="collection-top">
                <span className="collection-dot" style={{ background: collection.accent }} />
                <span className="pill">{collection.tag}</span>
              </div>
              <h3>{collection.name}</h3>
              <p>{collection.description}</p>
              <span className="subtle">{collection.subtitle}</span>
            </article>
          ))}
        </div>
      </section>
      {data.featuredProducts.length ? (
      <section className="section section-dark">
        <div className="wrap section-head light">
          <span className="eyebrow light">Featured products</span>
          <h2>Highlighted pieces from the atelier.</h2>
        </div>
        <div className="wrap grid grid-products">
          {data.featuredProducts.map((product) => (
            <article className="product-card" key={product.id}>
              <div
                className="product-media"
                style={{
                  background: product.imageUrl
                    ? 'transparent'
                    : `linear-gradient(135deg, ${product.gradientStart || '#201713'}, ${product.gradientEnd || '#6b4d1c'})`,
                }}
              >
                {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <span>{product.name.slice(0, 1)}</span>}
              </div>
              <div className="product-copy">
                <div className="product-row">
                  <h3>{product.name}</h3>
                  <strong>{data.formatCurrency(product.price)}</strong>
                </div>
                <p>{product.description}</p>
                <div className="product-row meta">
                  <span>{product.collectionName}</span>
                  <span>{product.status}</span>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>
      ) : null}
    </>
  );
}

function StoryPage() {
  return (
    <>
      <PublicPageShell
        eyebrow="About us"
        title="Thoughtful design. Personal expression. Beautifully made moments."
        description="Clothing is more than what we wear. It is an expression of identity, confidence, culture, and personal style."
      />
      <AboutSection />
    </>
  );
}

function BookingPage() {
  const data = usePublicSite();

  return (
    <>
      <PublicPageShell
        eyebrow="Contact & enquiries"
        title="Let’s bring your vision to life."
        description="Have a design in mind, a wedding to plan, or a special occasion coming up? Make an enquiry, discuss your ideas, or book a consultation."
      />
      <section className="section">
        <ContactCards />
      </section>
      <section className="section section-dark">
        <div className="wrap concierge-grid">
          <div className="glass-card concierge-card">
            <div className="chat-log">
              {data.chatMessages.map((message) => (
                <div className={`chat-bubble ${message.role}`} key={message.id}>
                  {message.text}
                </div>
              ))}
            </div>
            <div className="quick-replies">
              {chatStarters.map((starter) => (
                <button key={starter} className="chip" onClick={() => data.submitChat(starter)} type="button">
                  {starter}
                </button>
              ))}
            </div>
            <div className="chat-input-row">
              <input
                value={data.chatInput}
                onChange={(event) => data.setChatInput(event.target.value)}
                onKeyDown={(event) => event.key === 'Enter' && data.submitChat(data.chatInput)}
                placeholder="Ask about fabric, fit, timelines, or ceremony styling"
              />
              <button className="button button-gold" onClick={() => data.submitChat(data.chatInput)} disabled={data.chatBusy} type="button">
                {data.chatBusy ? 'Thinking…' : 'Ask'}
              </button>
            </div>
          </div>

          <div className="glass-card concierge-side">
            <div className="upload-box">
              <input
                id="styleFile"
                type="file"
                accept="image/*"
                onChange={(event) => data.setStyleFile(event.target.files?.[0] || null)}
              />
              <label htmlFor="styleFile">Drop an inspiration image or select a file</label>
              {data.styleFile ? <span>{data.styleFile.name}</span> : <span>Gown, suit, fabric sample, or Pinterest save</span>}
            </div>
            {data.stylePreview ? <img className="style-preview" src={data.stylePreview} alt="Style inspiration preview" /> : null}
            <button className="button button-ghost full-width" onClick={data.analyzeStyle} disabled={data.styleBusy || !data.styleFile} type="button">
              {data.styleBusy ? 'Analyzing…' : 'Analyze inspiration'}
            </button>
            {data.styleResult ? (
              <div className="result-grid">
                <div><span>Silhouette</span><strong>{data.styleResult.silhouette}</strong></div>
                <div><span>Fabric</span><strong>{data.styleResult.fabric}</strong></div>
                <div><span>Collection</span><strong>{data.styleResult.collection}</strong></div>
                <div><span>Styling note</span><strong>{data.styleResult.tip}</strong></div>
              </div>
            ) : null}
            <button className="button button-gold full-width" onClick={data.useStyleMatch} type="button" disabled={!data.styleResult}>
              Use this in booking
            </button>
            <div className="insight-block">
              <div className="insight-head">
                <span className="eyebrow light">Today’s insight</span>
                <button className="link-button" onClick={data.updateInsight} type="button">
                  Refresh
                </button>
              </div>
              <p>{data.insight?.copy || 'Loading insight...'}</p>
              <small>{data.insight?.generatedAt}</small>
            </div>
          </div>
        </div>
      </section>

      <section className="section booking" id="book-form">
        <div className="wrap booking-grid">
          <div className="section-head">
            <span className="eyebrow">Book a fitting</span>
            <h2>Send your details and the team can respond without touching code.</h2>
            <p>Submitting opens WhatsApp with your details for the right team: LoLo Bridal for bridal services, LoLo Fashion House for everything else.</p>
          </div>
          <form className="glass-card booking-card" onSubmit={data.submitBooking}>
            <div className="grid form-grid">
              <label>
                Full name
                <input required value={data.booking.name} onChange={(event) => data.setBooking({ ...data.booking, name: event.target.value })} />
              </label>
              <label>
                WhatsApp / phone
                <input required value={data.booking.phone} onChange={(event) => data.setBooking({ ...data.booking, phone: event.target.value })} />
              </label>
              <label>
                Email
                <input value={data.booking.email} onChange={(event) => data.setBooking({ ...data.booking, email: event.target.value })} />
              </label>
              <label>
                Event type
                <select value={data.booking.eventType} onChange={(event) => data.setBooking({ ...data.booking, eventType: event.target.value })}>
                  {bookingOptions.map((option) => (
                    <option key={option}>{option}</option>
                  ))}
                </select>
              </label>
              <label>
                Event date
                <input type="date" value={data.booking.eventDate} onChange={(event) => data.setBooking({ ...data.booking, eventDate: event.target.value })} />
              </label>
              <label>
                Delivery location
                <input value={data.booking.location} onChange={(event) => data.setBooking({ ...data.booking, location: event.target.value })} />
              </label>
              <label className="full-span">
                Design notes
                <textarea rows="4" value={data.booking.note} onChange={(event) => data.setBooking({ ...data.booking, note: event.target.value })} />
              </label>
            </div>
            <button className="button button-gold" type="submit" disabled={data.bookingBusy}>
              {data.bookingBusy ? 'Opening WhatsApp…' : 'Send via WhatsApp'}
            </button>
            {data.bookingSuccess ? <p className="success-note">Your enquiry is ready in WhatsApp. Press send there to reach us.</p> : null}
          </form>
        </div>
      </section>
    </>
  );
}

function AdminLoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event) {
    event.preventDefault();
    if (busy) return;
    setBusy(true);
    setError('');

    try {
      await adminLogin({ username, password });
      navigate('/admin', { replace: true });
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="section admin-gate">
      <div className="wrap auth-grid">
        <div>
          <span className="eyebrow">Staff access</span>
          <h1>Admin login</h1>
          <p className="lead">The dashboard is hidden behind this login and the API rejects admin requests without a session cookie.</p>
        </div>
        <form className="glass-card auth-card" onSubmit={handleSubmit}>
          <label>
            Username
            <input value={username} onChange={(event) => setUsername(event.target.value)} />
          </label>
          <label>
            Password
            <input type="password" value={password} onChange={(event) => setPassword(event.target.value)} />
          </label>
          {error ? <p className="error-note">{error}</p> : null}
          <button className="button button-gold" type="submit" disabled={busy}>
            {busy ? 'Signing in…' : 'Enter dashboard'}
          </button>
        </form>
      </div>
    </section>
  );
}

function AdminRoute() {
  const navigate = useNavigate();
  const [session, setSession] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    let alive = true;
    async function checkSession() {
      try {
        const response = await loadAdminSession();
        if (alive) setSession(response.user);
      } catch {
        if (alive) setSession(null);
      } finally {
        if (alive) setChecking(false);
      }
    }
    checkSession();
    return () => {
      alive = false;
    };
  }, []);

  async function handleLogout() {
    await adminLogout();
    navigate('/', { replace: true });
  }

  if (checking) {
    return (
      <section className="section admin-gate">
        <div className="wrap auth-grid">
          <div>
            <span className="eyebrow">Admin</span>
            <h1>Checking session</h1>
          </div>
          <div className="glass-card auth-card">Loading…</div>
        </div>
      </section>
    );
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return <AdminDashboardPage onLogout={handleLogout} />;
}

function AdminDashboardPage({ onLogout }) {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState('');
  const [activeTab, setActiveTab] = useState('collections');
  const [collectionDraft, setCollectionDraft] = useState(initialCollectionDraft);
  const [productDraft, setProductDraft] = useState(initialProductDraft);
  const [editingCollectionId, setEditingCollectionId] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [replyDrafts, setReplyDrafts] = useState({});

  async function loadData() {
    setLoading(true);
    try {
      const payload = await loadAdminBootstrap();
      setDashboard(payload);
    } catch (error) {
      setNotice(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const admin = dashboard?.admin || {};
  const collections = admin.collections || [];
  const products = admin.products || [];
  const messages = admin.messages || [];
  const chats = admin.chats || [];
  const overview = admin.overview || {};

  async function submitCollection(event) {
    event.preventDefault();
    const currentEditingId = editingCollectionId;
    const method = currentEditingId ? 'PUT' : 'POST';
    const path = currentEditingId
      ? `/api/admin/collections/${currentEditingId}`
      : '/api/admin/collections';

    try {
      await apiRequest(path, {
        method,
        body: JSON.stringify(collectionDraft),
      });
      setCollectionDraft(initialCollectionDraft);
      setEditingCollectionId(null);
      setNotice(currentEditingId ? 'Collection updated.' : 'Collection added.');
      await loadData();
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function submitProduct(event) {
    event.preventDefault();
    const currentEditingId = editingProductId;
    const payload = {
      ...productDraft,
      featured: Boolean(productDraft.featured),
      price: Number(productDraft.price || 0),
    };
    const method = currentEditingId ? 'PUT' : 'POST';
    const path = currentEditingId
      ? `/api/admin/products/${currentEditingId}`
      : '/api/admin/products';

    try {
      await apiRequest(path, {
        method,
        body: JSON.stringify(payload),
      });
      setProductDraft(initialProductDraft);
      setEditingProductId(null);
      setNotice(currentEditingId ? 'Product updated.' : 'Product added.');
      await loadData();
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function submitReply(messageId) {
    const reply = (replyDrafts[messageId] || '').trim();
    if (!reply) return;

    try {
      await apiRequest(`/api/admin/messages/${messageId}/reply`, {
        method: 'POST',
        body: JSON.stringify({ reply }),
      });
      setReplyDrafts((current) => ({ ...current, [messageId]: '' }));
      setNotice('Reply saved to the inbox.');
      await loadData();
    } catch (error) {
      setNotice(error.message);
    }
  }

  async function removeCollection(id) {
    await apiRequest(`/api/admin/collections/${id}`, { method: 'DELETE' });
    await loadData();
  }

  async function removeProduct(id) {
    await apiRequest(`/api/admin/products/${id}`, { method: 'DELETE' });
    await loadData();
  }

  return (
    <section className="section section-dark admin-page">
      <div className="wrap section-head light admin-page-head">
        <span className="eyebrow light">Admin dashboard</span>
        <h1>Protected control room</h1>
        <p>Collections, products, and inbox replies are only available after login.</p>
      </div>

      <div className="wrap admin-toolbar">
        <div className="admin-toolbar-note">Signed in as staff</div>
        <button className="button button-ghost" type="button" onClick={onLogout}>
          Sign out
        </button>
      </div>

      <div className="wrap admin-overview">
        <div className="metric-card"><span>Collections</span><strong>{overview.collections || 0}</strong></div>
        <div className="metric-card"><span>Products</span><strong>{overview.products || 0}</strong></div>
        <div className="metric-card"><span>Open messages</span><strong>{overview.openMessages || 0}</strong></div>
        <div className="metric-card"><span>Chat entries</span><strong>{overview.chats || 0}</strong></div>
      </div>

      <div className="wrap tabs-row">
        {['collections', 'products', 'messages', 'chats'].map((tab) => (
          <button
            key={tab}
            className={activeTab === tab ? 'tab active' : 'tab'}
            onClick={() => setActiveTab(tab)}
            type="button"
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="wrap admin-layout">
        {activeTab === 'collections' ? (
          <>
            <form className="glass-card admin-form" onSubmit={submitCollection}>
              <div className="form-head">
                <h3>{editingCollectionId ? 'Edit collection' : 'Add collection'}</h3>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => {
                    setCollectionDraft(initialCollectionDraft);
                    setEditingCollectionId(null);
                  }}
                >
                  Reset
                </button>
              </div>
              <label>
                Name
                <input value={collectionDraft.name} onChange={(event) => setCollectionDraft({ ...collectionDraft, name: event.target.value })} />
              </label>
              <label>
                Subtitle
                <input value={collectionDraft.subtitle} onChange={(event) => setCollectionDraft({ ...collectionDraft, subtitle: event.target.value })} />
              </label>
              <label>
                Description
                <textarea rows="4" value={collectionDraft.description} onChange={(event) => setCollectionDraft({ ...collectionDraft, description: event.target.value })} />
              </label>
              <div className="grid two-up">
                <label>
                  Tag
                  <input value={collectionDraft.tag} onChange={(event) => setCollectionDraft({ ...collectionDraft, tag: event.target.value })} />
                </label>
                <label>
                  Accent
                  <input value={collectionDraft.accent} onChange={(event) => setCollectionDraft({ ...collectionDraft, accent: event.target.value })} />
                </label>
              </div>
              <label className="check-row">
                <input
                  type="checkbox"
                  checked={collectionDraft.featured}
                  onChange={(event) => setCollectionDraft({ ...collectionDraft, featured: event.target.checked })}
                />
                Featured on home page
              </label>
              <button className="button button-gold" type="submit">
                {editingCollectionId ? 'Update collection' : 'Save collection'}
              </button>
            </form>

            <div className="admin-list">
              {collections.map((collection) => (
                <article className="glass-card admin-item" key={collection.id}>
                  <div className="admin-item-head">
                    <div>
                      <h3>{collection.name}</h3>
                      <p>{collection.subtitle}</p>
                    </div>
                    <span className="pill">{collection.tag}</span>
                  </div>
                  <p>{collection.description}</p>
                  <div className="admin-actions">
                    <button
                      type="button"
                      className="button button-ghost"
                      onClick={() => {
                        setEditingCollectionId(collection.id);
                        setCollectionDraft({
                          name: collection.name,
                          subtitle: collection.subtitle,
                          description: collection.description,
                          tag: collection.tag,
                          accent: collection.accent,
                          featured: collection.featured,
                        });
                      }}
                    >
                      Edit
                    </button>
                    <button type="button" className="button button-ghost danger" onClick={() => removeCollection(collection.id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : null}

        {activeTab === 'products' ? (
          <>
            <form className="glass-card admin-form" onSubmit={submitProduct}>
              <div className="form-head">
                <h3>{editingProductId ? 'Edit product' : 'Add product'}</h3>
                <button
                  type="button"
                  className="link-button"
                  onClick={() => {
                    setProductDraft(initialProductDraft);
                    setEditingProductId(null);
                  }}
                >
                  Reset
                </button>
              </div>
              <label>
                Product name
                <input value={productDraft.name} onChange={(event) => setProductDraft({ ...productDraft, name: event.target.value })} />
              </label>
              <label>
                Collection
                <select value={productDraft.collectionId} onChange={(event) => setProductDraft({ ...productDraft, collectionId: event.target.value })}>
                  <option value="">Choose a collection</option>
                  {collections.map((collection) => (
                    <option key={collection.id} value={collection.id}>
                      {collection.name}
                    </option>
                  ))}
                </select>
              </label>
              <div className="grid two-up">
                <label>
                  Price (KES)
                  <input type="number" value={productDraft.price} onChange={(event) => setProductDraft({ ...productDraft, price: event.target.value })} />
                </label>
                <label>
                  Status
                  <input value={productDraft.status} onChange={(event) => setProductDraft({ ...productDraft, status: event.target.value })} />
                </label>
              </div>
              <label>
                Description
                <textarea rows="4" value={productDraft.description} onChange={(event) => setProductDraft({ ...productDraft, description: event.target.value })} />
              </label>
              <label>
                Image URL
                <input value={productDraft.imageUrl} onChange={(event) => setProductDraft({ ...productDraft, imageUrl: event.target.value })} />
              </label>
              <button className="button button-gold" type="submit">
                {editingProductId ? 'Update product' : 'Save product'}
              </button>
            </form>

            <div className="admin-list">
              {products.map((product) => (
                <article className="glass-card admin-item" key={product.id}>
                  <div className="admin-item-head">
                    <div>
                      <h3>{product.name}</h3>
                      <p>{product.collectionName}</p>
                    </div>
                    <strong>{formatCurrency(product.price)}</strong>
                  </div>
                  <p>{product.description}</p>
                  <div className="admin-actions">
                    <button
                      type="button"
                      className="button button-ghost"
                      onClick={() => {
                        setEditingProductId(product.id);
                        setProductDraft({
                          name: product.name,
                          collectionId: product.collectionId,
                          price: String(product.price),
                          status: product.status,
                          description: product.description,
                          imageUrl: product.imageUrl || '',
                        });
                      }}
                    >
                      Edit
                    </button>
                    <button type="button" className="button button-ghost danger" onClick={() => removeProduct(product.id)}>
                      Delete
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </>
        ) : null}

        {activeTab === 'messages' ? (
          <div className="admin-list full-span">
            {messages.map((message) => (
              <article className="glass-card admin-item message-item" key={message.id}>
                <div className="admin-item-head">
                  <div>
                    <h3>{message.name}</h3>
                    <p>
                      {message.eventType} · {message.location || 'Location not provided'}
                    </p>
                  </div>
                  <span className={`pill ${message.status === 'Replied' ? 'pill-success' : ''}`}>{message.status}</span>
                </div>
                <p>{message.note}</p>
                {message.reply ? <div className="reply-box">Reply: {message.reply}</div> : null}
                <label>
                  Reply to client
                  <textarea
                    rows="3"
                    value={replyDrafts[message.id] || ''}
                    onChange={(event) => setReplyDrafts({ ...replyDrafts, [message.id]: event.target.value })}
                  />
                </label>
                <div className="admin-actions">
                  <button className="button button-gold" type="button" onClick={() => submitReply(message.id)}>
                    Save reply
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : null}

        {activeTab === 'chats' ? (
          <div className="admin-list full-span">
            {chats.map((chat) => (
              <article className="glass-card admin-item chat-item" key={chat.id}>
                <div className="admin-item-head">
                  <div>
                    <h3>Chat request</h3>
                    <p>{chat.createdAt}</p>
                  </div>
                </div>
                <div className="chat-audit">
                  <div>
                    <span>User</span>
                    <p>{chat.message}</p>
                  </div>
                  <div>
                    <span>AI</span>
                    <p>{chat.reply}</p>
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </div>

      <section className="section">
        <div className="wrap footer-note glass-card">
          <div>
            <span className="eyebrow">Status</span>
            <h2>{loading ? 'Loading dashboard…' : 'Admin dashboard is locked behind login.'}</h2>
          </div>
          <p>{notice || 'Admin changes are persisted on the server and never exposed on the public pages.'}</p>
        </div>
      </section>
    </section>
  );
}

export default AppShell;
