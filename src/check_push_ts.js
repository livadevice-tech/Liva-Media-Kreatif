import fs from 'fs';
import ts from 'typescript';

const source = fs.readFileSync('src/App.tsx', 'utf8');
const sourceFile = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest, true);

let missingKeys = [];

function checkJSXReturn(node) {
    if(!node) return false;
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
        let tag = ts.isJsxElement(node) ? node.openingElement : node;
        let hasKey = tag.attributes.properties.some(p => p.name && p.name.getText() === 'key');
        if (!hasKey) {
            let line = sourceFile.getLineAndCharacterOfPosition(tag.getStart()).line + 1;
            missingKeys.push({type: tag.tagName.getText(), line: line, source: 'jsx-push'});
        }
        return true;
    } else if (ts.isJsxFragment(node)) {
        let line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        missingKeys.push({type: 'Fragment', line: line, source: 'fragment-push'});
        return true;
    }
    return false;
}

function visit(node) {
    if (ts.isCallExpression(node)) {
        if (ts.isPropertyAccessExpression(node.expression) && node.expression.name.getText() === 'push') {
            node.arguments.forEach(arg => checkJSXReturn(arg));
        }
    }
    ts.forEachChild(node, visit);
}

visit(sourceFile);
console.log(missingKeys.filter(x => !['td', 'th', 'path', 'circle', 'line', 'svg'].includes(x.type)));
