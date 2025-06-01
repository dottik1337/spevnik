import express from 'express';
import path from 'path';
import { initPiesneJson, getSpevnik } from './db.mjs';

const app = express();
const PORT = 3777;
app.set('view engine', 'ejs');
app.use(express.json());

app.use(express.static(path.join(path.resolve(), 'public')));

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});


let piesne = getSpevnik();

var STATE = {
    piesenId: 1,
    strofaIndex: 0,
    skryta: true,
    showingName: false,
}

var clients = [];

app.get('/', (req, res) => {
    res.render('index' );
});

app.post('/set-view', (req, res) => {
    const { piesenId, strofaIndex, skryta, showingName } = req.body;
    STATE.piesenId = piesenId || STATE.piesenId;
    STATE.strofaIndex = strofaIndex || STATE.strofaIndex;
    STATE.skryta = skryta === undefined ? STATE.skryta : skryta;
    STATE.showingName = showingName === undefined ? STATE.showingName : showingName;
    console.log('State updated:', STATE);

    const piesen = piesne[STATE.piesenId];
    const dataForClient = {
        piesen: {
            id: STATE.id,
            name: piesen.nazov,
            strofa: piesen.strofy[STATE.strofaIndex],
        },
        skryta: STATE.skryta,
        showingName: STATE.showingName, 
    }

    for (const client of clients) {
        client.write(`data: ${JSON.stringify(dataForClient)}\n\n`);
    }
    res.json({ success: true, state: STATE });
});

app.get('/presentation', (req, res) => {
    res.render('presentation', { state: STATE });
});

app.get('/get-view', (req, res) => {
    res.json(STATE);
});

app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    res.write('\n');
    clients.push(res);

    req.on('close', () => {
        clients = clients.filter(client => client !== res);
    });
});