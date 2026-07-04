import fs from 'fs';
import ts from 'typescript';

let missingKeys = [];

function checkJSXReturn(node, sourceFile) {
    if(!node) return false;
    if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
        let tag = ts.isJsxElement(node) ? node.openingElement : node;
        let hasKey = tag.attributes.properties.some(p => p.name && p.name.getText() === 'key');
        if (!hasKey) {
            let line = sourceFile.getLineAndCharacterOfPosition(tag.getStart()).line + 1;
            missingKeys.push({file: sourceFile.fileName, type: tag.tagName.getText(), line: line, source: 'jsx'});
        }
        return true;
    } else if (ts.isJsxFragment(node)) {
        let line = sourceFile.getLineAndCharacterOfPosition(node.getStart()).line + 1;
        missingKeys.push({file: sourceFile.fileName, type: 'Fragment', line: line, source: 'fragment'});
        return true;
    } else if (ts.isParenthesizedExpression(node)) {
        return checkJSXReturn(node.expression, sourceFile);
    } else if (node.kind === ts.SyntaxKind.LogicalAnd || node.kind === ts.SyntaxKind.BinaryExpression || ts.isConditionalExpression(node)) {
         if (ts.isConditionalExpression(node)) {
              checkJSXReturn(node.whenTrue, sourceFile);
              checkJSXReturn(node.whenFalse, sourceFile);
         } else if (node.right) {
              checkJSXReturn(node.right, sourceFile);
         }
         return true;
    }
    return false;
}

function visit(node, sourceFile) {
    if (ts.isCallExpression(node)) {
        if (ts.isPropertyAccessExpression(node.expression) && node.expression.name.getText() === 'map') {
            const arg = node.arguments[0];
            if (arg && (ts.isArrowFunction(arg) || ts.isFunctionExpression(arg))) {
                const body = arg.body;
                if (ts.isBlock(body)) {
                    body.statements.forEach(stmt => {
                        if (ts.isReturnStatement(stmt) && stmt.expression) {
                            checkJSXReturn(stmt.expression, sourceFile);
                        }
                    });
                } else {
                    checkJSXReturn(body, sourceFile);
                }
            }
        }
    }
    ts.forEachChild(node, child => visit(child, sourceFile));
}

const files = ['src/App.tsx', 'src/components/DoubleDatePicker.tsx', 'src/components/InvoiceDashboard.tsx', 'src/LandingPage.tsx', 'src/main.tsx'];

files.forEach(f => {
   if(fs.existsSync(f)) {
      const source = fs.readFileSync(f, 'utf8');
      const sourceFile = ts.createSourceFile(f, source, ts.ScriptTarget.Latest, true);
      visit(sourceFile, sourceFile);
   }
});

console.log(missingKeys);
