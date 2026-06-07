# Tatawur AI

Marketing website for Tatawur AI LLC — a consulting firm specializing in software and AI automation solutions for the Architecture, Engineering, and Construction (AEC) industry.

The name "Tatawur" (تطور) means "evolution" in Arabic.

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- SCSS Modules
- Framer Motion
- Lucide React

## Quick Start

```bash
bun install
bun run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Build

```bash
bun run build
bun start
```

## Project Structure

```
src/
  app/
    layout.tsx        Root layout with fonts
    page.tsx          Main page

  components/
    Navigation.tsx    Header with mobile menu
    Hero.tsx          Landing section
    Overview.tsx      Value propositions
    Services.tsx      Service offerings
    About.tsx         Founder information
    Contact.tsx       Contact details
    Footer.tsx        Site footer
    Logo.tsx          Brand logo

  styles/
    _variables.scss   Design tokens
    _mixins.scss      Reusable mixins
    globals.scss      Base styles

  lib/
    utils.ts          Utilities
```

## Fonts

- Outfit — headings
- DM Sans — body text
- Aref Ruqaa — Arabic calligraphy

## Colors

| Name      | Hex       |
| --------- | --------- |
| Primary   | `#0a2463` |
| Secondary | `#3bceac` |
| Accent    | `#fb8b24` |

## License

Copyright 2025 Tatawur AI LLC

---

## Developer Setup Guide

### Prerequisites

| Tool | Install |
|---|---|
| [Bun](https://bun.sh) | `curl -fsSL https://bun.sh/install \| bash` |
| [Supabase CLI](https://supabase.com/docs/guides/cli) | `brew install supabase/tap/supabase` |

> **Note:** Docker Desktop is required if you want a local Supabase stack (`supabase start` uses Docker internally), but is not needed to run the Next.js app itself.

---

### Local Development (fast path — no Docker for Next.js)

```bash
supabase start              # boots local Postgres, Auth, and Studio in Docker
                            # copy the printed anon key into .env.local
bun install
bun run dev                 # Next.js dev server at http://localhost:3000
```

Create `.env.local` from `.env.example` and fill in the values printed by `supabase start`:

```bash
cp .env.example .env.local
# then edit .env.local with the URLs and keys from supabase start output
```

---

### Local Supabase Studio

Available at **http://localhost:54323** — inspect data, run SQL, and test RLS policies.

---

### Reset the Database

```bash
supabase db reset           # re-runs all migrations + seed.sql from scratch (wipes all data)
```

---

### Environment Variables

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (local: `http://localhost:54321`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase publishable/anon key |
| `NEXT_PUBLIC_SITE_URL` | Full site URL for OAuth redirects (local: `http://localhost:3000`) |

**Never commit `.env.local` or `.env.prod`.** These are in `.gitignore`.

---

### Supabase CLI Reference

```bash
supabase start      # start local stack
supabase stop       # stop local stack
supabase db reset   # re-run migrations + seed (wipes data)
supabase status     # show running services, URLs, and keys
```

---

### Production Deploy (Vercel)

1. Connect the GitHub repo (`github.com/telafifi/tatawur`) to Vercel.
2. In Vercel → Settings → Environment Variables, add the following for all environments (Production, Preview, Development):

   | Variable | Value |
   |---|---|
   | `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
   | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase publishable key |
   | `NEXT_PUBLIC_SITE_URL` | `https://tatawur.ai` (use your preview URL for Preview env) |

3. In Supabase dashboard → Authentication → URL Configuration → Redirect URLs, add:
   - `https://tatawur.ai/portal/auth/callback`
   - `https://*.vercel.app/portal/auth/callback` (covers all preview deployments)

4. Vercel auto-deploys on every push to `main`. Preview deployments are created for every PR.

5. After first deploy, promote yourself to admin: Supabase dashboard → Authentication → Users → edit your user → set `app_metadata` to `{"role": "admin"}`.
