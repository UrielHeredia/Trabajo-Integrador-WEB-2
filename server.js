const express = require('express');
const path = require('path');
const app = express();

// 1. Middleware para archivos estáticos desde /public
app.use(express.static(path.join(__dirname, 'public')));

// 2. Middleware para parsear JSON
app.use(express.json());

// 3. Ruta principal que sirve index.html desde /public
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 4. Puerto
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});