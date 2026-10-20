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
- Photos: the gallery, hero, traditional, birthday, red-carpet, menswear and bridal-gown images are the client's own. The rest (kids, robe, venue, balloons, rings, champagne, planner) are free-to-use Unsplash photos, see the [Unsplash License](https://unsplash.com/license). Gallery photos are in `site/assets/gallery/` (numbered `01.jpg`, `02.jpg`, ...); add or remove files there and run `npm run build`.
