# GDG on Campus · ITER — club hub

A light, Google-colour front end for a GDG on Campus chapter: public site plus a club-management console.
Everything runs on mock data stored in the browser (no backend), with a shared WebGL canvas for the 3D scenes.

Built by Jagdish Pattnaik for the UI Sphere GDG event.

## What's inside

| Route | What it does |
| --- | --- |
| `/` | Hero clubhouse (3D), recruitment form with a live 3D ID badge, meets with a 3D calendar and RSVP, gallery carousel, milestone road, member network, launch CTA |
| `/members` | Directory with search, filters, sort, grid / table / 3D network views, profile drawer, add / edit / remove, CSV import and export, birthdays |
| `/dashboard` | KPIs, 3D team chart, attendance, branch, year and points charts, leaderboard, activity |
| `/events` | Events manager: create events, RSVP, calendar export, check-in |
| `/applicants` | Recruitment board: drag between stages, add selected applicants to the roster |

Switch between **Admin** and **Member** on the Members page to see the permission difference.
Use **3D on/off** in the navbar for a lightweight 2D fallback (also automatic with reduced-motion or no WebGL).

## Run

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # outputs ./dist
```

## Deploy to Cloudflare Workers (static assets)

```bash
npm run build
npx wrangler deploy
```

`wrangler.jsonc` serves `./dist` with single-page-app fallback, so deep links like `/members` work.

## Customise

- Club name, chapter and colours: `src/config/brand.ts`
- Sample members, events, applicants, milestones: `src/data/seed.ts`
- Gallery photos: set `src` on items in `src/data/gallery.ts` (generated artwork is used until then)
- "Reset demo data" in the footer restores the seed data.

Stack: Vite, React, TypeScript, Tailwind v4, react-three-fiber / drei, framer-motion, Recharts, zustand.
