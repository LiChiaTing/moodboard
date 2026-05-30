// ============================================================
//  Mock data for the demo.
//  This is FAKE data so the whole app is clickable before the
//  AI teammates (P2 vision / P3 products) are finished.
//  When their endpoints are ready, api.js swaps these out — you
//  never have to touch the screens.
// ============================================================

// --- Preloaded demo photos (Dianne's real room shots) ---
// These stand in for "photos the user uploaded" so the demo starts full.
// Files live in /public/demo/ and are served at /demo/roomN.jpg.
// room2 (loft) is first so it's the hero in the Step 4 before/after.
export const DEMO_PHOTOS = [
  { file: null, url: '/demo/room2.jpg', label: '🛋 Living room' },
  { file: null, url: '/demo/room1.jpg', label: '🪑 Corner detail' },
  { file: null, url: '/demo/room3.jpg', label: '🛏 Bedroom' },
];

// --- Step 2: visual style tiles (no style-name jargon, per UX review) ---
export const STYLE_TILES = [
  { id: 'warm-minimal',  name: 'Warm & minimal',  sub: 'Light wood · Linen · Calm',     grad: '#E8DCC8' },
  { id: 'natural-earthy',name: 'Natural & earthy', sub: 'Plants · Rattan · Soft green',   grad: '#A7C4A0' },
  { id: 'dark-moody',    name: 'Dark & moody',     sub: 'Charcoal · Brass · Velvet',     grad: '#3A3A4A' },
  { id: 'clean-white',   name: 'Clean & white',    sub: 'All-white · Bright · Simple',   grad: '#ECEAE3' },
  { id: 'warm-boho',     name: 'Warm & boho',      sub: 'Terracotta · Texture · Layers', grad: '#E2A07A' },
  { id: 'cool-coastal',  name: 'Cool & coastal',   sub: 'Blue-grey · Linen · Airy',      grad: '#9FC1D4' },
];

// --- Step 2: color mood tiles ---
export const COLOR_MOODS = [
  { id: 'warm-neutral', name: 'Warm Neutrals',   sub: 'Beige · Cream · Tan',      grad: '#E8D5B7' },
  { id: 'cool-neutral', name: 'Cool Neutrals',   sub: 'Sage · Slate · Grey',      grad: '#B8D4C8' },
  { id: 'bold',         name: 'Bold & Saturated',sub: 'Terracotta · Rust · Ochre',grad: '#E8895C' },
  { id: 'mono',         name: 'Black & White',   sub: 'Monochrome · Contrast',    grad: '#4A4A4A' },
];

// --- Step 3: the animated loading steps (5th one added per UX review) ---
export const LOADING_STEPS = [
  'Photo uploaded & received',
  'Detecting style, colors & existing furniture',
  'Searching IKEA, Wayfair & Amazon…',
  'Ranking products by style match & budget',
  'Compositing picks into your room photo',
];

// --- Step 4: mock room analysis (what P2's vision AI will return) ---
export const MOCK_ANALYSIS = {
  summary: 'Bold art and warm tones already — the space just needs softer lighting and a few finishing textures to pull it together.',
  issues: ['Empty corner needs a warm light source', 'Hard surfaces could use soft texture', 'A small side surface would balance the sofa'],
};

// --- Step 4: mock curated products (what P3's product AI will return) ---
export const MOCK_PRODUCTS = [
  { id: 'p1', name: 'KNARREVIK Side Table', store: 'IKEA',    price: 49,  match: 98,
    why: 'Slim legs match your existing wood tones',          grad: '#C9A876', placed: true,  url: '#' },
  { id: 'p2', name: 'Arched Floor Lamp',    store: 'Amazon',  price: 129, match: 94,
    why: 'Arc shape fills the empty corner behind the sofa',  grad: '#44444F', placed: true,  url: '#' },
  { id: 'p3', name: 'Chunky Knit Throw',    store: 'Wayfair', price: 34,  match: 96,
    why: 'Adds the warmth and texture the room is missing',   grad: '#E0B894', placed: false, url: '#' },
  { id: 'p4', name: 'Framed Line Art Set',  store: 'Wayfair', price: 28,  match: 91,
    why: 'Fills the bare wall without cluttering it',         grad: '#E4DCCB', placed: false, url: '#' },
];
