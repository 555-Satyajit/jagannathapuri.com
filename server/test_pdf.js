const invoiceService = require('./src/services/invoiceService');

async function testPdf() {
    console.log('Starting PDF generation test...');
    try {
        const buffer = await invoiceService.generateInvoicePdf('<h1>Test Invoice</h1><p>This is a test.</p>');
        console.log('PDF generated successfully. Buffer size:', buffer.length);
    } catch (error) {
        console.error('PDF generation failed:', error);
    }
}

testPdf();
