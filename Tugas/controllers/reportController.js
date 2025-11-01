const { Presensi } = require('../models');
const {Op} = require('sequelize');

const getAllRecords = async (req, res) => {
    try {
        const { nama, start, end} = req.query;

        let options = { where: {} };

        if (nama) {
        options.where.nama = { [Op.like]: `%${nama}%` };
        }
        if (start && end) {
        options.where.checkIn = {
            [Op.between]: [new Date(start), new Date(end)],
        };
        } else if (start) {
        options.where.checkIn = {
            [Op.gte]: new Date(start),
        };
        } else if (end) {
        options.where.checkIn = {
            [Op.lte]: new Date(end),
        };
        }

        const records = await Presensi.findAll(options);

        res.json({
        reportDate: new Date().toLocaleDateString(),
        data: records,
        });
    } catch (error) {
        res
        .status(500)
        .json({ message: "Gagal mengambil laporan", error: error.message });
    }
};


module.exports = {getAllRecords };