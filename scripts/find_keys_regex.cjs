const fs = require('fs');
const tsx = fs.readFileSync('src/App.tsx', 'utf-8');

const regex = /\.map\s*\(\s*(?:[^=>]*)=>\s*(?:\{[^}]*return\s*)?(?:\()?\s*<([a-zA-Z0-9]+)([^>]*)/g;

let match;
while ((match = regex.exec(tsx)) !== null) {
  const tag = match[1];
  const attrs = match[2];
  if (!attrs.includes('key={') && !attrs.includes('key=')) {
     console.log('Missing key around index:', match.index, 'tag:', tag);
     const context = tsx.substring(match.index - 50, match.index + 100);
     console.log('Context:\n', context);
     console.log('---');
  }
}
