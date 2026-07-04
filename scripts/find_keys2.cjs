const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');

const lines = c.split('\n');
lines.forEach((line, i) => {
    if (line.includes('.map(')) {
        let block = lines.slice(i, i+15).join('\n');
        // If it maps to a component but doesn't have a 'key=' in the first returned HTML tag
        // Very basic heuristic
        if (block.match(/\.map\([^)]*=>\s*\(?\s*<[a-zA-Z]+[^>]*>/) && !block.slice(0, block.indexOf('>')+1).includes('key=')) {
            // Find the index of the first '<' after '=>'
            const postArrow = block.split('=>')[1];
            if (postArrow) {
                const firstTag = postArrow.substring(postArrow.indexOf('<'), postArrow.indexOf('>') + 1);
                if (!firstTag.includes('key=')) {
                     console.log('Possible missing key around line ' + (i+1) + ': ' + firstTag.substring(0, 30));
                }
            }
        }
    }
});
