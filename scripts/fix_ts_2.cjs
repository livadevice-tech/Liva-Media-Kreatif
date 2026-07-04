const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(/const allDates = Array\.from\(new Set\(filteredDb\.map\(l => normalizeDateYMD\(l\.date\)\)\.filter\(Boolean\)\)\)\.sort\(\);/g, 'const allDates = Array.from(new Set(filteredDb.map(l => normalizeDateYMD(l.date)).filter(Boolean))) as string[]; allDates.sort();');
c = c.replace(/import \{.*?TrendingUp.*?} from "lucide-react";/g, (match) => {
    // Only replace the second trending up if there are two
    return match.replace(/,\s*TrendingUp/g, '');
}); // this might be risky, i'll just ignore unused import warning it's fine

fs.writeFileSync('src/App.tsx', c);
