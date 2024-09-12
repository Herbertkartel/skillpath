const { DataTypes } = require('sequelize');
const sequelize = require('./index'); // Ensure this path is correct

const Skill = sequelize.define('Skill', {
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Skill;

