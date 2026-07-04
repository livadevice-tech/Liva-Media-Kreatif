const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// The Total Perolehan GMV line grid
code = code.replace(/<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">/g, 
'<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">');

// Add truncate to text-xl sm:text-2xl font-black text-slate-800
code = code.replace(/className="text-xl sm:text-2xl font-black text-slate-800"/g,
'className="text-xl sm:text-2xl font-black text-slate-800 truncate"');

fs.writeFileSync('src/App.tsx', code);
console.log('UI Patched Step 2');
