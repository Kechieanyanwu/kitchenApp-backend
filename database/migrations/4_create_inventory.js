'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('Inventories', {
            id: {
                allowNull: false,
                autoIncrement: true,
                primaryKey: true,
                type: Sequelize.INTEGER
            },
            item_name: {
                allowNull: false,
                type: Sequelize.STRING,
                // unique: true
            },
            quantity: {
                allowNull: false,
                type: Sequelize.INTEGER
            },
            category_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                onDelete: 'CASCADE',
                references: {
                    model: 'Categories',
                    key: 'id'
                }
            },
            // adding in user.id
            user_id: {
                type: Sequelize.INTEGER,
                allowNull: false,
                onDelete: 'CASCADE',
                references: {
                    model: 'Users',
                    key: 'id'
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
        // Add unique constraint on user_id and item_name
        await queryInterface.addIndex('Inventories', ['user_id', 'item_name'], {
            unique: true,
            name: 'unique_user_item'
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('Inventories');
    }
};