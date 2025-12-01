'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Presensis', 'latitude', {
      type: Sequelize.DECIMAL(10, 8),
      allowNull: true // Boleh null jika izin lokasi ditolak
    });
    await queryInterface.addColumn('Presensis', 'longitude', {
      type: Sequelize.DECIMAL(11, 8),
      allowNull: true
    });
  },


  async down (queryInterface, Sequelize) {
    await queryInterface.removeColumn('Presensis', 'latitude');
    await queryInterface.removeColumn('Presensis', 'longitude');
  }
};
