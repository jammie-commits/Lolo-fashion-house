import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dataDir = path.join(__dirname, 'data');
const dataFile = path.join(dataDir, 'state.json');

const seedState = {
  collections: [
    {
      id: 'weddings',
      name: 'Wedding Gowns',
      subtitle: 'Statement bridal silhouettes',
      description: 'Beaded lace, sculpted crepe, and ceremonial gowns designed to frame the day with precision.',
      tag: 'Made to measure',
      accent: '#d7b05e',
      featured: true,
    },
    {
      id: 'ruracio',
      name: 'Ruracio & Traditional Wear',
      subtitle: 'Ceremony sets with presence',
      description: 'Golden accents, structured tailoring, and coordinated looks for dowry and family ceremonies.',
      tag: 'Bridal party sets',
      accent: '#9c7530',
      featured: true,
    },
    {
      id: 'ankara',
      name: 'Ankara & Kitenge',
      subtitle: 'Pattern-rich custom dressing',
      description: 'Bold prints transformed into elegant tailoring for events, receptions, and modern occasion wear.',
      tag: 'Print + pattern',
      accent: '#c24f48',
      featured: true,
    },
    {
      id: 'menswear',
      name: 'Senator Suits & Menswear',
      subtitle: 'Clean lines, tailored confidence',
      description: 'Senator suits, agbada, and groomswear with a sharp fit and refined finish.',
      tag: 'Groom edit',
      accent: '#4d6f73',
      featured: true,
    },
    {
      id: 'bridesmaids',
      name: 'Bridesmaid Dresses',
      subtitle: 'Designed for the whole party',
      description: 'Color-matched dresses and shape-aware cutting so the bridal party looks cohesive and polished.',
      tag: 'Party matching',
      accent: '#8d5ca9',
      featured: true,
    },
    {
      id: 'kaftans',
      name: 'Kaftans',
      subtitle: 'Relaxed luxury silhouettes',
      description: 'Flowing garments made for gifting, guests, and elevated everyday occasion dressing.',
      tag: 'New arrival',
      accent: '#d08c4b',
      featured: true,
    },
  ],
  products: [
    {
      id: 'p-1',
      name: 'Golden Hour Gown',
      collectionId: 'weddings',
      collectionName: 'Wedding Gowns',
      price: 145000,
      status: 'Available',
      description: 'A fluid bridal gown with refined structure and warm gold finishing details.',
      imageUrl: '',
      featured: true,
      gradientStart: '#201913',
      gradientEnd: '#8c6a26',
    },
    {
      id: 'p-2',
      name: 'Ceremony Crown Set',
      collectionId: 'ruracio',
      collectionName: 'Ruracio & Traditional Wear',
      price: 98000,
      status: 'Available',
      description: 'Matching ceremonial tailoring for a family moment that photographs with authority.',
      imageUrl: '',
      featured: true,
      gradientStart: '#281c18',
      gradientEnd: '#7c4925',
    },
    {
      id: 'p-3',
      name: 'Midnight Senator Suit',
      collectionId: 'menswear',
      collectionName: 'Senator Suits & Menswear',
      price: 76000,
      status: 'Made to order',
      description: 'A smart senator suit with a contemporary cut and polished silhouette.',
      imageUrl: '',
      featured: true,
      gradientStart: '#0d2027',
      gradientEnd: '#556b6f',
    },
  ],
  messages: [],
  chats: [],
  insight: {
    copy: 'Gold-toned trims and softened ivory palettes are leading bridal requests this season, especially for outdoor ceremonies.',
    generatedAt: '2026-07-02T00:00:00.000Z',
  },
};

function ensureStore() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  if (!fs.existsSync(dataFile)) {
    fs.writeFileSync(dataFile, JSON.stringify(seedState, null, 2));
  }
}

export function readState() {
  ensureStore();
  const raw = fs.readFileSync(dataFile, 'utf8');
  return JSON.parse(raw);
}

export function writeState(state) {
  ensureStore();
  fs.writeFileSync(dataFile, JSON.stringify(state, null, 2));
}

export function createId(prefix) {
  return `${prefix}-${randomUUID().slice(0, 8)}`;
}

export function buildBootstrap(state) {
  return {
    site: {
      brand: 'Lolo Fashion House',
      collections: state.collections,
      products: state.products,
      testimonials: [
        'Our outfits spoke before we opened our mouths - the whole bridal party felt like royalty.',
        'Ordered from abroad with no fittings in person and everything still arrived fitting perfectly.',
        'The ruracio sets matched down to the beadwork - every photo looked intentional.',
      ],
    },
    insight: state.insight,
  };
}

export function buildAdminBootstrap(state) {
  const openMessages = state.messages.filter((message) => message.status !== 'Replied').length;

  return {
    site: {
      brand: 'Lolo Fashion House',
      collections: state.collections,
      products: state.products,
      testimonials: [
        'Our outfits spoke before we opened our mouths - the whole bridal party felt like royalty.',
        'Ordered from abroad with no fittings in person and everything still arrived fitting perfectly.',
        'The ruracio sets matched down to the beadwork - every photo looked intentional.',
      ],
    },
    insight: state.insight,
    admin: {
      overview: {
        collections: state.collections.length,
        products: state.products.length,
        openMessages,
        chats: state.chats.length,
      },
      collections: state.collections,
      products: state.products,
      messages: state.messages,
      chats: state.chats,
    },
  };
}

export function getStateOrSeed() {
  const state = readState();
  if (!state.collections || !state.products) {
    writeState(seedState);
    return readState();
  }
  return state;
}