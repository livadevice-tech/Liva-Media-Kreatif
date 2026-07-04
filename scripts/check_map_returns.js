import fs from 'fs';
import ts from 'typescript';

const source = fs.readFileSync('src/App.tsx', 'utf8');
const sourceFile = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest, true);

function visit(node) {
    if (ts.isCallExpression(node)) {
        if (ts.isPropertyAccessExpression(node.expression) && node.expression.name.getText() === 'map') {
            const arg = node.arguments[0];
            if (arg && (ts.isArrowFunction(arg) || ts.isFunctionExpression(arg))) {
                let body = arg.body;
                let returnedNode = null;
                if (ts.isBlock(body)) {
                    body.statements.forEach(stmt => {
                        if (ts.isReturnStatement(stmt)) {
                            returnedNode = stmt.expression;
                        }
                    });
                } else {
                    returnedNode = body;
                }
                
                if (returnedNode) {
                    if (!ts.isJsxElement(returnedNode) && !ts.isJsxSelfClosingElement(returnedNode) && !ts.isJsxFragment(returnedNode) && !ts.isParenthesizedExpression(returnedNode)) {
                        let line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
                        console.log("Map returns non-JSX at line: " + line, returnedNode.kind);
                        console.log(returnedNode.getText());
                    }
                }
            }
        }
    }
    ts.forEachChild(node, visit);
}

visit(sourceFile);
