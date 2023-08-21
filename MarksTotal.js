const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

const router = express.Router();

const sequelize = new Sequelize('markstotal', 'postgres', 'Gokul123@', {
  host: 'localhost',
  dialect: 'postgres',
  port: '5432', 
});

const Marks = sequelize.define('marks', {
  studentRollNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  firstReview: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  secondReview: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  thirdReview: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  guideMarks: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  totalMarks: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
});


sequelize.sync().then(() => {
  console.log('Database synchronized');
});

// Route to handle saving marks
router.post('/save-marks', async (req, res) => {
  try {
    const { studentRollNo, firstReview, secondReview, thirdReview, guideMarks, totalMarks } = req.body;

    // Create a new record in the marks table
    await Marks.create({
      studentRollNo,
      firstReview,
      secondReview,
      thirdReview,
      guideMarks,
      totalMarks,
    });

    res.status(201).json({ message: 'Marks saved successfully' });
  } catch (error) {
    console.error('Error saving marks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

router.get('/exists-marks', async (req, res) => {
  const { studentRollNo } = req.query;

  try {
    const marks = await Marks.findOne({
      where: { studentRollNo },
    });

    if (marks) {
      res.json({ exists: true });
    } else {
      res.json({ exists: false });
    }
  } catch (error) {
    console.error('Error checking if marks exist:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/update-marks', async (req, res) => {
  const updatedMarks = req.body;

  try {
    await Marks.update(updatedMarks, {
      where: { studentRollNo: updatedMarks.studentRollNo },
    });

    res.status(200).json({ message: 'Marks updated successfully' });
  } catch (error) {
    console.error('Error updating marks:', error);
    res.status(500).json({ error: 'An error occurred while updating marks' });
  }
});

// Endpoint to get marks by roll number
router.get('/get-marks-by-rollno', async (req, res) => {
  const { studentRollNo } = req.query;

  if (!studentRollNo) {
    return res.status(400).json({ error: 'Student roll number is required.' });
  }

  try {
    const marks = await Marks.findOne({
      where: { studentRollNo },
      attributes: ['totalMarks', 'firstReview', 'secondReview', 'thirdReview', 'guideMarks'],
    });

    if (marks) {
      res.json({
        totalMarks: marks.totalMarks,
        firstReview: marks.firstReview,
        secondReview: marks.secondReview,
        thirdReview: marks.thirdReview,
        guideMarks: marks.guideMarks,
      });
    } else {
      res.json({
        totalMarks: null,
        firstReview: null,
        secondReview: null,
        thirdReview: null,
        guideMarks: null,
      });
    }
  } catch (error) {
    console.error('Error fetching marks by roll number:', error);
    res.status(500).json({ error: 'An error occurred while fetching marks' });
  }
});



module.exports = router;
