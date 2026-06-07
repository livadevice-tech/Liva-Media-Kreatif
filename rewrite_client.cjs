const fs = require('fs');

const code = fs.readFileSync('src/App.tsx', 'utf8');

const lines = code.split('\n');
const dbViewerStart = lines.findIndex(l => l.includes('STORED DATABASE VIEWER - NEW DESIGN'));
const dbViewerEnd = lines.findIndex((l, i) => i > dbViewerStart && l.includes('BATCH UPLOAD HISTORY VIEWER'));

if (dbViewerStart === -1 || dbViewerEnd === -1) {
  console.log("Could not find blocks");
  process.exit(1);
}

// Get the block of code
let dbViewerCode = lines.slice(dbViewerStart, dbViewerEnd).join('\n');

// Replace activeReportBrandId with loggedInClientBrandId so it uses the client's brand
dbViewerCode = dbViewerCode.replace(/activeReportBrandId/g, 'loggedInClientBrandId');

// Remove the ACTION column in the table since the user said no CRUD and no upload history
dbViewerCode = dbViewerCode.replace(/<th className="px-5 py-3\.5 text-right">Aksi<\/th>/g, '');

// The action column td looks like:
// <td className="px-5 py-3.5 text-right">
//   <button ... className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus Sesi">
//     <Trash2 className="w-3.5 h-3.5" />
//   </button>
// </td>
dbViewerCode = dbViewerCode.replace(/<td className="px-5 py-3\.5 text-right">\s*<button[\s\S]*?<Trash2[\s\S]*?<\/button>\s*<\/td>/g, '');

// Save to a file
fs.writeFileSync('db_viewer.tsx', dbViewerCode);
console.log("Wrote db_viewer.tsx");

// NOW, let's find the client viewport block inside App.tsx and REPLACE IT with dbViewerCode
const clientViewportStart = lines.findIndex(l => l.includes('<main id="client-main-viewport" className="flex-1 bg-slate-50 overflow-y-auto p-8 pt-6">'));
const clientViewportEnd = lines.findIndex((l, i) => i > clientViewportStart && l.includes('</main>') && lines[i-1].includes('</div>') && l.includes('</main>')); // Just try to find the matching closing tag. 

// Actually, we can manually replace the client viewport using multi-edit or just outputting the block
