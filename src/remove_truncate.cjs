const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

code = code.replace(/className="text-\[15px\] sm:text-base lg:text-lg font-black tracking-tight text-slate-900 mt-1"/g,
  'className="text-base sm:text-lg lg:text-xl font-black tracking-tight text-slate-900 mt-1 xl:mt-2"');
  
code = code.replace(/className="text-\[15px\] sm:text-base lg:text-lg font-black text-slate-800 tracking-tight mt-1"/g,
  'className="text-base sm:text-lg lg:text-xl font-black text-slate-800 tracking-tight mt-1 xl:mt-2"');

fs.writeFileSync('src/App.tsx', code);
console.log('Removed truncate, restored some size');
