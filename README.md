# Lolo Fashion House — website starter

A responsive, multi-page static website using HTML5, CSS3 and vanilla JavaScript. To run locally, install dependencies with `npm install` and start the Vite development server with `npm run dev`. Run `npm run build` to create a production build in `dist/`; all nine pages are included.

## Files
- `index.html`, `collections.html`, `gowns.html`, `african-prints.html`, `gallery.html`, `how-to-order.html`, `about.html`, `contact.html`, `cart.html`: pages with shared header/footer.
- `styles.css`: design tokens, responsive layout, typography, patterns, and motion.
- `app.js`: shared interactions, quote forms, gallery/lightbox, WhatsApp messages and localStorage cart.
- `products.js`: central sample product catalogue (8 gowns + 8 African-print designs).
- `public/assets/images/`: locally hosted artwork and stock-photo assets served at `assets/images/`.
- `ui-polish.css`: responsive typography, navigation and stock-image disclosure refinements.
- `robots.txt`, `sitemap.xml`: SEO starter files; replace the canonical URL placeholders.

## Before publishing — required setup
1. In `app.js`, replace `REPLACE_WITH_WHATSAPP_NUMBER` with the studio WhatsApp number in international digits only (example format: `2547XXXXXXXX`, no `+`, spaces or hyphens). Also update phone, email, city and currency.
2. Replace all bracketed content such as `[CITY, COUNTRY]`, `[STUDIO ADDRESS]`, hours, payment methods, delivery areas, lead times, deposit and cancellation policies with verified business information.
3. Replace illustrative stock photos in `public/assets/images/` with approved brand photography before launch. Current fashion photos are from Unsplash under the [Unsplash License](https://unsplash.com/license); photo IDs are `1566174053879-31528523f8ae`, `1610030469983-98e550d6193c`, `1539008835657-9e8e9680c956`, `1595777457583-95e059d581b8`, `1524504388940-b1c1722653e1`, `1539109136881-3be0616acf4b`, and `1515886657613-9f3515b0c78f`. Stock photos are explicitly labeled as style inspiration and are not representations of confirmed products or client work.
4. Update the LocalBusiness JSON-LD in each page's `<head>` with verified contact details and canonical site URL. Replace the Open Graph image and `[WEBSITE URL]` in sitemap/robots.
5. Replace draft gallery events and testimonials with real details and obtain consent for client names, faces and photographer credits.
6. Connect the newsletter to a mailing-list provider before collecting emails. The current form intentionally does not store subscriber data.
7. Confirm payment, delivery, privacy, refund and rush-order policies. This is an enquiry website, not a payment gateway; it does not process online payments or reserve production slots.

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
  fabric: "[confirm fabric]",
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

## Change the WhatsApp number
Edit `window.LoloConfig.whatsapp` near the top of `app.js` using international digits only. Also replace the WhatsApp placeholder in the floating button and contact page (`REPLACE_WITH_WHATSAPP_NUMBER`) so every link points to the same verified number. Test the quote form, contact form and cart enquiry on a phone.

## Functionality and known limits
- Quote forms validate required fields and compose a WhatsApp message; email fallback is provided in quote/cart flows.
- Cart items persist in browser `localStorage` across pages on the same origin. Local file mode behavior varies by browser; use a local static server for best testing.
- Gallery filters, lightbox close/previous/next controls, Escape and arrow keys are supported.
- Inspiration photo upload is not implemented: the UI explains that photos should be attached in WhatsApp.
- No backend, payment processing, inventory reservation, analytics, or newsletter database is included.
- Collection filters are starter controls and need to be connected to verified product metadata if detailed filtering is required.
- Google Fonts are the only external design resource; a system-font fallback is provided.
- Verify on 360px, 768px and 1280px widths, keyboard navigation, contrast, final URLs and reduced-motion behavior before production.
