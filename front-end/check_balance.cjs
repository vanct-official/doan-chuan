const fs = require('fs');
const content = fs.readFileSync('src/pages/customer/TourDetailPage.jsx', 'utf8');

let depth = 0;
let parens = 0;
for (let i = 0; i < content.length; i++) {
  if (content[i] === '{') depth++;
  if (content[i] === '}') depth--;
  if (content[i] === '(') parens++;
  if (content[i] === ')') parens--;
}
console.log('depth ({}):', depth);
console.log('parens (()):', parens);
