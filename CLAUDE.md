# Tatawur AI Marketing Site

## Brand Direction: "Industrial Precision"

A structural engineering consultancy that treats software as a load-bearing element.

## Tech Stack

- Next.js 14 with TypeScript
- SCSS Modules (`.module.scss`) co-located with components
- Framer Motion for all animations
- Lucide React for icons (`strokeWidth={1.5}`)
- Bun as package manager (`bun install`, `bun run dev`)

## Project Structure

- `src/app/` — Next.js pages and layout
- `src/components/` — React components with co-located `.module.scss` files
- `src/styles/` — Global styles, SCSS variables (`_variables.scss`), mixins (`_mixins.scss`)
- `src/lib/` — Utility functions
- `public/brand/` — SVG assets (logo, marks, Pratt truss rule)
- `public/` — Images (`tarek-profile.jpeg`), SVGs (`tatawur-pratt-rule-ivory.svg`)

## Typography

- `Fraunces` — all headlines (h1–h3), large display numbers (optical serif, loaded via Next.js font, variable: `--font-fraunces`)
- `Syne` — body copy, labels, nav, buttons (variable: `--font-syne`)
- `JetBrains Mono` — tags, code accents (variable: `--font-mono`)
- SCSS vars: `$font-display`, `$font-body`, `$font-mono`

## Color System

All colors are CSS custom properties on `:root` in `globals.scss` and referenced via `var(--*)` in component SCSS. Never hardcode hex.

| Token | Value | Use |
|---|---|---|
| `--bg` | #0B0E0F | Default background |
| `--surface` | #0F1315 | Alternate section background |
| `--card` | #141A1C | Card surfaces |
| `--border` | #1C2426 | Borders |
| `--primary` | #008F7A | Emerald — primary actions, emphasis |
| `--gold` | #B8935A | Bronze gold — numbers, secondary accent |
| `--text` | #E8ECED | Primary text |
| `--text-muted` | #667880 | Secondary text |
| `--text-dim` | #2E3D42 | Decorative numbers |

SCSS vars `$primary` and `$gold` exist for SCSS expressions (`rgba()`, `mix()`, etc.).

## Layout Rules

- Container: max-width 1280px, 24px padding mobile / 48px desktop
- Sections: 120px padding desktop, 80px mobile
- Sharp corners only — `$radius` = 4px everywhere (no pill/round shapes)
- Sections alternate `--bg` / `--surface` backgrounds for rhythm
- Pratt truss SVG (`/tatawur-pratt-rule-ivory.svg`) as decorative horizontal divider

## Component Conventions

Each component SCSS module starts with:
```scss
@use '../styles/variables' as *;
@use '../styles/mixins' as *;
```

- Badges: `@include section-badge` mixin
- Buttons: `@include button-primary` or `@include button-ghost`
- Scroll-triggered animation: `useInView({ once: true, margin: '-80px' })`
- Stagger pattern: `{ duration: 0.55, delay: base + index * 0.08 }`
- No looping/perpetual animations

## Page Sections (in order)

1. Navigation — transparent → blur-on-scroll, full-screen mobile overlay
2. Hero — staggered line reveal, proof row at bottom
3. Problem — `--surface` bg, two-column text + pain points
4. Services — numbered list layout (NOT card grid), `--bg`
5. SelectedWork — editorial numbered list, `--surface`
6. Methodology — 4-column stage cards, Pratt truss SVG above, `--bg`
7. About — asymmetric 2-col, expertise tag row, `--surface`
8. Contact — large email display element, `--bg`
9. Footer — Pratt truss rule top divider, `--surface`

## Section IDs

`#home`, `#problem`, `#services`, `#work`, `#methodology`, `#about`, `#contact`
