const { Anthropic } = require('@anthropic-ai/sdk');

const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

// Use a current, valid model. Override via ANTHROPIC_MODEL if needed
// (e.g. "claude-sonnet-4-6" for lower cost, "claude-haiku-4-5" for speed).
const MODEL = process.env.ANTHROPIC_MODEL || 'claude-opus-4-8';
const MAX_TOKENS = Number(process.env.ANTHROPIC_MAX_TOKENS || 2000);
const MAX_PICKS = Number(process.env.MAX_PICKS || 8);

// Stable instructions live in the system prompt so they can be prompt-cached
// across requests. Only the per-request room/preference/product data varies.
const SYSTEM_PROMPT = `You are an expert interior design product curator.

Your job: read the room analysis, the user's preferences, and the list of
available product candidates, then recommend products that transform the room
while staying within budget.

Rules:
1. Recommend up to ${MAX_PICKS} products total: one "topPick" plus up to ${MAX_PICKS - 1} "supportingPicks".
2. STAY WITHIN BUDGET. The combined price of every recommended product
   (topPick + supportingPicks) must be less than or equal to the overall budget.
   Respect category budgets when they are provided.
3. Prefer products from the supplied candidate list when they match the user's
   style, colors, and vibe AND fit the budget. The candidates have already been
   filtered to items within budget, so favour them. When you pick a candidate,
   copy its name EXACTLY as written so it can be matched to a real product link
   and image. Only describe a generic alternative if no candidate fits.
4. Match the requested style, colors, and vibe, and improve the room's flow,
   lighting, and sense of space.
5. Set "price" to the real numeric price of each pick (no currency symbol).
   Compute the budget block honestly from your picks:
   estimatedTotal = sum of picked prices, remainingBudget = totalBudget - estimatedTotal,
   isOverBudget = estimatedTotal > totalBudget (this must be false).

Respond with ONLY a single JSON object — no markdown, no code fences, no prose
before or after — in exactly this shape:
{
  "topPick": {"category":"","name":"","price":0,"source":"","url":"","image":"","reason":""},
  "supportingPicks": [{"category":"","name":"","price":0,"source":"","url":"","image":"","reason":""}],
  "budget": {"totalBudget":0,"estimatedTotal":0,"remainingBudget":0,"isOverBudget":false},
  "placementPrompt":""
}`;

function asList(value) {
  if (Array.isArray(value)) return value.join(', ');
  return value || '';
}

function normalizeName(name) {
  return String(name || '').trim().toLowerCase();
}

function buildUserContent({ userPreferences = {}, roomData = {}, scrapedProducts = [] }) {
  const style = asList(userPreferences.style) || 'minimalist';
  const colors = asList(userPreferences.colors) || 'neutral tones';
  const items =
    userPreferences.items ||
    userPreferences.desiredItems ||
    'decor and furniture to make the room look spacious';
  const budget = userPreferences.budget || roomData.overallBudget || 200;
  const categoryBudgets = userPreferences.categoryBudgets || roomData.categoryBudgets || {};
  const vibe = userPreferences.vibe || roomData.vibe || 'cozy minimalist';

  const productsSection = scrapedProducts.length
    ? `Available product candidates (already filtered to items within budget):\n${scrapedProducts
        .map(
          (p, i) =>
            `${i + 1}. ${p.name} | category: ${p.category || 'n/a'} | price: ${p.price} ${p.currency || ''} | source: ${p.source || 'unknown'}`
        )
        .join('\n')}`
    : 'No scraped product candidates are available. Suggest realistic Amazon / IKEA / Wayfair-style picks for the requested look, within budget.';

  return `Room analysis:
- Room type: ${roomData.roomType || 'unspecified'}
- Existing furniture: ${asList(roomData.existingFurniture) || 'none'}
- Issues to fix: ${asList(roomData.issues) || 'none'}
- Color palette: ${asList(roomData.colorPalette) || 'none'}
- Style inference: ${roomData.styleInference || 'unspecified'}
- User requirement: ${roomData.userRequirement || 'Make it feel more spacious and functional.'}

User preferences:
- Desired style: ${style}
- Preferred colors: ${colors}
- Desired items: ${items}
- Vibe / mood: ${vibe}

Budget:
- Overall budget: $${budget}
- Category budgets: ${JSON.stringify(categoryBudgets)}

${productsSection}`;
}

function tryParseJson(text) {
  if (!text) return null;
  try {
    const body = text.trim();
    const jsonStart = body.indexOf('{');
    const jsonEnd = body.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      return JSON.parse(body.slice(jsonStart, jsonEnd + 1));
    }
    return JSON.parse(body);
  } catch (error) {
    return null;
  }
}

// The model returns name/price/reason; the real url + image live on the scraped
// candidate. Match picks back to candidates by name so the frontend gets real,
// clickable, shoppable cards instead of bare text.
function enrichPick(pick, productsByName) {
  if (!pick) return pick;
  const match = productsByName.get(normalizeName(pick.name));
  if (match) {
    return {
      ...pick,
      url: pick.url || match.url || null,
      image: pick.image || match.image || null,
      source: pick.source || match.source || null,
      price: typeof pick.price === 'number' ? pick.price : match.price,
    };
  }
  return {
    url: null,
    image: null,
    ...pick,
  };
}

// Guard: if the model's combined picks still exceed budget, drop the most
// expensive supporting picks (keeping the topPick) until the cart fits.
function enforceBudget(result, budget) {
  if (!budget || budget <= 0) return result;

  const priceOf = (p) => (p && typeof p.price === 'number' ? p.price : 0);
  let supporting = [...(result.supportingPicks || [])];
  let total = priceOf(result.topPick) + supporting.reduce((s, p) => s + priceOf(p), 0);

  if (total > budget) {
    supporting.sort((a, b) => priceOf(b) - priceOf(a)); // most expensive first
    while (total > budget && supporting.length > 0) {
      const removed = supporting.shift();
      total -= priceOf(removed);
    }
  }

  const estimatedTotal = priceOf(result.topPick) + supporting.reduce((s, p) => s + priceOf(p), 0);
  return {
    ...result,
    supportingPicks: supporting,
    budget: {
      totalBudget: budget,
      estimatedTotal,
      remainingBudget: budget - estimatedTotal,
      isOverBudget: estimatedTotal > budget,
    },
  };
}

async function curateProducts(userPreferences, roomData, scrapedProducts = []) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Missing ANTHROPIC_API_KEY in environment.');
  }

  const userContent = buildUserContent({ userPreferences, roomData, scrapedProducts });

  const response = await anthropicClient.messages.create({
    model: MODEL,
    max_tokens: MAX_TOKENS,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: userContent }],
  });

  const text = (response.content || [])
    .filter((block) => block.type === 'text')
    .map((block) => block.text)
    .join('\n');

  const parsed = tryParseJson(text);
  const budget = userPreferences.budget || roomData.overallBudget || 0;

  if (parsed) {
    const productsByName = new Map(
      scrapedProducts.filter((p) => p && p.name).map((p) => [normalizeName(p.name), p])
    );

    const enriched = {
      ...parsed,
      topPick: enrichPick(parsed.topPick, productsByName),
      supportingPicks: (parsed.supportingPicks || []).map((p) => enrichPick(p, productsByName)),
    };

    return enforceBudget(enriched, budget);
  }

  return {
    topPick: null,
    supportingPicks: [],
    budget: {
      totalBudget: budget,
      estimatedTotal: 0,
      remainingBudget: budget,
      isOverBudget: false,
    },
    placementPrompt: text || 'Unable to parse AI response.',
    rawAiOutput: text,
  };
}

module.exports = {
  curateProducts,
};
