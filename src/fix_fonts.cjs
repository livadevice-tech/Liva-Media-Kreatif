const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 mt-2 truncate"/g, 
  'className="text-lg sm:text-[19px] lg:text-xl font-black tracking-tight text-slate-900 mt-2 truncate"');

fs.writeFileSync('src/App.tsx', code);
console.log('Fonts Patched');
