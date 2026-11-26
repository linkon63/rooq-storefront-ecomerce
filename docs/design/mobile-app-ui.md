# Rooq — mobile app-style UI plan

Status: **Review er jonno draft.** Kono code change hoyni.

## 1. Goal

Phone e Rooq website er moto na, ekta **shopping app** er moto cholbe: niche tab bar,
buro angul diye shob kaj, bottom sheet, full-screen flow, home screen e install.

- Scope: **768px er niche**. Tablet/desktop ja ache tai thakbe.
- Same codebase, same URL, same API. Alada native app na (PWA).
- Same brand: green ink `#1C3934`, magenta `#9B1A41`, Hanken Grotesk + Newsreader.

## 2. Ekhon ki ache, ki somossa

Code pore paowa. Real device e test kora hoyni.

| Ache | Somossa |
| --- | --- |
| Hamburger menu | Main navigation lukano; upore, angul pouchay na |
| Header e search, review, account, bag | Wishlist, compare phone e header e nai, menu er vitore |
| Header icon 40px, product card button 36px | 44px er kom, vul tap hobe |
| Card er upor "Add to bag" + "Buy now" | Size na jiggesh korei prothom in-stock size add hoy |
| Card er naam, dam 12px | Chhoto |
| Panda + scroll-top floating | Content ar niche er button dhekte pare |
| Home e 15+ section | Onek lomba scroll |
| Sort dropdown 14px text | iPhone e tap korle page zoom hoy |
| Safe area handle nai | Niche bar boshale iPhone home indicator e lagbe |
| PWA (manifest, offline page) | Ache, bhalo; app feel er jonno aro lagbe |

Already bhalo, reuse hobe: filter bottom sheet, gallery swipe, sticky "Add to bag" bar,
mini bag drawer.

## 3. App shell

### 3.1 Bottom tab bar

```
┌────────────────────────────────────┐
│  ⌂       ▦        ⊡•     ♡     ☺   │  56px + safe area
│ Home  Categories  Bag  Wishlist Me │
└────────────────────────────────────┘
```

- Active tab: filled icon + ink colour; Bag e count badge.
- Product, checkout, confirmation page e tab bar **thakbe na** (nijer action bar thakbe).
- Tab bodlale ager tab er scroll position thakbe.

### 3.2 Top app bar

Tab root e:

```
┌────────────────────────────────────┐
│ rooq   [⌕ Search shirts…      ]    │
└────────────────────────────────────┘
```

Bhitorer page e:

```
┌────────────────────────────────────┐
│ ←   Linen shirt              ⌕  ⊡  │
└────────────────────────────────────┘
```

- Hamburger uthe jabe. Language, contact, policy, review gallery → **Me** tab e.
- Scroll niche gele bar lukabe, upore korle ferot.
- Footer phone e shudhu Home e (selai animation okhane shesh hoy); onno page er link Me tab e.

### 3.3 Common rules

- Touch target kompokkhe 44×44px; main button 48px, full width.
- Input/select text 16px.
- Niche/upore `env(safe-area-inset-*)`.
- Popup shob bottom sheet, niche tene bondho kora jabe.
- Hover er upor nirvor kono kaj na.
- Loading e skeleton; tap korle sathe sathe press feedback.
- Page transition: halka slide (200–250ms); reduced motion e off.
- Tulo panda: shob page e; angul diye tene soranor system, jaiga mone rakhe, niche bar er
  upore thake. Scroll-top button bad (active tab abar tap korle upore jabe).

## 4. Screen by screen

### 4.1 Home

```
┌────────────────────────────┐
│ rooq  [⌕ Search…        ]  │
├────────────────────────────┤
│ (○)(○)(○)(○)(○) →          │  category circle
│ ┌────────────────────────┐ │
│ │  Hero banner (swipe)   │ │  4:5
│ └──────────── ● ○ ○ ─────┘ │
│ ⏱ Sale ends 02:14:09     > │
│ New in            See all  │
│ [img][img][im →            │
│ Offers            See all  │
│ [img][img][im →            │
│ ┌──── Lookbook ──────────┐ │
│ Best sellers (2 column)    │
│ Recently viewed →          │
├────────────────────────────┤
│        tab bar             │
└────────────────────────────┘
```

Phone e bad ba onno page e: made-by-hand numbers, order journey, product highlights,
contact form, Facebook reviews, coming soon. 15+ theke prai 8 section.

### 4.2 Categories (notun page `/categories`)

```
┌────────┬───────────────────┐
│ Women ▌│ [img]    [img]    │
│ Men    │ Saree    Kurti    │
│ Kids   │ [img]    [img]    │
│ Access.│ Tops     Bags     │
│ Sale   │ View all Women >  │
└────────┴───────────────────┘
```

### 4.3 Search (full screen)

Recent search → popular chip → type korle suggestion (chhobi, naam, dam).
`←` ba phone er back button e bondho.

### 4.4 Product list (shop / new / sale / collection)

```
┌────────────────────────────┐
│ ← Women (128)        ⌕  ⊡  │
│ (All)(Saree)(Kurti)(Top) → │
├─────────────┬──────────────┤
│ [img    ♡]  │ [img    ♡]   │
│ Name        │ Name         │
│ ৳2,450      │ ৳1,900 -20%  │
│ ●●● +2      │ ●●           │
├─────────────┴──────────────┤
│   [ ⇅ Sort ] [ ☰ Filter 2 ]│  sticky
└────────────────────────────┘
```

- Card e shudhu ♡ ar ekta **+** button. **+** tap → size/colour sheet → Add.
- Infinite scroll ("Load more" fallback soho); back korle same jaygay.
- Filter: sheet, bame filter er naam, dane option; niche "Show 42 items".
- Sort: choto sheet.

### 4.5 Product

```
┌────────────────────────────┐
│ ←                    ♡  ↗  │  chhobir upor
│                            │
│    full width gallery      │
│                      1/5   │
├────────────────────────────┤
│ Name                       │
│ ৳2,450  ৳3,000  -18%       │
│ Colour  ● ○ ○              │
│ Size    S [M] L XL   Guide │
│ ⚠ Only 2 left              │
│ 🚚 Delivery & return     > │
│ Details                  > │
│ Reviews ★4.6 (32)        > │
│ Complete the look →        │
├────────────────────────────┤
│ [ Add to bag ] [ Buy now ] │  sob somoy dekhabe
└────────────────────────────┘
```

- Size na bachle button tap → size sheet.
- Share: phone er native share.
- Breadcrumb phone e bad.

### 4.6 Bag (tab)

```
┌────────────────────────────┐
│ Bag (2)                    │
│ ▓▓▓▓░░ ৳550 more = free    │
│ [img] Name        [− 1 +]  │
│       M · Green   ৳2,450   │  swipe → remove / wishlist
├────────────────────────────┤
│ Total ৳4,350  [ Check out ]│
│        tab bar             │
└────────────────────────────┘
```

Mini drawer er bodole add korle toast: "Added to bag — View".

### 4.7 Checkout (full screen, 3 step)

```
 ① Address ─── ② Payment ─── ③ Review
```

| Step | Content |
| --- | --- |
| Address | Saved address card ba form, delivery zone o charge |
| Payment | Payment method, coupon (chalu thakle), note |
| Review | Item, hisab, **Place order** |

Niche sticky bar e total + porer button. Phone number e number keyboard, browser
autofill. Back korle lekha hariye jabe na. Eki URL, step gula `?step=`.

### 4.8 Order confirmation

Boro success tick, order number, "Track order", "Invoice download", "Continue shopping".

### 4.9 Me (account)

```
┌────────────────────────────┐
│ (☺) Name            Edit > │
│ [Orders][Returns][Address] │
│ Details & password       > │
│ Compare                  > │
│ Customer gallery         > │
│ Language          EN | বাং │
│ Help: Call / WhatsApp    > │
│ FAQ, Policies, About     > │
│ Install app              > │
│ Sign out                   │
└────────────────────────────┘
```

- Horizontal tab er bodole list; prottek ta alada screen.
- Order card: status timeline, return button.
- Login na thakle upore "Sign in" card, baki list khola.

## 5. App feel (PWA)

| Feature | Phase |
| --- | --- |
| Full screen standalone, status bar colour (kichu ache) | 1 |
| 2nd visit e "Install Rooq" sheet; iPhone e instruction | 3 |
| Splash screen, app icon check | 3 |
| Offline e age dekha page, bag (service worker cache) | 3 |
| Push notification (order status, back in stock) | Pore; backend lagbe |
| Play Store (TWA wrapper) | Pore, optional |

## 6. Admin panel (mobile)

Admin screen gula ami details e dekhini; eta direction matro.

- Tab bar: Dashboard · Orders · POS · Products · More.
- Table → card list; tap korle detail sheet.
- Form → full screen, niche sticky Save.
- Age: orders, stock, POS. Report o settings pore.

## 7. Kivabe banabo

- Notun component `components/storefront/mobile/` e (tab bar, app bar, sheet).
- Beshirvag CSS responsive; data o service same. Desktop e prabhab porbe na.
- Notun UI library lagbe na (Radix, GSAP, Tailwind ache).
- Phone e bad deya home section render-i na korar chesta (speed er jonno).

| Phase | Kaj | Size |
| --- | --- | --- |
| 1 | Shell: tab bar, app bar, safe area, touch size, floating button | Majhari |
| 2 | Home, categories, list, product, bag, checkout, Me | Boro |
| 3 | Sheet gesture, transition, PWA install/offline | Majhari |
| 4 | Admin mobile | Boro |

Prottek phase er por apni phone e test korben.

## 8. Apnar decision

| # | Proshno | Amar suggestion |
| --- | --- | --- |
| 1 | Tab 5 ta thik ache? | Home, Categories, Bag, Wishlist, Me |
| 2 | Checkout 3 step na ek page? | 3 step |
| 3 | Card theke "Buy now" bad? | Bad; **+** → size sheet |
| 4 | Panda mascot? | Shob page e, soranor system soho (decided) |
| 5 | Home er section komabo? | Hae |
| 6 | Admin o korbo? | Storefront er por |
| 7 | Push notification / Play Store? | Pore |
