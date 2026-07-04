const React = require('react');
const ReactDOMServer = require('react-dom/server');

const arr = [1, 2];
try {
  let res = ReactDOMServer.renderToString(React.createElement('div', null, arr.map((x, i) => React.createElement('div', {key: undefined}, x))));
  console.log(res);
} catch (e) {
  console.log(e);
}
