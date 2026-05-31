import fs from 'fs';
let code = fs.readFileSync('src/App.tsx', 'utf8');
const startMatch = "            {/* ==================== SUBTAB: REPORTING BRAND ==================== */}";
const endMatch = "            {/* ==================== SUBTAB: LEADS / CALON KLIEN ==================== */}";
const startIdx = code.indexOf(startMatch);
const endIdx = code.indexOf(endMatch);
if (startIdx !== -1 && endIdx !== -1) {
  const newCode = code.substring(0, startIdx) + code.substring(endIdx);
  fs.writeFileSync('src/App.tsx', newCode);
  console.log("Deleted reporting brand block successfully.");
} else {
  console.log("Could not find start or end match");
}
