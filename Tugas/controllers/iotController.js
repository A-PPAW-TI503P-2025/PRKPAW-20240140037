// controllers/iotController.js
const { SensorLog } = require('../models');

// Function untuk menerima data dari ESP32
exports.receiveSensorData = async (req, res) => {
  try {
    // 1. Tangkap data dari body request (dikirim oleh ESP32)
    const { suhu, kelembaban, cahaya, alert } = req.body;

    // 2. Validasi sederhana
    if (suhu === undefined || kelembaban === undefined) {
      return res.status(400).json({ 
        status: "error", 
        message: "Data suhu atau kelembaban tidak valid" 
      });
    }

    // 3. Tentukan alert berdasarkan suhu jika tidak dikirim dari Arduino
    let alertStatus = alert;
    if (!alertStatus) {
      alertStatus = parseFloat(suhu) > 32 ? "PANAS" : "NORMAL";
    }

    // 4. Simpan ke Database
    const newData = await SensorLog.create({
      suhu: parseFloat(suhu),
      kelembaban: parseFloat(kelembaban),
      cahaya: parseInt(cahaya) || 0,
      alert: alertStatus
    });

    // Log agar terlihat di terminal
    console.log(`💾 [SAVED] Suhu: ${suhu}°C | Lembab: ${kelembaban}% | Cahaya: ${cahaya} | Alert: ${alertStatus}`);

    // 5. Beri respon sukses ke ESP32
    res.status(201).json({ 
      status: "ok", 
      message: "Data berhasil disimpan",
      data: newData
    });

  } catch (error) {
    console.error("Gagal menyimpan data:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Function untuk mengambil history data sensor (untuk grafik React)
exports.getSensorHistory = async (req, res) => {
  try {
    // Ambil 20 data terakhir, diurutkan dari yang paling baru
    const data = await SensorLog.findAll({
      limit: 20,
      order: [['createdAt', 'DESC']]
    });

    // Balik urutannya (reverse) agar di grafik muncul dari Kiri (Lama) ke Kanan (Baru)
    const formattedData = data.reverse(); 

    res.json({
      status: "success",
      data: formattedData
    });
  } catch (error) {
    console.error("Gagal mengambil data:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Function untuk mengambil data terakhir (untuk kartu indikator)
exports.getLatestSensorData = async (req, res) => {
  try {
    const data = await SensorLog.findOne({
      order: [['createdAt', 'DESC']]
    });

    if (!data) {
      return res.status(404).json({
        status: "error",
        message: "Belum ada data sensor"
      });
    }

    res.json({
      status: "success",
      data: data
    });
  } catch (error) {
    console.error("Gagal mengambil data terakhir:", error);
    res.status(500).json({ status: "error", message: error.message });
  }
};

// Test connection (dari Modul 11)
exports.testConnection = (req, res) => {
  const { message, deviceId } = req.body;
  console.log(`📡 [IOT] Pesan dari ${deviceId}: ${message}`);
  res.status(200).json({ status: "ok", reply: "Server menerima koneksi!" });
};
