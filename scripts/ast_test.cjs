const fs = require('fs');
const ts = require('typescript');
const code = fs.readFileSync('src/App.tsx', 'utf8');
const sf = ts.createSourceFile('App.tsx', code, ts.ScriptTarget.Latest, true);

let totalMaps = 0;
let mapsReturningJsx = 0;
let missingKeys = [];

function visit(node) {
  if (ts.isCallExpression(node)) {
    const expr = node.expression;
    if (ts.isPropertyAccessExpression(expr) && expr.name.text === 'map') {
       totalMaps++;
       const mapCb = node.arguments[0];
       let returnsJsx = false;
       let hasKey = false;
       let locs = [];

       function checkJsx(bodyNode) {
          if (ts.isJsxElement(bodyNode) || ts.isJsxSelfClosingElement(bodyNode)) {
             returnsJsx = true;
             const op = ts.isJsxElement(bodyNode) ? bodyNode.openingElement : bodyNode;
             const keyAttr = op.attributes.properties.find(p => p.name && p.name.text === 'key');
             if (keyAttr) hasKey = true;
             else locs.push(sf.getLineAndCharacterOfPosition(op.pos).line + 1);
          } else if (ts.isJsxFragment(bodyNode)) {
             returnsJsx = true;
             locs.push(sf.getLineAndCharacterOfPosition(bodyNode.pos).line + 1);
          } else if (ts.isReturnStatement(bodyNode) && bodyNode.expression) {
             checkJsx(bodyNode.expression);
          } else if (ts.isParenthesizedExpression(bodyNode)) {
             checkJsx(bodyNode.expression);
          } else if (ts.isArrowFunction(bodyNode) || ts.isFunctionExpression(bodyNode)) {
             checkJsx(bodyNode.body);
          } else if (ts.isBlock(bodyNode)) {
             ts.forEachChild(bodyNode, c => { if(ts.isReturnStatement(c)) checkJsx(c); });
          } else if (ts.isConditionalExpression(bodyNode)) {
             checkJsx(bodyNode.whenTrue);
             checkJsx(bodyNode.whenFalse);
          }
       }
       if (mapCb) checkJsx(mapCb);
       
       if (returnsJsx && !hasKey) {
          const m = sf.getLineAndCharacterOfPosition(node.pos).line + 1;
          missingKeys.push(m + ' (jsxs at ' + locs.join(',') + ')');
       }
       if (returnsJsx && hasKey) {
           mapsReturningJsx++;
       }
    }
  }
  ts.forEachChild(node, visit);
}
visit(sf);
console.log('Total Maps:', totalMaps);
console.log('Maps Returning JSX:', mapsReturningJsx);
console.log('Missing Keys locs:', missingKeys);
