const fs = require('fs');
let c = fs.readFileSync('src/pages/customer/TourDetailPage.jsx', 'utf8');

const missingVars = `
  const isCreatorOrAdmin = isLeaderOrCreator || isAdminPath;
  const canEditItinerary = isLeaderOrCreator || isAdminPath;
`;

if (!c.includes('const isCreatorOrAdmin =')) {
  const returnPattern = "  return (\r\n    <Box sx={{ height: '100vh'";
  const returnPatternUnix = "  return (\n    <Box sx={{ height: '100vh'";
  let idx = c.indexOf(returnPattern);
  if (idx === -1) idx = c.indexOf(returnPatternUnix);
  
  if (idx !== -1) {
    c = c.substring(0, idx) + missingVars + '\n' + c.substring(idx);
    console.log("Injected vars");
  } else {
    console.log('Could not find return index for vars injection!');
  }
}

fs.writeFileSync('src/pages/customer/TourDetailPage.jsx', c);
console.log("Done");
