'use strict';
const { Model, DataTypes } = require("sequelize");
const db = require(".");
class User extends Model {
  /**
   * Helper method for defining associations.
   * This method is not a part of Sequelize lifecycle.
   * The `models/index` file will call this method automatically.
   */
  static associate(models) {
    // define association here
  }
}
User.init(
  {
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    hashed_password: DataTypes.STRING,
    salt: DataTypes.STRING
  },
  {
    sequelize: db.sequelize,
    modelName: "User",
    tableName: "Users",
    createdAt: "date_created",
    updatedAt: "date_updated",
    underscored: true,
  }
);

module.exports = { User }