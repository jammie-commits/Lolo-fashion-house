import { readFileSync } from 'node:fs';

export const contacts = {
  fashion: { label: 'LoLo Fashion House', phone: '0713280731', wa: '254713280731' },
  bridal: { label: 'LoLo Bridal', phone: '0740537139', wa: '254740537139', email: 'lolobridal001@gmail.com' },
};

// Add a per-product Selar `url` to digitalProducts entries when available; otherwise the store link is used.
export const selarStoreUrl = 'https://selar.com/m/laurine-muturi1';

export const waLink = (brand, text) =>
  `https://wa.me/${contacts[brand].wa}?text=${encodeURIComponent(text)}`;

// Editable copy and photo choices live in data/*.json and are managed from /admin.
const load = (name) => JSON.parse(readFileSync(new URL(`../data/${name}.json`, import.meta.url), 'utf8'));
const data = load('content');

export const gallery = load('gallery');
export const { heroes, homeStrip, brands, collections, bridalOfferings, beforeIDo, guardianAngel, planning, digitalProducts, about, mfalme, kidsInfo } = data;
export const tagline = heroes.home.title;

export const bridalEnquiryTypes = [
  'Before I Do Experience',
  'Bridal Assistant Services',
  'Wedding Planning & Coordination',
];

export const buildEnquiryMessage = (b) =>
  [
    `Hello, I would like to make an enquiry.`,
    `Name: ${b.name}`,
    `Phone: ${b.phone}`,
    b.email && `Email: ${b.email}`,
    `Enquiry type: ${b.eventType}`,
    b.eventDate && `Event date: ${b.eventDate}`,
    b.location && `Location: ${b.location}`,
    b.note && `Notes: ${b.note}`,
  ]
    .filter(Boolean)
    .join('\n');

export const enquiryOptions = [
  'Wedding Gown',
  'Ruracio / Traditional Wear',
  'Ankara / Kitenge',
  'Red-Carpet / Birthday / Graduation Outfit',
  'Mfalme Menswear',
  'LoLo Kids Outfit',
  'Bridesmaid Dresses',
  'Before I Do Experience',
  'Bridal Assistant Services',
  'Wedding Planning & Coordination',
  'Other',
];
