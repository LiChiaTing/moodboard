// Calls the P2 Room Generator (Java/Bedrock) server-to-server and returns the
// generated "after" image as a base64 data URL. Done here (not in the browser)
// so the frontend only ever talks to this one service.

const ROOMGEN_URL = process.env.ROOMGEN_URL || 'http://localhost:8080';
// P2/Bedrock inpaints a publicly-fetchable "before" room image. Browser uploads
// aren't reachable by AWS, so we use a public sample room as the base.
const SAMPLE_ROOM_IMAGE =
  process.env.SAMPLE_ROOM_IMAGE ||
  'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?w=1024';

async function generateRoomImage(userPreferences = {}, roomProfile = {}, picks = []) {
  // Send P2 the curated picks (clean string fields only) so the render reflects
  // the recommendation.
  const products = (picks || [])
    .slice(0, 10)
    .map((p) => ({
      name: p.name || null,
      image: typeof p.image === 'string' ? p.image : null,
      category: typeof p.category === 'string' ? p.category : null,
      brand: p.source || p.brand || null,
      typeName: p.typeName || null,
    }))
    .filter((p) => p.name);

  const styleInference = Array.isArray(userPreferences.style)
    ? userPreferences.style[0]
    : userPreferences.style;

  // P2's UserPreferences DTO types `items` and `vibe` as String (style/colors
  // are List). The frontend sends `items` as an array, so coerce it to a string
  // here — otherwise Jackson rejects the body with MALFORMED_JSON.
  const p2Prefs = {
    items: Array.isArray(userPreferences.items)
      ? userPreferences.items.join(', ')
      : (userPreferences.items || ''),
    style: Array.isArray(userPreferences.style)
      ? userPreferences.style
      : (userPreferences.style ? [userPreferences.style] : []),
    colors: Array.isArray(userPreferences.colors)
      ? userPreferences.colors
      : (userPreferences.colors ? [userPreferences.colors] : []),
    vibe: userPreferences.vibe || '',
  };

  const body = {
    userPreferences: p2Prefs,
    roomData: {
      roomImageUrl: roomProfile.roomImageUrl || SAMPLE_ROOM_IMAGE,
      roomType: roomProfile.roomType || 'living room',
      existingFurniture: roomProfile.existingFurniture,
      issues: roomProfile.issues,
      colorPalette: roomProfile.colorPalette || userPreferences.colors,
      styleInference: roomProfile.styleInference || styleInference || 'minimalist',
      vibe: userPreferences.vibe || roomProfile.vibe,
      userRequirement: roomProfile.userRequirement,
      overallBudget: userPreferences.budget || roomProfile.overallBudget,
    },
    scrapedProducts: products,
  };

  const payload = JSON.stringify(body);
  let lastErr;
  // Retry once on a transient failure (e.g. P2 momentarily restarting).
  for (let attempt = 1; attempt <= 2; attempt += 1) {
    try {
      const resp = await fetch(`${ROOMGEN_URL}/api/v1/generate-room`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: payload,
      });
      if (!resp.ok) {
        const text = await resp.text().catch(() => '');
        throw new Error(`roomgen ${resp.status}: ${text.slice(0, 200)}`);
      }
      const buffer = Buffer.from(await resp.arrayBuffer());
      return `data:image/png;base64,${buffer.toString('base64')}`;
    } catch (err) {
      lastErr = err;
      if (attempt < 2) await new Promise((r) => setTimeout(r, 1500));
    }
  }
  throw lastErr;
}

module.exports = { generateRoomImage };
