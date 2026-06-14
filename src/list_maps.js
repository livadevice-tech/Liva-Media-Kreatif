import fs from 'fs';
import ts from 'typescript';

const source = fs.readFileSync('src/App.tsx', 'utf8');
const sourceFile = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest, true);

function visit(node) {
    if (ts.isCallExpression(node)) {
        if (ts.isPropertyAccessExpression(node.expression) && node.expression.name.getText() === 'map') {
            const arg = node.arguments[0];
            if (arg && (ts.isArrowFunction(arg) || ts.isFunctionExpression(arg))) {
                let line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
                console.log("Found map at line: " + line);
            }
        }
    }
    ts.forEachChild(node, visit);
}

visit(sourceFile);
