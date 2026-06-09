const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf-8');

// Section Titles
code = code.replace(/<h4 className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider">Sale Metrics<\/h4>/g, 
  '<h4 className="text-sm md:text-base font-black text-slate-900 mb-4 uppercase tracking-widest">Sale Metrics</h4>');
  
code = code.replace(/<h4 className="text-xs font-bold text-slate-800 mb-3 uppercase tracking-wider">Engagement Metrics<\/h4>/g, 
  '<h4 className="text-sm md:text-base font-black text-slate-900 mb-4 uppercase tracking-widest mt-8">Engagement Metrics</h4>');

// Grid responsiveness
code = code.replace(/<div className="grid grid-cols-2 lg:grid-cols-5 gap-3">/g, 
  '<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4 lg:gap-5">');

// Label formatting
code = code.replace(/className="text-\[10px\] text-slate-500 font-bold uppercase tracking-tight"/g, 
  'className="text-[10px] sm:text-xs font-bold text-slate-500 uppercase tracking-widest leading-tight"');

// Value formatting
code = code.replace(/className="text-xl font-black tracking-tight text-slate-900 leading-none"/g, 
  'className="text-lg sm:text-xl lg:text-2xl font-black tracking-tight text-slate-900 mt-1 sm:mt-2 truncate"');

// Card padding
code = code.replace(/className="bg-white rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between"/g, 
  'className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"');
code = code.replace(/className="bg-\[#f8fafc\] rounded-xl p-4 border border-slate-200 shadow-sm flex flex-col justify-between"/g, 
  'className="bg-slate-50 rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"');

fs.writeFileSync('src/App.tsx', code);
console.log('UI Patched');
