import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INIT_FILE = path.join(__dirname, 'public', 'piesne_init.json');
const MY_FILE = path.join(__dirname, 'public', 'piesne.json');

export function initPiesneJson() {
    if (fs.existsSync(MY_FILE)) return;
    try {
        fs.copyFileSync(INIT_FILE, MY_FILE);
        console.log('File copied successfully');
    } catch (err) {
        console.error('Copy failed:', err);
    }
}