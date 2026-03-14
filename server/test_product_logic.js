const adminController = require('./src/controllers/adminController');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTests() {
    try {
        console.log("--- Testing Single Delete ---");
        // 1. Find a product with orders to see if it fails gracefully
        const prodWithOrder = await prisma.product.findFirst({
            where: { orderItems: { some: {} } }
        });

        if (prodWithOrder) {
            console.log(`Testing delete on product with order: ${prodWithOrder.product_name} (ID: ${prodWithOrder.id})`);
            const req1 = { params: { id: prodWithOrder.id } };
            const res1 = {
                json: (data) => console.log("Response JSON:", data),
                status: (code) => { console.log("Response Status:", code); return { json: (data) => console.log("Error JSON:", data) }; }
            };
            await adminController.deleteProduct(req1, res1);
        } else {
            console.log("No product with orders found.");
        }

        console.log("\n--- Testing Bulk Delete ---");
        // 2. Create a dummy product that can be safely deleted
        // Need to feed it a category first
        const dummyCategory = await prisma.category.findFirst();
        
        const dummy1 = await prisma.product.create({
            data: { product_name: "Test Prod Dummy 1", product_brand: "Dummy Brand", slug: "test-dummy-prod-1-" + Date.now(), sku: "SKUD1", price: "10.00", product_type: "Simple", category_id: dummyCategory.id }
        });
        const dummy2 = await prisma.product.create({
            data: { product_name: "Test Prod Dummy 2", product_brand: "Dummy Brand", slug: "test-dummy-prod-2-" + Date.now(), sku: "SKUD2", price: "20.00", product_type: "Simple", category_id: dummyCategory.id }
        });

        console.log(`Created dummy products: ${dummy1.product_name} (ID: ${dummy1.id}), ${dummy2.product_name} (ID: ${dummy2.id})`);

        const idsToBulkDelete = [dummy1.id, dummy2.id];
        if (prodWithOrder) idsToBulkDelete.push(prodWithOrder.id);

        console.log(`Testing bulk delete on IDs: ${idsToBulkDelete.join(', ')}`);
        
        const req2 = { body: { ids: idsToBulkDelete } };
        const res2 = {
            json: (data) => console.log("Response JSON:", data),
            status: (code) => { console.log("Response Status:", code); return { json: (data) => console.log("Error JSON:", data) }; }
        };
        await adminController.bulkDeleteProducts(req2, res2);

        // Verify dummies are gone
        const checkDummy1 = await prisma.product.findUnique({ where: { id: dummy1.id } });
        const checkDummy2 = await prisma.product.findUnique({ where: { id: dummy2.id } });
        console.log(`Dummy 1 exists? ${!!checkDummy1}`);
        console.log(`Dummy 2 exists? ${!!checkDummy2}`);

    } catch (e) {
        console.error("Test Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

runTests();
