const { Presensi } = require("../models");
const { format } = require("date-fns");
const timeZone = "Asia/Jakarta";
const multer = require("multer");
const path = require("path");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); 
  },
  filename: (req, file, cb) => {
    // Format nama file: userId-timestamp.jpg
    cb(null, `${req.user.id}-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Hanya file gambar yang diperbolehkan!'), false);
  }
};

exports.upload = multer({ storage: storage, fileFilter: fileFilter });



const CheckIn = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({
          message:
            "Unauthorized: user not found. Pastikan cookie terkirim (client harus mengirim kredensial).",
        });
    }
    const { id: userId, nama: userName } = req.user;
    const { latitude, longitude } = req.body;
    const waktuSekarang = new Date();
    
    let buktiFotoPath = null;
    if (req.file) {
      buktiFotoPath = req.file.path; 
    }
    
    const newRecord = await Presensi.create({
      userId: userId,
      checkIn: waktuSekarang,
      latitude: latitude,
      longitude: longitude,
      buktiFoto: buktiFotoPath 
    });
    
    const formattedData = {
      userId: newRecord.userId,
      checkIn: format(newRecord.checkIn, "yyyy-MM-dd HH:mm:ssXXX", {
        timeZone,
      }),
      latitude: newRecord.latitude,
      longitude: newRecord.longitude,
      buktiFoto: newRecord.buktiFoto 
    };
    
    res.status(201).json({
      message: `Selamat datang ${userName}, check-in Anda berhasil pada pukul ${format(
        waktuSekarang,
        "HH:mm:ss",
        { timeZone }
      )} WIB`,
      data: formattedData,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

const CheckOut = async (req, res) => {
  // Gunakan try...catch
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({
          message:
            "Unauthorized: user not found. Pastikan cookie terkirim (client harus mengirim kredensial).",
        });
    }
    const { id: userId, nama: userName } = req.user;
    const waktuSekarang = new Date();

    // Cari data di database
    const recordToUpdate = await Presensi.findOne({
      where: { userId: userId, checkOut: null },
    });

    if (!recordToUpdate) {
      return res.status(404).json({
        message: "Tidak ditemukan catatan check-in yang aktif untuk Anda.",
      });
    }

    // 5. Update dan simpan perubahan ke database
    recordToUpdate.checkOut = waktuSekarang;
    data = await recordToUpdate.save();
    console.log(data);

    const formattedData = {
      userId: recordToUpdate.userId,
      checkIn: format(recordToUpdate.checkIn, "yyyy-MM-dd HH:mm:ssXXX", {
        timeZone,
      }),
      checkOut: format(recordToUpdate.checkOut, "yyyy-MM-dd HH:mm:ssXXX", {
        timeZone,
      }),
    };

    res.json({
      message: `Selamat jalan ${userName}, check-out Anda berhasil pada pukul ${format(
        waktuSekarang,
        "HH:mm:ss",
        { timeZone }
      )} WIB`,
      data: formattedData,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

const deletePresensi = async (req, res) => {
  try {
    if (!req.user) {
      return res
        .status(401)
        .json({
          message:
            "Unauthorized: user not found. Pastikan cookie terkirim (client harus mengirim kredensial).",
        });
    }
    const { id: userId } = req.user;
    const presensiId = req.params.id;
    const recordToDelete = await Presensi.findByPk(presensiId);

    if (!recordToDelete) {
      return res
        .status(404)
        .json({ message: "Catatan presensi tidak ditemukan." });
    }
    if (recordToDelete.userId !== userId) {
      return res
        .status(403)
        .json({ message: "Akses ditolak: Anda bukan pemilik catatan ini." });
    }
    await recordToDelete.destroy();
    res.status(204).send();
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi Interval Server Erorr", erorr: error });
  }
};

const updatePresensi = async (req, res) => {
  try {
    const presensiId = req.params.id;
    const { checkIn, checkOut } = req.body;
    if (checkIn === undefined && checkOut === undefined) {
      return res.status(400).json({
        message:
          "Request body tidak berisi data yang valid untuk diupdate (checkIn, checkOut).",
      });
    }

    if (checkIn && isNaN(new Date(checkIn).getTime())) {
      return res.status(400).json({ message: "Format checkIn tidak valid." });
    }
    if (checkOut && isNaN(new Date(checkOut).getTime())) {
      return res.status(400).json({ message: "Format checkOut tidak valid." });
    }

    const recordToUpdate = await Presensi.findByPk(presensiId);
    if (!recordToUpdate) {
      return res
        .status(404)
        .json({ message: "Catatan presensi tidak ditemukan." });
    }
    recordToUpdate.checkIn = checkIn || recordToUpdate.checkIn;
    recordToUpdate.checkOut = checkOut || recordToUpdate.checkOut;
    await recordToUpdate.save();

    res.json({
      message: "Data presensi berhasil diperbarui.",
      data: recordToUpdate,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Terjadi kesalahan pada server", error: error.message });
  }
};

module.exports = { CheckIn, CheckOut, deletePresensi, updatePresensi };
