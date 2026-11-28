# LGU Connect: Barangay Information System and Municipal System

Centralized LGU platform with two systems (Barangay Information System, Municipal System) and four user levels (Barangay Secretary, Municipal Personnel, Municipal IT Admin, Superadmin).

**Stack:** Next.js 16 (App Router, TypeScript) · PostgreSQL + Prisma 7 · Tailwind CSS v4 · Framer Motion · Claude API (in-app assistant)

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
    motion/            Reveal, StaggerList/Item, Tilt, AnimatedHeadline, ScrollProgress, DrawPath, MotionProvider
    shared/            ButtonLink, TricolorRule, ThemeToggle, ThemeScript
    assistant/         AssistantWidget (AI chat in the signed-in areas)
    layout/            Header, MobileNav, Footer
    landing/           Hero, About, Features, Gallery, HowItWorks, Security, Contact
    ui/                shadcn / Vengeance UI components
  data/                landing-content.ts, navigation.ts, help-content.ts, assistant-starters.ts
  server/assistant/    knowledge base, tools, and system prompt for the AI assistant
  types/               landing.ts
  lib/                 brand.ts, routes.ts, styles.ts
```

## Conventions

- Brand name, subtitle, and tagline: `lib/brand.ts`. Navigation links: `data/navigation.ts`. Page text: `data/landing-content.ts`. URLs: `lib/routes.ts`.
- Animations live in `components/motion/` and respect the visitor's reduced-motion setting.
- New icon: one file in `components/icons/`, exported from `index.ts`.
- Import through folder barrels, e.g. `import { Hero } from "@/components/landing"`.

## Landing page

All text is in `data/landing-content.ts`. The "Explore the Platform" carousel shows real screenshots from `public/screenshots/` (taken from the sample data; replace them with your own when you have real data). Contact details appear on the Contact section only when filled in under `contact.details`.

## Light and dark mode

The theme is a `dark` class on `<html>`, set before the page paints by `components/shared/ThemeScript.tsx` and changed with `ThemeToggle`. Only CSS tokens change (`app/portal.css`, `.dark { ... }`). Blue fills that carry white text use `bg-brand-fill`; the large blue bands use `flag-blue`; certificates and printing stay light.

## Installable app (PWA)

Staff can install LGU Connect on phones and computers; it then opens in its own window from a home-screen or desktop icon.

- `app/manifest.ts` is the web app manifest. The app starts at `/app` (`app/app/route.ts`), which sends signed-in users to their workspace and everyone else to `/login`.
- Icons are in `public/pwa/`. After changing `public/brand/lgu-icon.svg`, run `node scripts/generate-pwa-icons.mjs`.
- `public/sw.js` is the service worker, registered in production by `components/shared/PwaSetup.tsx`. For privacy (RA 10173) it never stores pages or API responses, only the offline page, the icons, and hashed `/_next/static/` build files. Without internet, a page load shows `public/offline.html`, which reloads when the connection returns. Bump `VERSION` in `sw.js` when it or `offline.html` changes.
- "Install app" appears in the account menu and the landing page's phone menu when the browser can install (`lib/pwa.ts` keeps the `beforeinstallprompt` event). On iPhone and iPad, it shows the Share → Add to Home Screen steps (`IosInstallDialog`). On desktop Chrome and Edge, the address bar's install icon also works.

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

## AI assistant

A chat widget ("Ask AI") in all four signed-in areas. It answers how-to and navigation questions and questions about the user's figures. Before answering it retrieves from:

- `search_help`: the knowledge base in `server/assistant/knowledge.ts` (page descriptions, task guides, FAQs; the secretary guides are shared with the Help page through `data/help-content.ts`).
- `get_statistics`: aggregate figures from the same report builders as the Reports pages, limited to the user's barangay, municipality, or (superadmin) the whole system.
- `get_work_status`: what needs attention (pending requests, KP deadlines, reports due, review queue, account health).

Privacy (RA 10173): the tools return totals, statuses, and names of barangays, offices, and reports only, never a resident's name or record, and never VAWC cases. Conversations are not stored on the server; the browser keeps the current one for the tab only.

Setup: add one of these to `.env.local` and to Vercel (Production):

```bash
# Google AI Studio (Gemini) — currently used
ASSISTANT_PROVIDER="gemini"
GEMINI_API_KEY="..."
GEMINI_MODEL="gemini-3-flash-preview"            # optional; this is the default
GEMINI_FALLBACK_MODELS="gemini-3.1-flash-lite,gemini-flash-lite-latest"  # optional; tried when a model is busy, unavailable, out of quota, or silent for 25 s

# Anthropic directly (key from console.anthropic.com)
ANTHROPIC_API_KEY="sk-ant-..."

# or an Anthropic-compatible gateway, e.g. OpenCode (pay-as-you-go credits)
ANTHROPIC_BASE_URL="https://opencode.ai/inference/anthropic"
ANTHROPIC_AUTH_TOKEN="oc_sk_..."

# optional: another Claude model, e.g. claude-haiku-5-5 (cheaper) — default claude-opus-5-5
ASSISTANT_MODEL="claude-opus-5-5"
```

Through a gateway, questions and the figures the tools return pass through the gateway before reaching the model, and the Anthropic-only refusal fallback is not sent.

Without a key the widget shows "The assistant is not set up yet". Set a monthly spend limit (Anthropic Console, or a budget in the OpenCode console): the per-user limit in `app/api/assistant/route.ts` (20 questions per 10 minutes) is kept in memory per server instance and is not a hard cap on Vercel. Provider code: `server/assistant/gemini.ts` and `server/assistant/claude.ts` (the tools in `tools.ts` are shared). With Claude the default model is `claude-opus-5-5` at low effort.

Google AI Studio's free tier has low per-minute limits and Google may use free-tier prompts to improve its products; for real resident data, enable billing on the Google Cloud project behind the key (paid-tier prompts are not used that way).

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
