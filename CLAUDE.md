# Tatawur AI Marketing Site

## Brand Guidelines

Read `brand-designer-agent-prompt.md` before making any design or styling changes. It contains the full brand identity, color scheme, typography, and visual design language.

## Tech Stack

- Next.js 14 with TypeScript
- SCSS Modules for component styling
- Framer Motion for animations
- Radix UI for accessible primitives
- Lucide React for icons (strokeWidth 1–1.5)
- Bun as package manager (`bun install`, `bun run dev`)

## Project Structure

- `src/app/` — Next.js pages and layout
- `src/components/` — React components with co-located `.module.scss` files
- `src/styles/` — Global styles, SCSS variables (`_variables.scss`), and mixins (`_mixins.scss`)
- `src/lib/` — Utility functions
- `public/` — Static assets (logo, images)

## Styling Conventions

- Use SCSS Modules (`.module.scss`) co-located with components
- All design tokens (colors, spacing, typography, breakpoints) are defined in `src/styles/_variables.scss` — always use variables, never hardcode values
- Dark-mode-first: `$bg-main` (#0B0E0F) is the default background
- Use `$primary` (emerald #008F7A) and `$secondary` (bronze gold #B8935A) for accent colors
