const React = require('react');
const ReactDOMServer = require('react-dom/server');

try {
  let res = ReactDOMServer.renderToString(React.createElement('div', null, ['a', 'b']));
  console.log(res);
} catch (e) {
  console.log(e);
}
