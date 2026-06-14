const fs = require('fs');

const glob = require('fs');
let toCheck = ['src/App.tsx', 'src/LandingPage.tsx'];
let compFiles = glob.readdirSync('src/components').filter(f => f.endsWith('.tsx')).map(f => 'src/components/' + f);
toCheck = toCheck.concat(compFiles);

for (let file of toCheck) {
   if (!fs.existsSync(file)) continue;
   let lines = fs.readFileSync(file, 'utf8').split('\n');
   for (let i = 0; i < lines.length; i++) {
       if (lines[i].includes('.map(')) {
           console.log(`\n--- ${file}:${i+1} ---`);
           for (let j = Math.max(0, i - 1); j < Math.min(lines.length, i + 6); j++) {
               console.log(`${j+1}: ${lines[j]}`);
           }
       }
   }
}
