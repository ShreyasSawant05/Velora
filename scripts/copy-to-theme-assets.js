import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rootDir = path.resolve(__dirname, '..');
const distAssetsDir = path.join(rootDir, 'dist', 'assets');
const themeAssetsDir = path.join(rootDir, 'assets');

if (!fs.existsSync(themeAssetsDir)) {
  fs.mkdirSync(themeAssetsDir, { recursive: true });
}

if (fs.existsSync(distAssetsDir)) {
  const files = fs.readdirSync(distAssetsDir);
  for (const file of files) {
    if (file === 'app.js' || file.endsWith('.js')) {
      fs.copyFileSync(path.join(distAssetsDir, file), path.join(themeAssetsDir, file === 'app.js' ? 'app.js' : file));
      console.log(`Copied dist/assets/${file} -> assets/${file === 'app.js' ? 'app.js' : file}`);
    } else if (file === 'app.css' || file.endsWith('.css')) {
      fs.copyFileSync(path.join(distAssetsDir, file), path.join(themeAssetsDir, 'app.css'));
      console.log(`Copied dist/assets/${file} -> assets/app.css`);
    }
  }
}
