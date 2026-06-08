const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/if \(operatorPlatformFilter\) \{\s*if \(log\.platform !== operatorPlatformFilter\) return false;\s*\}/g, `if (operatorPlatformFilter) {
                             if (!isPlatformMatch(log.platform, operatorPlatformFilter)) return false;
                           }`);

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed platform filters.');
