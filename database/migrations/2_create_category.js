'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Categories', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            category_name: {
                type: Sequelize.STRING
            },
            // adding in user.id
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                onDelete: "CASCADE",
                references: {
                    model: "Users",
                    key: "id"
                }
            },
            date_created: {
                allowNull: false,
                type: Sequelize.DATE
            },
            date_updated: {
                allowNull: false,
                type: Sequelize.DATE
            }
        });
        // Add unique constraint on user_id and category_name
        await queryInterface.addIndex('Categories', ['user_id', 'category_name'], {
            unique: true,
            name: 'unique_user_category'
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Categories');
    }
};