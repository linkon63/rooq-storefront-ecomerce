# Rooq launch promo — 8 s motion video

Apple-launch style: dark ground, one idea per shot, big type, hard cuts on the beat,
slow camera push on real product. Theme stays handloom (thread, tant border, loom),
not generic tech glow.

- **Length**: 8 s @ 30 fps (240 frames)
- **Formats**: 1080×1920 (Reels/Story — main), 1920×1080 (web hero/YouTube)
- **Build**: Remotion (React → MP4), assets from `data/promo-video/assets.json`
- **Sound**: one 100–120 BPM track; cuts land on beats (≈0.5 s grid)

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
| 0.0–1.0 | Ink-green black. One gold thread draws left → right across centre. | Line stroke, soft glow |
| 1.0–2.0 | **"Woven."** in huge Newsreader, cream. | Letters rise + blur-in, thread stays under |
| 2.0–3.5 | Macro crop of a tant border (Hoimonti 01, Shubhrota 01) — slow push-in. | Scale 1.15 → 1.0, maroon triangle border slides from top |
| 3.5–5.0 | 3 sarees, 0.5 s each, hard cuts on beat: Roktojoba → Hawai Mithai → Ranga Padma. Name + ৳ price bottom-left. | Ken Burns, colour flash between cuts |
| 5.0–6.5 | iPhone frame rises from below with `mobile-home` → scrolls to `mobile-product`; "Add to bag" taps, bag badge pops. (Landscape: MacBook frame with `desktop-home`.) | Device float + 3D tilt 8° → 0° |
| 6.5–7.3 | **"Worn with pride."** | Same type move as shot 2 |
| 7.3–8.0 | ROOQ wordmark: top & bottom maroon triangle rows close in, wordmark fades up. URL + "Handloom tant · Free delivery over ৳5,000". | Border rows slide in, hold last 0.4 s |

Line copy is taken from the live home hero ("Woven by hand. Worn with pride.").

## Assets

Ready (in repo):

- Screenshots — `data/promo-video/screenshots/` (desktop 1920×1080, mobile 390×844 @3x;
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
