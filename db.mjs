import fs from 'fs';
import path from 'path';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { readFile, writeFile } from 'fs/promises';
import dotenv from 'dotenv';
dotenv.config();


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const INIT_FILE = path.join(__dirname, 'public', 'piesne_init.json');
const MY_FILE = path.join(__dirname, 'public', 'piesne.json');

const GOOGLE_SHEET_URL = process.env.GOOGLE_SHEET_URL;
const SHEET2JSON_URL = 'https://api.sheets2json.com/v1/doc/?url=';

function buildPiesneJson(data) {
    const piesne = {};
    data.forEach(item => {
        const id = item[0];
        if (isNaN(id)) return;
        const nazov = item[1];
        const strofy = item.slice(2).filter(strofa => strofa?.trim() !== '');
        piesne[id] = {
            id: id,
            nazov: nazov,
            strofy: strofy.filter(strofa => strofa != null),
        };
    });
    return piesne;
}

export async function initPiesneJson() {
    try {
        const result = await fetch(SHEET2JSON_URL + GOOGLE_SHEET_URL);
        if (!result.ok) {
            throw new Error(`Failed to fetch data from Google Sheets: ${result.statusText}`);
        }
        const data = await result.json();
        const piesne = buildPiesneJson(data);
        await writeFile(MY_FILE, JSON.stringify(piesne, null, 4));
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
    console.log('Fetching spevnik asynchronously...');
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