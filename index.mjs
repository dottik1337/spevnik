import express from 'express';
import path from 'path';
import { initPiesneJson, getSpevnik, addToJson, getSpevnikAsync } from './db.mjs';

const app = express();
const PORT = 3777;
app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
            id: piesen.id,
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
    res.render('presentation');
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

app.get('/settings', (req, res) => {
    res.render('settings');
});

app.post('/new-song', async (req, res) => {
    try{
        const {id, nazov, strofy} = req.body;
        if (piesne[id] !== undefined){
            res.status(400).send("ID je uz obsadene");
            return;
        }
        const strofy_arr = strofy.split('\n')
                                 .map(p => p.trim())
                                 .filter(p => p !== '');
        const song = {
            nazov: nazov,
            id: id,
            strofy: strofy_arr
        }
        await addToJson(id, song);
        res.status(200).send('OK');
        piesne = await getSpevnikAsync();
    } catch(e)
    {
        console.error(e);
        res.status(500).send('Server error');
    }
});