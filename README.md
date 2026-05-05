# aimanalhazmi.github.io

Personal site of Aiman Al-Hazmi — built with Astro, React Three Fiber, and Tailwind CSS. Deployed to GitHub Pages.

## Local development

```bash
npm install
npm run dev          # http://localhost:4321
```

The dev server hot-reloads on save — edit a markdown file in `src/content/blog/` or `src/content/projects/` and the page updates instantly.

## Build & preview production

```bash
npm run build        # builds to ./dist
npm run preview      # serves ./dist locally
```

## Adding content

### Easiest: the admin UI

Visit `/admin` on your live site, log in with GitHub, and edit posts/projects through a visual editor. Saving creates a git commit. **Requires the Cloudflare Worker OAuth proxy to be deployed first** — see "Decap CMS setup" below.

### Direct: edit markdown files

```
src/content/
  blog/             ← one .md file per blog post
  projects/         ← one .md file per project
src/data/
  cv.ts             ← CV content (work, education, skills)
  site.ts           ← site name, tagline, social links
```

Every file has typed frontmatter (validated at build time). Just `git push` to publish.

## Decap CMS setup (one-time)

The `/admin` page needs a tiny OAuth proxy so it can talk to GitHub. Free, runs on Cloudflare Workers.

1. Sign up for [Cloudflare Workers](https://workers.cloudflare.com/) (free, no card).
2. Deploy [`decap-proxy`](https://github.com/i40west/netlify-cms-cloudflare-pages) or any `decap-cms-oauth` worker template.
3. Create a GitHub OAuth App (Settings → Developer settings → OAuth Apps) with the worker URL as callback.
4. Update `public/admin/config.yml` → set `base_url` to your worker URL.

Until this is wired up, edit content directly in markdown files (works fine, just no visual editor).

## Deploy

Pushes to `main` trigger `.github/workflows/pages-deploy.yml` which builds and deploys to GitHub Pages. In repo settings → Pages, ensure the source is set to **GitHub Actions**.
