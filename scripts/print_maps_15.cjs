const fs = require('fs');
const lines = fs.readFileSync('src/App.tsx', 'utf-8').split('\n');
for(let i=0; i<lines.length; i++) {
  if (lines[i].includes('.map(') && lines[i].includes('=>')) {
    console.log('--- MAP at', i+1);
    for(let j=i; j<i+15 && j<lines.length; j++) {
       console.log(j+1 + ':', lines[j]);
    }
  }
}
