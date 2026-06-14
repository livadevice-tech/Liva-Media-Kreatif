import fs from 'fs';
import ts from 'typescript';

const source = fs.readFileSync('src/App.tsx', 'utf8');
const sourceFile = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest, true);

let missingKeys = [];

function checkJSXReturn(node) {
    if(!node) return false;
    if (ts.isIdentifier(node)) {
        // returning an identifier: `return myElem;`
        let line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        missingKeys.push({type: 'Identifier', line, text: node.getText()});
        return true;
    }
}

function visit(node) {
    if (ts.isCallExpression(node)) {
        if (ts.isPropertyAccessExpression(node.expression) && node.expression.name.getText() === 'map') {
            const arg = node.arguments[0];
            if (arg && (ts.isArrowFunction(arg) || ts.isFunctionExpression(arg))) {
                const body = arg.body;
                if (ts.isBlock(body)) {
                    body.statements.forEach(stmt => {
                        if (ts.isReturnStatement(stmt) && stmt.expression) {
                            checkJSXReturn(stmt.expression);
                        }
                    });
                }
            }
        }
    }
    ts.forEachChild(node, visit);
}

visit(sourceFile);
console.log(missingKeys);
