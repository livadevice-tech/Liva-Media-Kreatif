const fs = require('fs');
const ts = require('typescript');

const source = fs.readFileSync('src/App.tsx', 'utf8');
const sourceFile = ts.createSourceFile('App.tsx', source, ts.ScriptTarget.Latest, true);

function visit(node) {
    if (ts.isCallExpression(node)) {
        if (ts.isPropertyAccessExpression(node.expression) && node.expression.name.getText() === 'map') {
            const arg = node.arguments[0];
            if (arg && (ts.isArrowFunction(arg) || ts.isFunctionExpression(arg))) {
                const body = arg.body;
                if (ts.isBlock(body)) {
                    body.statements.forEach(stmt => {
                        if (ts.isReturnStatement(stmt) && stmt.expression) {
                           if (!ts.isJsxElement(stmt.expression) && !ts.isJsxSelfClosingElement(stmt.expression) && !ts.isJsxFragment(stmt.expression) && !ts.isParenthesizedExpression(stmt.expression) && !ts.isConditionalExpression(stmt.expression)) {
                               let line = sourceFile.getLineAndCharacterOfPosition(stmt.getStart()).line + 1;
                               console.log(`Line ${line}: Returns non-JSX in map: ` + stmt.expression.getText());
                           }
                        }
                    });
                } else if (!ts.isJsxElement(body) && !ts.isJsxSelfClosingElement(body) && !ts.isJsxFragment(body) && !ts.isParenthesizedExpression(body) && !ts.isConditionalExpression(body) && !ts.isIdentifier(body)) {
                    let line = sourceFile.getLineAndCharacterOfPosition(body.getStart()).line + 1;
                    console.log(`Line ${line}: Arrow Returns non-JSX in map: ` + body.getText().substring(0, 50));
                }
            }
        }
    }
    ts.forEachChild(node, visit);
}

visit(sourceFile);
