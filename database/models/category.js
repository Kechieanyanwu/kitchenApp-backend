"use strict";
//issue with test using development database could be from the change to this set up
const { Model, DataTypes } = require("sequelize");
const db = require("./index");
class Category extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models) {
    // define association here
  }
}
Category.init(
  {
    category_name: DataTypes.STRING,
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
    modelName: "Category",
    tableName: "Categories", // just added this
    createdAt: "date_created",
    updatedAt: "date_updated",
    underscored: true,
  }
);
module.exports = { Category };
