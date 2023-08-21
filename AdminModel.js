const { Sequelize, DataTypes } = require('sequelize');

// Create a Sequelize connection
const sequelize = new Sequelize('Admin', 'postgres', '', {
  host: 'localhost',
  dialect: 'postgres',
  port: '5432',
});


const Circular = sequelize.define('Circular', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  recipients: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
  },
  pdfUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

const Message = sequelize.define('Message', {
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  recipients: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: false,
  },
  pdfUrl: {
    type: DataTypes.STRING,
    allowNull: true,
  },
});

// Sync models with the database
sequelize.sync()
  .then(() => {
    console.log('Models synchronized with database');
  })
  .catch((error) => {
    console.error('Error synchronizing models with database:', error);
  });

module.exports = { Circular, Message };
