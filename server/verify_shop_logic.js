const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyLogic() {
    console.log('Verifying Numerical Sorting & Rating Filtering...');

    // Simulate fetch
    let products = await prisma.product.findMany({
        where: { status: 1 },
        include: { category: true }
    });

    // Inject mock ratings
    products = products.map(p => ({
        ...p,
        mockRating: (p.id % 5) + 1
    }));

    // Test Rating Filter (e.g., 4 stars)
    const ratingThreshold = 4;
    const filteredByRating = products.filter(p => p.mockRating >= ratingThreshold);
    console.log(`Products with Rating >= ${ratingThreshold}:`, filteredByRating.length);
    filteredByRating.forEach(p => console.log(` - ${p.product_name}: Rating ${p.mockRating}`));

    const parsePrice = (priceStr) => {
        if (!priceStr) return 0;
        const cleanPrice = priceStr.toString().replace(/[^\d.]/g, '');
        return parseFloat(cleanPrice) || 0;
    };

    // Test Price Sorting (Numerical)
    // Add mock prices if needed to test 1000 vs 200
    // Actually using real data from DB

    console.log('\nTesting Price Ascending (Numerical):');
    const sortedAsc = [...products].sort((a, b) => parsePrice(a.price) - parsePrice(b.price));
    sortedAsc.forEach(p => console.log(` - ${p.product_name}: ₹${p.price} (Parsed: ${parsePrice(p.price)})`));

    console.log('\nTesting Price Descending (Numerical):');
    const sortedDesc = [...products].sort((a, b) => parsePrice(b.price) - parsePrice(a.price));
    sortedDesc.forEach(p => console.log(` - ${p.product_name}: ₹${p.price} (Parsed: ${parsePrice(p.price)})`));

    // Final check for Latest sort
    console.log('\nTesting Latest Sort (Date):');
    const sortedLatest = [...products].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    sortedLatest.slice(0, 3).forEach(p => console.log(` - ${p.product_name}: ${p.created_at}`));
}

verifyLogic()
    .catch(console.error)
    .finally(() => prisma.$disconnect());
