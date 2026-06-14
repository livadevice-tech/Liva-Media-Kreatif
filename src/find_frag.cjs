const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

const lines = c.split('\n');
for(let i=0; i<lines.length; i++) {
    const line = lines[i];
    if (line.includes('.map(')) {
        let block = lines.slice(i, i+12).join('\n');
        let idx = block.indexOf('=>');
        if (idx !== -1) {
            let afterArrow = block.slice(idx + 2);
            // find the first tag
            let match = afterArrow.match(/<\/?([a-zA-Z0-9_]+)[^>]*>/);
            if (match && match.length > 0) {
                let tag = match[0];
                if (!tag.includes('key=') && !tag.startsWith('</')) {
                    console.log("Missing key at line " + (i+1));
                    console.log(tag);
                } else if (tag === '<>' || tag === '<React.Fragment>') {
                    console.log("Fragment mapped at line " + (i+1));
                }
            }
        }
    }
}
