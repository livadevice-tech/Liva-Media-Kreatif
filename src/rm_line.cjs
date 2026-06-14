const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8').split('\n');
c.splice(88, 1);
fs.writeFileSync('src/App.tsx', c.join('\n'));
