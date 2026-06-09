const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Title format
code = code.replace(/className="text-\[10px\] sm:text-xs font-bold text-slate-500 uppercase tracking-widest leading-tight"/g, 
  'className="text-[9px] sm:text-[10px] font-black text-slate-500 uppercase tracking-wider leading-tight flex-1"');

// Modify value format
code = code.replace(/className="text-lg sm:text-xl lg:text-2xl font-black tracking-tight text-slate-900 mt-1 sm:mt-2 truncate"/g, 
  'className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 mt-2 truncate"');

fs.writeFileSync('src/App.tsx', code);
console.log('UI Patched Step 3');
