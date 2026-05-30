const { Anthropic } = require('@anthropic-ai/sdk');
const fetch = require('node-fetch');

const anthropicClient = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
  fetch,
});

const MODEL = process.env.ANTHROPIC_MODEL || 'claude-3.5';

function buildPrompt({ userPreferences = {}, roomData = {}, scrapedProducts = [] }) {
  const style = Array.isArray(userPreferences.style)
    ? userPreferences.style.join(', ')
    : userPreferences.style || 'minimalist';
  const colors = Array.isArray(userPreferences.colors)
    ? userPreferences.colors.join(', ')
    : userPreferences.colors || 'neutral tones';
  const items = userPreferences.items || userPreferences.desiredItems || 'decor and furniture to make the room look spacious';
  const budget = userPreferences.budget || roomData.overallBudget || 200;
  const categoryBudgets = userPreferences.categoryBudgets || roomData.categoryBudgets || {};
  const vibe = userPreferences.vibe || roomData.vibe || 'cozy minimalist';

  const scrapedProductsSection = scrapedProducts.length
    ? `Available scraped product candidates:
${scrapedProducts
        .map(
          (product) =>
            `- ${product.name} | category: ${product.category} | price: ${product.price} | source: ${product.source || 'unknown'}`
        )
        .join('\n')}

`
    : 'No scraped products are available yet. Use your knowledge of Amazon, Wayfair, and IKEA-style picks for the requested look.';

  const body = `You are an interior design product curator. Use the room data, user preferences, and budget to recommend furniture and decor items.\n\nRoom context:\n- Room type: ${roomData.roomType || 'unspecified'}\n- Existing furniture: ${Array.isArray(roomData.existingFurniture) ? roomData.existingFurniture.join(', ') : roomData.existingFurniture || 'none'}\n- Issues: ${Array.isArray(roomData.issues) ? roomData.issues.join(', ') : roomData.issues || 'none'}\n- Color palette: ${Array.isArray(roomData.colorPalette) ? roomData.colorPalette.join(', ') : roomData.colorPalette || 'none'}\n- Style inference: ${roomData.styleInference || 'unspecified'}\n- Vibe: ${vibe}\n- User requirement: ${roomData.userRequirement || 'Please make it feel more spacious and functional.'}\n- Overall budget: $${budget}\n- Category budgets: ${JSON.stringify(categoryBudgets)}\n\nUser preferences:\n- Desired style: ${style}\n- Preferred colors: ${colors}\n- Desired items: ${items}\n- Budget target: $${budget}\n- Mood: ${vibe}\n\n${scrapedProductsSection}\n\nInstructions:\n1. Recommend up to 3 products. Prefer items that match the chosen style and budget.\n2. Focus on categories requested by the user and improve room flow, lighting, and spaciousness.\n3. Prefer realistic product examples from Amazon, Wayfair, or IKEA, but you can describe generic items if exact product matches are not available.\n4. Respect the total budget and category budgets. If the best item exceeds a category budget, explain why.\n5. Return only valid JSON with this structure:\n{\n  \"topPick\": {\"category\":\"\",\"name\":\"\",\"price\":0,\"source\":\"\",\"reason\":\"\"},\n  \"supportingPicks\": [{\"category\":\"\",\"name\":\"\",\"price\":0,\"source\":\"\",\"reason\":\"\"}],\n  \"budget\": {\"totalBudget\":0,\"estimatedTotal\":0,\"remainingBudget\":0,\"isOverBudget\":false},\n  \"placementPrompt\":\"\"\n}\n\nDo not include extra explanation outside the JSON object.`;
  return `\n\nHuman: ${body}\n\nAssistant:`;
}

function tryParseJson(text) {
  try {
    const body = text.trim();
    const jsonStart = body.indexOf('{');
    const jsonEnd = body.lastIndexOf('}');
    if (jsonStart !== -1 && jsonEnd !== -1) {
      const jsonString = body.slice(jsonStart, jsonEnd + 1);
      return JSON.parse(jsonString);
    }
    return JSON.parse(body);
  } catch (error) {
    return null;
  }
}

async function curateProducts(userPreferences, roomData, scrapedProducts = []) {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('Missing ANTHROPIC_API_KEY in environment.');
  }

  const prompt = buildPrompt({ userPreferences, roomData, scrapedProducts });

  const response = await anthropicClient.completions.create({
    model: MODEL,
    prompt,
    max_tokens: 700,
    temperature: 0.7,
  });

  const completion = response?.completion || response?.completion?.[0]?.text || response?.text || '';
  const parsed = tryParseJson(completion || '');

  if (parsed) {
    return parsed;
  }

  return {
    topPick: null,
    supportingPicks: [],
    budget: {
      totalBudget: userPreferences.budget || roomData.overallBudget || 0,
      estimatedTotal: 0,
      remainingBudget: userPreferences.budget || roomData.overallBudget || 0,
      isOverBudget: false,
    },
    placementPrompt: completion || 'Unable to parse AI response.',
    rawAiOutput: completion,
  };
}

module.exports = {
  curateProducts,
};
