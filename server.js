const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { createForm } = require('./FormController');
const { Form } = require('./FormModel');
const { EvaluationForm } = require('./EvaluationModel');
const formProjectRoutes = require('./FormStud');
const { logToken, authenticateToken } = require('./authMiddleware');
const Drive= require('./Drive');
const adminRouter = require('./Admin');
const bodyParser = require('body-parser');
const path = require('path');
const adminDataRouter = require('./AdminData');
const EventModule = require('./Event');
const EvalGuide = require('./GuideEval');
const weightageRouter = require('./WeightageMark');
const marksRoute = require('./MarksTotal')
const cookieParser = require('cookie-parser');
const sendEmail = require('./emailSender');
const app = express();

app.use(cookieParser());

// Update your CORS configuration to set the appropriate origin
app.use(cors({
  origin: 'http://localhost:3000', // Replace with your frontend's URL
  credentials: true,
}));

// Add this line to increase payload size limit
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ limit: '50mb', extended: true }));


// Middleware to parse JSON bodies
app.use(express.json());

// Sequelize connection
const sequelize = new Sequelize('signup', 'postgres','Gokul123@', {
  host: 'localhost',
  dialect: 'postgres',
  port: '5432',
});

sequelize.options.logging = console.log;

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
  department: {
    type: DataTypes.STRING, // Add the department field with the appropriate data type
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


// Root route handler
app.get('/', (req, res) => {
  res.send('Welcome to the Result Management API');
});

// Account creation route
app.post('/api/signup', async (req, res) => {
  const { firstName, lastName, email, password, phoneNumber, role, university, rollNo, department } = req.body;

  // Perform validation or additional checks on the received data
  if (!firstName || !lastName || !email || !password || !phoneNumber || !role || !university || !rollNo || !department) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    // Generate a hash of the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new account with the hashed password
    const account = await Account.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      phoneNumber,
      role,
      university,
      rollNo,
      department, // Include department in the account creation
    });

    res.status(201).json(account);
  } catch (error) {
    console.error('Error creating account:', error);
    res.status(500).json({ error: 'Account creation failed' });
  }
});


const generateToken = (account) => {
  const { role, email, rollNo } = account;
  const expiresIn = '12h';
  const secretKey = 'your_secret_key_here'; // Replace with your own secret key
  // Create the token payload
  const payload = { role, email, rollNo };

  // Generate the token
  const token = jwt.sign(payload, secretKey, { expiresIn });

  return token;
};


// Login route
app.post('/api/login', async (req, res) => {
  const { role, rollNo, password } = req.body;

  try {
    const account = await Account.findOne({ where: { role, rollNo } });

    if (account) {
      const passwordMatch = await bcrypt.compare(password, account.password);

      if (passwordMatch) {
        // Generate the token
        const token = generateToken(account);

        // Set the tokens and rollNo as cookies
        res.cookie('authToken', token, { httpOnly: true, sameSite: 'none' });
        res.cookie('rollNo', rollNo, { secure: true, sameSite: 'none' });

        console.log('authToken Cookie:', token); // Log authToken value
        console.log('rollNo Cookie:', rollNo);

        res.json({ message: 'Login successful' });
      } else {
        res.status(401).json({ error: 'Invalid credentials' });
      }
    } else {
      res.status(401).json({ error: 'Invalid credentials' });
    }
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ error: 'An error occurred during login' });
  }
});

// Logout route
app.get('/api/logout', (req, res) => {
  res.clearCookie('authToken');
  res.clearCookie('rollNo');
  res.json({ message: 'Logged out successfully' });
});


app.use(logToken);
app.use(authenticateToken);

app.get('/api/currentuser', authenticateToken, (req, res) => {
  const rollNo = req.user.rollNo;
  const requestedRole = req.query.role; // Get the requested role from the query parameter

  if (rollNo) {
    Account.findOne({ where: { rollNo } })
      .then((user) => {
        if (user) {
          // Check if the requested role matches the user's role
          if (requestedRole && requestedRole === user.role) {
            res.json(user);
          } else if (!requestedRole) {
            res.json(user);
          } else {
            res.status(403).json({ error: 'Access denied' });
          }
        } else {
          console.log('User not found');
          res.status(404).json({ error: 'User not found' });
        }
      })
      .catch((error) => {
        console.error('Error fetching current user:', error);
        res.status(500).json({ error: 'An error occurred while fetching current user' });
      });
  } else {
    res.status(401).json({ error: 'Not logged in' });
  }
});


// API endpoint to update user data
app.post('/api/updateuser', logToken, authenticateToken, async (req, res) => {
  try {
    // Get the user's rollNo from the authenticated token (assuming you have stored the rollNo in the token)
    const { rollNo } = req.user; // Assuming the rollNo is available in req.user

    // Get the updated user data from the request body
    const { firstName, lastName, email, phoneNumber } = req.body;

    // Find the user in the database by their rollNo
    const user = await Account.findOne({ where: { rollNo } });

    if (!user) {
      // User not found in the database
      return res.status(404).json({ error: 'User not found' });
    }

    // Update the user's data with the edited values
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;
    user.phoneNumber = phoneNumber;

    // Save the changes to the database
    await user.save();

    // Generate a new token with the updated user data (optional)
    const token = jwt.sign(
      { rollNo: user.rollNo, role: user.role, email: user.email }, // Customize the token payload as needed
      'your_secret_key_here',
      { expiresIn: '1h' } // Set the token expiration time as needed
    );

    // Respond with the updated user data (you can also send a success message if needed)
    res.json({
      firstName: user.firstName,
      lastName: user.lastName,
      rollNo: user.rollNo,
      email: user.email,
      phoneNumber: user.phoneNumber,
      role: user.role,
      university: user.university,
      // Add other relevant user data here
      token: token, // Optional: Send the new token to the client if needed
    });
  } catch (error) {
    console.error('Error updating user data:', error);
    res.status(500).json({ error: 'An error occurred while updating user data' });
  }
});

// Form creation route
app.post('/api/forms/create', createForm);

// Fetch all forms from the database
app.get('/api/forms', authenticateToken, async (req, res) => {
  try {
    const { reviewSystem } = req.query;

    let filterOptions = {};
    if (reviewSystem) {
      filterOptions = { reviewSystem };
    }

    const forms = await Form.findAll({
      where: filterOptions,
    });


    res.json(forms);
  } catch (error) {
    console.error('Error fetching forms:', error);
    res.status(500).json({ error: 'Failed to fetch forms' });
  }
});


// Route for creating an evaluation form
app.post('/api/evaluation-forms', async (req, res) => {
  const { rollNo, studentName, formTitle, formParameters, formValues, reviewType, remarks, calculatedTotalMarks } = req.body;

  try {
    // Create a new evaluation form record in the database
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

    res.status(201).json(evaluationForm);
  } catch (error) {
    console.error('Error creating evaluation form:', error);
    res.status(500).json({ error: 'Evaluation form creation failed' });
  }
});


// API endpoint to get the evaluation form submission based on roll number and review type
app.get('/api/evaluation-forms', logToken, authenticateToken, async (req, res) => {
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
app.get('/api/evaluationstaff', logToken, authenticateToken, async (req, res) => {
  try {
    // Get the roll number and review type from the query parameters
    const { rollNo, reviewType } = req.query;

    console.log('Received request with rollNo:', rollNo, 'and reviewType:', reviewType);

    // Find the evaluation form submission in the database by the roll number and review type
    const submissionData = await EvaluationForm.findOne({
      where: {
        rollNo,
        reviewType
      }
    });

    if (!submissionData) {
      // Evaluation form submission not found for the roll number and review type
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
app.get('/api/evaluation-forms/check', logToken, authenticateToken, async (req, res) => {
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
app.put('/api/evaluation-forms/:id', logToken, authenticateToken, async (req, res) => {
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


// Form creation
app.post('/api/create-evaluation-form', async (req, res) => {
  const { formTitle, formParameters, formValues } = req.body;

  try {
    // Create a new evaluation form record in the database
    const evaluationForm = await EvaluationForm.create({
      formTitle,
      formParameters,
      formValues,
    });

    res.status(201).json(evaluationForm);
  } catch (error) {
    console.error('Error creating evaluation form:', error);
    res.status(500).json({ error: 'Evaluation form creation failed' });
  }
});

// Route handler for fetching students
app.get('/api/accounts', async (req, res) => {
  const { role } = req.query;

  try {
    const students = await Account.findAll({
      where: { role },
      attributes: ['rollNo', 'firstName', 'lastName', 'email'], // Include 'rollNo' attribute
    });

    res.json(students);
  } catch (error) {
    console.error('Error fetching students:', error);
    res.status(500).json({ error: 'An error occurred while fetching students' });
  }
});

// New API route to fetch email by roll number
app.get('/api/accounts/email', async (req, res) => {
  const { rollNumber } = req.query;

  try {
    const account = await Account.findOne({
      where: { rollNo: rollNumber },
      attributes: ['email'],
    });

    if (account) {
      res.json({ email: account.email });
    } else {
      res.status(404).json({ error: 'Account not found' });
    }
  } catch (error) {
    console.error('Error fetching email:', error);
    res.status(500).json({ error: 'An error occurred while fetching email' });
  }
});


// Form Submission for Project
app.use('/api', formProjectRoutes);

// Guide Eval
app.use('/api',logToken, authenticateToken, EvalGuide);

// Use the DriveLink router as middleware
app.use('/api', Drive);

//Admin
app.use('/admin', adminRouter);

// Serve PDF files from the "uploads" directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Use the AdminData router
app.use('/admin', adminDataRouter);

// Route handler to get users by role
app.get('/admin/getUsersByRole/:role', async (req, res) => {
  const { role } = req.params;

  try {
    const users = await Account.findAll({
      where: { role },
      attributes: ['firstName', 'lastName', 'email', 'role', 'university', 'department'],
    });

    res.json(users);
  } catch (error) {
    console.error('Error fetching users by role:', error);
    res.status(500).json({ error: 'An error occurred while fetching users by role' });
  }
});

// Route handler to get user counts by role
app.get('/admin/getRoleCounts', async (req, res) => {
  try {
    const studentCount = await Account.count({ where: { role: 'student' } });
    const teacherCount = await Account.count({ where: { role: 'teacher' } });
    const guideCount = await Account.count({ where: { role: 'Guide' } });

    res.json({
      studentCount,
      teacherCount,
      guideCount
    });
  } catch (error) {
    console.error('Error fetching role counts:', error);
    res.status(500).json({ error: 'An error occurred while fetching role counts' });
  }
});


// Use the Event module routes
app.use('/api', authenticateToken,logToken, EventModule);

Account.getStudentEmailsByRole = async function (role) {
  try {
    const students = await Account.findAll({
      attributes: ['email'],
      where: {
        role: role,
      },
    });

    return students.map(student => student.email);
  } catch (error) {
    throw error;
  }
};

app.post('/api/send-email', async (req, res) => {
  const { subject, message} = req.body;
  const role = 'student';
  try {
    const studentEmails = await Account.getStudentEmailsByRole(role);

    for (const email of studentEmails) {
      await sendEmail(subject, email, message);
    }

    res.status(200).json({ message: 'Emails sent successfully' });
  } catch (error) {
    console.error('Error sending emails:', error);
    res.status(500).json({ error: 'An error occurred while sending emails' });
  }
});

// Use the router
app.use('/api', weightageRouter);

// Use the imported routes as middleware
app.use('/api', marksRoute);

// Start the server
app.listen(5000, () => {
  console.log('Server started on port 5000');
});
