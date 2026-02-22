const puppeteer = require('puppeteer');

/**
 * Generates a PDF buffer from the provided HTML content using Puppeteer.
 * @param {string} htmlContent - The full HTML content to render.
 * @returns {Promise<Buffer>} - The generated PDF buffer.
 */
exports.generateInvoicePdf = async (htmlContent) => {
    let browser = null;
    try {
        console.log('[DEBUG] Launching Puppeteer...');
        browser = await puppeteer.launch({
            headless: 'new',
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        console.log('[DEBUG] Puppeteer launched.');

        const page = await browser.newPage();

        // Intercept requests to serve local files directly
        await page.setRequestInterception(true);
        page.on('request', (request) => {
            const url = request.url();

            // Handle local assets by finding specific keywords in the URL
            if (url.includes('/admin-assets/') || url.includes('/assets/') || url.includes('/uploads/')) {
                const fs = require('fs');
                const path = require('path');

                let localPath = '';
                let isValidPath = false;

                // Clean the URL of protocol and host
                let relativeUrlstr = url;
                try {
                    relativeUrlstr = new URL(url).pathname;
                } catch (e) { }

                // Decode the URI to handle encoded traversals (e.g. %2e%2e -> ..)
                try {
                    relativeUrlstr = decodeURIComponent(relativeUrlstr);
                } catch (e) { }

                if (relativeUrlstr.includes('/admin-assets/')) {
                    const relativePath = relativeUrlstr.split('/admin-assets/')[1].split('?')[0];
                    const baseDir = path.resolve(__dirname, '../../../admin-panel/assets');
                    localPath = path.resolve(baseDir, relativePath);
                    if (localPath.startsWith(baseDir)) isValidPath = true;
                } else if (relativeUrlstr.includes('/assets/')) {
                    const relativePath = relativeUrlstr.split('/assets/')[1].split('?')[0];
                    const baseDir = path.resolve(__dirname, '../../../assets');
                    localPath = path.resolve(baseDir, relativePath);
                    if (localPath.startsWith(baseDir)) isValidPath = true;
                } else if (relativeUrlstr.includes('/uploads/')) {
                    const relativePath = relativeUrlstr.split('/uploads/')[1].split('?')[0];
                    const baseDir = path.resolve(__dirname, '../../../uploads');
                    localPath = path.resolve(baseDir, relativePath);
                    if (localPath.startsWith(baseDir)) isValidPath = true;
                }

                if (isValidPath && fs.existsSync(localPath)) {
                    const contentType = url.endsWith('.css') ? 'text/css' :
                        url.endsWith('.js') ? 'application/javascript' :
                            url.endsWith('.png') ? 'image/png' :
                                url.endsWith('.jpg') || url.endsWith('.jpeg') ? 'image/jpeg' :
                                    url.endsWith('.svg') ? 'image/svg+xml' :
                                        url.endsWith('.woff2') ? 'font/woff2' : 'text/plain';

                    try {
                        const fileContent = fs.readFileSync(localPath);
                        request.respond({
                            status: 200,
                            contentType: contentType,
                            body: fileContent
                        });
                        return; // Successfully responded with local file
                    } catch (err) {
                        console.error(`[DEBUG] Error reading local file ${localPath}:`, err);
                    }
                } else {
                    console.log(`[DEBUG] File not found locally: ${localPath}`);
                }
            }

            // Continue with normal request if not intercepted above
            request.continue();
        });

        console.log('[DEBUG] Setting page content...');
        // Using goto with a data URI can sometimes resolve base tag issues better than setContent
        // Wait for networkidle2 which is more lenient with background requests (like fonts)
        await page.setContent(htmlContent, {
            waitUntil: ['load', 'networkidle2'],
            timeout: 15000 // 15 seconds is plenty for local assets
        });

        // Let's also evaluate a script to verify if CSS is actually loaded.
        const linksCount = await page.evaluate(() => document.styleSheets.length);
        console.log(`[DEBUG] Number of stylesheets loaded by Puppeteer: ${linksCount}`);

        console.log('[DEBUG] Page content set. Generating PDF...');

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
