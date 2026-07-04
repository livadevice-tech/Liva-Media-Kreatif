const fs = require('fs');

try {
  let app = fs.readFileSync('src/App.tsx', 'utf8');

  // Change all 3xl to 2xl for live performance tab
  app = app.replace(/className="text-3xl font-black text-slate-800"/g, 'className="text-2xl font-black text-slate-800 mt-1"');

  // Also apply it to engagement tab so they all look consistent and big
  app = app.replace(/className="text-lg font-black text-slate-800"/g, 'className="text-2xl font-black text-slate-800 mt-1"');
  app = app.replace(/className="text-lg text-emerald-600 font-black"/g, 'className="text-2xl text-emerald-600 font-black mt-1"');
  app = app.replace(/className="text-lg text-indigo-600 font-extrabold"/g, 'className="text-2xl text-indigo-600 font-extrabold mt-1"');

  // Update outer wrappers of the live performance cards if they still have unnecessary flex classes
  // The user said make the cards like the engagement tab. The engagement tab outer wrapper is:
  // "bg-slate-50 border border-slate-100 rounded-xl p-4"
  app = app.replace(/className="bg-slate-50 border border-slate-100 rounded-xl p-4 flex flex-col justify-between"/g, 'className="bg-slate-50 border border-slate-100 rounded-xl p-4"');

  // Also replace any gap/mb in inner wrapper of live performance
  app = app.replace(/className="flex justify-between items-start mb-1"/g, 'className="flex justify-between items-start mb-1"'); // remains the same

  fs.writeFileSync('src/App.tsx', app, 'utf8');
  console.log('Update successful');
} catch (e) {
  console.error(e);
}
