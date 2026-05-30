# Screen Data Needs

*A designer → engineering handoff for AI Room Transformer.*

## What this is (and isn't)

This document describes, **for every screen, what the user sees, what the user
does, and what data each screen needs**. It's written from the design /UX side,
based on the [desktop wireframe](wireframe-desktop.html).

- ✅ **This is the design intent** — the "what the UI is hungry for."
- 🔧 **Engineers own the technical contract** — turning each "needs" list below
  into real API routes, JSON shapes, and field types. Where you see
  **`→ For engineers:`**, that's the handoff line: please convert it into the
  actual backend response.

Think of it as the bridge: the designer says *what* each screen needs; the
backend and frontend agree on *how* it's delivered.

> 🎨 Visual reference: open `wireframe-desktop.html` to see every screen.
> Design language and tokens live in `DESIGN_SYSTEM.md`.

---

## ⚠️ The biggest gap to align on first

The current backend (`server.js`) handles **storage only** — Box login, photo
upload, and saving a moodboard PDF. There is **no endpoint yet that actually
generates a result**: takes the room photo + budget + style and returns the
transformed room and the matched products.

That "generate / transform" step is the **core of the product** and the screens
below (4–6) all depend on it. **This is the #1 thing for the team to scope
together.** Everything marked `→ For engineers:` on the Style/Budget, Results,
and Save screens flows out of that one missing endpoint.

---

## The flow

```
1. Landing  →  2. Upload  →  3. Budget + Style  →  4. Generating  →  5. Results  →  6. Save
```

A **session** ties the whole flow together: the user's photos, their choices,
and the generated result all belong to one session. The backend already creates
a `sessionId` on upload — every screen after that should carry it.

---

## 1 · Landing

**What the user sees**
- Headline, subtext, and a sample before/after of a transformed room.
- Social proof stat: *"2,400+ rooms transformed this week."*
- A sample result summary: cohesion score (%), amount spent of budget, number of matched products.

**What the user can do**
- Start the flow ("Transform my room").
- See how it works (secondary).

**Data needed**
- The proof stat and sample numbers can be **static / hardcoded for the demo** —
  they're marketing, not real user data.

> `→ For engineers:` nothing required from the backend to render this screen.
> Optionally, the "rooms transformed this week" count could be a real number later.

---

## 2 · Upload

**What the user sees**
- A drag-and-drop / tap-to-upload zone (accepts JPG, PNG, HEIC, up to ~20MB).
- Thumbnails of each uploaded photo, each with:
  - a "uploaded ✓" confirmation,
  - a remove (✕) control,
  - an **editable space label** (e.g. "Living room", "Corner detail").
- An "Add photo" tile to upload more (up to 10).
- A skip option: *"Moving into an empty space? Start from scratch."*
- A continue button that reflects the count: *"Continue with 2 photos."*

**What the user can do**
- Upload 1–10 photos, label each, remove any, or skip with no photos.

**Data the screen sends**
- The photo files (already supported by `POST /upload`).
- For each photo: its **space label** (user-entered text).
- A flag for **"starting from scratch"** (empty room, no photos).

**Data the screen needs back**
- A `sessionId` to carry through the rest of the flow.
- Per photo: a confirmation it uploaded, and an id so it can be removed/referenced.

> `→ For engineers:` `POST /upload` already returns `sessionId` + uploaded files.
> Two additions from the design: (1) store a **label per photo**, and (2) support
> a **"no photos / empty room"** session so the flow can continue without an upload.

---

## 3 · Budget + Style

This is the screen that collects everything the AI needs. Four inputs, in order:

**A · Budget**
- A slider, roughly **$50 → $1,000+**, single "max budget" value.

**B · Items to add (priority-ordered)**
- A set of preset item chips: Sofa, Coffee table, Rug, Floor lamp, Armchair,
  Shelf, Side table, Wall art, Plant, Curtains, Mirror, Cushions.
- The user taps them **in priority order** — first tap = most important.
- The user can also **type custom items** (e.g. "bedside lamp, TV unit").

**C · Style**
- Pick **up to 3** from: Scandinavian, Wabi-Sabi, Minimalist, Industrial,
  Japandi, Mid-Century, Bohemian, Quiet Luxury, Mediterranean, Maximalism.

**D · Color preference**
- Pick **one mood**: Warm Neutrals, Cool Neutrals, Bold & Saturated, Black & White.
- Optionally pick **any number of specific colors** (Beige, Warm Oak, Sage Green,
  Dusty Pink, Charcoal, Terracotta, Mustard, Forest Green, White, Black).

**What the user can do**
- Set all four, then "Find my style" to generate.

**Data the screen sends** (all tied to the `sessionId`)
- `budget` — a number.
- `items` — an **ordered list** of item names (preset + custom), order = priority.
- `styles` — a list of up to 3 style names.
- `colorMood` — one mood.
- `colors` — an optional list of specific color names.

> `→ For engineers:` this is the input to the **generate/transform** step.
> Please define the endpoint that accepts `{ sessionId, budget, items, styles,
> colorMood, colors }` and kicks off generation. Note **item order carries
> meaning** (priority) — preserve it.

---

## 4 · Generating

**What the user sees**
- A loading state: *"Working on your room… finding real pieces that match your
  style & budget."* (animated, reassuring).

**What the user can do**
- Wait. (Optionally cancel.)

**Data needed**
- A way to know **when the result is ready** (and ideally, progress).

> `→ For engineers:` the frontend needs to know generation status. Either the
> generate call returns the result directly when done, or there's a way to
> poll/await it. Designer doesn't mind which — just needs a "ready / not ready"
> signal so this screen can advance to Results.

---

## 5 · Results

The payoff screen. Two halves: the transformed room on the left, the shopping
plan on the right.

**What the user sees**
- **Transformed room image** with a "Your room, transformed" badge.
- **Cohesion score** (%) — "how well these pieces work together" (with a tooltip explanation).
- **Results summary**: number of products found, and **budget used** ($X of $Y).
- **A list of product cards**, each showing:
  - thumbnail / image,
  - name,
  - **a one-line reason** ("Matches your warm palette & living room scale"),
  - price,
  - a **"View →" buy link**,
  - a **swap** control ("show me another option"),
  - a **favorite (heart)** toggle.
- A special **"already own / $0"** state for items the user keeps (removable from plan).
- A "+N more items" expander.
- A **"Adjust & re-run"** option (go back, change budget/style, regenerate).

**What the user can do**
- Browse the plan, swap any item for an alternative, favorite items, open buy
  links, mark items as "already own," re-run with different inputs, or save.

**Data the screen needs back** (the generate result, per `sessionId`)
- `transformedImageUrl` — the generated room image.
- `cohesionScore` — a number (%).
- `budgetUsed` and `budgetTotal` — numbers.
- `products` — a list, each item with:
  - `name`,
  - `reason` (the one-line "why"),
  - `price`,
  - `buyUrl` (real purchasable link),
  - `image`,
  - `category` (which item slot it fills, e.g. Sofa),
  - and ideally a way to fetch an **alternative** for the "swap" action.

> `→ For engineers:` this is the **output shape** of the generate/transform
> endpoint. Two interactions also need backend thought: **swap** (return another
> product for the same slot) and **favorite** (persist per session). "Already
> own" just removes an item from the plan and frees its budget.

---

## 6 · Save

**What the user sees**
- A **summary card** of the finished plan: style names ("Scandinavian · Japandi
  Living Room"), item count, cohesion %, palette name, and total cost.
- Three ways to save:
  1. **Download as PDF** — room image + full shopping list with prices & links.
  2. **Copy shareable link** — sends the whole plan to someone, buy links live.
  3. **Save before/after image** — side-by-side, made for social sharing.

**What the user can do**
- Export the plan in any of the three formats, or go back to results.

**Data needed**
- The same finished plan from Results (image, products, totals, palette, styles).
- A generated **PDF**, a **shareable URL**, and a **before/after image**.

> `→ For engineers:` `POST /session/:id/moodboard` already uploads a PDF to Box
> and returns a shareable link — good foundation. Still to define: **who
> generates the PDF** and the before/after image (and from what data). The
> three options map to: PDF file, share URL, before/after image.

---

## Quick reference — what each screen needs from the backend

| Screen | Sends → backend | Needs ← backend |
|---|---|---|
| 1 · Landing | — | (static demo numbers) |
| 2 · Upload | photos + labels, "from scratch" flag | `sessionId`, per-photo confirmation |
| 3 · Budget + Style | budget, ordered items, styles, colorMood, colors | (kicks off generation) |
| 4 · Generating | — | "ready / not ready" status |
| 5 · Results | swap / favorite / "own it" actions | image, cohesion, budget used, product list (name, why, price, buyUrl, image, category) |
| 6 · Save | export choice | PDF, share URL, before/after image |

---

*This is a living handoff. If a screen changes, this doc changes with it. If
engineering needs a field the design didn't anticipate, let's talk — better to
add it here than to guess.*
