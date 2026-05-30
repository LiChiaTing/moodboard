const { ApifyClient } = require('apify-client');

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_KEY,
});

const ACTOR_ID_AMAZON = process.env.APIFY_AMAZON_ACTOR_ID || 'jungleee/free-amazon-product-scraper';
const ACTOR_ID_IKEA = process.env.APIFY_IKEA_ACTOR_ID || 'happyendpoint/ikea-scraper';

function buildSearchQuery(userPreferences = {}) {
  const parts = [];
  if (userPreferences.items) {
    if (Array.isArray(userPreferences.items)) {
      parts.push(...userPreferences.items);
    } else {
      parts.push(userPreferences.items);
    }
  }
  if (userPreferences.style) {
    if (Array.isArray(userPreferences.style)) {
      parts.push(...userPreferences.style);
    } else {
      parts.push(userPreferences.style);
    }
  }
  if (userPreferences.colors) {
    if (Array.isArray(userPreferences.colors)) {
      parts.push(...userPreferences.colors);
    } else {
      parts.push(userPreferences.colors);
    }
  }
  if (userPreferences.vibe) {
    parts.push(userPreferences.vibe);
  }

  const query = parts.filter(Boolean).join(' ').trim();
  return query || 'home decor';
}

function buildAmazonSearchUrl(userPreferences = {}) {
  const query = buildSearchQuery(userPreferences);
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
}

function buildIkeaInput(userPreferences = {}, pageNumber = 1, options = {}) {
  return {
    searchKeyword: buildSearchQuery(userPreferences),
    local: options.local || 'us-en',
    pageNumber,
    sortOrder: options.sortOrder || 'RELEVANCE',
  };
}

function normalizeProduct(item) {
  if (!item || typeof item !== 'object') return null;

  const priceValue = item.price?.value ?? item.price;
  const priceCurrency = item.price?.currency ?? '$';

  return {
    name: item.title || item.name || item.productName || null,
    url: item.url || item.detailUrl || item.productUrl || null,
    price: typeof priceValue === 'number' ? priceValue : Number(priceValue) || null,
    currency: priceCurrency,
    source: 'Amazon',
    asin: item.asin || null,
    brand: item.brand || null,
    category: item.breadCrumbs || item.categories || null,
    image: item.thumbnailImage || item.image || item.picture || null,
    inStock: item.inStock ?? item.inStockText != null,
    raw: item,
  };
}

function normalizeIkeaProduct(item) {
  if (!item || typeof item !== 'object') return null;

  const priceValue = item.price?.currentPrice ?? item.price;
  const currency = item.price?.currency ?? 'USD';
  const category = Array.isArray(item.categoryPath)
    ? item.categoryPath.map((segment) => segment.name).join(' > ')
    : null;
  const imageUrl = item.images?.main || item.images?.all?.[0]?.url || null;

  return {
    name: item.name || item.typeName || null,
    url: item.url || null,
    price: typeof priceValue === 'number' ? priceValue : Number(priceValue) || null,
    currency,
    source: 'IKEA',
    brand: item.brand || 'IKEA',
    category,
    image: imageUrl,
    rating: item.rating?.average ?? null,
    reviewsCount: item.rating?.count ?? null,
    itemType: item.typeName || null,
    raw: item,
  };
}

async function callActor(actorId, input, maxItems = 20) {
  if (!process.env.APIFY_API_KEY) {
    throw new Error('Missing APIFY_API_KEY in environment.');
  }

  const actor = apifyClient.actor(actorId);
  const run = await actor.call(input);
  const datasetId = run.defaultDatasetId;

  if (!datasetId) {
    throw new Error('Apify actor did not return a dataset ID.');
  }

  const { items } = await apifyClient.dataset(datasetId).listItems({ clean: true, limit: maxItems });
  return items || [];
}

async function scrapeAmazonProducts(userPreferences = {}, options = {}) {
  const url = options.url || buildAmazonSearchUrl(userPreferences);
  const maxItems = Number(options.maxItems ?? 20);
  const maxPages = Number(options.maxPages ?? 2);

  const items = await callActor(ACTOR_ID_AMAZON, {
    url,
    maxItems,
    maxPages,
  }, maxItems);

  return items.map(normalizeProduct).filter(Boolean);
}

async function scrapeIkeaProducts(userPreferences = {}, options = {}) {
  const maxItems = Number(options.maxItems ?? 20);
  const maxPages = Number(options.maxPages ?? 2);
  const local = options.local || 'us-en';
  const sortOrder = options.sortOrder || 'RELEVANCE';
  const items = [];

  for (let page = 1; page <= maxPages && items.length < maxItems; page += 1) {
    const pageInput = buildIkeaInput(userPreferences, page, { local, sortOrder });
    const pageItems = await callActor(ACTOR_ID_IKEA, pageInput, maxItems);
    items.push(...pageItems);
  }

  return items
    .slice(0, maxItems)
    .map(normalizeIkeaProduct)
    .filter(Boolean);
}

module.exports = {
  scrapeAmazonProducts,
  scrapeIkeaProducts,
  buildAmazonSearchUrl,
};
