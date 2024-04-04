"use strict";
const { Model, DataTypes } = require("sequelize");
const db = require(".");
class Inventory extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models) {
    // define association here
  }
}
Inventory.init(
  {
    item_name: DataTypes.STRING,
    quantity: DataTypes.INTEGER,
    category_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: "CASCADE",
      references: {
        model: "Categories",
        key: "id",
      },
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      onDelete: "CASCADE",
      references: {
        model: "Users",
        key: "id",
      },
    },
  },
  {
    sequelize: db.sequelize,
    modelName: "Inventory",
    tableName: "Inventories",
    createdAt: "date_created",
    updatedAt: "date_updated",
    underscored: true,
  }
);
module.exports = { Inventory };
