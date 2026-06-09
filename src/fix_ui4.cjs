const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/<div className="flex justify-between items-start mb-2">/g, 
  '<div className="flex justify-between items-start mb-2 gap-1 sm:gap-2 flex-wrap sm:flex-nowrap">');

fs.writeFileSync('src/App.tsx', code);
console.log('UI Patched flex');
