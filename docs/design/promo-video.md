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

## Storyboard — Format 1: "The Flagship Reveal" (9.1 s, built)

| Time | Shot | Motion |
| --- | --- | --- |
| 0.0–2.0 | Launch: "Introducing" → **"ROOQ Website online Now."** → pill "rooqbd.com is live", over a gold thread drawn across. | Thread stroke, letters rise + blur-in, pulsing live dot |
| 2.0–3.5 | Macro of Shubhrota's red tant border, "Pure handloom tant · Straight from the loom." | Fades up from dark, slow push-in, triangle band drops in |
| 3.5–5.0 | Roktojoba → Hawai Mithai → Hoimonti, 0.5 s each with name + ৳ price. | Hard cuts on the beat, Ken Burns, no white flash |
| 5.0–6.9 | Hoimonti shrinks into a phone screen; the real home page scrolls, Ranga Padma slides in, "Add to bag" tap, bag badge + toast. | Shrink-to-device (no cut), page push like real navigation |
| 6.9–7.8 | **"Worn with pride."** | Letters rise, fast exit |
| 7.8–9.1 | Cream end card opens from the centre line; scissors logo, `rooqbd.com`, "Handloom tant · Free delivery over ৳5,000". | Centre wipe (no flash), triangle bands close in |

Rule: no full-frame brightness jumps — every dark ↔ light change is a fade, a wipe or a
shrink.

## Alternative <10 s Apple-Style Reel Formats

### Format 2: "Don't Blink" Kinetic Typography + UI Speedrun (7.5 s)

Fast stomp-beat teaser focused on storefront speed and tactile mobile UI.

| Time | Visual | On-Screen Copy | Audio Cue |
| --- | --- | --- | --- |
| 0.0–1.5 | Rapid 0.5 s word slams on `#1c3934` dark stage | **"Woven."** → **"Timeless."** → **"Now Digital."** | 3 dry percussion hits |
| 1.5–3.0 | Floating phone wakes up from dark void; lookbook slider glides | **"Browse the loom."** | Low sub-bass swell + swipe whoosh |
| 3.0–4.5 | Pinch-zoom macro into tant weave texture inside product page | **"Feel every thread."** | Subtle cloth rustle + crisp tick |
| 4.5–5.8 | "Add to bag" tap ripple + `Added to bag` pill toast & badge `1` pop | **"Yours in a tap."** | iOS haptic click + glass chime |
| 5.8–7.5 | Centre loom-shed wipe to cream end card + Kechi logo | **`rooqbd.com`** · *Free delivery over ৳5,000* | Scissors snip + warm chord tail |

### Format 3: "Loom to Glass" Match-Cut Teaser (6.0 s)

Ultra-minimal luxury drop reel pairing raw handloom texture with the digital storefront.

| Time | Visual | On-Screen Copy | Audio Cue |
| --- | --- | --- | --- |
| 0.0–2.0 | Directional light sweep across macro tant thread on dark ground | **"Centuries of craft."** | Deep resonant drone + loom shuttle click |
| 2.0–4.0 | Match-cut: fabric rectangle morphs directly into glowing phone glass showing `rooqbd.com` | **"Zero seconds to shop."** | Sub-drop + clean glass lock sound |
| 4.0–6.0 | Kechi scissors cut the gold thread line → logo + live URL hold | **`rooqbd.com — Live Now`** | Crisp scissors snip + shimmer |

## Apple-Style Launch Rules (Under 10 Seconds)

1. **Max 3–4 words per frame**: Use punchy headlines (*"Handloom, now online."*, *"Shop it in a tap."*, *"Worn with pride."*). Never put paragraphs on screen.
2. **Geometry morphs over transitions**: Never use white flashes, spins or stock dissolves. Connect scenes via physical motion (full-bleed saree shrinking into the phone bezel in `src/scenes/phone-scene.tsx` or centre loom-shed wipe in `src/scenes/end-card.tsx`).
3. **Single Hero UI flow**: Do not show the entire website navbar/footer clutter. Zoom into **1 smooth scroll → 1 product slide-in → 1 "Add to bag" tap → 1 toast pop** (`src/components/phone-screen.tsx`).
4. **Frame-accurate sound design**: Every visual cut and UI tap must land on an audio transient (kick on 0.5 s saree cuts, click on button press, chime on cart badge).

## How to Build & Render (`../promo-video/`)

1. **Capture fresh storefront screenshots** (if UI changed):
   - Start `rooq` dev server on port `3000`, then run `node scripts/shoot-home.mjs` inside `../promo-video/` to update `public/shots/mobile-home-full.png`, `mobile-product.png` and `mobile-cart.png`.
2. **Swap featured sarees or prices**:
   - Place `1200×1600` (3:4) JPGs in `../promo-video/public/img/` and update `LOOKS` (`src`, `focus`, `name`, `price`) in `../promo-video/src/looks.ts`.
3. **Adjust scene timings & UI beats**:
   - Edit scene durations (`sec`) and phone interaction timestamps (`phoneBeats`) in `../promo-video/src/timeline.json`.
4. **Update or regenerate audio**:
   - Run `node scripts/score.mjs` inside `../promo-video/` to re-sync `public/sfx/score.wav` to `src/timeline.json`, or replace `public/sfx/score.wav` with a custom 48 kHz WAV track.
5. **Preview & render MP4**:
   - Live preview: `cd ../promo-video && npm run studio`
   - Final 9:16 export (`1080×1920`, H.264 CRF 17): `cd ../promo-video && npm run render` → outputs `../promo-video/out/rooq-promo-9x16.mp4`.

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
