const router = require('express').Router();
const { CheckIn, CheckOut } = require('../controllers/presensiController');

router.post('/checkin', CheckIn);
router.post('/checkout', CheckOut);

module.exports = router;