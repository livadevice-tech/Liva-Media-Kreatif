const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');
const lines = content.split('\n');

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (line.includes('.map(') && !line.includes('key=')) {
    // Check next few lines for 'key=' or '<tag>'
    let tagsLines = line;
    for (let j = 1; j < 5 && i + j < lines.length; j++) {
      tagsLines += lines[i + j];
    }
    if (tagsLines.includes('<') && !tagsLines.includes('key={') && !tagsLines.includes('key=')) {
       console.log((i + 1) + ": " + line.trim());
    }
  }
}
