const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

const router = express.Router();

// Create a new Sequelize instance with your database credentials
const sequelize = new Sequelize('FormSub', 'postgres', 'Gokul123@', {
  host: 'localhost',
  dialect: 'postgres',
  port: '5432', // Adjust the port number based on your database configuration
});

const Project = sequelize.define('Project', {
  studentName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rollNumber: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  teamMember1: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  teamMember2: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  teamMember3: {
    type: DataTypes.STRING,
    allowNull: true,
  },
  projectTitle: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  guideName: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  guideRollNumber: { // Added guideRollNumber field
    type: DataTypes.STRING,
    allowNull: false,
  },
  guideDepartment: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  guideMobile: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  guideEmail: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  verified: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  },
});

module.exports = Project;



// Synchronize the model with the database (create the table if it doesn't exist)
sequelize.sync().then(() => {
  console.log('Projects table created successfully.');
}).catch((error) => {
  console.error('Error creating Projects table:', error);
});

// Route for submitting a project
router.post('/formproject', async (req, res) => {
  const {
    studentName,
    rollNumber,
    teamMember1,
    teamMember2,
    teamMember3,
    projectTitle,
    description,
    guideName,
    guideRollNumber,
    guideDepartment,
    guideMobile,
    guideEmail,
  } = req.body;

  try {
    // Check if the rollNumber field is provided and not null
    if (!rollNumber) {
      return res.status(400).json({ error: 'Roll number is required' });
    }

    // Create a new project record in the database
    const project = await Project.create({
      studentName,
      rollNumber,
      teamMember1,
      teamMember2,
      teamMember3,
      projectTitle,
      description,
      guideName,
      guideRollNumber,
      guideDepartment,
      guideMobile,
      guideEmail,
    });

    res.status(201).json(project);
  } catch (error) {
    console.error('Error creating project:', error);
    res.status(500).json({ error: 'Project creation failed' });
  }
});


// API endpoint to fetch the verified form submissions for a specific student
router.get('/formproject/student', async (req, res) => {
  const { rollNumber, verified } = req.query;

  // Check if the rollNumber is provided and not empty
  if (!rollNumber) {
    return res.status(400).json({ error: 'Roll number is required' });
  }

  try {
    let formSubmissions;

    if (verified === 'true') {
      // Fetch only the verified form submissions
      formSubmissions = await Project.findAll({ where: { rollNumber, verified: true } });
    } else {
      // Fetch all form submissions for the student (verified or not)
      formSubmissions = await Project.findAll({ where: { rollNumber } });
    }

    res.json(formSubmissions);
  } catch (error) {
    console.error('Error fetching form submissions:', error);
    res.status(500).json({ error: 'Failed to fetch form submissions' });
  }
});

// API endpoint to fetch form submissions for a specific student
router.get('/formproject', async (req, res) => {
  const { rollNumber } = req.query;

  try {
    // Fetch all form submissions for the specified roll number
    const formSubmissions = await Project.findAll({ where: { rollNumber } });

    res.json(formSubmissions);
  } catch (error) {
    console.error('Error fetching form submissions:', error);
    res.status(500).json({ error: 'Failed to fetch form submissions' });
  }
});



// API endpoint to fetch the form submissions for a specific guide's roll number
router.get('/formproject/guide', async (req, res) => {
  const { guideRollNumber } = req.query;

  // Check if the guideRollNumber is provided and not empty
  if (!guideRollNumber) {
    return res.status(400).json({ error: 'Guide roll number is required' });
  }

  try {
    const formSubmissions = await Project.findAll({ where: { guideRollNumber } });
    res.json(formSubmissions);
  } catch (error) {
    console.error('Error fetching form submissions:', error);
    res.status(500).json({ error: 'Failed to fetch form submissions' });
  }
});

// Route to verify a student
router.post('/verify/student/:id', async (req, res) => {
  const studentId = req.params.id;

  try {
    const updatedStudent = await Project.update(
      { verified: true },
      { where: { id: studentId } }
    );
    res.status(200).json(updatedStudent);
  } catch (error) {
    console.error('Error verifying student:', error);
    res.status(500).json({ error: 'Failed to verify student' });
  }
});


module.exports = router;
