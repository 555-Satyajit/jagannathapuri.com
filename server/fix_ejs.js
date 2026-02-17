const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../admin-panel/Ui/pages/admin-product-edit.ejs');
let content = fs.readFileSync(filePath, 'utf8');

// Very permissive regex for the syntax error
const regex = /<%.*?JSON\.stringify\(product\).*?%>/g;
const match = content.match(regex);

if (match) {
    console.log('Match found:', match[0]);
    // Print character codes for diagnosis
    for (let i = 0; i < match[0].length; i++) {
        console.log(`Char at ${i}: '${match[0][i]}' (code: ${match[0].charCodeAt(i)})`);
    }
    const newContent = content.replace(regex, '<%- JSON.stringify(product) %>');
    fs.writeFileSync(filePath, newContent, 'utf8');
    console.log('Fixed EJS syntax error with permissive regex.');
} else {
    console.log('Still could not find any match with permissive regex.');
    // Search for just "const product =" and print the next 50 chars
    const index = content.indexOf('const product =');
    if (index !== -1) {
        const snippet = content.substring(index, index + 100);
        console.log('Snippet from file:', snippet);
        for (let i = 0; i < snippet.length; i++) {
            console.log(`Char at ${i}: '${snippet[i]}' (code: ${snippet.charCodeAt(i)})`);
        }
    } else {
        console.log('Could not even find "const product =".');
    }
}
