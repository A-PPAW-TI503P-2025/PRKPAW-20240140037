const { Presensi, User } = require("../models");
const { Op } = require("sequelize");

const getAllRecords = async (req, res) => {
  try {
    const { nama, start, end } = req.query;

    let options = {
      where: {},
      include: [
        {
          model: User,
          as: "User",
          attributes: ["id", "nama", "email", "role"],
          required: false,
        },
      ],
    };

    // Filter by user nama (search in User table)
    if (nama) {
      options.include[0].where = {
        nama: { [Op.like]: `%${nama}%` },
      };
      options.include[0].required = true; // INNER JOIN if filtering by nama
    }

    // Filter by date range
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

module.exports = { getAllRecords };
