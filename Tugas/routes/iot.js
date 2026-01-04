const express = require('express');
const router = express.Router();
const iotController = require('../controllers/iotController');

// Test connection (Modul 11)
router.post('/ping', iotController.testConnection);

// Endpoint penerima data sensor dari ESP32 (Modul 12 & 13)
// URL: http://localhost:8080/api/iot/data
router.post('/data', iotController.receiveSensorData);

// Endpoint untuk mengambil history data sensor (Modul 14)
// URL: http://localhost:8080/api/iot/history
router.get('/history', iotController.getSensorHistory);

// Endpoint untuk mengambil data terakhir
// URL: http://localhost:8080/api/iot/latest
router.get('/latest', iotController.getLatestSensorData);

module.exports = router;
