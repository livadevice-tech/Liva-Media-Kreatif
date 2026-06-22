const fs = require('fs');

try {
  let app = fs.readFileSync('src/App.tsx', 'utf8');

  // Change 2xl to xl
  app = app.replace(/className="text-2xl font-black text-slate-800 mt-1"/g, 'className="text-xl font-black text-slate-800 mt-1"');
  app = app.replace(/className="text-2xl text-emerald-600 font-black mt-1"/g, 'className="text-xl text-emerald-600 font-black mt-1"');
  app = app.replace(/className="text-2xl text-indigo-600 font-extrabold mt-1"/g, 'className="text-xl text-indigo-600 font-extrabold mt-1"');

  fs.writeFileSync('src/App.tsx', app, 'utf8');
  console.log('Update successful');
} catch (e) {
  console.error(e);
}
