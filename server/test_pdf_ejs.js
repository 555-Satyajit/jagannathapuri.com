const path = require('path');
const ejs = require('ejs');
const invoiceService = require('./src/services/invoiceService');

async function testPdfWithEjs() {
    console.log('Testing PDF with EJS...');

    const mockOrder = {
        orderNumber: 'TEST-123',
        date: new Date(),
        customer: { fullName: 'Test User', email: 'test@test.com', phone: '123' },
        shippingAddress: { addressLine1: 'Test', city: 'Test', state: 'Test', zipCode: '123', country: 'Test' },
        totalAmount: 100,
        subtotal: 100,
        shippingFee: 0,
        items: [
            { product: { product_name: 'Product 1' }, price: 50, quantity: 2 }
        ]
    };

    const templatePath = path.join(__dirname, '../admin-panel/Ui/pages/invoice-print.ejs');

    try {
        const html = await ejs.renderFile(templatePath, {
            order: mockOrder,
            baseUrl: 'http://localhost:3000'
        });

        console.log('EJS rendered successfully, string length:', html.length);

        const buffer = await invoiceService.generateInvoicePdf(html);
        console.log('PDF generated successfully. Buffer size:', buffer.length);

    } catch (error) {
        console.error('Test failed:', error);
    }
}

testPdfWithEjs();
