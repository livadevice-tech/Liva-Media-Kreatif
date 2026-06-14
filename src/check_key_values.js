import fs from 'fs';
import ts from 'typescript';

const source = fs.readFileSync('src/App.tsx', 'utf8');
const sourceFile = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest, true);

let questionableKeys = [];

function checkKeyAttribute(node) {
    if (ts.isJsxAttribute(node) && node.name.getText() === 'key') {
        const initializer = node.initializer;
        if (initializer && ts.isJsxExpression(initializer)) {
            const expr = initializer.expression;
            // check if it's a property access that could be undefined
            if (ts.isPropertyAccessExpression(expr)) {
                let line = sourceFile.getLineAndCharacterOfPosition(expr.getStart()).line + 1;
                questionableKeys.push({line: line, text: expr.getText()});
            }
        }
    }
    ts.forEachChild(node, checkKeyAttribute);
}

checkKeyAttribute(sourceFile);
console.log(questionableKeys);
