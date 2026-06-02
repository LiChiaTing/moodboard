# Warm Studio — Design System

*The design language of AI Room Transformer.*

A shared reference for everyone building this product. It captures the visual
language, the design tokens, and the rules for using them so the UI stays
consistent no matter who is building a screen.

**Why "Warm Studio"?** The product is a studio for reimagining your space — but
it should feel like a warm, encouraging friend, not a cold technical tool. The
name keeps us honest: warm first, studio-smart second.

> **TL;DR for engineers:** copy the `:root` token block in
> [Design Tokens (copy-paste)](#design-tokens-copy-paste) into your global CSS,
> then use the `var(--token)` names everywhere. Never hard-code a hex value.

> **TL;DR for designers:** warm cream canvas, bold black DM Sans type, soft
> rounded shapes, and a friendly 6-color accent palette dropped in as organic
> "blobs." Keep it playful but uncluttered.

---

## 1. Design Personality

The product helps real people reimagine their room. The interface should feel
**warm, encouraging, and approachable** — never cold, clinical, or "techy."

| Principle | What it means in practice |
|---|---|
| **Warm, not white** | Backgrounds are cream (`--bg`), never pure white. White is reserved for content panels that need to pop. |
| **Bold but friendly** | Headlines are heavy (weight 900) and confident, but the rounded shapes and soft colors keep it inviting. |
| **Playful color, calm base** | The base is neutral cream + near-black. Color arrives in small, joyful doses — accent blobs, tags, buttons, badges. |
| **Soft everywhere** | Rounded corners and pill shapes throughout. Nothing has a hard 90° corner unless it's intentional (e.g. wall art). |
| **One clear action** | Each screen has a single obvious next step (a dark pill button). Don't compete for attention. |

---

## 2. Color

### Accent palette
Six accent colors. Use them for energy and personality — backgrounds blobs,
tags, illustration, state. **Don't** use them for body text.

| Token | Hex | Name | Primary use |
|---|---|---|---|
| `--coral` | `#F4724A` | Coral | **Primary accent.** Eyebrows, the logo dot, primary illustration furniture, budget bar fill. |
| `--pink` | `#F2A0BC` | Pink | Secondary accent blobs, soft highlights. |
| `--green` | `#4CAF72` | Green | **Success / done state.** Completed steps, "Transformed" badge, positive notes. |
| `--blue` | `#5BA4CF` | Blue | Cool accent blobs, info accents. |
| `--yellow` | `#F5D030` | Yellow | Highlight / "in-progress" / value emphasis (totals, slider fill, active loading step). |
| `--lav` | `#C5AEED` | Lavender | Soft accent blobs, rugs, count badges. |

### Neutrals (the real workhorses)
| Token | Hex | Name | Use |
|---|---|---|---|
| `--bg` | `#F4F1EC` | Canvas | Default page background. The signature cream. |
| `--warm` | `#E6DFD3` | Warm sand | Inactive chips, dividers, icon backgrounds, empty tracks. |
| `--dark` | `#1C1C1C` | Ink | Headlines, body emphasis, primary buttons, dark cards. |
| `--mid` | `#7A7060` | Mid | Body copy, descriptions, secondary text. |
| `--light` | `#B0A898` | Light | Hints, captions, placeholder text, disabled states. |

### Color rules
- ✅ Body text is only ever `--dark`, `--mid`, or `--light`.
- ✅ White (`#fff`) appears as **content panels** (results product list) and as text **on** dark/accent fills.
- ✅ Accent colors carry mood and state, not text.
- ❌ Don't introduce new hex values. If you need a new color, propose adding it as a token first.
- ❌ Don't put two strong accents next to each other competing — pick one hero accent per screen.

---

## 3. Typography

**Typeface:** [DM Sans](https://fonts.google.com/specimen/DM+Sans) (Google Fonts).
Fallback stack: `'DM Sans', -apple-system, sans-serif`.

```html
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,400;0,9..40,500;0,9..40,700;0,9..40,900;1,9..40,400&display=swap" rel="stylesheet">
```

### Weights
| Weight | Name | Use |
|---|---|---|
| 400 | Regular | Body copy, descriptions |
| 500 | Medium | Subtle emphasis, range labels |
| 700 | Bold | Labels, buttons, tags, sub-headlines |
| 900 | Black | Headlines, big numbers, hero type |

### Type scale
Headlines are **black (900)**, tight tracking, line-height ~1.0–1.05.
Everything else stays comfortable (line-height 1.4–1.7).

| Role | Size | Weight | Tracking | Line-height |
|---|---|---|---|---|
| Hero headline | 64px | 900 | -1.5px | 1.0 |
| Page headline (L) | 48px | 900 | -1px | 1.05 |
| Page headline (M) | 42px | 900 | -1px | 1.04 |
| Loading / focus headline | 40px | 900 | -1px | 1.1 |
| Big number (budget) | 54px | 900 | -2px | 1.0 |
| Panel headline | 22px | 900 | — | 1.2 |
| Lead paragraph | 17px | 400 | — | 1.7 |
| Body | 15–16px | 400 | — | 1.6–1.7 |
| Label / button | 13–15px | 700 | — | 1.4 |
| Small label | 12–13px | 700 | — | 1.5 |
| Caption / hint | 11–12px | 600–700 | — | 1.5 |
| Eyebrow / overline | 11px | 700 | +0.1–0.12em, UPPERCASE | 1.0 |

**Eyebrow pattern** (the little label above a headline): 11px, 700, uppercase,
wide letter-spacing, usually `--coral`, often preceded by a short 24px line.

---

## 4. Spacing & Layout

- **Spacing rhythm:** multiples of 4 — `4, 8, 12, 16, 20, 24, 28, 32, 36, 44, 60, 80`.
- **Screen padding (desktop):** roughly `80–100px` horizontal, `80–100px` top.
- **Card padding:** `20–36px` depending on density.
- **Gaps between cards / columns:** `12px` (tight grids) up to `60px` (major columns).
- **Layout model:** two-column grids are the backbone (text + visual, or controls + preview). Center single-focus screens (loading).

---

## 4b. Mobile & Responsive

The desktop values above are the "full" expression of the system. On smaller
screens we **scale down generously and stack everything into one column** — the
warmth stays, the density relaxes.

### Breakpoints
| Name | Width | Layout |
|---|---|---|
| Mobile | `≤ 600px` | Single column. Full-bleed sections. |
| Tablet | `601–1024px` | One or two columns depending on content. |
| Desktop | `≥ 1025px` | Full two-column layouts, max content width ~1080–1200px. |

### Screen padding
| | Desktop | Mobile |
|---|---|---|
| Horizontal | 80–100px | **20–24px** |
| Top (below any fixed bar) | 80–100px | **24–32px** |
| Between major sections | 60px | **32–40px** |

### Mobile type scale
Headlines shrink the most; body text barely changes (readability floor). Keep
the heavy 900 weight and tight tracking — just smaller.

| Role | Desktop | **Mobile** |
|---|---|---|
| Hero headline | 64px | **38px** |
| Page headline (L) | 48px | **32px** |
| Page headline (M) | 42px | **28px** |
| Big number (budget) | 54px | **40px** |
| Panel headline | 22px | **20px** |
| Lead paragraph | 17px | **16px** |
| Body | 15–16px | **15px** (never below 14px) |
| Label / button | 14px | **14px** |
| Caption / eyebrow | 11px | **11px** |

### Layout rules on mobile
- **One column.** Two-column desktop grids (text + visual, controls + preview) stack vertically — visual/preview usually goes **on top**, controls below.
- **Cards go full-width** with `16–20px` inner padding (down from 28–36px).
- **Buttons go full-width** (`width: 100%`) and the primary action often becomes a **sticky bottom bar** so it's always reachable with a thumb.
- **Style/color tiles** drop from a 3-up grid to **2-up** (or a horizontal scroll row).
- **Blobs:** fewer and smaller (1–2 per screen, scaled to ~50–60%). They should never push content or cause horizontal scroll — keep them clipped (`overflow: hidden` on the section).

### Touch targets
- **Minimum tappable size: 44 × 44px** (Apple/Material standard). Small visual elements (a 24px dot) still need a 44px tap area — pad the hit zone, don't shrink the finger target.
- **Spacing between tappable items: ≥ 8px** so thumbs don't mis-tap.
- Hover states (`:hover` lifts, dims) are decorative on touch — make sure the **resting and active/pressed states alone** communicate everything. Add an `:active` press feedback (e.g. slight scale-down 0.97) since there's no hover.

### Responsive CSS pattern
```css
/* Mobile-first base, then enhance up. Or cap down with a max-width query: */
@media (max-width: 600px) {
  .screen      { padding: 28px 20px; }
  .hero h1     { font-size: 38px; letter-spacing: -1px; }
  .layout-2col { grid-template-columns: 1fr; gap: 28px; }
  .btn-dark    { width: 100%; justify-content: center; }
  .tiles       { grid-template-columns: 1fr 1fr; }   /* 3-up → 2-up */
}
```

---

## 5. Shape & Radius

Rounded is the brand. Match the radius to the element's size.

| Token-ish | Radius | Use |
|---|---|---|
| Pill | `100px` | Buttons, tags, badges, chips, sliders |
| Card (L) | `28px` | Hero image, dark feature cards, preview cards |
| Card (M) | `24px` | Upload zone, tip cards, style tiles |
| Card (S) | `20px` | List options, loading step cards |
| Inner | `12–16px` | Icon wells, thumbnails, small inputs |
| **Blob** | `55% 45% 60% 40%` (organic) | Decorative background shapes only |

**Blobs** are the signature decorative element: large, soft, low-opacity
(0.1–0.85) circles/organic shapes floating behind content, `pointer-events:none`,
positioned partly off-screen. They add warmth without adding UI. Use 2–4 per
screen, never in the content's way.

---

## 6. Elevation (Shadows)

Soft, warm, and low. Shadows lift interactive things off the cream — they're never harsh.

| Use | Shadow |
|---|---|
| Resting card | `0 4px 14px rgba(28,28,28,0.06)` |
| Hover lift (button) | `0 8px 24px rgba(28,28,28,0.25)` |
| Selected / focused tile | `0 16px 40px rgba(28,28,28,0.22)` |
| Hero / feature image | `0 24px 64px rgba(0,0,0,0.14)` |
| Small floating element | `0 2px 8px rgba(0,0,0,0.2)` |

**Glass / blur:** overlay bars and chips use a translucent fill +
`backdrop-filter: blur(8–12px)` for the frosted look (e.g. the progress bar,
screen chips, badges over photos).

---

## 7. Core Components

### Buttons
- **Primary** — `.btn-dark`: dark (`--dark`) pill, white text, 700, `16px 32px`.
  Hover lifts 2px with a soft shadow. **One per screen.**
- **Secondary** — `.btn-outline`: transparent pill with a 2px `--dark` border, dark text.

### Pills / Tags
Rounded `100px` chips. Two states:
- **Default:** `--warm` or translucent white fill, `--mid` text, light border.
- **Selected:** `--dark` fill, white text.

### Cards
White or translucent-white (`rgba(255,255,255,0.7)` + blur) panels, `20–28px`
radius, soft resting shadow. **Dark cards** (`--dark`) are for emphasis moments
(budget input, export preview) with white/yellow text inside.

### Badges
Small pill labels. Status uses color: `--green` = done/transformed,
`--yellow` = value/highlight, dark translucent = info over photos.

### Step / progress indicators
- A row of dots: inactive = `--warm`, active = `--dark` stretched into a 22–24px bar.
- Numbered step pills: upcoming = warm/light, active = dark, done = green.

### Selection feedback
When the user picks something, **scale it up slightly (1.03–1.07) and lift the
shadow**, and **dim the unselected siblings to ~0.55 opacity**. This makes
choices feel tactile and obvious.

---

## 8. Motion

Keep it smooth and a little springy — playful, never frantic.

| Use | Timing |
|---|---|
| Slide / page transition | `0.55s cubic-bezier(0.77, 0, 0.175, 1)` (smooth ease) |
| Selection pop | `0.22s cubic-bezier(0.34, 1.56, 0.64, 1)` (slight overshoot) |
| Hover / state | `0.15s–0.25s` ease |
| Loading life | bouncing color blocks + spinning gradient orb + shimmer sweep |

**Principle:** motion confirms an action or shows the system is working. Decorative
motion (loading orb, bouncing blocks) is reserved for waiting moments where it
reassures rather than distracts.

---

## 9. Do / Don't

| ✅ Do | ❌ Don't |
|---|---|
| Use cream (`--bg`) as the default canvas | Default to pure white pages |
| Reach for tokens (`var(--coral)`) | Hard-code hex values inline |
| Keep one hero action per screen | Stack multiple dark buttons competing |
| Let blobs add warmth behind content | Let blobs overlap or obscure text/controls |
| Pair a heavy 900 headline with calm body text | Make everything bold |
| Use green for success, yellow for value | Use accent colors for body text |
| Round everything to match its size | Mix sharp corners into the soft system |

---

## Design Tokens (copy-paste)

Drop this into your global stylesheet and reference the variables everywhere.

```css
:root {
  /* Accent palette */
  --coral:  #F4724A;  /* primary accent */
  --pink:   #F2A0BC;
  --green:  #4CAF72;  /* success / done */
  --blue:   #5BA4CF;
  --yellow: #F5D030;  /* highlight / value */
  --lav:    #C5AEED;

  /* Neutrals */
  --bg:     #F4F1EC;  /* cream canvas */
  --warm:   #E6DFD3;  /* sand: chips, dividers, wells */
  --dark:   #1C1C1C;  /* ink: text + primary buttons */
  --mid:    #7A7060;  /* body copy */
  --light:  #B0A898;  /* hints / captions */
}

/* Type */
body {
  font-family: 'DM Sans', -apple-system, sans-serif;
  color: var(--dark);
  background: var(--bg);
}

/* Primary button */
.btn-dark {
  display: inline-flex; align-items: center; gap: 8px;
  background: var(--dark); color: #fff;
  border: none; border-radius: 100px;
  padding: 16px 32px; font-size: 15px; font-weight: 700;
  cursor: pointer; transition: transform .15s, box-shadow .15s;
}
.btn-dark:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(28,28,28,.25); }

/* Secondary button */
.btn-outline {
  display: inline-flex; align-items: center; gap: 8px;
  background: transparent; color: var(--dark);
  border: 2px solid var(--dark); border-radius: 100px;
  padding: 14px 28px; font-size: 14px; font-weight: 700; cursor: pointer;
}

/* Pill / tag */
.pill {
  display: inline-block; padding: 9px 20px; border-radius: 100px;
  font-size: 13px; font-weight: 700;
  border: 1.5px solid var(--warm);
  background: rgba(255,255,255,.7); color: var(--mid);
}
.pill.selected { background: var(--dark); color: #fff; border-color: var(--dark); }
```

---

*This system is the source of truth. If something on a screen doesn't fit these
rules, that's a conversation to have — update the system, don't quietly break it.*
