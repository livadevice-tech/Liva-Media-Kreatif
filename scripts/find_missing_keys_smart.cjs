const fs = require('fs');

const glob = require('fs');
let toCheck = ['src/App.tsx', 'src/LandingPage.tsx'];
let compFiles = glob.readdirSync('src/components').filter(f => f.endsWith('.tsx')).map(f => 'src/components/' + f);
toCheck = toCheck.concat(compFiles);

for (let file of toCheck) {
   if (!fs.existsSync(file)) continue;
   let lines = fs.readFileSync(file, 'utf8').split('\n');
   for (let i = 0; i < lines.length; i++) {
       if (lines[i].includes('.map(') && lines.slice(i, i+15).some(l => /return\s*</.test(l) || /=>\s*</.test(l) || /=>\s*\(/.test(l) || /=>\s*\w*\s*</.test(l) || /<[a-zA-Z]/.test(l))) {
           // It's likely a React map returning JSX
           let hasKey = lines.slice(i, i+15).some(l => l.includes('key='));
           if (!hasKey) {
               console.log(`\n\n=== NO KEY DETECTED ===\n${file}:${i+1} ---`);
               for (let j = Math.max(0, i - 1); j < Math.min(lines.length, i + 8); j++) {
                   console.log(`${j+1}: ${lines[j]}`);
               }
           }
       }
   }
}
