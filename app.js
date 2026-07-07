// Entry file for Hostinger Node.js environments (Phusion Passenger / LiteSpeed)
// that require an app.js at the root of the project.
// Make sure you run 'npm run build' before deploying.
//
// NOTE: We use createRequire so this ESM module can load the CommonJS bundle
// produced by the build script (dist/server.cjs).
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';

process.env.NODE_ENV = 'production';

const require = createRequire(import.meta.url);
const __dirname = path.dirname(fileURLToPath(import.meta.url));

require(path.join(__dirname, 'dist', 'server.cjs'));
