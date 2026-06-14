const fs = require('fs');
const ts = require('typescript');

function checkArrayInFile2(filename) {
    const source = fs.readFileSync(filename, 'utf8');
    const sourceFile = ts.createSourceFile(filename, source, ts.ScriptTarget.Latest, true);
    let missingKeys = [];

    function checkJSXReturn(node) {
        if(!node) return;
        if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
            let tag = ts.isJsxElement(node) ? node.openingElement : node;
            let hasKey = tag.attributes.properties.some(p => p.name && p.name.getText() === 'key');
            if (!hasKey) {
                let line = sourceFile.getLineAndCharacterOfPosition(tag.getStart()).line + 1;
                missingKeys.push({type: tag.tagName.getText(), line: line, source: 'array'});
            }
        }
    }

    function visit(node) {
        if (ts.isArrayLiteralExpression(node)) {
            // Check if ANY element is JSX
            let hasJSX = node.elements.some(el => ts.isJsxElement(el) || ts.isJsxSelfClosingElement(el));
            if (hasJSX) {
                node.elements.forEach(el => checkJSXReturn(el));
            }
        }
        ts.forEachChild(node, visit);
    }
    visit(sourceFile);
    return missingKeys;
}

const glob = require('fs');
let toCheck = ['src/App.tsx', 'src/LandingPage.tsx'];
let compFiles = glob.readdirSync('src/components').filter(f => f.endsWith('.tsx')).map(f => 'src/components/' + f);
toCheck = toCheck.concat(compFiles);

for (let file of toCheck) {
   let res = checkArrayInFile2(file);
   if (res.length > 0) console.log(file, res);
}
