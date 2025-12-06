const router = require('express').Router();
const { CheckIn, CheckOut, deletePresensi, updatePresensi } = require('../controllers/presensiController');
const multer = require('multer');
const path = require('path');

// Konfigurasi penyimpanan file menggunakan multer
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // Folder penyimpanan file
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Nama file unik dengan ekstensi asli
  }
});

const upload = multer({ storage: storage });

router.post('/checkin', upload.single('buktiFoto'), CheckIn);
router.post('/checkout', CheckOut);
router.delete('/:id', deletePresensi);
router.put('/:id', updatePresensi);

module.exports = router;