const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const target = 'if (url) return <img src={url} className={} alt="Liva Agency Logo" />;';
const replace = 'if (url) return <img src={url} className={`object-contain ${className}`} alt="Liva Agency Logo" />;';
code = code.replace(target, replace);

fs.writeFileSync('src/App.tsx', code);
console.log('App.tsx LivaLogo className fixed.');
