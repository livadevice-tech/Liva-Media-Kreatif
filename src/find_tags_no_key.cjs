const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8').split('\n');
let results = [];
c.forEach((line, i) => {
    if (line.includes('.map') && /<[a-zA-Z]+/.test(line) && !line.includes('key=')) {
        results.push(`${i+1}: ${line}`);
    }
});
console.log(results.join('\n'));
