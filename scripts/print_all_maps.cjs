const fs = require('fs');
const code = fs.readFileSync('src/App.tsx', 'utf-8');
const lines = code.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('.map(') && lines[i].includes('=>')) {
    console.log('\n--- Line ' + (i+1) + ' ---');
    console.log(lines.slice(i, i+10).join('\n'));
  }
}
