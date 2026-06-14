const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

const lines = c.split('\n');
for(let i=0; i<lines.length; i++) {
    const line = lines[i];
    if (line.includes('.map(')) {
        let block = lines.slice(i, i+6).join('\n');
        if (block.includes('=>') && block.includes('<')) {
            let nextTags = block.match(/<[a-zA-Z0-9_]+[^>]*>/g);
            if (nextTags && nextTags.length > 0 && nextTags[0] && !nextTags[0].includes('key=')) {
                // Ignore Fragments if they aren't written with key but they generally don't error unless it's a real element or <React.Fragment key=...>
                if (!nextTags[0].startsWith('</') && !nextTags[0].startsWith('<>')) {
                    console.log('Possible missing key around line ' + (i+1) + ': ' + nextTags[0]);
                }
            }
        }
    }
}
