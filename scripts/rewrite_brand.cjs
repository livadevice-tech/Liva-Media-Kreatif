const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(/livamedia\.com/g, 'livaagency.com');
code = code.replace(/LIVA MEDIA/g, 'LIVA AGENCY');
code = code.replace(/sistem livamedia/g, 'sistem Liva Agency');
code = code.replace(/Attendence System/g, 'Agency');
code = code.replace(/ATTENDENCE SYSTEM/g, 'AGENCY');
code = code.replace(/LIVA ATTENDENCE SYSTEM/g, 'LIVA AGENCY');
code = code.replace(/Liva Attendence System/g, 'Liva Agency');
code = code.replace(/livamedia/g, 'livaagency');

fs.writeFileSync('src/App.tsx', code);
