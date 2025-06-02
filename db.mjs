import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFile, writeFile } from 'fs/promises';

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

export function getSpevnik() {
    initPiesneJson();
    const data = fs.readFileSync(MY_FILE, 'utf8');
    const json = JSON.parse(data);
    return json;
}

export async function getSpevnikAsync() {
    initPiesneJson();
    const raw = await readFile(MY_FILE, 'utf8');
    const data = JSON.parse(raw);
    return data;
}
export async function addToJson(id, obj) {
    try {
        const raw = await readFile(MY_FILE, 'utf8');
        const data = JSON.parse(raw);

        if (data.hasOwnProperty(id)) {
            console.warn(`ID "${id}" already exists. Skipping.`);
            return;
        }

        data[id] = obj;

        await writeFile(MY_FILE, JSON.stringify(data, null, 4));
    }
    catch (e) {
        console.error('Failed to add entry:', err);
    }
}

export async function deleteFromJson(id) {
    try {
        const raw = await readFile(MY_FILE, 'utf8');
        const data = JSON.parse(raw);

        delete data[id];

        await writeFile(MY_FILE, JSON.stringify(data, null, 4));
    }
    catch (e) {
        console.error('Failed to delete entry:', err);
    }
}