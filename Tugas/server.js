const express = require('express');
const app = express();
const port = 6000;

require('./helpers/db');

const { checkAuth } = require('./middleware/check');
const booksRouter = require('./routes/books');

app.use(express.json());

app.use('/api/books', checkAuth, booksRouter);

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});