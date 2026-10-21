const fs = require('fs');
const parse5 = require('parse5');
const vm = require('vm');

console.log('Testing parse5 to DOM bridge...');
const html = fs.readFileSync('dist/otkrii-problema/index.html', 'utf8');
const ast = parse5.parse(html);
console.log('AST parsed successfully. Document type:', ast.nodeName);
