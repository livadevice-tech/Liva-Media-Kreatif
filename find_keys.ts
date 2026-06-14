import fs from 'fs';

const code = fs.readFileSync('src/App.tsx', 'utf-8');
const lines = code.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('.map(') && lines[i].includes('=>')) {
    let hasKey = false;
    for (let j = i; j < Math.min(i + 4, lines.length); j++) {
      if (lines[j].includes('key=')) {
        hasKey = true;
        break;
      }
    }
    if (!hasKey) {
      console.log('Line', i + 1, ':', lines.slice(i, i+3).join('\n'));
    }
  }
}
