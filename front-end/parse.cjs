const fs = require('fs');
const acorn = require('acorn');
const jsx = require('acorn-jsx');

const code = fs.readFileSync('src/pages/customer/TourDetailPage.jsx', 'utf8');

try {
  acorn.Parser.extend(jsx()).parse(code, {
    sourceType: 'module',
    ecmaVersion: 2020
  });
  console.log('No syntax error found.');
} catch (err) {
  console.error('Syntax Error at line:', err.loc.line, 'col:', err.loc.column);
  console.error(err.message);
  const lines = code.split('\n');
  const start = Math.max(0, err.loc.line - 5);
  const end = Math.min(lines.length, err.loc.line + 5);
  for (let i = start; i < end; i++) {
    const prefix = (i + 1) === err.loc.line ? '> ' : '  ';
    console.log(prefix + (i + 1) + ': ' + lines[i]);
  }
}
