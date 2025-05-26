import express from 'express';
import path from 'path';

const app = express();
const PORT = 3777;
app.set('view engine', 'ejs');
app.use(express.json());

app.use(express.static(path.join(path.resolve(), 'public')));

app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`);
});


var STATE = {
    piesenId: 0,
    strofaIndex: 0,
    skryta: false
}


app.get('/', (req, res) => {
    res.render('index' );
});

app.post('/set-view', (req, res) => {
    const { piesenId, strofaIndex, skryta } = req.body;
    STATE.piesenId = piesenId || STATE.piesenId;
    STATE.strofaIndex = strofaIndex || STATE.strofaIndex;
    STATE.skryta = skryta === undefined ? STATE.skryta : skryta;
    console.log('State updated:', STATE);
    res.json({ success: true, state: STATE });
});

app.get('/presentation', (req, res) => {
    res.render('presentation', { state: STATE });
});

app.get('/get-view', (req, res) => {
    res.json(STATE);
});