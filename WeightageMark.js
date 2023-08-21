const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

const router = express.Router();

const sequelize = new Sequelize('Marks', 'postgres', '2004', {
  host: 'localhost',
  dialect: 'postgres',
  port: '5433', // Adjust the port number based on your database configuration
});

// Define the Weightage model
const Weightage = sequelize.define('Weightage', {
  firstReview: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  secondReview: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  thirdReview: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  guideMarks: {
    type: DataTypes.FLOAT,
    allowNull: false
  }
});

// Synchronize the model with the database (create the table if it doesn't exist)
sequelize.sync().then(() => {
  console.log('Database synchronized');
});


// Route to handle setting weightage
router.post('/set-weightage', async (req, res) => {
  const newWeightage = req.body;

  try {
    let existingWeightage = await Weightage.findOne({ where: { id: 1 } });

    if (existingWeightage) {
      // Update the weightage settings in the existing row
      await existingWeightage.update(newWeightage);
    } else {
      // Create a new row with the weightage settings
      await Weightage.create({ id: 1, ...newWeightage });
    }

    res.status(200).json({ message: 'Weightage set successfully', newWeightage });
  } catch (error) {
    console.error('Error setting weightage:', error);
    res.status(500).json({ error: 'An error occurred while setting weightage' });
  }
});

// Route to fetch weightage by ID
router.get('/get-weightage', async (req, res) => {
  const weightageId = req.query.id;

  try {
    const weightage = await Weightage.findByPk(weightageId);
    if (weightage) {
      res.status(200).json({ weightage });
    } else {
      res.status(404).json({ error: 'Weightage not found' });
    }
  } catch (error) {
    console.error('Error fetching weightage:', error);
    res.status(500).json({ error: 'An error occurred while fetching weightage' });
  }
});


module.exports = router;