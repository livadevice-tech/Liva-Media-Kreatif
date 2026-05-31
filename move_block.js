const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const tableFiltersStartStr = '                             {/* Table Filters */}';
// find where Table Filters ends. It ends with a <div> followed by {/* Table */}
const tableFiltersEndStr = '                             {/* Table */}';

let startIdx = code.indexOf(tableFiltersStartStr);
let endIdx = code.indexOf(tableFiltersEndStr);

if(startIdx !== -1 && endIdx !== -1) {
  let subBlock = code.substring(startIdx, endIdx);
  
  // delete it from there
  code = code.substring(0, startIdx) + code.substring(endIdx);
  
  // insert before Time & Day Analytics
  const targetStr = '                              {/* Time & Day Analytics */}';
  let targetIdx = code.indexOf(targetStr);
  
  if (targetIdx !== -1) {
    code = code.substring(0, targetIdx) + subBlock + code.substring(targetIdx);
    fs.writeFileSync('src/App.tsx', code);
    console.log("Moved successfully.");
  } else {
    console.log("target not found");
  }
} else {
  console.log("table filters block not found", startIdx, endIdx);
}
