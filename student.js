const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

const router = express.Router();

// Sequelize connection
const sequelize = new Sequelize('Signup', 'postgres', 'Gokul123@', {
  host: 'localhost',
  dialect: 'postgres',
  port: '5432',
});

// Define the Account model
const Account = sequelize.define('Account', {
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  phoneNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  role: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  university: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rollNo: {
    type: DataTypes.STRING, // Adjust the data type as per your requirements
    allowNull: false,
  },
});

// Sync the models with the database
sequelize.sync()
  .then(() => {
    console.log('Database synced');
  })
  .catch((error) => {
    console.error('Error syncing database:', error);
  });

// Update the route handler for fetching students
router.get('/api/accounts', async (req, res) => {
  const { role } = req.query;

  try {
    const students = await Account.findAll({
      where: { role },
      attributes: ['id', 'firstName', 'lastName', 'email', 'role', 'university'], // Include role and university fields
    });

    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'An error occurred while fetching students' });
  }
});

module.exports = router;
