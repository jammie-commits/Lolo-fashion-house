# LoLo Fashion House & LoLo Bridal

A static website (plain HTML, CSS and a little vanilla JS). No framework or runtime backend.

## Structure
- `site/`: the deployable site (Vercel `outputDirectory`). Contains the generated pages, `assets/` (styles, `app.js`, images), `logo.jpg`, `robots.txt` and `sitemap.xml`.
- `scripts/content.mjs`: all copy, prices, phone numbers and the Selar link.
- `scripts/build.mjs`: generates the HTML pages and sitemap into `site/`.

## Editing
1. Change copy or prices in `scripts/content.mjs`.
2. Run `npm run build` to regenerate `site/*.html`, then commit the result.
3. Preview with `npm run preview`.

## Behaviour
- Enquiry form (`/contact.html`) opens WhatsApp with the details pre-filled: bridal enquiry types go to LoLo Bridal (0740537139), everything else to LoLo Fashion House (0713280731).
- Digital products link to the Selar store. Add a `url` to an entry in `digitalProducts` for a per-product listing.
- Photos: all site photos come from the client's Drive folder (gallery in `site/assets/gallery/`; each page slot uses a different photo). The only exception is `site/assets/images/kids.jpg`, a free-to-use Unsplash photo ([license](https://unsplash.com/license)) until real LoLo Kids photos are available. Add or remove gallery files and run `npm run build`.
- Pages: Home, LoLo Bridal, Mfalme by LoLo, LoLo Kids, Digital Products, Gallery, About Us, Contact Us.
