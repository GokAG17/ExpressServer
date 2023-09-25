const express = require('express');
const bodyParser = require('body-parser');
const { Sequelize, DataTypes } = require('sequelize');
const router = express.Router();
router.use(bodyParser.json());

// Create a Sequelize connection for the evaluation form database
const sequelize = new Sequelize('Signup', 'postgres', '2004', {
  host: 'localhost',
  dialect: 'postgres',
  port: '5433',
});

sequelize.options.logging = console.log;

// Define the EvaluationForm model
const EvaluationForm = sequelize.define('EvaluationForm', {
  studentName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rollNo: { 
    type: DataTypes.STRING,
    allowNull: false,
  },
  formTitle: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  formParameters: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  formValues: {
    type: DataTypes.JSONB,
    allowNull: false,
  },
  reviewType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  remarks: {
    type: DataTypes.TEXT, // Assuming remarks can be longer, using TEXT data type
    allowNull: true, // Allow nullable if remarks are optional
  },
  calculatedTotalMarks: { // Add the field for calculatedTotalMarks
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});


// Sync the model with the database
sequelize.sync()
  .then(() => {
    console.log('Evaluation form database synced');
  })
  .catch((error) => {
    console.error('Error syncing evaluation form database:', error);
  });

// Route for creating an evaluation form
router.post('/formsguide', async (req, res) => {
  const { rollNo, studentName, formTitle, formParameters, formValues, reviewType, remarks, calculatedTotalMarks } = req.body;

  try {
    // Create a new evaluation form record in the database
    console.log('Creating new evaluation form...');
    const evaluationForm = await EvaluationForm.create({
      rollNo,
      studentName,
      formTitle,
      formParameters,
      formValues,
      reviewType,
      remarks, 
      calculatedTotalMarks,
    });

    console.log('Evaluation form created:', evaluationForm);
    res.status(201).json(evaluationForm);
  } catch (error) {
    console.error('Error creating evaluation form:', error);
    res.status(500).json({ error: 'Evaluation form creation failed' });
  }
});

// API endpoint to get the evaluation form submission based on roll number and review type
router.get('/formsguide', async (req, res) => {
  try {

    // Get the user's roll number from the authenticated token (assuming you have stored it in req.user)
    const { rollNo } = req.user; // Assuming the user's roll number is available in req.user

    // Get the review type from the query parameters
    const { reviewType } = req.query;
    
    console.log('Received request with rollNo:', rollNo, 'and reviewType:', reviewType);
    // Find the evaluation form submission in the database by the user's roll number and review type
    const submissionData = await EvaluationForm.findOne({ where: { rollNo, reviewType } });

    if (!submissionData) {
      // Evaluation form submission not found for the user and review type
      return res.status(404).json({ error: 'Evaluation form submission not found' });
    }

    // Respond with the evaluation form submission data
    res.json(submissionData);
  } catch (error) {
    console.error('Error fetching evaluation form submission:', error);
    res.status(500).json({ error: 'An error occurred while fetching evaluation form submission' });
  }
});

// API endpoint to get the evaluation form submission based on roll number and review type
router.get('/formsguide', async (req, res) => {
  try {

    // Get the user's roll number from the authenticated token (assuming you have stored it in req.user)
    const { rollNo } = req.user; // Assuming the user's roll number is available in req.user

    // Get the review type from the query parameters
    const { reviewType } = req.query;
    
    console.log('Received request with rollNo:', rollNo, 'and reviewType:', reviewType);
    // Find the evaluation form submission in the database by the user's roll number and review type
    const submissionData = await EvaluationForm.findOne({ where: { rollNo, reviewType } });

    if (!submissionData) {
      // Evaluation form submission not found for the user and review type
      return res.status(404).json({ error: 'Evaluation form submission not found' });
    }

    // Respond with the evaluation form submission data
    res.json(submissionData);
  } catch (error) {
    console.error('Error fetching evaluation form submission:', error);
    res.status(500).json({ error: 'An error occurred while fetching evaluation form submission' });
  }
});

// API endpoint to check if an evaluation form entry exists for a given roll number and review type
router.get('/formsguide/check', async (req, res) => {
  try {
    // Get the roll number and review type from the query parameters
    const { rollNo, reviewType } = req.query;

    // Find the evaluation form entry in the database by roll number and review type
    const entry = await EvaluationForm.findOne({ where: { rollNo, reviewType } });

    if (!entry) {
      // Entry not found for the given roll number and review type
      return res.status(404).json({ message: 'Evaluation form entry not found' });
    }

    // Respond with the found entry
    res.json(entry);
  } catch (error) {
    console.error('Error checking evaluation form entry:', error);
    res.status(500).json({ error: 'An error occurred while checking evaluation form entry' });
  }
});

// API endpoint to update an existing evaluation form entry
router.put('/formsguide/:id', async (req, res) => {
  try {
    // Get the evaluation form entry ID from the URL parameter
    const { id } = req.params;

    // Find the existing evaluation form entry in the database by ID
    const entry = await EvaluationForm.findByPk(id);

    if (!entry) {
      // Entry not found for the given ID
      return res.status(404).json({ message: 'Evaluation form entry not found' });
    }

    // Update the entry with the new data from the request body
    entry.studentName = req.body.studentName;
    entry.rollNo = req.body.rollNo;
    entry.formTitle = req.body.formTitle;
    entry.formParameters = req.body.formParameters;
    entry.formValues = req.body.formValues;
    entry.reviewType = req.body.reviewType;
    entry.remarks = req.body.remarks;

    // Save the updated entry to the database
    await entry.save();

    // Respond with the updated entry
    res.json(entry);
  } catch (error) {
    console.error('Error updating evaluation form entry:', error);
    res.status(500).json({ error: 'An error occurred while updating evaluation form entry' });
  }
});

// API endpoint to get the evaluation form submission based on roll number
router.get('/formsguidemark', async (req, res) => {
  try {
    // Get the user's roll number from the authenticated token (assuming you have stored it in req.user)
    const { rollNo } = req.user; // Assuming the user's roll number is available in req.user
    
    console.log('Received request with rollNo:', rollNo);

    // Find the evaluation form submission in the database by the user's roll number
    const submissionData = await EvaluationForm.findOne({ where: { rollNo } });

    if (!submissionData) {
      // Evaluation form submission not found for the user
      return res.status(404).json({ error: 'Evaluation form submission not found' });
    }

    // Respond with the evaluation form submission data
    res.json(submissionData);
  } catch (error) {
    console.error('Error fetching evaluation form submission:', error);
    res.status(500).json({ error: 'An error occurred while fetching evaluation form submission' });
  }
});

// API endpoint to get the evaluation form submission based on roll number
router.get('/formsguidemarkstaff', async (req, res) => {
  try {
    // Get the user's roll number from the query parameter
    const { rollNo } = req.query;
    
    console.log('Received request with rollNo:', rollNo);

    // Find the evaluation form submission in the database by the user's roll number
    const submissionData = await EvaluationForm.findOne({ where: { rollNo } });

    if (!submissionData) {
      // Evaluation form submission not found for the user
      return res.status(404).json({ error: 'Evaluation form submission not found' });
    }

    // Respond with the evaluation form submission data
    res.json(submissionData);
  } catch (error) {
    console.error('Error fetching evaluation form submission:', error);
    res.status(500).json({ error: 'An error occurred while fetching evaluation form submission' });
  }
});


// API endpoint to check if the evaluation form submission is completed based on roll number
router.get('/formsguideevaluationcompleted', async (req, res) => {
  try {
    // Get the user's roll number from the query parameter
    const { rollNo } = req.query;

    console.log('Received request with rollNo:', rollNo);

    // Find the evaluation form submission in the database by the user's roll number
    const submissionData = await EvaluationForm.findOne({ where: { rollNo } });

    // Respond with a boolean indicating whether the evaluation form submission is completed
    res.json({ completed: !!submissionData }); // Converts the object to a boolean

  } catch (error) {
    console.error('Error fetching evaluation form submission:', error);
    res.status(500).json({ error: 'An error occurred while fetching evaluation form submission' });
  }
});



module.exports = router;