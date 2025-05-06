const express = require('express');

const app = express();
const path = require('path');
app.use(express.static(path.join(__dirname, 'build')));

app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, 'build', 'index.html'));
});

app.get('/', (req, res) => {
    res.send('Servidor funcionando correctamente');
  });

app.use(express.static('public'));

app.use(express.json());

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});