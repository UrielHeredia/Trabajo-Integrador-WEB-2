const express = require('express');
const path = require('path'); 
const app = express();

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
   
app.use(express.static('public'));

app.use(express.json());

const port = process.env.PORT || 3000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});