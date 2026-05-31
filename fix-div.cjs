const fs = require('fs');
const lines = fs.readFileSync('src/App.tsx', 'utf-8').split('\n');
lines.splice(4766, 0, '                 </div>');
fs.writeFileSync('src/App.tsx', lines.join('\n'));
