const fs = require('fs');
const ts = require('typescript');

const code = fs.readFileSync('src/App.tsx', 'utf8');

const sourceFile = ts.createSourceFile(
  'App.tsx',
  code,
  ts.ScriptTarget.Latest,
  true
);

function visit(node) {
  if (ts.isCallExpression(node)) {
    const expr = node.expression;
    if (ts.isPropertyAccessExpression(expr) && expr.name.text === 'map') {
       // It's a .map() call. Let's find the returned JSX elements.
       const mapCb = node.arguments[0];
       if (mapCb) {
          findJsxReturns(mapCb, node);
       }
    }
  }
  ts.forEachChild(node, visit);
}

function findJsxReturns(node, mapCallNode) {
   if (ts.isJsxElement(node) || ts.isJsxSelfClosingElement(node)) {
      const openingElement = ts.isJsxElement(node) ? node.openingElement : node;
      const attrMatch = openingElement.attributes.properties.find(p => p.name && p.name.text === 'key');
      if (!attrMatch) {
         const { line, character } = sourceFile.getLineAndCharacterOfPosition(openingElement.pos);
         console.log(`Missing key prop at line ${line + 1}:${character + 1} for map call at line ${sourceFile.getLineAndCharacterOfPosition(mapCallNode.pos).line + 1}`);
      }
      return; // Stop at top level JSX element returned
   }
   if (ts.isJsxFragment(node)) {
      const { line, character } = sourceFile.getLineAndCharacterOfPosition(node.pos);
      console.log(`Missing key prop (Fragment) at line ${line + 1}:${character + 1} for map call at line ${sourceFile.getLineAndCharacterOfPosition(mapCallNode.pos).line + 1}`);
      return;
   }
   if (ts.isReturnStatement(node)) {
       if (node.expression) findJsxReturns(node.expression, mapCallNode);
       return;
   }
   if (ts.isParenthesizedExpression(node)) {
       findJsxReturns(node.expression, mapCallNode);
       return;
   }
   if (ts.isArrowFunction(node) || ts.isFunctionExpression(node)) {
       findJsxReturns(node.body, mapCallNode);
       return;
   }
   if (ts.isBlock(node)) {
       ts.forEachChild(node, child => {
           if (ts.isReturnStatement(child)) findJsxReturns(child, mapCallNode);
       });
       return;
   }
   if (ts.isConditionalExpression(node)) {
      findJsxReturns(node.whenTrue, mapCallNode);
      findJsxReturns(node.whenFalse, mapCallNode);
      return;
   }
   // Sometimes the map callback body is a Block which we caught, or directly a JSX Element
   // Handled above.
}

visit(sourceFile);
