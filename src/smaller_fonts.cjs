const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// The original lines might be text-lg sm:text-[19px] lg:text-xl font-black tracking-tight text-slate-900 mt-2 truncate
// or text-lg sm:text-[19px] lg:text-xl font-black text-slate-800 truncate
// Let's replace both.
code = code.replace(/text-lg sm:text-\[19px\] lg:text-xl font-black tracking-tight text-slate-900 mt-2 truncate/g,
  'text-[15px] sm:text-base lg:text-lg font-black tracking-tight text-slate-900 mt-1');
  
code = code.replace(/text-lg sm:text-\[19px\] lg:text-xl font-black text-slate-800 truncate/g,
  'text-[15px] sm:text-base lg:text-lg font-black text-slate-800 tracking-tight mt-1');

// Wait! Also the old `text-xl sm:text-2xl` might still be somewhere? Let's be thorough.
code = code.replace(/text-xl sm:text-2xl font-black text-slate-800 truncate/g,
  'text-[15px] sm:text-base lg:text-lg font-black text-slate-800 tracking-tight mt-1');

code = code.replace(/text-xl sm:text-2xl font-black tracking-tight text-slate-900 mt-2 truncate/g,
  'text-[15px] sm:text-base lg:text-lg font-black tracking-tight text-slate-900 mt-1');

fs.writeFileSync('src/App.tsx', code);
console.log('Fonts made smaller');
