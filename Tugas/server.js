const express = require('express');
const app = express();
const port = 6000;

require('./helpers/db');

const { checkAuth, addUserData, isAdmin } = require('./middleware/check');

const booksRouter = require('./routes/books');
const presensiRouter = require('./routes/presensi');
const reportRouter = require('./routes/reports')

app.use(express.json());

app.use('/api/books', checkAuth, booksRouter);
app.use('/api/presensi', [checkAuth, addUserData] ,presensiRouter);
app.use('/api/report', [checkAuth, addUserData, isAdmin], reportRouter)

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});