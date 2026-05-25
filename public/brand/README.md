# Tatawur · AI — Brand Asset Pack

**v1.0 · Final · Q1 2026**

This is the working asset pack for the Tatawur · AI brand identity. Pull what you need; do not re-derive from these (re-derivation drifts colors and weights). If you need a variant that isn't here, request it; do not regenerate.

---

## Color tokens (locked)

| Name  | Hex       | RGB            | CMYK         |
|-------|-----------|----------------|--------------|
| Ink   | `#0F1620` | 15 · 22 · 32   | 88·78·65·88  |
| Ivory | `#F4EFE6` | 244·239·230    | 4·5·11·0     |
| Ochre | `#C99459` | 201·148·89     | 24·45·70·4   |

Ink and Ivory carry the work. Ochre lands on ≤3 moments per surface. No substitutions.

---

## Marks (SVG)

The mark is the {8/3} octagram truss. Use the SVG variants — they scale infinitely and stay sharp.

- `tatawur-mark.svg` — primary mark · ink color, transparent background. Use on ivory or any light surface.
- `tatawur-mark-ivory.svg` — ivory mark, transparent. Use on ink/dark surfaces.
- `tatawur-mark-ink-on-ivory.svg` — ink mark on ivory background (composited).
- `tatawur-mark-ivory-on-ink.svg` — ivory mark on ink background (composited).
- `tatawur-mark-animated.svg` — load-wave animation embedded (SMIL). Works in browsers, presentation software with SVG support. Use for hero contexts and live "AI thinking" states.
- `tatawur-mark-animated-on-ink.svg` — same, ivory mark on ink background.

The mark uses `currentColor` for stroke and fill, so the transparent variants can be recolored by setting `color: …` on the parent element. Do not change individual stroke colors. Do not introduce new colors.

---

## Wordmark (SVG)

- `tatawur-wordmark.svg` — type only, ink, transparent. `.ai` carries the ochre accent.
- `tatawur-wordmark-ivory.svg` — ivory variant for dark surfaces.

---

## Lockups (SVG)

- `tatawur-lockup-horizontal.svg` / `-ivory.svg` — mark + wordmark side by side. **Primary lockup.** Use everywhere a single-line presentation works.
- `tatawur-lockup-vertical.svg` / `-ivory.svg` — mark above wordmark. Use only when horizontal won't fit.

Clearspace: one mark-radius (R) on every side. No copy, no edge, no other element enters that zone.

---

## Pratt rule (SVG)

- `tatawur-pratt-rule.svg` / `-ivory.svg` — the linear truss page chrome. **Use this as the page divider on every brand document.** Stretches to any width; it's a 1280×36 vector that scales horizontally.

The rolled mark and the stretched rule come from the same trusswork. Use them together.

---

## Favicons (SVG + PNG)

- `favicon.svg` — primary, scales to any size.
- `favicon-16.png` / `favicon-32.png` / `favicon-64.png` / `favicon-192.png` / `favicon-512.png` — raster fallbacks. Use `favicon-192.png` and `favicon-512.png` in your web app manifest.

In HTML:
```html
<link rel="icon" type="image/svg+xml" href="/favicon.svg">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png">
<link rel="apple-touch-icon" sizes="192x192" href="/favicon-192.png">
```

---

## App icon

- `tatawur-app-icon-1024.png` — 1024×1024 iOS-style tile, ivory mark on ink with rounded corners (radius matches Apple's tile geometry).

Use as the master source for iOS App Store, Play Store, web app manifest, and any other tiled-icon context. Down-sample for smaller sizes; do not regenerate.

---

## Social card

- `tatawur-og-1200x630.png` — 1200×630 Open Graph / Twitter / LinkedIn card. Mark + wordmark + tagline on ink background.

Use in:
```html
<meta property="og:image" content="…/tatawur-og-1200x630.png">
<meta name="twitter:image" content="…/tatawur-og-1200x630.png">
```

---

## Typography (not bundled)

- **Display / Heading / Body:** Helvetica Neue (system) with Inter as web fallback.
- **Mono:** Roboto Mono (Google Fonts).

Web embed:
```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Roboto+Mono:wght@400;500&display=swap" rel="stylesheet">
```

CSS stacks:
```css
--font-sans: "Helvetica Neue", Inter, -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
--font-mono: "Roboto Mono", "Courier New", monospace;
```

---

## Don't

- Don't stretch the mark (scale uniformly only).
- Don't recolor in non-system colors.
- Don't fill the chord struts as a solid polygon — the mark is linework.
- Don't rotate. The major axis points up.
- Don't crop or clip.
- Don't apply drop-shadow, glow, bevel, or 3D effects. The mark is flat.

---

## Contact

For variants, expanded applications, or questions about correct usage: **design@tatawur.ai**

Issued Q1 2026 · v1.0 · Final · Confidential
