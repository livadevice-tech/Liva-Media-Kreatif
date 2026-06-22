const fs = require('fs');

try {
  let app = fs.readFileSync('src/App.tsx', 'utf8');

  // Change initial states
  app = app.replace(/const \[platformFilter, setPlatformFilter\] = useState\("Semua Platform"\);/g, 'const [platformFilter, setPlatformFilter] = useState("TikTok Live");');
  app = app.replace(/const \[dbPlatformFilter, setDbPlatformFilter\] = useState\("Semua Platform"\);/g, 'const [dbPlatformFilter, setDbPlatformFilter] = useState("TikTok Live");');
  app = app.replace(/const \[operatorPlatformFilter, setOperatorPlatformFilter\] = useState\(""\);/g, 'const [operatorPlatformFilter, setOperatorPlatformFilter] = useState("TikTok Live");');
  app = app.replace(/const \[clientPlatformFilter, setClientPlatformFilter\] = useState\(""\);/g, 'const [clientPlatformFilter, setClientPlatformFilter] = useState("TikTok Live");');

  // Also replace any options
  app = app.replace(/<option value="Semua Platform">Semua Platform<\/option>/g, '');
  app = app.replace(/<option value="">\s*Semua Platform\s*<\/option>/g, '');
  app = app.replace(/<option value="">Semua Platform<\/option>/g, '');

  fs.writeFileSync('src/App.tsx', app, 'utf8');
  console.log('Update successful');
} catch (e) {
  console.error(e);
}
