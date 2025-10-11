const db = require('../helpers/db');

const getBooks = (req, res) => {
    const query = `SELECT * FROM books`;
    db.all(query, [], (err, rows) => {
        if (err) {
            return res.status(500).send('Error retrieving books');
        }
        res.status(200).json(rows);
    });
};

const getBooksById = (req, res) =>{
    const id = req.params.id;
    const query = `SELECT * FROM books WHERE id = ?`;
    db.get(query, [id], (err, row) => {
        if (err) {
            return res.status(500).send('Error retrieving book');
        }
        if (!row) {
            return res.status(404).send('Book not found');
        }
        res.status(200).json(row);
    });
}

const addBooks = (req, res) => {
    const { title, author } = req.body;

    if (!title || !author) {
        return res.status(400).send('Title and author are required');
    }

    const query = `INSERT INTO books (title, author) VALUES (?, ?)`;
    db.run(query, [title, author], function(err) {
        if (err) {
            return res.status(500).send('Error adding book');
        }
        res.status(201).send({ id: this.lastID, title, author });
    });
};

const updateBook = (req, res) =>{
    const id  = req.query.id;
    const { title, author } = req.body;

    if (!title || !author) {
        return res.status(400).send('Title and author are required');
    }

    const query = `UPDATE books SET title = ?, author = ? WHERE id = ?`;
    db.run(query, [title, author, id], function(err) {
        if (err) {
            return res.status(500).send('Error updating book');
        }
        if (this.changes === 0) {
            return res.status(404).send('Book not found');
        }
        res.status(200).send({ id, title, author });
    });
}

const deleteBook = (req, res) => {
    const id = req.query.id;
    const query = `DELETE FROM books WHERE id = ?`;
    db.run(query, [id], function(err) {
        if (err) {
            return res.status(500).send('Error deleting book');
        }
        if (this.changes === 0) {
            return res.status(404).send('Book not found');
        }
        res.status(200).send('Book deleted successfully');
    });
}

module.exports = { getBooks, addBooks, updateBook, deleteBook, getBooksById };