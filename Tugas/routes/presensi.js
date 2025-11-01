const router = require('express').Router();
const { CheckIn, CheckOut, deletePresensi, updatePresensi } = require('../controllers/presensiController');

router.post('/checkin', CheckIn);
router.post('/checkout', CheckOut);
router.delete('/:id', deletePresensi);
router.put('/:id', updatePresensi);

module.exports = router;