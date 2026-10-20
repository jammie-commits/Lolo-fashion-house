import { useEffect, useMemo, useState } from 'react';
import { apiRequest, loadBootstrap, refreshInsight } from './api';

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
  'Other',
];

function App() {
  const [dashboard, setDashboard] = useState(null);
  const [insight, setInsight] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('collections');
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
  const [collectionDraft, setCollectionDraft] = useState(initialCollectionDraft);
  const [productDraft, setProductDraft] = useState(initialProductDraft);
  const [editingCollectionId, setEditingCollectionId] = useState(null);
  const [editingProductId, setEditingProductId] = useState(null);
  const [replyDrafts, setReplyDrafts] = useState({});

  async function loadData() {
    setLoading(true);
    try {
      const [bootstrap, insightPayload] = await Promise.all([
        loadBootstrap(),
        apiRequest('/api/insight'),
      ]);
      setDashboard(bootstrap);
      setInsight(insightPayload.insight);
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
      setNotice(error.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const site = dashboard?.site || {};
  const admin = dashboard?.admin || {};
  const collections = site.collections || [];
  const products = site.products || [];
  const messages = admin.messages || [];
  const chats = admin.chats || [];
  const overview = admin.overview || {};

  const featuredProducts = useMemo(
    () => products.filter((product) => product.featured),
    [products],
  );

  const formatCurrency = (value) =>
    new Intl.NumberFormat('en-KE', {
      style: 'currency',
      currency: 'KES',
      maximumFractionDigits: 0,
    }).format(Number(value || 0));

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
        {
          id: crypto.randomUUID(),
          role: 'assistant',
          text: error.message,
        },
      ]);
    } finally {
      setChatBusy(false);
    }
  }

  async function submitBooking(event) {
    event.preventDefault();
    if (bookingBusy) return;
    setBookingBusy(true);

    try {
      await apiRequest('/api/messages', {
        method: 'POST',
        body: JSON.stringify(booking),
      });
      setBooking(initialBooking);
      setBookingSuccess(true);
      setNotice('Your fitting request was submitted to the admin inbox.');
      await loadData();
    } catch (error) {
      setNotice(error.message);
    } finally {
      setBookingBusy(false);
    }
  }

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
    document.getElementById('booking')?.scrollIntoView({ behavior: 'smooth' });
  }

  const heroStats = [
    { label: 'Collections in dashboard', value: collections.length },
    { label: 'Products managed', value: products.length },
    { label: 'Messages waiting', value: messages.filter((item) => item.status !== 'Replied').length },
  ];

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="wrap nav">
          <div className="brand">
            <span className="brand-mark">L</span>
            <span>
              Lolo <em>Fashion House</em>
            </span>
          </div>
          <nav>
            <a href="#collections">Collections</a>
            <a href="#concierge">Concierge</a>
            <a href="#booking">Booking</a>
            <a href="#admin">Admin</a>
          </nav>
        </div>
      </header>

      <main>
        <section className="hero section" id="home">
          <div className="wrap hero-grid">
            <div>
              <span className="eyebrow">lolo fashion house · Nairobi, Kenya</span>
              <h1>Where polished tailoring meets a gold standard of service.</h1>
              <p className="lead">
                Lolo Fashion House is built for bridal elegance, ceremonial wear, and a modern admin
                workflow that lets the team manage collections, products, and client messages without
                touching code.
              </p>
              <div className="hero-actions">
                <a className="button button-gold" href="#booking">
                  Book a fitting
                </a>
                <a className="button button-ghost" href="#admin">
                  Open admin dashboard
                </a>
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
                {(collections.slice(0, 4).length ? collections.slice(0, 4) : site.collections || []).map((collection) => (
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
            <span>Wedding gowns</span>
            <span>Ruracio wear</span>
            <span>Ankara & Kitenge</span>
            <span>Senator suits</span>
            <span>Bridesmaid dresses</span>
            <span>Kaftans</span>
          </div>
        </section>

        <section className="section" id="collections">
          <div className="wrap section-head">
            <span className="eyebrow">Collections</span>
            <h2>Six wardrobe pillars, managed from the admin dashboard.</h2>
            <p>
              The public storefront reads directly from the same editable data that the admin team uses.
              Add a collection once and the site updates everywhere.
            </p>
          </div>
          <div className="wrap grid grid-collections">
            {collections.map((collection) => (
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

        <section className="section section-dark" id="products">
          <div className="wrap section-head light">
            <span className="eyebrow light">Products</span>
            <h2>Featured products with editorial presentation.</h2>
            <p>
              Product cards are editable in the dashboard, including pricing, collection assignment,
              and status.
            </p>
          </div>
          <div className="wrap grid grid-products">
            {featuredProducts.map((product) => (
              <article className="product-card" key={product.id}>
                <div className="product-media" style={{ background: product.imageUrl ? 'transparent' : `linear-gradient(135deg, ${product.gradientStart || '#201713'}, ${product.gradientEnd || '#6b4d1c'})` }}>
                  {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <span>{product.name.slice(0, 1)}</span>}
                </div>
                <div className="product-copy">
                  <div className="product-row">
                    <h3>{product.name}</h3>
                    <strong>{formatCurrency(product.price)}</strong>
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

        <section className="section" id="story">
          <div className="wrap story-grid">
            <div>
              <span className="eyebrow">Our Story</span>
              <h2>From a sitting-room sewing machine to a full atelier system.</h2>
            </div>
            <div className="story-copy glass-card">
              <p>
                The brand grew from small custom orders into a polished fashion house with a distinct
                bridal and occasion-wear identity.
              </p>
              <p>
                This React build keeps that presentation elegant while making the business easier to run:
                the public site, collections, products, bookings, and AI responses all flow through the
                server.
              </p>
            </div>
          </div>
        </section>

        <section className="section section-dark" id="concierge">
          <div className="wrap section-head light">
            <span className="eyebrow light">AI Style Concierge</span>
            <h2>Chat, upload inspiration, and refresh style insight.</h2>
            <p>
              The AI layer now runs on the server, so the admin can audit conversations and the public
              no longer needs direct access to model credentials.
            </p>
          </div>
          <div className="wrap concierge-grid">
            <div className="glass-card concierge-card">
              <div className="chat-log">
                {chatMessages.map((message) => (
                  <div className={`chat-bubble ${message.role}`} key={message.id}>
                    {message.text}
                  </div>
                ))}
              </div>
              <div className="quick-replies">
                {chatStarters.map((starter) => (
                  <button key={starter} className="chip" onClick={() => submitChat(starter)} type="button">
                    {starter}
                  </button>
                ))}
              </div>
              <div className="chat-input-row">
                <input
                  value={chatInput}
                  onChange={(event) => setChatInput(event.target.value)}
                  onKeyDown={(event) => event.key === 'Enter' && submitChat(chatInput)}
                  placeholder="Ask about fabric, fit, timelines, or ceremony styling"
                />
                <button className="button button-gold" onClick={() => submitChat(chatInput)} disabled={chatBusy} type="button">
                  {chatBusy ? 'Thinking…' : 'Ask'}
                </button>
              </div>
            </div>

            <div className="glass-card concierge-side">
              <div className="upload-box">
                <input
                  id="styleFile"
                  type="file"
                  accept="image/*"
                  onChange={(event) => setStyleFile(event.target.files?.[0] || null)}
                />
                <label htmlFor="styleFile">Drop an inspiration image or select a file</label>
                {styleFile ? <span>{styleFile.name}</span> : <span>Gown, suit, fabric sample, or Pinterest save</span>}
              </div>
              {stylePreview ? <img className="style-preview" src={stylePreview} alt="Style inspiration preview" /> : null}
              <button className="button button-ghost full-width" onClick={analyzeStyle} disabled={styleBusy || !styleFile} type="button">
                {styleBusy ? 'Analyzing…' : 'Analyze inspiration'}
              </button>
              {styleResult ? (
                <div className="result-grid">
                  <div><span>Silhouette</span><strong>{styleResult.silhouette}</strong></div>
                  <div><span>Fabric</span><strong>{styleResult.fabric}</strong></div>
                  <div><span>Collection</span><strong>{styleResult.collection}</strong></div>
                  <div><span>Styling note</span><strong>{styleResult.tip}</strong></div>
                </div>
              ) : null}
              <button className="button button-gold full-width" onClick={useStyleMatch} type="button" disabled={!styleResult}>
                Use this in booking
              </button>
              <div className="insight-block">
                <div className="insight-head">
                  <span className="eyebrow light">Today’s insight</span>
                  <button className="link-button" onClick={updateInsight} type="button">
                    Refresh
                  </button>
                </div>
                <p>{insight?.copy || 'Loading insight...'}</p>
                <small>{insight?.generatedAt}</small>
              </div>
            </div>
          </div>
        </section>

        <section className="section booking" id="booking">
          <div className="wrap booking-grid">
            <div className="section-head">
              <span className="eyebrow">Book a fitting</span>
              <h2>Send your details and the team can respond without touching code.</h2>
              <p>
                Messages submit into the admin inbox where the team can reply, track status, and keep
                conversations organized.
              </p>
            </div>
            <form className="glass-card booking-card" onSubmit={submitBooking}>
              <div className="grid form-grid">
                <label>
                  Full name
                  <input required value={booking.name} onChange={(event) => setBooking({ ...booking, name: event.target.value })} />
                </label>
                <label>
                  WhatsApp / phone
                  <input required value={booking.phone} onChange={(event) => setBooking({ ...booking, phone: event.target.value })} />
                </label>
                <label>
                  Email
                  <input value={booking.email} onChange={(event) => setBooking({ ...booking, email: event.target.value })} />
                </label>
                <label>
                  Event type
                  <select value={booking.eventType} onChange={(event) => setBooking({ ...booking, eventType: event.target.value })}>
                    {bookingOptions.map((option) => (
                      <option key={option}>{option}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Event date
                  <input type="date" value={booking.eventDate} onChange={(event) => setBooking({ ...booking, eventDate: event.target.value })} />
                </label>
                <label>
                  Delivery location
                  <input value={booking.location} onChange={(event) => setBooking({ ...booking, location: event.target.value })} />
                </label>
                <label className="full-span">
                  Design notes
                  <textarea rows="4" value={booking.note} onChange={(event) => setBooking({ ...booking, note: event.target.value })} />
                </label>
              </div>
              <button className="button button-gold" type="submit" disabled={bookingBusy}>
                {bookingBusy ? 'Sending…' : 'Send request'}
              </button>
              {bookingSuccess ? <p className="success-note">Request received. The admin inbox has been updated.</p> : null}
            </form>
          </div>
        </section>

        <section className="section section-dark" id="admin">
          <div className="wrap section-head light">
            <span className="eyebrow light">Admin Dashboard</span>
            <h2>Manage collections, products, messages, and AI history.</h2>
            <p>
              This is the control room for the brand. Changes here are persisted in the server store and
              reflected in the storefront immediately.
            </p>
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
                      <div><span>User</span><p>{chat.message}</p></div>
                      <div><span>AI</span><p>{chat.reply}</p></div>
                    </div>
                  </article>
                ))}
              </div>
            ) : null}
          </div>
        </section>

        <section className="section">
          <div className="wrap footer-note glass-card">
            <div>
              <span className="eyebrow">Status</span>
              <h2>{loading ? 'Loading dashboard…' : 'React storefront and admin server are live.'}</h2>
            </div>
            <p>{notice || 'Admin changes are persisted on the server and flow back into the storefront.'}</p>
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;