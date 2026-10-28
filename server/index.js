import express from 'express';
import cors from 'cors';
import crypto from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { analyzeStyleImage, getChatReply, getInsight } from './ai.js';
import {
  buildAdminBootstrap,
  buildBootstrap,
  createId,
  getStateOrSeed,
  readState,
  writeState,
} from './store.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const port = process.env.PORT || 3001;
const adminUsername = process.env.ADMIN_USERNAME || 'admin';
const adminPassword = process.env.ADMIN_PASSWORD || 'lolo-admin';
const adminSessionSecret = process.env.ADMIN_SESSION_SECRET || 'lolo-fashion-house-session';
const adminCookieName = 'lolo_admin_session';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '15mb' }));

function parseCookies(cookieHeader = '') {
  return cookieHeader.split(';').reduce((cookies, entry) => {
    const separatorIndex = entry.indexOf('=');
    if (separatorIndex === -1) return cookies;
    const key = entry.slice(0, separatorIndex).trim();
    const value = entry.slice(separatorIndex + 1).trim();
    if (key) cookies[key] = decodeURIComponent(value);
    return cookies;
  }, {});
}

function createSessionToken(payload) {
  const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto
    .createHmac('sha256', adminSessionSecret)
    .update(encodedPayload)
    .digest('base64url');
  return `${encodedPayload}.${signature}`;
}

function verifySessionToken(token) {
  if (!token || !token.includes('.')) return null;
  const [encodedPayload, signature] = token.split('.');
  const expectedSignature = crypto
    .createHmac('sha256', adminSessionSecret)
    .update(encodedPayload)
    .digest('base64url');

  if (signature !== expectedSignature) return null;

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, 'base64url').toString('utf8'));
    return payload?.role === 'admin' ? payload : null;
  } catch {
    return null;
  }
}

function getAdminSession(req) {
  const cookies = parseCookies(req.headers.cookie || '');
  return verifySessionToken(cookies[adminCookieName]);
}

function requireAdminSession(req, res, next) {
  const session = getAdminSession(req);
  if (!session) {
    res.status(401).json({ error: 'Admin authentication required' });
    return;
  }
  req.adminSession = session;
  next();
}

function setAdminCookie(res, token) {
  const maxAgeSeconds = 60 * 60 * 12;
  res.setHeader(
    'Set-Cookie',
    `${adminCookieName}=${encodeURIComponent(token)}; HttpOnly; Path=/; SameSite=Lax; Max-Age=${maxAgeSeconds}`,
  );
}

function clearAdminCookie(res) {
  res.setHeader('Set-Cookie', `${adminCookieName}=; HttpOnly; Path=/; SameSite=Lax; Max-Age=0`);
}

function persist(mutator) {
  const state = getStateOrSeed();
  const nextState = mutator(structuredClone(state)) || state;
  writeState(nextState);
  return nextState;
}

function resolveCollectionName(collections, collectionId) {
  return collections.find((collection) => collection.id === collectionId)?.name || 'Unassigned';
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/bootstrap', (_req, res) => {
  const state = getStateOrSeed();
  res.json(buildBootstrap(state));
});

app.get('/api/admin/session', (req, res) => {
  const session = getAdminSession(req);
  if (!session) {
    res.status(401).json({ authenticated: false });
    return;
  }
  res.json({ authenticated: true, user: { username: session.username, role: 'admin' } });
});

app.post('/api/admin/login', (req, res) => {
  const username = String(req.body?.username || '').trim();
  const password = String(req.body?.password || '');

  if (username !== adminUsername || password !== adminPassword) {
    res.status(401).json({ error: 'Invalid admin credentials' });
    return;
  }

  const token = createSessionToken({ username, role: 'admin' });
  setAdminCookie(res, token);
  res.json({ ok: true, user: { username, role: 'admin' } });
});

app.post('/api/admin/logout', (_req, res) => {
  clearAdminCookie(res);
  res.json({ ok: true });
});

app.get('/api/insight', (_req, res) => {
  const state = getStateOrSeed();
  res.json({ insight: state.insight });
});

app.post('/api/insight', async (_req, res) => {
  const insight = {
    copy: await getInsight(),
    generatedAt: new Date().toISOString(),
  };
  persist((state) => {
    state.insight = insight;
    return state;
  });
  res.json({ insight });
});

app.post('/api/chat', async (req, res) => {
  const message = String(req.body?.message || '').trim();
  if (!message) {
    res.status(400).json({ error: 'Message is required' });
    return;
  }

  const reply = await getChatReply(message);
  const entry = {
    id: createId('chat'),
    message,
    reply,
    createdAt: new Date().toISOString(),
  };

  persist((state) => {
    state.chats.unshift(entry);
    return state;
  });

  res.json({ entry, reply });
});

app.post('/api/style-match', async (req, res) => {
  const base64 = String(req.body?.base64 || '').trim();
  const mediaType = String(req.body?.mediaType || 'image/jpeg').trim();

  if (!base64) {
    res.status(400).json({ error: 'Image data is required' });
    return;
  }

  const match = await analyzeStyleImage({ base64, mediaType });
  res.json({ match });
});

app.get('/api/admin/bootstrap', requireAdminSession, (_req, res) => {
  const state = getStateOrSeed();
  res.json(buildAdminBootstrap(state));
});

app.get('/api/admin/collections', requireAdminSession, (_req, res) => {
  res.json({ collections: getStateOrSeed().collections });
});

app.post('/api/admin/collections', requireAdminSession, (req, res) => {
  const payload = req.body || {};
  if (!payload.name) {
    res.status(400).json({ error: 'Collection name is required' });
    return;
  }

  const collection = {
    id: createId('collection'),
    name: String(payload.name),
    subtitle: String(payload.subtitle || ''),
    description: String(payload.description || ''),
    tag: String(payload.tag || ''),
    accent: String(payload.accent || '#d1ad5d'),
    featured: Boolean(payload.featured),
  };

  persist((state) => {
    state.collections.unshift(collection);
    return state;
  });

  res.status(201).json({ collection });
});

app.put('/api/admin/collections/:id', requireAdminSession, (req, res) => {
  const { id } = req.params;
  const payload = req.body || {};
  let updatedCollection = null;

  persist((state) => {
    state.collections = state.collections.map((collection) => {
      if (collection.id !== id) return collection;
      updatedCollection = {
        ...collection,
        name: String(payload.name || collection.name),
        subtitle: String(payload.subtitle || collection.subtitle),
        description: String(payload.description || collection.description),
        tag: String(payload.tag || collection.tag),
        accent: String(payload.accent || collection.accent),
        featured: Boolean(payload.featured),
      };
      return updatedCollection;
    });
    state.products = state.products.map((product) => ({
      ...product,
      collectionName: resolveCollectionName(state.collections, product.collectionId),
    }));
    return state;
  });

  if (!updatedCollection) {
    res.status(404).json({ error: 'Collection not found' });
    return;
  }

  res.json({ collection: updatedCollection });
});

app.delete('/api/admin/collections/:id', requireAdminSession, (req, res) => {
  const { id } = req.params;
  let found = false;

  persist((state) => {
    found = state.collections.some((collection) => collection.id === id);
    state.collections = state.collections.filter((collection) => collection.id !== id);
    state.products = state.products.map((product) =>
      product.collectionId === id
        ? { ...product, collectionId: '', collectionName: 'Unassigned' }
        : product,
    );
    return state;
  });

  if (!found) {
    res.status(404).json({ error: 'Collection not found' });
    return;
  }

  res.json({ ok: true });
});

app.get('/api/admin/products', requireAdminSession, (_req, res) => {
  res.json({ products: getStateOrSeed().products });
});

app.post('/api/admin/products', requireAdminSession, (req, res) => {
  const payload = req.body || {};
  if (!payload.name) {
    res.status(400).json({ error: 'Product name is required' });
    return;
  }

  let product = null;

  persist((state) => {
    product = {
      id: createId('product'),
      name: String(payload.name),
      collectionId: String(payload.collectionId || ''),
      collectionName: resolveCollectionName(state.collections, payload.collectionId),
      price: Number(payload.price || 0),
      status: String(payload.status || 'Available'),
      description: String(payload.description || ''),
      imageUrl: String(payload.imageUrl || ''),
      featured: payload.featured !== false,
      gradientStart: '#1c1612',
      gradientEnd: '#7a5a24',
    };
    state.products.unshift(product);
    return state;
  });

  res.status(201).json({ product });
});

app.put('/api/admin/products/:id', requireAdminSession, (req, res) => {
  const { id } = req.params;
  const payload = req.body || {};
  let updatedProduct = null;

  persist((state) => {
    state.products = state.products.map((product) => {
      if (product.id !== id) return product;
      updatedProduct = {
        ...product,
        name: String(payload.name || product.name),
        collectionId: String(payload.collectionId || product.collectionId),
        collectionName: resolveCollectionName(state.collections, payload.collectionId || product.collectionId),
        price: Number(payload.price || product.price || 0),
        status: String(payload.status || product.status),
        description: String(payload.description || product.description),
        imageUrl: String(payload.imageUrl || product.imageUrl || ''),
        featured: payload.featured !== false,
      };
      return updatedProduct;
    });
    return state;
  });

  if (!updatedProduct) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  res.json({ product: updatedProduct });
});

app.delete('/api/admin/products/:id', requireAdminSession, (req, res) => {
  const { id } = req.params;
  let found = false;

  persist((state) => {
    found = state.products.some((product) => product.id === id);
    state.products = state.products.filter((product) => product.id !== id);
    return state;
  });

  if (!found) {
    res.status(404).json({ error: 'Product not found' });
    return;
  }

  res.json({ ok: true });
});

app.get('/api/admin/messages', requireAdminSession, (_req, res) => {
  res.json({ messages: getStateOrSeed().messages });
});

app.post('/api/messages', (req, res) => {
  const payload = req.body || {};
  if (!payload.name || !payload.phone) {
    res.status(400).json({ error: 'Name and phone are required' });
    return;
  }

  const message = {
    id: createId('message'),
    name: String(payload.name),
    phone: String(payload.phone),
    email: String(payload.email || ''),
    eventType: String(payload.eventType || 'Wedding Gown'),
    eventDate: String(payload.eventDate || ''),
    location: String(payload.location || ''),
    note: String(payload.note || ''),
    reply: '',
    status: 'New',
    createdAt: new Date().toISOString(),
  };

  persist((state) => {
    state.messages.unshift(message);
    return state;
  });

  res.status(201).json({ message });
});

app.post('/api/admin/messages/:id/reply', requireAdminSession, (req, res) => {
  const { id } = req.params;
  const reply = String(req.body?.reply || '').trim();
  if (!reply) {
    res.status(400).json({ error: 'Reply is required' });
    return;
  }

  let updated = null;
  persist((state) => {
    state.messages = state.messages.map((message) => {
      if (message.id !== id) return message;
      updated = { ...message, reply, status: 'Replied' };
      return updated;
    });
    return state;
  });

  if (!updated) {
    res.status(404).json({ error: 'Message not found' });
    return;
  }

  res.json({ message: updated });
});

app.use(express.static(path.join(__dirname, '..', 'dist')));
app.get('*', (_req, res, next) => {
  if (process.env.NODE_ENV === 'production') {
    res.sendFile(path.join(__dirname, '..', 'dist', 'index.html'));
    return;
  }
  next();
});

app.listen(port, () => {
  const state = readState();
  if (!state) {
    getStateOrSeed();
  }
  console.log(`Lolo Fashion House API running on http://127.0.0.1:${port}`);
});