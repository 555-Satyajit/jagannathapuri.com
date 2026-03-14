const adminController = require('./src/controllers/adminController');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTests() {
    try {
        console.log("--- Testing Single Delete ---");
        // 1. Find a category with products to see if it fails gracefully
        const catWithProducts = await prisma.category.findFirst({
            where: { products: { some: {} } }
        });

        if (catWithProducts) {
            console.log(`Testing delete on category with products: ${catWithProducts.name} (ID: ${catWithProducts.id})`);
            const req1 = { params: { id: catWithProducts.id } };
            const res1 = {
                json: (data) => console.log("Response JSON:", data),
                status: (code) => { console.log("Response Status:", code); return { json: (data) => console.log("Error JSON:", data) }; }
            };
            await adminController.deleteCategory(req1, res1);
        } else {
            console.log("No category with products found.");
        }

        console.log("\n--- Testing Bulk Delete ---");
        // 2. Create a dummy category that can be safely deleted
        const dummy1 = await prisma.category.create({
            data: { name: "Test Dummy 1", slug: "test-dummy-1-" + Date.now(), status: "Scheduled" }
        });
        const dummy2 = await prisma.category.create({
            data: { name: "Test Dummy 2", slug: "test-dummy-2-" + Date.now(), status: "Scheduled" }
        });

        console.log(`Created dummy categories: ${dummy1.name} (ID: ${dummy1.id}), ${dummy2.name} (ID: ${dummy2.id})`);

        const idsToBulkDelete = [dummy1.id, dummy2.id];
        if (catWithProducts) idsToBulkDelete.push(catWithProducts.id);

        console.log(`Testing bulk delete on IDs: ${idsToBulkDelete.join(', ')}`);
        
        const req2 = { body: { ids: idsToBulkDelete } };
        const res2 = {
            json: (data) => console.log("Response JSON:", data),
            status: (code) => { console.log("Response Status:", code); return { json: (data) => console.log("Error JSON:", data) }; }
        };
        await adminController.bulkDeleteCategories(req2, res2);

        // Verify dummies are gone
        const checkDummy1 = await prisma.category.findUnique({ where: { id: dummy1.id } });
        const checkDummy2 = await prisma.category.findUnique({ where: { id: dummy2.id } });
        console.log(`Dummy 1 exists? ${!!checkDummy1}`);
        console.log(`Dummy 2 exists? ${!!checkDummy2}`);

    } catch (e) {
        console.error("Test Error:", e);
    } finally {
        await prisma.$disconnect();
    }
}

runTests();
