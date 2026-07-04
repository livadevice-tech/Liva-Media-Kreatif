const fs = require('fs');

try {
  let app = fs.readFileSync('src/App.tsx', 'utf8');
  
  // Replace card wrappers
  app = app.replace(/className="bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"/g, 'className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between"');
  
  // Replace card wrappers for Engagement Metrics
  app = app.replace(/className="bg-slate-50 rounded-2xl p-4 sm:p-5 lg:p-6 border border-slate-200 shadow-sm flex flex-col justify-between hover:shadow-md transition-shadow"/g, 'className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between"');

  // Next steps: inner wrappers
  // Title wrappers
  app = app.replace(/className="flex justify-between items-start mb-2 gap-1 sm:gap-2 flex-wrap sm:flex-nowrap"/g, 'className="flex justify-between items-start mb-1"');
  
  // Titles text style
  app = app.replace(/className="text-\[9px\] sm:text-\[10px\] font-black text-slate-500 uppercase tracking-wider leading-tight flex-1"/g, 'className="text-[10px] font-bold text-slate-500 uppercase tracking-wider flex-1"');
  
  // Values text style
  app = app.replace(/className="text-base sm:text-lg lg:text-xl font-black tracking-tight text-slate-900 mt-1 xl:mt-2"/g, 'className="text-3xl font-black text-slate-800"'); // Changed to text-3xl to match screenshot better
  
  fs.writeFileSync('src/App.tsx', app, 'utf8');
  console.log('Update successful');
} catch (e) {
  console.error(e);
}
