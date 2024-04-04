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
        "Inventories",
        [
          {
            item_name: "Yoghurt",
            quantity: 4,
            category_id: 1,
            user_id: 1,
            date_created: "2023-11-08T14:14:01.390Z",
            date_updated: "2023-11-08T14:14:01.390Z",
          },
          {
            item_name: "Cherries",
            quantity: 50,
            category_id: 2,
            user_id: 1,
            date_created: "2023-11-08T14:14:01.390Z",
            date_updated: "2023-11-08T14:14:01.390Z",
          },
          {
            item_name: "Sourdough Bread",
            quantity: 1,
            category_id: 3,
            user_id: 1,
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
      await queryInterface.bulkDelete("Inventories", null, {})
    })
  }
};
