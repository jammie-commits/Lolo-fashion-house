# Lolo Fashion House — website starter

A responsive, multi-page static website using HTML5, CSS3 and vanilla JavaScript. To run locally, install dependencies with `npm install` and start the Vite development server with `npm run dev`. Run `npm run build` to create a production build in `dist/`; all nine pages are included.

## Files
- `index.html`, `collections.html`, `gowns.html`, `african-prints.html`, `gallery.html`, `how-to-order.html`, `about.html`, `contact.html`, `cart.html`: pages with shared header/footer.
- `styles.css`: design tokens, responsive layout, typography, patterns, and motion.
- `app.js`: shared interactions, quote forms, gallery/lightbox, WhatsApp messages and localStorage cart.
- `products.js`: central sample product catalogue (8 gowns + 8 African-print designs).
- `public/assets/images/`: locally hosted artwork and stock-photo assets served at `assets/images/`.
- `ui-polish.css`: responsive typography, navigation and stock-image disclosure refinements.
- `robots.txt`, `sitemap.xml`: SEO files configured for the production site.

## Current site behavior
- Stock photos from Unsplash are labeled as style inspiration and are not representations of confirmed products or client work. Photo IDs are `1566174053879-31528523f8ae`, `1610030469983-98e550d6193c`, `1539008835657-9e8e9680c956`, `1595777457583-95e059d581b8`, `1524504388940-b1c1722653e1`, `1539109136881-3be0616acf4b`, and `1515886657613-9f3515b0c78f`; see the [Unsplash License](https://unsplash.com/license).
- Contact links go to the studio's Instagram profile. A WhatsApp number is not configured; quote and cart forms explain when an enquiry has not been sent and provide the Instagram contact link.
- The contact page does not collect or store enquiries. Quote/cart forms do not submit to a server and no payment is collected.
- Product prices and order terms are confirmed by the studio. Delivery, production timelines, payment, cancellation and alteration details are discussed before an order is confirmed.
- No newsletter form or mailing-list integration is present.

## Add a product
Open `products.js` and add an object to `window.LoloProducts`. Use a unique `id`, set `collection` to `gowns` or `african-prints`, and fill in `name`, `description`, `fabric`, `sizes`, `colours`, `swatches`, `image`, and `images`. `price: null` with `priceLabel: "Price on request"` avoids implying a price is confirmed. Use local image paths. Product pages render products from this data file automatically.

Example:
```js
{
  id: "gown-09",
  collection: "gowns",
  name: "New Signature Look",
  price: null,
  priceLabel: "Price on request",
  fabric: "Add a verified fabric description",
  sizes: ["Made to measure"],
  colours: ["Ink Indigo", "Turmeric"],
  swatches: ["#1C1B3A", "#E8A317"],
  image: "assets/images/new-look.webp",
  images: ["assets/images/new-look.webp", "assets/images/new-look-detail.webp"],
  description: "Add a concise, accurate product description."
}
```

## Add a gallery event
In `app.js`, find the `events` array and add an event object. Required fields are `title`, `type`, `date`, `place`, `garment`, `fabric`, `colours`, `details`, `story`, `credit`, and `image`. The gallery cards and accessible lightbox are generated from that array. Use accurate event details and approved photos only. Supported filters include Weddings, Traditional Ceremonies, Church and Graduation, Galas and Corporate, Birthdays, and Runway.

## Configure WhatsApp enquiries
If the studio wants WhatsApp enquiries, set `window.LoloConfig.whatsapp` near the top of `app.js` using the verified number in international digits only. The floating and contact links remain on Instagram. Test the quote and cart enquiry flows on a phone.

## Functionality and known limits
- Quote forms validate required fields and open a prepared WhatsApp message only when a valid studio number is configured. Otherwise, they provide an Instagram contact link; the form data is not sent.
- Cart items persist in browser `localStorage` across pages on the same origin. Local file mode behavior varies by browser; use a local static server for best testing.
- Gallery filters, lightbox close/previous/next controls, Escape and arrow keys are supported.
- Inspiration photo upload is not implemented.
- No backend, payment processing, inventory reservation, analytics, or newsletter database is included.
- Collection filters are starter controls and need to be connected to verified product metadata if detailed filtering is required.
- Google Fonts are the only external design resource; a system-font fallback is provided.
- Verify on 360px, 768px and 1280px widths, keyboard navigation, contrast, final URLs and reduced-motion behavior before production.
