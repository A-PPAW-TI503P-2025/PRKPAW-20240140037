'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn(
      'Presensis',
      'nama'
    )
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn(
      'Presensis',
      'nama',
      Sequelize.STRING
    )
  }
};
