const fs = require('fs');

const code = fs.readFileSync('src/App.tsx', 'utf-8');
const lines = code.split('\n');

let balance = 0;
for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  
  // A naive tag balancer to see where it breaks.
  const openDivs = (line.match(/<div(\s|>)/g) || []).length;
  let closeDivs = (line.match(/<\/div>/g) || []).length;
  // account for self closing? No divs don't self close.
  
  if (line.includes('//') && !line.match(/<div.*?(\/\/.*)/)) {
     // ignore comments generally, but regex is weak
  }
  
  balance += openDivs;
  balance -= closeDivs;
  
  // if (i > 4500 && i < 5350) console.log(`Line ${i+1}: Open: ${openDivs}, Close: ${closeDivs}, Bal: ${balance}`);
}

console.log("Final balance:", balance);
