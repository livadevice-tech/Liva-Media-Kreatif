const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

content = content.replace(/\b([a-zA-Z_0-9]+)\.some\(/g, (match, p1) => {
  if ([''].includes(p1)) return match;
  return p1 + '?.some(';
});

content = content.replace(/row\.some\(/g, 'row?.some(');

fs.writeFileSync('src/App.tsx', content, 'utf8');
