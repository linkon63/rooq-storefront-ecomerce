# Rooq launch promo — 9 s motion video

Apple-launch style: dark ground, one idea per shot, big type, hard cuts on the beat,
slow camera push on real product. Theme stays handloom (thread, tant border, loom),
not generic tech glow.

- **Length**: 9.1 s @ 30 fps (273 frames)
- **Formats**: 1080×1920 (Reels/Story — built), 1920×1080 (web hero/YouTube — later)
- **Build**: Remotion project in `../promo-video/` (sibling of this app). Scene lengths
  live in `src/timeline.json`; `node scripts/score.mjs` regenerates the synthesized
  score from it, `npm run render` writes `out/rooq-promo-9x16.mp4`, `npm run studio`
  opens the editor.
- **Sound**: synthesized pad + kick on every cut (0.5 s grid), tap click, bag pop,
  end shimmer. Swap `public/sfx/score.wav` for a licensed track any time.

## Look

| Token | Value | Use |
| --- | --- | --- |
| Ink green | `#1c3934` | Background (instead of Apple black) |
| Dye maroon | `#9b1a41` | Triangle border, accent wipe |
| Selvedge cream | `#f0dfc6` | Text on dark |
| Gold | `#a08c6b` | Thread line, thin rules |
| Display | Newsreader (light) | Big words |
| UI/body | Hanken Grotesk | Price, URL, small labels |
| Bangla | Noto Serif Bengali | Optional Bangla line |

Easing: `cubic-bezier(0.22, 1, 0.36, 1)` (site's `--ease-cloth`).

## Storyboard

| Time | Shot | Motion |
| --- | --- | --- |
| 0.0–2.0 | Launch: "Introducing" → **"Handloom, / now online."** → pill "rooqbd.com is live", over a gold thread drawn across. | Thread stroke, letters rise + blur-in, pulsing live dot |
| 2.0–3.5 | Macro of Shubhrota's red tant border, "Pure handloom tant · Straight from the loom." | Fades up from dark, slow push-in, triangle band drops in |
| 3.5–5.0 | Roktojoba → Hawai Mithai → Hoimonti, 0.5 s each with name + ৳ price. | Hard cuts on the beat, Ken Burns, no white flash |
| 5.0–6.9 | Hoimonti shrinks into a phone screen; the real home page scrolls, Ranga Padma slides in, "Add to bag" tap, bag badge + toast. | Shrink-to-device (no cut), page push like real navigation |
| 6.9–7.8 | **"Worn with pride."** | Letters rise, fast exit |
| 7.8–9.1 | Cream end card opens from the centre line; scissors logo, `rooqbd.com`, "Handloom tant · Free delivery over ৳5,000". | Centre wipe (no flash), triangle bands close in |

Rule: no full-frame brightness jumps — every dark ↔ light change is a fade, a wipe or a
shrink.

## Assets

Ready (in repo):

- Screenshots — `../promo-video/assets/screenshots/` (outside git) (desktop 1920×1080, mobile 390×844 @3x;
  home, shop, product, collection, new, sale, cart, plus full-page home/product)
- Logo — `public/images/logo-wordmark.png`, `public/images/logo-kechi-clear(-white).png`,
  `data/logo-variants/rooq-logo-4-kechi.svg`
- Product photos — `data/product-photos/<saree>/01.jpg…`
- Cut-out models (white bg) — `data/hero-slider/white/`, `data/hero-slider/processed/`
- Craft icons (thread spool, needle, woven label) — `data/logo-variants/clothing/`

Needed from you:

1. **Music** — 8–10 s royalty-free track (or say "no music").
2. **Live domain** for the end card.
3. **Transparent PNG** of the wordmark (current one has a white box) — or OK to mask it.
4. Optional: a 2–3 s phone clip of real fabric/loom (raises the "Apple" feel a lot).
5. Confirm: Reels 9:16 first, then 16:9?
