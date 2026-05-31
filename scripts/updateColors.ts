import fs from 'fs';
const file = 'src/LandingPage.tsx';
let content = fs.readFileSync(file, 'utf-8');
content = content.replace(/rose/g, 'violet').replace(/orange/g, 'fuchsia');
fs.writeFileSync(file, content);
console.log('Colors replaced successfully!');
