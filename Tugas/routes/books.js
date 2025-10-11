const express = require('express');
const router = express.Router();

const { getBooks, addBooks, updateBook, deleteBook } = require('../controllers/books');

router.get('/', getBooks);
router.post('/', addBooks);
router.put('/', updateBook);
router.delete('/', deleteBook);

module.exports = router;
