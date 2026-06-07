const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'front-end/src/pages/customer/TourDetailPage.jsx');
let content = fs.readFileSync(filePath, 'utf-8');

content = content.replace(/import \{ toast \} from 'react-toastify';\n/, '');
content = content.replace(/toast\.success/g, 'setActionSuccess');
content = content.replace(/toast\.error/g, 'setActionError');

fs.writeFileSync(filePath, content, 'utf-8');
console.log('Fixed toast in TourDetailPage.jsx!');
