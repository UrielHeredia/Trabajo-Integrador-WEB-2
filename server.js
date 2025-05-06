const express = require('express');
const fetch = require('node-fetch');
const path = require('path'); 
const app = express();

app.get('/api/paises', async (req, res) => {
  try {
    const response = await fetch('https://restcountries.com/v3.1/all');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('Error en /api/paises:', error);
    res.status(500).json({ error: 'No se pudieron obtener los datos' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
   
app.use(express.static('public'));

app.use(express.json());

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});