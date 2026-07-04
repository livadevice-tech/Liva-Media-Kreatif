import fs from 'fs';
import ts from 'typescript';

const source = fs.readFileSync('src/App.tsx', 'utf8');
const sourceFile = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest, true);

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
        // check if inside a JSX expression
        let isInsideJSX = false;
        let parent = node.parent;
        while(parent) {
             if (ts.isJsxExpression(parent)) {
                  isInsideJSX = true;
                  break;
             }
             parent = parent.parent;
        }
        if (isInsideJSX) {
             node.elements.forEach(el => checkJSXReturn(el));
        }
    }
    ts.forEachChild(node, visit);
}

visit(sourceFile);
console.log(missingKeys);
