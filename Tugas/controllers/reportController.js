const { Presensi } = require('../models');

const getAllRecords = async (req, res) => {
    try {
        const records = await Presensi.findAll();
        res.json({
            success: true,
            data: records
        });
    } catch (error) {
        res.status(500).json({ 
            success: false, 
            message: "Terjadi kesalahan pada server", 
            error: error.message 
        });
    }
};


module.exports = {getAllRecords };