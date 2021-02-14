const express = require("express");
const app = express();
const path = require('path');
const fs = require('fs');

const models = fs.readdirSync('./assets/minecraft/models/block/', {
    encoding: 'utf-8',
    withFileTypes: true,
}).filter(entry=>{
    return path.extname(entry.name) === '.json';
}).map(e=>path.basename(e.name, '.json'));

console.log(models);


app.get('/', (req, res)=>{
    res.sendFile('index.html', {root: __dirname});
})

app.get('/model_list.json', (req, res)=>{
    res.json(models);
})

app.use(express.static('./', {extensions: ['js', 'html', 'css']}));

app.listen(3000);