const ejs = require('ejs');
const fs = require('fs');
const path = require('path');

const ejsPath = path.join(__dirname, '../user-ui/pages/shop.ejs');
const template = fs.readFileSync(ejsPath, 'utf-8');

const mockData = {
    filters: {
        categories: [{ name: 'Health', slug: 'health', _count: { products: 10 } }],
        brands: ['BrandA', 'BrandB'],
        attributes: [
            { name: 'Color', values: ['Red', 'Blue'] },
            { name: 'Size', values: ['S', 'M'] }
        ],
        query: {},
        priceMin: 0,
        priceMax: 100
    },
    products: [
        {
            id: 1,
            product_name: 'Test Product', // Configured with correct field name
            slug: 'test-product',
            price: 50,
            salePrice: 40,
            images: ['image.jpg']
        },
        {
            id: 2,
            product_name: 'No Image Product',
            slug: 'no-image-product',
            price: 60,
            salePrice: null,
            images: []
        }
    ],
    pagination: {
        currentPage: 1,
        totalPages: 5,
        totalProducts: 50,
        hasPrevPage: false,
        hasNextPage: true
    },
    user: null,
    cart: []
};

try {
    const html = ejs.render(template, mockData, { filename: ejsPath });
    console.log('EJS Compilation Successful!');
    if (html.includes('₹')) {
        console.log('Rupee symbol found.');
    } else {
        console.error('Rupee symbol NOT found.');
    }
    if (html.includes('Test Product')) {
        console.log('Product Name found.');
    } else {
        console.error('Product Name NOT found.');
    }
    if (html.includes('/uploads/image.jpg')) {
        console.log('Uploads path prefix found.');
    } else {
        console.error('Uploads path prefix NOT found.');
    }
    if (html.includes('/assets/images/logo.png')) {
        console.log('Fallback image found.');
    } else {
        console.error('Fallback image NOT found.');
    }

} catch (error) {
    console.error('EJS Compilation Failed:', error);
    process.exit(1);
}
