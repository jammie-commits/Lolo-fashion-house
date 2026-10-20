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

## Admin (edit photos and text)

Open `/admin/` on the live site and log in. Photos can be added, replaced, captioned, hidden from the gallery or deleted, and the copy, prices and photo choices for every page can be edited. Saving commits the change to this repository, and Vercel rebuilds the site (about a minute).

- Editable data: `data/content.json` (copy, prices, photo choices) and `data/gallery.json` (photo list). Photos are in `site/assets/gallery/`.
- API: `api/auth.js` (login), `api/content.js`, `api/photos.js`, shared code in `api/_lib.js`.
- Set these in Vercel (Project Settings, Environment Variables), then redeploy:
  - `ADMIN_PASSWORD`: the admin password. Changing it logs everyone out.
  - `GITHUB_TOKEN`: a fine-grained personal access token limited to this repository with **Contents: Read and write**.
  - Optional: `GITHUB_REPO` (default `jammie-commits/Lolo-fashion-house`) and `GITHUB_BRANCH` (default `main`).
- Local testing: run the handlers with `ADMIN_STORAGE=fs` to write to local files instead of GitHub (ignored on Vercel). Use a copy of the repo, since it edits `data/` in place.

## Self-hosted server (Vultr)

`server.mjs` is a dependency-free Node server: it serves `site/` and runs the admin API, saving edits straight to `data/` and `site/assets/gallery/` and regenerating the pages in a second or two. No GitHub token is needed.

- Run locally: `ADMIN_PASSWORD=choose-one PORT=3000 npm start`
- Deploy: `deploy/deploy.sh root@SERVER_IP` (installs Node, creates a `lolo` systemd service, syncs the code). Set `DOMAIN=example.com` to add HTTPS through Caddy. Set `ADMIN_PASSWORD` or one is generated on the first deploy and printed once.
- Re-deploying never overwrites admin edits (`data/` and the gallery folder are left alone after the first deploy).
- Without a domain the site is served over plain HTTP, so the admin password is not encrypted in transit. Use a domain with HTTPS for real use.
- The Vercel setup (`api/` as serverless functions with `GITHUB_TOKEN`) still works but is no longer the primary host.
