// ── Fake product data ──────────────────────────────────────────────
// This is placeholder data so the whole flow is clickable end-to-end.
// When the AI backend is ready, replace `getRoomPlan()` with a real API
// call that returns the same shape. See README "Connecting the backend".

// Each product has `variants` so the "swap" (↻) button can cycle through
// alternative options without needing the backend.
export const PRODUCTS = [
  {
    id: 'sofa',
    emoji: '🛋',
    image: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=240&h=240&fit=crop&q=80',
    color: 'var(--coral)',
    owned: false,
    variants: [
      { name: 'Linen Accent Sofa', why: 'Matches your warm palette & living room scale perfectly', price: 129 },
      { name: 'Boucle 2-Seater', why: 'Soft texture that leans into the Japandi mood', price: 165 },
      { name: 'Oak-Frame Loveseat', why: 'Lighter footprint for a smaller corner', price: 118 },
    ],
  },
  {
    id: 'vase',
    emoji: '🪴',
    image: 'https://images.unsplash.com/photo-1612196808214-b8e1d6145a8c?w=240&h=240&fit=crop&q=80',
    color: 'var(--yellow)',
    owned: false,
    variants: [
      { name: 'Ceramic Floor Vase', why: 'Adds height & echoes the warm earth tones in your room', price: 28 },
      { name: 'Stoneware Jug Vase', why: 'Hand-thrown look for a wabi-sabi touch', price: 24 },
    ],
  },
  {
    id: 'lamp',
    emoji: '💡',
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=240&h=240&fit=crop&q=80',
    color: 'var(--lav)',
    owned: false,
    variants: [
      { name: 'Brass Arc Floor Lamp', why: 'Ties in the metallic accent from your selected style', price: 25 },
      { name: 'Paper Globe Lamp', why: 'Soft diffused glow, very Scandinavian', price: 42 },
    ],
  },
  {
    id: 'rug',
    emoji: '🪞',
    image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?w=240&h=240&fit=crop&q=80',
    color: 'var(--blue)',
    owned: true,
    variants: [
      { name: 'Woven Area Rug 5×7', why: 'Sets the tone — anchors the furniture and adds texture', price: 0 },
    ],
  },
  {
    id: 'coffee-table',
    emoji: '🪑',
    image: 'https://images.unsplash.com/photo-1533090481720-856c6e3c1fdc?w=240&h=240&fit=crop&q=80',
    color: 'var(--green)',
    owned: false,
    variants: [
      { name: 'Round Oak Coffee Table', why: 'Soft edges keep the walkway open', price: 39 },
      { name: 'Travertine Side Table', why: 'Stone accent that grounds the palette', price: 52 },
    ],
  },
  {
    id: 'art',
    emoji: '🖼',
    image: 'https://images.unsplash.com/photo-1531913764164-f85c52e6e654?w=240&h=240&fit=crop&q=80',
    color: 'var(--pink)',
    owned: false,
    variants: [
      { name: 'Abstract Canvas Set', why: 'Pulls the warm neutrals up onto the wall', price: 26 },
      { name: 'Framed Line Print', why: 'Minimalist focal point above the sofa', price: 22 },
    ],
  },
  {
    id: 'cushions',
    emoji: '🧶',
    image: 'https://images.unsplash.com/photo-1616627561839-074385245ff6?w=240&h=240&fit=crop&q=80',
    color: 'var(--coral)',
    owned: false,
    variants: [
      { name: 'Linen Cushion Pair', why: 'Layers in the terracotta you picked', price: 8 },
      { name: 'Knit Throw Cushions', why: 'Extra cosiness for the cooler months', price: 14 },
    ],
  },
  {
    id: 'plant',
    emoji: '🌿',
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=240&h=240&fit=crop&q=80',
    color: 'var(--green)',
    owned: true,
    variants: [
      { name: 'Potted Fiddle-Leaf Fig', why: 'You already have this — keeping it in the plan', price: 0 },
    ],
  },
]

// Build the initial room plan. Swap a product variant by index.
export function buildPlan(products = PRODUCTS) {
  return products.map((p) => ({ ...p, variantIndex: 0 }))
}

export function activeVariant(product) {
  return product.variants[product.variantIndex % product.variants.length]
}

// Where to buy a product. The backend can attach a real `url` per variant;
// until then we fall back to a Google Shopping search by name so the link
// still takes the user somewhere they can actually buy the piece.
export function buyUrl(variant) {
  return (
    variant.url ||
    'https://www.google.com/search?tbm=shop&q=' + encodeURIComponent(variant.name)
  )
}
