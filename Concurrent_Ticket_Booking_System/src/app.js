const express = require('express');
const app = express();
const routes = require('./routes');
const PORT = 3000;

app.use(express.json());
app.use('/api/seats', routes);

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/../index.html');
});

app.listen(PORT, () => {
  console.log(`🎟️ Server running at http://localhost:${PORT}`);
});
