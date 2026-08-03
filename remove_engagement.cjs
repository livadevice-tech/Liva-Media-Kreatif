const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// Use a regex to find the clientReportingTab engagement rendering block and remove it.
const clientEngagementRegex = /\{\s*clientReportingTab\s*===\s*"engagement"\s*&&\s*\([\s\S]*?<EngagementReportPanel[\s\S]*?\/>\s*\)\s*\}/g;
content = content.replace(clientEngagementRegex, '');

// Use a regex to find the operatorReportingTab engagement rendering block and remove it.
const operatorEngagementRegex = /\{\s*operatorReportingTab\s*===\s*"engagement"\s*&&\s*\([\s\S]*?<EngagementReportPanel[\s\S]*?\/>\s*\)\s*\}/g;
content = content.replace(operatorEngagementRegex, '');

fs.writeFileSync('src/App.tsx', content, 'utf8');
console.log('Removed engagement tab renderings');
