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
        "Checklists",
        [
          {
            item_name: "Turkey Bacon",
            quantity: 5,
            category_id: 1,
            user_id: 1,
            date_created: "2023-11-08T14:14:01.390Z",
            date_updated: "2023-11-08T14:14:01.390Z",
          },
          {
            item_name: "Cinnamon Powder",
            quantity: 2,
            category_id: 2,
            user_id: 1,
            date_created: "2023-11-08T14:14:01.390Z",
            date_updated: "2023-11-08T14:14:01.390Z",
          },
          {
            item_name: "Dishwashing tabs",
            quantity: 10,
            category_id: 3,
            user_id: 1,
            date_created: "2023-11-08T14:14:01.390Z",
            date_updated: "2023-11-08T14:14:01.390Z",
          },
          {
            item_name: "Coriander Seeds",
            quantity: 2,
            category_id: 2,
            user_id: 1,
            date_created: "2023-11-08T14:14:01.390Z",
            date_updated: "2023-11-08T14:14:01.390Z",
          },
          {
            item_name: "Curry Powder",
            quantity: 2,
            category_id: 2,
            user_id: 1,
            date_created: "2023-11-08T14:14:01.390Z",
            date_updated: "2023-11-08T14:14:01.390Z",
          },
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
      await queryInterface.bulkDelete("Checklists", null, {})
    })
  }
};

