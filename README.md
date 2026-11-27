# LGU Connect: Barangay Information System and Municipal System

Centralized LGU platform with two systems (Barangay Information System, Municipal System) and four user levels (Barangay Secretary, Municipal Personnel, Municipal IT Admin, Superadmin).

**Stack:** Next.js 16 (App Router, TypeScript) · PostgreSQL + Prisma 7 · Tailwind CSS v4 · Framer Motion

## Setup

```bash
npx create-next-app@latest barangay-portal --ts --tailwind --eslint --app --src-dir --import-alias "@/*"
cd barangay-portal
npx shadcn@latest init
npm install framer-motion
# optional: add a Vengeance UI component (documented example)
npx shadcn@latest add https://www.vengenceui.com/r/animated-rays.json
```

Copy this `src/` folder in (keep shadcn's `components/ui` and `lib/utils.ts`), then add below the other imports in `src/app/globals.css`:

```css
@import "./portal.css";
```

`npm run dev` to run, `npm run build` to check a production build.

## Structure

```
src/
  app/                 layout.tsx, page.tsx, portal.css (tokens, motion CSS)
  components/
    logo/              Logo, Brand (logo + name lockup)
    icons/             one file per icon
    motion/            Reveal, StaggerList/Item, CountUp, DrawArrow, DrawPath, RotatingWord, MotionProvider
    shared/            ButtonLink, TricolorRule
    layout/            Header, MobileNav, Footer
    landing/           Hero, SystemsOverview, UserLevels, Workflow, DataPrivacy, CallToAction
    ui/                shadcn / Vengeance UI components
  data/                landing-content.ts, navigation.ts
  types/               landing.ts
  lib/                 brand.ts, routes.ts, styles.ts
```

## Conventions

- Brand name, subtitle, and tagline: `lib/brand.ts`. Navigation links: `data/navigation.ts`. Page text: `data/landing-content.ts`. URLs: `lib/routes.ts`.
- Animations live in `components/motion/` and respect the visitor's reduced-motion setting.
- New icon: one file in `components/icons/`, exported from `index.ts`.
- Import through folder barrels, e.g. `import { Hero } from "@/components/landing"`.

## Hero animated map (ReactDrops "Liquid Glass Logo")

```bash
npx shadcn@latest add https://reactdrops.dev/r/liquid-glass-logo.json
```

This installs four files into `src/components/` (`liquid-glass-logo.tsx`, `-renderer.ts`, `-shaders.ts`, `.css`). They are not bundled in this repo's zip; install them with the command above and keep their license header. The hero uses `components/landing/HeroMap.tsx` with `public/philippines.svg`. The component recolors the map (colors inside the SVG do not matter), and theme, background and map color are set in `HeroMap.tsx`.

## Gallery (ReactDrops "Fan Gallery")

```bash
npx shadcn@latest add https://reactdrops.dev/r/fan-gallery.json
```

Installs `fan-gallery.tsx` and its helpers into `src/components/` (not bundled in this zip; keep their license header). Images live in `public/gallery/` and are listed in `data/gallery-content.ts`. The six SVGs there are illustrative placeholders: replace them with real screenshots (4:5 portrait works best), then set `galleryIsIllustrative` to `false`.

## Login page (`/login`)

Pick a role, then narrow the location before the credentials appear: Barangay Secretary = region, province, city or municipality, barangay; Municipal Personnel = region, province, city or municipality; Superadmin = credentials only. Regions without provinces (NCR) skip the province step.

- Location data comes from the free PSGC API (`psgc.gitlab.io/api`), called only from the server in `lib/geo/psgc.ts` and exposed to the browser through `app/api/geo/route.ts` (inputs validated, cached for a day).
- Official PSA API: set `PSA_PSGC_TOKEN` (and `PSA_PSGC_VERSION`, e.g. `Q2_2024`) in `.env.local`, and `lib/geo/index.ts` switches to `lib/geo/psa.ts` automatically. Remove the token and it falls back to the free API. Verify first with `node --env-file=.env.local scripts/check-psa.mjs`. PSA codes are 10 digits (the free API's are 9), so pick one before storing locations in your database.
- `lib/auth/login.ts` posts to `/api/auth/login`, which verifies the password and that the account belongs to the chosen role and location (the dropdowns are not a security control). The municipal page accepts both Municipal Personnel and the Municipal IT Admin.

### Sign-in URLs

Choosing the last field on `/login` opens a page for that place instead of showing the form there:

- Barangay Secretary: `/province/municipality/barangay`
- Municipal Personnel: `/province/municipality`
- NCR and province-free cities (Davao City, Baguio City, ...) use the region in place of the province, for example `/national-capital-region-ncr/pasig-city/barangay-x`.
- Superadmin has no location and signs in on `/login` itself.

Slugs come from the place names (`lib/slug.ts`) and are turned back into codes on the server (`lib/geo/resolve.ts`, cached for days with `"use cache"`, which needs `cacheComponents` in `next.config.ts`). Unknown slugs show the 404 page. Do not add other two- or three-segment top-level routes: these dynamic routes would shadow them.

## Database (PostgreSQL + Prisma 7)

One schema for all four user levels: `prisma/schema.prisma`. The full plan is in `docs/ROADMAP.md`.

```bash
# .env.local
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/lgu_connect?schema=public"

createdb lgu_connect            # or create it in pgAdmin
npm install                     # also generates the Prisma client (postinstall)
npm run db:migrate              # apply migrations
npm run db:seed                 # sample data (fictional people, real PSGC codes for Pila, Laguna)
npm run dev
```

Other scripts: `npm run db:reset` (drop, migrate, seed), `npm run db:studio` (browse data), `npm run db:backup` (dump to `backups/`, keeps 14), `npm run typecheck`.

Seed accounts (password `Password123`):

| Role | Username | Sign in at |
| --- | --- | --- |
| Barangay Secretary (with VAWC access) | `bagongpook.sec` | `/laguna/pila/bagong-pook` |
| Barangay Secretary | `labuin.sec` | `/laguna/pila/labuin` |
| Municipal Personnel | `pila.mpdo` | `/laguna/pila` |
| Municipal IT Admin | `pila.admin` | `/laguna/pila` |
| Superadmin | `superadmin` | `/login` |

## Signed-in areas

| Role | Area | Menu |
| --- | --- | --- |
| Barangay Secretary | `/dashboard` | `config/navigation.ts` |
| Municipal Personnel | `/municipal` | `config/workspaces.ts` |
| Municipal IT Admin | `/admin` | `config/workspaces.ts` |
| Superadmin | `/superadmin` | `config/workspaces.ts` |

All four share `components/dashboard/shell` (pass the workspace key). Staff pages call `requireRole(...)` from `lib/auth/staff.ts`; secretary pages call `requireSession()`. Settings and notification pages are shared components (`components/settings`, `components/announcements/NotificationsView`).

## Barangay Secretary dashboard (`/dashboard`)

```
src/
  app/api/auth/              login and logout (HTTP-only session cookie, lockout after 5 failures)
  app/api/dashboard/         lookup (resident/household pickers, search) and export/[kind] (CSV)
  app/dashboard/             one folder per menu section; detail pages use [id]
  config/navigation.ts       the whole menu and the route map
  server/                    server-only code
    db.ts, auth.ts, audit.ts   Prisma client, sessions and role permissions, audit log and running numbers
    queries/                 reads, always filtered by the session's barangay code
    actions/                 server actions (validated with zod, re-check the session, write the audit log)
    reports.ts               report generator shared by Reports, Generate, Submissions, and CSV
  components/dashboard/ui/   design system: Card, Table, ListToolbar, Pagination, form, Dialog, RecordPicker…
  lib/labels.ts              display text for database enums
```

- **Scope:** every query and action uses `session.barangay.code` from the database session. Nothing in the URL can change it.
- **Lists** are server-rendered; search, filters, and page live in the URL.
- **Forms** use `ActionForm` + a server action returning `{ ok, message, errors }`; values stay put on errors.
- **Every change** is written to `AuditLog` (Activity pages, change history on each record).
- **VAWC** entries need the `vawc:view` permission and are excluded from every other list, report, and export.
- **Design:** flag blue, gold, and red tokens in `app/portal.css` (`dash-*`), component classes in `@layer components` so Tailwind utilities can override them.
