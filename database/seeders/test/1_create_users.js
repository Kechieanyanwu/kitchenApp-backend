'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.bulkInsert(
        "Users",
        [
          {
            username: "Test Seed Dummy",
            email: "seeddummyemail@pivotech.io",
            hashed_password: "$2b$10$PkR.KEgVHCwbcorgSraSIeEEZoGQCrPbjdyr5DxAWIBNXELLjMLxG",
            salt: "$2b$10$PkR.KEgVHCwbcorgSraSIe",
            date_created: "2023-11-08T14:14:01.390Z",
            date_updated: "2023-11-08T14:14:01.390Z",
          }
        ]);
      })
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
    return queryInterface.sequelize.transaction(async (t) => {
      await queryInterface.bulkDelete("Users", null, {})
    })
  }
};
