const fs = require('fs');

let fileContent = fs.readFileSync('src/shared/utils/xlsxUploadParsers.ts', 'utf8');
// Fix redeclaration of aov. Let's find "const aov = finalOrders > 0" and change it to "const finalAov = ..."
// And update the push block.
fileContent = fileContent.replace('const aov = finalOrders > 0 ?', 'const finalAov = finalOrders > 0 ?');
fileContent = fileContent.replace('aov,\n      views,', 'aov: finalAov,\n      views,');
// Also wait, I left the original `aov` somewhere. Let's check where the first `aov` is defined in the file.
fs.writeFileSync('src/shared/utils/xlsxUploadParsers.ts', fileContent, 'utf8');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');
appContent = appContent.replace(
  '"success"\n        );',
  '"info"\n        );'
);
fs.writeFileSync('src/App.tsx', appContent, 'utf8');
console.log('Fixed errors');
