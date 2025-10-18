const presensiRecords = require('../data/presensiData');

const getDailyReport = (req, res) => {
    res.json({
        reportDate: new Date().toLocaleDateString(),
        records: presensiRecords
    });
};

module.exports = { getDailyReport };
