# Vladislav — Premium Web Development Studio

A premium, animation-heavy personal portfolio built with Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer Motion, GSAP, and Lenis smooth scroll.

## Tech stack

- **Next.js 15** (App Router, React 19)
- **TypeScript** (strict mode)
- **Tailwind CSS v4**
- **Framer Motion** — scroll reveals, text masking, magnetic buttons, page/section transitions
- **GSAP + ScrollTrigger** — scroll-scrubbed timeline progress in the Process section
- **Lenis** — smooth scrolling
- **react-icons** — iconography
- Native Next.js **Metadata API** for SEO (Open Graph image, JSON-LD, sitemap, robots)

## Project structure

```
src/
  app/                # Routes, layout, metadata, robots/sitemap, OG image, icon
  components/
    layout/            # Header, Footer, SmoothScroll, CustomCursor, LoadingScreen
    sections/          # Hero, About, Skills, Services, Portfolio, Process, Pricing, FAQ, Contact
    ui/                # Reusable animation primitives (Reveal, RevealText, MagneticButton, ...)
  hooks/               # useMousePosition, useMediaQuery
  lib/
    data/              # Site content (services, projects, pricing, FAQ, process, skills, nav)
    utils.ts
  types/               # Shared TypeScript types
public/
  projects/            # Case study artwork (SVG)
```

## 1. Install

Requires Node.js 20+.

```bash
npm install
```

## 2. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Optional: copy `.env.example` to `.env.local` and set `NEXT_PUBLIC_SITE_URL` to your local/staging URL if you want accurate canonical/OG URLs while developing:

```bash
cp .env.example .env.local
```

### Other scripts

```bash
npm run build   # production build
npm run start   # serve the production build (respects $PORT)
npm run lint    # ESLint
```

## 3. Deploy on Render

This repo includes a `render.yaml` Blueprint, so Render can provision the service automatically.

**Option A — Blueprint (recommended)**

1. Push this repository to GitHub/GitLab.
2. In the Render dashboard, choose **New → Blueprint** and select the repo. Render will read `render.yaml` and configure the web service for you.
3. When prompted, set the `NEXT_PUBLIC_SITE_URL` environment variable to the URL Render assigns your service (e.g. `https://vladislav-portfolio.onrender.com`), or your custom domain once attached.
4. Deploy. Render runs `npm install && npm run build` to build and `npm run start` to serve.

**Option B — Manual web service**

1. In the Render dashboard, choose **New → Web Service** and connect the repo.
2. Runtime: **Node**.
3. Build command: `npm install && npm run build`
4. Start command: `npm run start`
5. Add an environment variable `NEXT_PUBLIC_SITE_URL` set to your Render service URL or custom domain.
6. Deploy.

`next start` automatically binds to the `PORT` environment variable Render provides — no extra configuration needed.

After the first deploy, if you attach a custom domain, update `NEXT_PUBLIC_SITE_URL` to match so canonical links, the sitemap, and Open Graph metadata stay correct.

## Content

All copy, pricing, services, FAQ, and case-study data live under `src/lib/data/` — edit those files to update site content without touching component code. Contact details (Telegram, GitHub, email) live in `src/lib/data/site.ts`.
