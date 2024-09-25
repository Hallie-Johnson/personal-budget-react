// Budget API

const express = require('express');
const cors = require('cors');
const app = express();
const port = 3001;

const fs = require('fs');
const path = require('path');

app.use(cors());

app.get('/budget', (req, res) => {
    const filePath = path.join(__dirname, 'budget-data.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading budget data:', err);
            res.status(500).send('Server Error');
        } else {
            res.json(JSON.parse(data));
        }
    });
});

app.listen(port, () => {
    console.log(`API served at http://localhost:${port}`);
});