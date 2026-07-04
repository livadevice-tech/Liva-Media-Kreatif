const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

const lines = c.split('\n');
lines.forEach((line, i) => {
    if (line.includes('.map(')) {
        let nextFew = lines.slice(i, i+3).join('\n');
        if (nextFew.includes('<') && !nextFew.includes('key=')) {
            console.log('Possible missing key around line ' + (i+1) + ': ' + line.trim());
        }
    }
});
