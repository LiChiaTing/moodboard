require('dotenv').config();
const express = require('express');
const mockRoom = require('./mockRoom.json');
const { calculateBudget } = require('./services/budgetService');
const { curateProducts } = require('./services/claudeService');
const { scrapeAmazonProducts, scrapeIkeaProducts } = require('./services/apifyService');

const app = express();
const PORT = process.env.PORT || 4000;
const DEFAULT_MAX_ITEMS = Number(process.env.DEFAULT_MAX_ITEMS || 20);
const DEFAULT_MAX_PAGES = Number(process.env.DEFAULT_MAX_PAGES || 2);

app.use(express.json());

app.get('/', (req, res) => {
    res.json({
        message: 'AI Room Transformer Product Curator is running'
    });
});

app.post('/curate-products', async (req, res) => {
    const userPreferences = req.body.userPreferences || req.body;
    let scrapedProducts = req.body.scrapedProducts || [];

    try {
        if (!Array.isArray(scrapedProducts) || scrapedProducts.length === 0) {
            const maxItems = DEFAULT_MAX_ITEMS;
            const maxPages = DEFAULT_MAX_PAGES;

            const [amazonProducts, ikeaProducts] = await Promise.all([
                scrapeAmazonProducts(userPreferences, { maxItems, maxPages }),
                scrapeIkeaProducts(userPreferences, { maxItems, maxPages }),
            ]);

            scrapedProducts = [...amazonProducts, ...ikeaProducts].slice(0, maxItems);
        }

        const aiResult = await curateProducts(userPreferences, mockRoom, scrapedProducts);

        const budgetSummary = calculateBudget([
            aiResult.topPick,
            ...(aiResult.supportingPicks || []),
        ].filter(Boolean), mockRoom.overallBudget);

        res.json({
            status: 'success',
            inputReceived: req.body,
            mockRoom,
            scrapedProducts,
            result: {
                ...aiResult,
                totalCost: budgetSummary.totalCost,
                remainingBudget: budgetSummary.remainingBudget,
                isOverBudget: budgetSummary.isOverBudget,
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: error.message || 'Failed to curate products',
            details: error.stack,
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});