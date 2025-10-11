const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./booksDatabase.db', (err) => {
    if (err) {
        console.error('Could not connect to database', err);
    } else {
        console.log('Connected to database');
        db.run(`CREATE TABLE IF NOT EXISTS books (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT,
            author TEXT
        )`);
    }
});

module.exports = db;
