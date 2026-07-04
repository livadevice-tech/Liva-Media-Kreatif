const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

const lines = c.split('\n');
for(let i=0; i<lines.length; i++) {
    const line = lines[i];
    if (line.includes('.map(')) {
        let block = lines.slice(i, i+10).join('\n');
        let idx = block.indexOf('=>');
        if (idx !== -1) {
            let afterArrow = block.slice(idx + 2);
            let match = afterArrow.match(/<[a-zA-Z0-9_]+[^>]*>/);
            if (match && match.length > 0) {
                let tag = match[0];
                if (!tag.includes('key=')) {
                    console.log("Possible missing key at line " + (i+1));
                    console.log(tag);
                }
            }
        }
    }
}
