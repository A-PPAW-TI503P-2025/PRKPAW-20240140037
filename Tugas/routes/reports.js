const router = require('express').Router();
const { getAllRecords } = require('../controllers/reportController')

router.get('/daily', getAllRecords)

module.exports = router