const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

const router = express.Router();

const sequelize = new Sequelize('Drive', 'postgres', 'Gokul123@', {
  host: 'localhost',
  dialect: 'postgres',
  port: '5432', // Adjust the port number based on your database configuration
});
// Define the LinkSubmission model
const LinkSubmission = sequelize.define('LinkSubmission', {
  linkType: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  link: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  rollNo: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false, // Set the default value to false
    allowNull: false,
  },
});

// Synchronize the model with the database (create the table if it doesn't exist)
sequelize.sync().then(() => {
  console.log('Database synchronized');
});
// Endpoint for handling link submission
router.post('/submitlink', async (req, res) => {
  try {
    // Retrieve the link type, link, and rollNo from the request body
    const { linkType, link, rollNo } = req.body;

    console.log('Received link submission request. Link:', link, 'Link Type:', linkType, 'Roll No:', rollNo);

    // Check if a submission with the given student roll number and link type already exists
    const existingSubmission = await LinkSubmission.findOne({ where: { rollNo, linkType } });

    if (existingSubmission) {
      console.log('Link submission already exists.');
      res.status(400).json({ message: 'Link submission already exists for this student and link type.' });
    } else {
      // Create a new LinkSubmission record in the database
      await LinkSubmission.create({ linkType, link, rollNo });

      console.log('Link submitted successfully!');
      // Respond with a success message
      res.status(200).json({ message: 'Link submitted successfully!' });
    }
  } catch (error) {
    console.error('Error handling link submission:', error);
    res.status(500).json({ error: 'Link submission failed. Please try again later.' });
  }
});


// Endpoint for fetching submission information
router.get('/submitlink', async (req, res) => {
  try {
    // Retrieve the studentRollNo and linkType from the query parameters
    const studentRollNo = req.query.rollNo;
    const linkType = req.query.linkType;

    console.log('Received submission info request. Student Roll No:', studentRollNo, 'Link Type:', linkType);

    // Retrieve the submission information from the database based on the provided studentRollNo and linkType
    const submissionInfo = await LinkSubmission.findOne({ where: { rollNo: studentRollNo, linkType } });

    if (submissionInfo) {
      console.log('Submission info retrieved:', submissionInfo);
      // Respond with the fetched submission information
      res.status(200).json(submissionInfo);
    } else {
      console.log('Submission info not found.');
      res.status(404).json({ message: 'Submission information not found.' });
    }
  } catch (error) {
    console.error('Error fetching submission info:', error);
    res.status(500).json({ error: 'Error fetching submission information.' });
  }
});

// Endpoint for verifying a link
router.post('/verifylink', async (req, res) => {
  try {
    // Retrieve the link from the request body
    const { link } = req.body;

    console.log('Received link verification request. Link:', link);

    // Find the submission based on the provided link
    const submission = await LinkSubmission.findOne({ where: { link } });

    if (!submission) {
      console.log('Link not found.');
      res.status(404).json({ message: 'Link not found in the database.' });
    } else {
      // Update the verification status in the database
      submission.verified = true;
      await submission.save();

      console.log('Link verified successfully.');
      res.status(200).json({ message: 'Link verified successfully.' });
    }
  } catch (error) {
    console.error('Error verifying link:', error);
    res.status(500).json({ error: 'Error verifying link.' });
  }
});

// Endpoint for fetching verified link submissions
router.get('/verifiedlinksubmissions', async (req, res) => {
  try {
    // Retrieve the rollNo and linkType from the query parameters
    const rollNo = req.query.rollNo;
    const linkType = req.query.linkType;

    console.log('Received request to fetch verified links for:', rollNo, 'with link type:', linkType);

    // Retrieve the verified link submissions from the database based on the provided rollNo and linkType
    const verifiedLinks = await LinkSubmission.findAll({
      where: { rollNo, linkType, verified: true },
    });

    if (verifiedLinks.length > 0) {
      console.log('Fetched verified links:', verifiedLinks);
      // Respond with the fetched verified link submissions
      res.status(200).json(verifiedLinks);
    } else {
      console.log('No verified links found for the provided criteria.');
      res.status(404).json({ message: 'No verified links found for the provided criteria.' });
    }
  } catch (error) {
    console.error('Error fetching verified links:', error);
    res.status(500).json({ error: 'Error fetching verified links.' });
  }
});

// Endpoint for checking if a specific link type is verified
router.get('/checklinkverified', async (req, res) => {
  try {
    // Retrieve the rollNo and linkType from the query parameters
    const rollNo = req.query.rollNo;
    const linkType = req.query.linkType;

    console.log('Received request to check if link is verified for:', rollNo, 'with link type:', linkType);

    // Check if the link submission is verified based on the provided rollNo and linkType
    const isLinkVerified = await LinkSubmission.findOne({
      where: { rollNo, linkType, verified: true },
    });

    if (isLinkVerified) {
      console.log('Link is verified for the provided criteria.');
      res.status(200).json({ verified: true });
    } else {
      console.log('Link is not verified for the provided criteria.');
      res.status(200).json({ verified: false });
    }
  } catch (error) {
    console.error('Error checking if link is verified:', error);
    res.status(500).json({ error: 'Error checking if link is verified.' });
  }
});

// Endpoint for checking if report link submission is completed based on studentRollNo
router.get('/checklinksubmissioncompletedr', async (req, res) => {
  try {
    // Retrieve the studentRollNo from the query parameters
    const studentRollNo = req.query.rollNo;

    console.log('Received link submission check request. Student Roll No:', studentRollNo);

    // Retrieve the submission information from the database based on the provided studentRollNo and linkType
    const submissionInfo = await LinkSubmission.findOne({ where: { rollNo: studentRollNo, linkType: 'report' } });

    // Respond with a boolean indicating whether the report link submission is completed
    res.json({ completed: !!submissionInfo }); // Converts the object to a boolean

  } catch (error) {
    console.error('Error checking report link submission:', error);
    res.status(500).json({ error: 'Error checking report link submission.' });
  }
});

// Endpoint for checking if report link submission is completed based on studentRollNo
router.get('/checklinksubmissioncompletedd', async (req, res) => {
  try {
    // Retrieve the studentRollNo from the query parameters
    const studentRollNo = req.query.rollNo;

    console.log('Received link submission check request. Student Roll No:', studentRollNo);

    // Retrieve the submission information from the database based on the provided studentRollNo and linkType
    const submissionInfo = await LinkSubmission.findOne({ where: { rollNo: studentRollNo, linkType: 'drive' } });

    // Respond with a boolean indicating whether the report link submission is completed
    res.json({ completed: !!submissionInfo }); // Converts the object to a boolean

  } catch (error) {
    console.error('Error checking report link submission:', error);
    res.status(500).json({ error: 'Error checking report link submission.' });
  }
});



module.exports = router;
