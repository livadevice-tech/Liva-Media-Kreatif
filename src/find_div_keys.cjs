const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

const lines = c.split('\n');
for(let i=0; i<lines.length; i++) {
    const line = lines[i];
    if (line.includes('.map(')) {
        let block = lines.slice(i, i+6).join('\n');
        if (block.includes('=>') && block.match(/=>\s*\(?\s*<div/)) {
           let matches = block.match(/<div[^>]*>/);
           if (matches && matches.length > 0) {
               let tag = matches[0];
               if (!tag.includes('key=')) {
                   console.log("Missing key div rooted in map at line " + (i+1));
                   console.log(tag);
               }
           }
        }
    }
}
