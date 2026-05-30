const { ApifyClient } = require('apify-client');

const apifyClient = new ApifyClient({
  token: process.env.APIFY_API_KEY,
});

const ACTOR_ID_AMAZON = process.env.APIFY_AMAZON_ACTOR_ID || 'junglee/free-amazon-product-scraper';
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

// Return the list of desired items the user picked. Each becomes its OWN search
// so we get a relevant match per item instead of one mashed query.
function getItemList(userPreferences = {}) {
  const items = userPreferences.items;
  if (Array.isArray(items) && items.length) return items;
  if (typeof items === 'string' && items.trim()) {
    return items.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return ['home decor'];
}

// A focused per-item query: the item plus a light style + colour hint (only the
// first of each, so the search stays relevant rather than diluted).
function buildItemQuery(item, userPreferences = {}) {
  const style = Array.isArray(userPreferences.style) ? userPreferences.style[0] : userPreferences.style;
  const color = Array.isArray(userPreferences.colors) ? userPreferences.colors[0] : userPreferences.colors;
  return [item, style, color].filter(Boolean).join(' ').trim();
}

function amazonSearchUrl(query) {
  return `https://www.amazon.com/s?k=${encodeURIComponent(query)}`;
}

function buildIkeaInput(userPreferences = {}, pageNumber = 1, options = {}) {
  return {
    keyword: buildSearchQuery(userPreferences),
    local_code: options.localCode || 'us',
    page: pageNumber,
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
  const maxItems = Number(options.maxItems ?? 20);
  const itemList = getItemList(userPreferences);
  // How many products to pull per requested item (so results span all items).
  const perItem = Number(options.perItem ?? Math.max(3, Math.ceil(maxItems / itemList.length)));

  // One actor run, one search URL PER ITEM — relevant matches for each.
  const categoryUrls = options.url
    ? [{ url: options.url }]
    : itemList.map((it) => ({ url: amazonSearchUrl(buildItemQuery(it, userPreferences)) }));

  const items = await callActor(ACTOR_ID_AMAZON, {
    categoryUrls,
    maxItemsPerStartUrl: perItem,
    maxSearchPagesPerStartUrl: 1,
  }, maxItems);

  return items.map(normalizeProduct).filter(Boolean);
}

async function scrapeIkeaProducts(userPreferences = {}, options = {}) {
  const maxItems = Number(options.maxItems ?? 2);
  const localCode = options.localCode || 'us';
  // IKEA actor takes a single keyword, so search the user's top desired item.
  const topItem = getItemList(userPreferences)[0];
  const keyword = buildItemQuery(topItem, userPreferences);

  const pageItems = await callActor(
    ACTOR_ID_IKEA,
    { keyword, local_code: localCode, page: 1 },
    maxItems
  );

  return pageItems
    .slice(0, maxItems)
    .map(normalizeIkeaProduct)
    .filter(Boolean);
}

module.exports = {
  scrapeAmazonProducts,
  scrapeIkeaProducts,
  buildAmazonSearchUrl,
};
