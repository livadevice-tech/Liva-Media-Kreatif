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
            missingKeys.push({type: tag.tagName.getText(), line: line, source: 'jsx'});
        }
        return true;
    } else if (ts.isJsxFragment(node)) {
        let line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        missingKeys.push({type: 'Fragment', line: line, source: 'fragment'});
        return true;
    } else if (ts.isParenthesizedExpression(node)) {
        return checkJSXReturn(node.expression);
    } else if (node.kind === ts.SyntaxKind.LogicalAnd || node.kind === ts.SyntaxKind.BinaryExpression || ts.isConditionalExpression(node)) {
         if (ts.isConditionalExpression(node)) {
              checkJSXReturn(node.whenTrue);
              checkJSXReturn(node.whenFalse);
         } else if (node.right) {
              checkJSXReturn(node.right);
         }
         return true;
    }
    return false;
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
                } else {
                    checkJSXReturn(body);
                }
            }
        }
    }
    ts.forEachChild(node, visit);
}

visit(sourceFile);
console.log(missingKeys);
