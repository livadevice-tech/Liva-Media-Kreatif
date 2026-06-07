process.env.NODE_ENV = 'production';
// Entry file for Hostinger Node.js environments (Phusion Passenger / LiteSpeed)
// that require an app.js at the root of the project.
// Make sure you run 'npm run build' before pointing to this on your server.
import './dist/server.cjs';
