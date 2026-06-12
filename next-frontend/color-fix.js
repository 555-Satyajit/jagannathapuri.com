const fs = require('fs');
let data = fs.readFileSync('public/assets/lottie-spinner.json', 'utf8');
// Replace colors (arrays of [R, G, B, 1]) where R,G,B are 0-1
// Standard color arrays in lottie look like "k":[0.5,0.5,0.5,1]
// We replace them with an orange: "k":[0.917,0.345,0.047,1] (which is roughly #EA580C)
data = data.replace(/"k":\[[0-9.]+,[0-9.]+,[0-9.]+,1\]/g, '"k":[0.917,0.345,0.047,1]');
fs.writeFileSync('public/assets/lottie-spinner.json', data);
