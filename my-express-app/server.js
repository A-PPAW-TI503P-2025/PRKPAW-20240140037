// server.js
const express = require('express');
const app = express();
const PORT = process.env.PORT || 6000;

app.get('/', (req, res) => {
  res.send('Hello From Server!');
});

app.listen(PORT, () => {
  console.log(`Server berjalan di http://localhost:${PORT}`);
});