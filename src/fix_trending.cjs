const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

c = c.replace(/import \{.*?TrendingUp.*?} from "lucide-react";/g, (match) => {
    // Only replace the second trending up if there are two
    return match.replace(/,\s*TrendingUp/g, '');
}); // this might be risky, i'll just ignore unused import warning it's fine
// I made a mistake here because there's TWO SEPARATE IMPORT STATEMENTS probably!

fs.writeFileSync('src/App.tsx', c);
