const puppeteer = require('puppeteer');

/**
 * Generates a PDF buffer from the provided HTML content using Puppeteer.
 * @param {string} htmlContent - The full HTML content to render.
 * @returns {Promise<Buffer>} - The generated PDF buffer.
 */
exports.generateInvoicePdf = async (htmlContent) => {
    let browser = null;
    try {
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });

        const page = await browser.newPage();

        // setContent takes the HTML string. 
        // We set waitUntil: 'networkidle0' to ensure any external assets (like fonts/css) load if possible.
        // But since we are likely rendering local assets via localhost or file paths, we need to be careful.
        // For best results, ensure the HTML has absolute URLs or base tags if loading remote assets.
        // Or inline critical CSS.
        // Here we assume the HTML passed in has correct paths relative to where it's served or is self-contained.
        // If the HTML relies on `localhost:3000/assets/...`, request interception might be needed or just let it load from network.

        await page.setContent(htmlContent, {
            waitUntil: 'networkidle0'
        });

        const pdfBuffer = await page.pdf({
            format: 'A4',
            printBackground: true,
            margin: {
                top: '10mm',
                right: '10mm',
                bottom: '10mm',
                left: '10mm'
            }
        });

        return pdfBuffer;

    } catch (error) {
        console.error('Error in generateInvoicePdf:', error);
        throw error;
    } finally {
        if (browser) {
            await browser.close();
        }
    }
};
