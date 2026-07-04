const fs = require('fs');
let lines = fs.readFileSync('src/App.tsx', 'utf8').split('\n');
const targets = [4242, 5064, 5117, 5798, 5799, 6334, 6338, 6339, 8989, 9054, 9062, 9094, 9107, 9116, 9125, 10531, 10584, 10873, 10951];

for (let t of targets) {
  console.log(`--- Line ${t} ---`);
  let start = Math.max(0, t - 5);
  let end = Math.min(lines.length, t + 5);
  for (let i = start; i < end; i++) {
     console.log(`${i+1}: ${lines[i]}`);
  }
}
