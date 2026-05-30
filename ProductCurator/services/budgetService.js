function calculateBudget(products, overallBudget) {
    const totalCost = products.reduce((sum, product) => {
        return sum + Number(product.price || 0);
    }, 0);

    return {
        totalCost,
        remainingBudget: overallBudget - totalCost,
        isOverBudget: totalCost > overallBudget
    };
}

module.exports = {
    calculateBudget
};