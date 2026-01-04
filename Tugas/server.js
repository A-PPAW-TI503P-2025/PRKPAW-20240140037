const express = require('express');
const app = express();
const port = 8080;
const path = require('path');

require('./helpers/db');
const cookieParser = require('cookie-parser');
const cors = require('cors');

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(cookieParser());
app.use(express.json());

const { checkAuth, isAdmin, addUserData } = require('./middleware/check');

const booksRouter = require('./routes/books');
const presensiRouter = require('./routes/presensi');
const reportRouter = require('./routes/reports')
const authRouter = require('./routes/auth')
const iotRouter = require('./routes/iot');
app.use(express.json());
app.use(cookieParser());

app.use((req, res, next) => {
  console.log(`[REQUEST MASUK] ${req.method} ke ${req.path}`);
  console.log('Body:', req.body);
  next();
});

app.use('/api/books', checkAuth, addUserData, booksRouter);
app.use('/api/presensi', [checkAuth, addUserData], presensiRouter);
app.use('/api/report', [checkAuth, addUserData, isAdmin], reportRouter);
app.use('/api/auth', authRouter);
app.use('/api/iot', iotRouter);

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});